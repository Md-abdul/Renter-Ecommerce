const express = require("express");
const ProductRoutes = express.Router();
const ProductModal = require("../Modals/productModal");
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `upload-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Create multer instance
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed!'), false);
    }
  }
});

// Excel Upload Route - Updated to handle both field names
ProductRoutes.post('/upload-excel', (req, res) => {
  // Use .any() to accept any file field name
  upload.any()(req, res, async (err) => {
    try {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ 
          error: err.message || 'File upload failed',
          details: err.field ? `Received field name: ${err.field}` : ''
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.files[0];
      console.log('Processing file:', file.originalname);

      try {
        const workbook = xlsx.readFile(file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const products = [];
        for (const row of data) {
          // Parse colors
          const colors = [];
          if (row.colors) {
            const colorGroups = row.colors.split('|');
            for (const colorGroup of colorGroups) {
              const parts = colorGroup.split(',');
              const colorInfo = parts[0].split(':');
              
              const colorObj = {
                name: colorInfo[0],
                hexCode: colorInfo[1],
                images: []
              };
              
              if (parts.length > 1) {
                const mainImage = parts[1];
                const subImages = parts.slice(2);
                
                colorObj.images.push({
                  imageUrl: mainImage,
                  subImages: subImages.map(url => ({ subImagesUrl: url }))
                });
              }
              
              colors.push(colorObj);
            }
          }

          // Parse sizes
          const sizes = [];
          if (row.sizes) {
            const sizeGroups = row.sizes.split(',');
            for (const sizeGroup of sizeGroups) {
              const sizeInfo = sizeGroup.split(':');
              sizes.push({
                size: sizeInfo[0],
                quantity: parseInt(sizeInfo[1]) || 0
              });
            }
          }

          const productData = {
            title: row.title,
            summary: row.summary || '',
            price: row.price,
            offerPrice: row.offerPrice || row.price,
            discount: row.discount || 0,
            rating: row.rating || 0,
            reviews: row.reviews || 0,
            colors,
            category: row.category || 'general',
            sizes
          };

          const product = new ProductModal(productData);
          await product.save();
          products.push(product);
        }

        res.status(201).json({ 
          success: true,
          message: `${products.length} products imported successfully`,
          products 
        });

      } catch (parseError) {
        console.error("File processing error:", parseError);
        res.status(500).json({ 
          error: "Failed to process Excel file",
          details: parseError.message 
        });
      }
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ 
        error: "Server error during file processing",
        details: error.message 
      });
    }
  });
});

// Create a new product (POST)
ProductRoutes.post("/", async (req, res) => {
  try {
    // Validate required fields
    if (
      !req.body.title ||
      !req.body.price ||
      !req.body.colors ||
      !req.body.sizes
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate colors array
    if (!Array.isArray(req.body.colors) || req.body.colors.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one color must be provided" });
    }

    // Validate sizes array
    if (!Array.isArray(req.body.sizes) || req.body.sizes.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one size must be provided" });
    }

    const newProduct = new ProductModal(req.body);
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create product", details: error.message });
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
