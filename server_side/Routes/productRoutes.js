const express = require("express");
const ProductRoutes = express.Router();
const ProductModal = require("../Modals/productModal");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

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
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
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
      "0-6 months",
      "6-12 months",
      "1-2 years",
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

// ProductRoutes.post("/upload-excel", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const workbook = xlsx.readFile(req.file.path);
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = xlsx.utils.sheet_to_json(worksheet);

//     // Group by variantId (handles both spellings)
//     const productGroups = {};
//     data.forEach((row) => {
//       const key = row.variantId || row.varientId || row.sku;
//       if (!productGroups[key]) {
//         productGroups[key] = [];
//       }
//       productGroups[key].push(row);
//     });

//     const products = [];
//     for (const [groupKey, rows] of Object.entries(productGroups)) {
//       const firstRow = rows[0];

//       if (!firstRow.sku) continue;

//       // Process Colors with their sizes
//       const colorsMap = new Map();
//       rows.forEach((row) => {
//         const colorName = row.colorName;
//         const hexCode = row.hexCode;
//         const mainImage = row.mainImage;
//         const priceAdjustment = row.priceAdjustment || 0; // Get price adjustment from row

//         if (colorName && hexCode && mainImage) {
//           if (!colorsMap.has(colorName)) {
//             colorsMap.set(colorName, {
//               name: colorName,
//               hexCode: hexCode,
//               priceAdjustment: priceAdjustment, // Set price adjustment at color level
//               images: {
//                 main: mainImage,
//                 gallery: [
//                   row.gallery1,
//                   row.gallery2,
//                   row.gallery3,
//                   row.gallery4,
//                 ].filter(Boolean),
//               },
//               sizes: [],
//             });
//           }

//           // Add size information to this color (without price adjustment)
//           if (row.size) {
//             const colorObj = colorsMap.get(colorName);
//             colorObj.sizes.push({
//               size: row.size,
//               quantity: row.quantity || 0,
//               sku: row.sku,
//               available: (row.quantity || 0) > 0,
//             });
//           }
//         }
//       });

//       // Get all unique sizes across all colors (without price adjustment)
//       const sizeMap = new Map();

//       Array.from(colorsMap.values()).forEach((color) => {
//         color.sizes.forEach((size) => {
//           if (!sizeMap.has(size.size)) {
//             sizeMap.set(size.size, {
//               size: size.size,
//               quantity: size.quantity,
//               available: size.available,
//             });
//           }
//         });
//       });

//       const productData = {
//         variantId: firstRow.variantId || firstRow.varientId || firstRow.sku,
//         title: firstRow.title,
//         summary: firstRow.summary || "",
//         basePrice: firstRow.basePrice,
//         category: firstRow.category,
//         wearCategory: firstRow.wearCategory,
//         colors: Array.from(colorsMap.values()),
//         sizes: Array.from(sizeMap.values()),
//         discount: firstRow.discount || 0,
//         rating: firstRow.rating || 0,
//         reviews: firstRow.reviews || 0,
//         sku: firstRow.sku,
//       };

//       const product = new ProductModal(productData);
//       await product.save();
//       products.push(product);
//     }

//     // Clean up - delete the uploaded file
//     fs.unlinkSync(req.file.path);

//     res.status(201).json({
//       success: true,
//       message: `${products.length} products imported successfully`,
//       products,
//     });
//   } catch (error) {
//     console.error("Error processing Excel:", error);

//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }

//     res.status(500).json({
//       error: "Failed to process Excel file",
//       details: error.message,
//     });
//   }
// });

// ProductRoutes.post("/", async (req, res) => {
//   try {
//     const {
//       title,
//       basePrice,
//       category,
//       wearCategory,
//       colors: incomingColors,
//       sizes: incomingSizes,
//     } = req.body;

//     if (
//       !title ||
//       !basePrice ||
//       !category ||
//       !wearCategory ||
//       !incomingColors?.length
//     ) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Process colors - add default priceAdjustment if not provided
//     const colors = incomingColors.map((color) => ({
//       ...color,
//       priceAdjustment: color.priceAdjustment || 0,
//       images: color.images || { main: "", gallery: [] },
//     }));

//     // Process sizes - keep only the sizes that were actually added in the form
//     const sizes = incomingSizes.map((size) => ({
//       size: size.size,
//       priceAdjustment: size.priceAdjustment || 0,
//       quantity: size.quantity || 0,
//     }));

//     const productData = {
//       ...req.body,
//       colors,
//       sizes,
//     };

//     const newProduct = new ProductModal(productData);
//     await newProduct.save();

//     res.status(201).json({
//       message: "Product created successfully",
//       product: newProduct,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to create product",
//       details: error.message,
//     });
//   }
// });

ProductRoutes.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Group by variantId (handles both spellings)
    const productGroups = {};
    data.forEach((row) => {
      const key = row.variantId || row.varientId || row.sku;
      if (!productGroups[key]) {
        productGroups[key] = [];
      }
      productGroups[key].push(row);
    });

    const products = [];
    for (const [groupKey, rows] of Object.entries(productGroups)) {
      const firstRow = rows[0];

      if (!firstRow.sku) continue;

      // Process Colors with their sizes
      const colorsMap = new Map();
      rows.forEach((row) => {
        const colorName = row.colorName;
        const hexCode = row.hexCode;
        const mainImage = row.mainImage;
        const colorPriceAdjustment = row.colorPriceAdjustment || 0;

        if (colorName && hexCode && mainImage) {
          if (!colorsMap.has(colorName)) {
            colorsMap.set(colorName, {
              name: colorName,
              hexCode: hexCode,
              priceAdjustment: colorPriceAdjustment,
              images: {
                main: mainImage,
                gallery: [
                  row.gallery1,
                  row.gallery2,
                  row.gallery3,
                  row.gallery4,
                ].filter(Boolean),
              },
              sizes: [],
            });
          }

          // Add size information to this color
          if (row.size) {
            const colorObj = colorsMap.get(colorName);
            colorObj.sizes.push({
              size: row.size,
              priceAdjustment: row.sizePriceAdjustment || 0,
              quantity: row.quantity || 0,
            });
          }
        }
      });

      const productData = {
        variantId: firstRow.variantId || firstRow.varientId || firstRow.sku,
        title: firstRow.title,
        summary: firstRow.summary || "",
        basePrice: firstRow.basePrice,
        category: firstRow.category,
        wearCategory: firstRow.wearCategory,
        colors: Array.from(colorsMap.values()),
        discount: firstRow.discount || 0,
        rating: firstRow.rating || 0,
        reviews: firstRow.reviews || 0,
        sku: firstRow.sku,
      };

      const product = new ProductModal(productData);
      await product.save();
      products.push(product);
    }

    // Clean up - delete the uploaded file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: `${products.length} products imported successfully`,
      products,
    });
  } catch (error) {
    console.error("Error processing Excel:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Failed to process Excel file",
      details: error.message,
    });
  }
});

ProductRoutes.post("/", async (req, res) => {
  try {
    const {
      title,
      summary,
      basePrice,
      category,
      wearCategory,
      colors,
      discount,
      sku
    } = req.body;

    if (
      !title ||
      !summary ||
      !basePrice ||
      !category ||
      !wearCategory ||
      !colors?.length
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate each color has at least one size
    for (const color of colors) {
      if (!color.sizes || color.sizes.length === 0) {
        return res.status(400).json({ 
          error: `Color ${color.name} must have at least one size`
        });
      }
    }

    const productData = {
      title,
      summary,
      basePrice,
      category,
      wearCategory,
      colors,
      discount: discount || 0,
      sku,
      createdAt: new Date()
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

ProductRoutes.get("/:id/sizes", async (req, res) => {
  try {
    const product = await ProductModal.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
 
    // Return just the sizes array with availability information
    const sizesWithAvailability = product.sizes.map(size => ({
      ...size.toObject(),
      available: size.quantity > 0
    }));
 
    res.status(200).json(sizesWithAvailability);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch product sizes",
      details: error.message
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

    const selectedColor = product.colors.find(
      (c) => c.name === req.params.color
    );
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
    const colorExists = product.colors.some((c) => c.name === color);
    if (!colorExists) {
      return res.status(400).json({ error: "Selected color not available" });
    }

    // Check size exists
    const sizeObj = product.sizes.find((s) => s.size === size);
    if (!sizeObj) {
      return res.status(400).json({ error: "Selected size not available" });
    }

    // Check quantity
    if (sizeObj.quantity < quantity) {
      return res.status(400).json({
        error: "Insufficient quantity available",
        available: sizeObj.quantity,
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
      quantityAvailable: sizeObj.quantity,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to check availability",
      details: error.message,
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

    // Convert to plain object and add availability info
    const productWithAvailability = product.toObject();
    
    // Process each color's sizes
    productWithAvailability.colors = productWithAvailability.colors.map(color => ({
      ...color,
      sizes: color.sizes.map(size => ({
        ...size,
        available: size.quantity > 0
      }))
    }));

    res.status(200).json(productWithAvailability);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch product", details: error.message });
  }
});

// Update a product by ID (PUT)
// ProductRoutes.put("/:id", async (req, res) => {
//   try {
//     // Validate colors if provided
//     if (
//       req.body.colors &&
//       (!Array.isArray(req.body.colors) || req.body.colors.length === 0)
//     ) {
//       return res
//         .status(400)
//         .json({ error: "At least one color must be provided" });
//     }

//     // Validate sizes if provided
//     if (
//       req.body.sizes &&
//       (!Array.isArray(req.body.sizes) || req.body.sizes.length === 0)
//     ) {
//       return res
//         .status(400)
//         .json({ error: "At least one size must be provided" });
//     }

//     const updatedProduct = await ProductModal.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedProduct)
//       return res.status(404).json({ error: "Product not found" });
//     res.status(200).json({
//       message: "Product updated successfully",
//       product: updatedProduct,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Failed to update product", details: error.message });
//   }
// });
ProductRoutes.put("/:id", async (req, res) => {
  try {
    const { colors, ...otherData } = req.body;

    // Validate colors if provided
    if (colors) {
      if (!Array.isArray(colors)) {
        return res.status(400).json({ error: "Colors must be an array" });
      }

      for (const color of colors) {
        if (!color.sizes || color.sizes.length === 0) {
          return res.status(400).json({
            error: `Color ${color.name} must have at least one size`
          });
        }
      }
    }

    const updateData = colors ? { colors, ...otherData } : otherData;

    const updatedProduct = await ProductModal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update product",
      details: error.message,
    });
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
// ProductRoutes.post("/check-availability/:id", async (req, res) => {
//   try {
//     const { color, size, quantity } = req.body;
//     const product = await ProductModal.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     // Check color exists
//     const colorExists = product.colors.some((c) => c.name === color);
//     if (!colorExists) {
//       return res.status(400).json({ error: "Selected color not available" });
//     }

//     // Check size exists and has enough quantity
//     const sizeObj = product.sizes.find((s) => s.size === size);
//     if (!sizeObj) {
//       return res.status(400).json({ error: "Selected size not available" });
//     }

//     if (sizeObj.quantity < quantity) {
//       return res.status(400).json({
//         error: "Insufficient quantity available",
//         available: sizeObj.quantity,
//       });
//     }

//     res.status(200).json({ available: true });
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to check availability",
//       details: error.message,
//     });
//   }
// });
ProductRoutes.post("/check-availability/:id", async (req, res) => {
  try {
    const { color, size, quantity } = req.body;
    const product = await ProductModal.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the color
    const colorObj = product.colors.find(c => c.name === color);
    if (!colorObj) {
      return res.status(400).json({ error: "Selected color not available" });
    }

    // Find the size within the color
    const sizeObj = colorObj.sizes.find(s => s.size === size);
    if (!sizeObj) {
      return res.status(400).json({ error: "Selected size not available" });
    }

    if (sizeObj.quantity < quantity) {
      return res.status(400).json({
        error: "Insufficient quantity available",
        available: sizeObj.quantity,
      });
    }

    // Calculate final price (base + color adjustment + size adjustment)
    const finalPrice = product.basePrice + 
                      (colorObj.priceAdjustment || 0) + 
                      (sizeObj.priceAdjustment || 0);

    res.status(200).json({ 
      available: true,
      finalPrice,
      totalPrice: finalPrice * quantity
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to check availability",
      details: error.message,
    });
  }
});

// Add this route to productRoutes.js
// In productRoutes.js, update the check-inventory route
// ProductRoutes.post("/check-inventory", async (req, res) => {
//   try {
//     const { items } = req.body;

//     const availabilityCheck = await Promise.all(
//       items.map(async (item) => {
//         const product = await ProductModal.findById(item.productId);
//         if (!product) {
//           return {
//             productId: item.productId,
//             available: false,
//             message: "Product not found",
//             name: "Unknown product",
//             size: item.size,
//           };
//         }

//         const sizeObj = product.sizes.find((s) => s.size === item.size);
//         if (!sizeObj) {
//           return {
//             productId: item.productId,
//             available: false,
//             message: "Size not available",
//             name: product.title,
//             size: item.size,
//           };
//         }

//         return {
//           productId: item.productId,
//           available: sizeObj.quantity >= item.quantity,
//           availableQuantity: sizeObj.quantity,
//           requiredQuantity: item.quantity,
//           name: product.title,
//           size: item.size,
//           message:
//             sizeObj.quantity >= item.quantity ? "" : "Insufficient quantity",
//         };
//       })
//     );

//     const allAvailable = availabilityCheck.every((item) => item.available);

//     res.status(200).json({
//       allAvailable,
//       details: availabilityCheck,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to check inventory",
//       details: error.message,
//     });
//   }
// });
ProductRoutes.post("/check-inventory", async (req, res) => {
  try {
    const { items } = req.body;

    const availabilityCheck = await Promise.all(
      items.map(async (item) => {
        const product = await ProductModal.findById(item.productId);
        if (!product) {
          return {
            productId: item.productId,
            available: false,
            message: "Product not found",
            name: "Unknown product",
            size: item.size,
            color: item.color
          };
        }

        // Find the color
        const colorObj = product.colors.find(c => c.name === item.color);
        if (!colorObj) {
          return {
            productId: item.productId,
            available: false,
            message: "Color not available",
            name: product.title,
            size: item.size,
            color: item.color
          };
        }

        // Find the size within the color
        const sizeObj = colorObj.sizes.find(s => s.size === item.size);
        if (!sizeObj) {
          return {
            productId: item.productId,
            available: false,
            message: "Size not available",
            name: product.title,
            size: item.size,
            color: item.color
          };
        }

        return {
          productId: item.productId,
          available: sizeObj.quantity >= item.quantity,
          availableQuantity: sizeObj.quantity,
          requiredQuantity: item.quantity,
          name: product.title,
          size: item.size,
          color: item.color,
          message:
            sizeObj.quantity >= item.quantity ? "" : "Insufficient quantity",
        };
      })
    );

    const allAvailable = availabilityCheck.every(item => item.available);

    res.status(200).json({
      allAvailable,
      details: availabilityCheck,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to check inventory",
      details: error.message,
    });
  }
});
// ProductModal

module.exports = { ProductRoutes };
