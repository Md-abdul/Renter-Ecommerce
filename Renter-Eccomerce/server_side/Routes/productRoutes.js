const express = require("express");
const ProductRoutes = express.Router();
const ProductModal = require("../Modals/productModal");
// Add these at the top of productRoutes.js
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


// Create a new product (POST)
ProductRoutes.post("/", async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.title || !req.body.price || !req.body.colors || !req.body.sizes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate colors array
    if (!Array.isArray(req.body.colors) || req.body.colors.length === 0) {
      return res.status(400).json({ error: "At least one color must be provided" });
    }

    // Validate sizes array
    if (!Array.isArray(req.body.sizes) || req.body.sizes.length === 0) {
      return res.status(400).json({ error: "At least one size must be provided" });
    }

    const newProduct = new ProductModal(req.body);
    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to create product", details: error.message });
  }
});

// Get all products (GET)
ProductRoutes.get("/", async (req, res) => {
  try {
    const products = await ProductModal.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
});

// Get a product by ID (GET)
ProductRoutes.get("/:id", async (req, res) => {
  try {
    const product = await ProductModal.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    // Check available quantities for each size
    const productWithAvailability = product.toObject();
    productWithAvailability.sizes = productWithAvailability.sizes.map(size => ({
      ...size,
      available: size.quantity > 0
    }));
    
    res.status(200).json(productWithAvailability);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product", details: error.message });
  }
});

// Update a product by ID (PUT)
ProductRoutes.put("/:id", async (req, res) => {
  try {
    // Validate colors if provided
    if (req.body.colors && (!Array.isArray(req.body.colors) || req.body.colors.length === 0)) {
      return res.status(400).json({ error: "At least one color must be provided" });
    }

    // Validate sizes if provided
    if (req.body.sizes && (!Array.isArray(req.body.sizes) || req.body.sizes.length === 0)) {
      return res.status(400).json({ error: "At least one size must be provided" });
    }

    const updatedProduct = await ProductModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product", details: error.message });
  }
});

// Delete a product by ID (DELETE)
ProductRoutes.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await ProductModal.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product", details: error.message });
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
    const colorExists = product.colors.some(c => c.name === color);
    if (!colorExists) {
      return res.status(400).json({ error: "Selected color not available" });
    }

    // Check size exists and has enough quantity
    const sizeObj = product.sizes.find(s => s.size === size);
    if (!sizeObj) {
      return res.status(400).json({ error: "Selected size not available" });
    }

    if (sizeObj.quantity < quantity) {
      return res.status(400).json({ 
        error: "Insufficient quantity available",
        available: sizeObj.quantity
      });
    }

    res.status(200).json({ available: true });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to check availability", 
      details: error.message 
    });
  }
});

// Update the Excel upload route
ProductRoutes.post('/upload-excel', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const products = [];
    for (const row of data) {
      // Parse colors with images
      const colors = row.colors ? row.colors.split('|').map(colorPart => {
        const [colorInfo, ...imageUrls] = colorPart.split(',');
        const [name, hexCode] = colorInfo.split(':');
        
        return {
          name,
          hexCode,
          images: [{
            imageUrl: imageUrls[0] || null,
            subImages: imageUrls.slice(1).map(url => ({ subImagesUrl: url }))
          }]
        };
      }) : [];

      // Parse sizes
      const sizes = row.sizes ? row.sizes.split(',').map(sizeStr => {
        const [size, quantity] = sizeStr.split(':');
        return { size, quantity: parseInt(quantity) };
      }) : [];

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
      message: `${products.length} products imported successfully`,
      products 
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to import products", 
      details: error.message 
    });
  }
});

module.exports = { ProductRoutes };