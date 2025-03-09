const express = require("express");
const ProductRoutes = express.Router();
const ProductModal = require("../Modals/productModal");

// Create a new product (POST)
ProductRoutes.post("/", async (req, res) => {
  try {
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
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch product", details: error.message });
  }
});

// Update a product by ID (PUT)
ProductRoutes.put("/:id", async (req, res) => {
  try {
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

module.exports = { ProductRoutes };
