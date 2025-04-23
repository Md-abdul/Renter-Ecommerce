const express = require("express");
const ProductRoutes = express.Router();
const ProductModal = require("../Modals/productModal");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `upload-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed!"), false);
    }
  },
});

function getSizeOptions(category, wearCategory) {
  if (category === "kids") {
    return [
      "2-4 years",
      "4-6 years",
      "6-8 years",
      "8-10 years",
      "10-12 years",
      "12-14 years",
      "14-16 years",
    ];
  }

  if (wearCategory === "top") {
    return ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  }

  if (category === "womens" && wearCategory === "bottom") {
    return Array.from({ length: 13 }, (_, i) => (26 + i).toString());
  }

  return Array.from({ length: 21 }, (_, i) => (28 + i).toString());
}

ProductRoutes.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const products = [];
    for (const row of data) {
      if (!row.title || !row.basePrice || !row.category || !row.wearCategory) {
        continue;
      }

      const colors = [];
      if (row.colors) {
        const colorGroups = row.colors.split("|");
        for (const group of colorGroups) {
          const [name, hexCode, mainImage, ...gallery] = group.split(",");
          colors.push({
            name: name.trim(),
            hexCode: hexCode.trim(),
            images: {
              main: mainImage.trim(),
              gallery: gallery.map((img) => img.trim()),
            },
          });
        }
      }

      const sizeOptions = getSizeOptions(row.category, row.wearCategory);
      const sizes = sizeOptions.map((size) => ({
        size,
        priceAdjustment: row[`${size}_price`] || 0,
        quantity: row[`${size}_qty`] || 0,
      }));

      const productData = {
        title: row.title,
        summary: row.summary || "",
        basePrice: row.basePrice,
        category: row.category,
        wearCategory: row.wearCategory,
        colors,
        sizes,
        discount: row.discount || 0,
        rating: row.rating || 0,
        reviews: row.reviews || 0,
      };

      const product = new ProductModal(productData);
      await product.save();
      products.push(product);
    }

    res.status(201).json({
      success: true,
      message: `${products.length} products imported successfully`,
      products,
    });
  } catch (error) {
    console.error("Error processing Excel:", error);
    res.status(500).json({
      error: "Failed to process Excel file",
      details: error.message,
    });
  }
});



// Create a new product
ProductRoutes.post("/", async (req, res) => {
  try {
    const { title, basePrice, category, wearCategory, colors } = req.body;

    if (!title || !basePrice || !category || !wearCategory || !colors?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate sizes based on category and wear type
    const sizeOptions = getSizeOptions(category, wearCategory);
    const sizes = sizeOptions.map((size) => ({
      size,
      priceAdjustment: req.body.sizes?.[size]?.priceAdjustment || 0,
      quantity: req.body.sizes?.[size]?.quantity || 0,
    }));

    const productData = {
      ...req.body,
      sizes,
    };

    const newProduct = new ProductModal(productData);
    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create product",
      details: error.message,
    });
  }
});

// Get products by category and wear type
ProductRoutes.get("/:category/:wearType", async (req, res) => {
  try {
    const { category, wearType } = req.params;
    const products = await ProductModal.find({
      category,
      wearCategory: wearType,
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch products",
      details: error.message,
    });
  }
});

// Get product details with color-specific images
// Get product details with color-specific images
ProductRoutes.get("/:id/:color", async (req, res) => {
  try {
    const product = await ProductModal.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const selectedColor = product.colors.find((c) => c.name === req.params.color);
    if (!selectedColor) {
      return res.status(404).json({ error: "Color not found" });
    }

    // Return product with only the selected color's images
    const response = {
      ...product.toObject(),
      colors: [selectedColor],
      images: selectedColor.images,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch product",
      details: error.message,
    });
  }
});

// Check availability and get final price
ProductRoutes.post("/:id/check", async (req, res) => {
  try {
    const { color, size, quantity } = req.body;
    const product = await ProductModal.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check color exists
    const colorExists = product.colors.some(c => c.name === color);
    if (!colorExists) {
      return res.status(400).json({ error: "Selected color not available" });
    }

    // Check size exists
    const sizeObj = product.sizes.find(s => s.size === size);
    if (!sizeObj) {
      return res.status(400).json({ error: "Selected size not available" });
    }

    // Check quantity
    if (sizeObj.quantity < quantity) {
      return res.status(400).json({
        error: "Insufficient quantity available",
        available: sizeObj.quantity
      });
    }

    // Calculate final price
    const finalPrice = product.basePrice + sizeObj.priceAdjustment;
    const totalPrice = finalPrice * quantity;

    res.status(200).json({
      available: true,
      finalPrice,
      totalPrice,
      size: sizeObj.size,
      quantityAvailable: sizeObj.quantity
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to check availability",
      details: error.message
    });
  }
});

// Get all products (GET)
ProductRoutes.get("/", async (req, res) => {
  try {
    const products = await ProductModal.find();
    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch products", details: error.message });
  }
});

// Get a product by ID (GET)
ProductRoutes.get("/:id", async (req, res) => {
  try {
    const product = await ProductModal.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Check available quantities for each size
    const productWithAvailability = product.toObject();
    productWithAvailability.sizes = productWithAvailability.sizes.map(
      (size) => ({
        ...size,
        available: size.quantity > 0,
      })
    );

    res.status(200).json(productWithAvailability);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch product", details: error.message });
  }
});

// Update a product by ID (PUT)
ProductRoutes.put("/:id", async (req, res) => {
  try {
    // Validate colors if provided
    if (
      req.body.colors &&
      (!Array.isArray(req.body.colors) || req.body.colors.length === 0)
    ) {
      return res
        .status(400)
        .json({ error: "At least one color must be provided" });
    }

    // Validate sizes if provided
    if (
      req.body.sizes &&
      (!Array.isArray(req.body.sizes) || req.body.sizes.length === 0)
    ) {
      return res
        .status(400)
        .json({ error: "At least one size must be provided" });
    }

    const updatedProduct = await ProductModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ error: "Product not found" });
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update product", details: error.message });
  }
});

// Delete a product by ID (DELETE)
ProductRoutes.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await ProductModal.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete product", details: error.message });
  }
});

// Get products by category
ProductRoutes.get("/category/:category", async (req, res) => {
  try {
    const products = await ProductModal.find({ category: req.params.category });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch products by category",
      details: error.message,
    });
  }
});

// Check product availability
ProductRoutes.post("/check-availability/:id", async (req, res) => {
  try {
    const { color, size, quantity } = req.body;
    const product = await ProductModal.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check color exists
    const colorExists = product.colors.some((c) => c.name === color);
    if (!colorExists) {
      return res.status(400).json({ error: "Selected color not available" });
    }

    // Check size exists and has enough quantity
    const sizeObj = product.sizes.find((s) => s.size === size);
    if (!sizeObj) {
      return res.status(400).json({ error: "Selected size not available" });
    }

    if (sizeObj.quantity < quantity) {
      return res.status(400).json({
        error: "Insufficient quantity available",
        available: sizeObj.quantity,
      });
    }

    res.status(200).json({ available: true });
  } catch (error) {
    res.status(500).json({
      error: "Failed to check availability",
      details: error.message,
    });
  }
});

module.exports = { ProductRoutes };
