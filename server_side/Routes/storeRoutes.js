const express = require("express");
const storeRoutes = express.Router();
const Store = require("../Modals/Store");

// Get all stores
storeRoutes.get("/", async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single store
storeRoutes.get("/:id", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a store
storeRoutes.post("/", async (req, res) => {
  const store = new Store({
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    pincode: req.body.pincode,
    country: req.body.country,
    phone: req.body.phone,
    coordinates: req.body.coordinates,
  });

  try {
    const newStore = await store.save();
    res.status(201).json(newStore);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a store
storeRoutes.put("/:id", async (req, res) => {
  try {
    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country,
        phone: req.body.phone,
        coordinates: req.body.coordinates,
      },
      { new: true }
    );
    if (!updatedStore)
      return res.status(404).json({ message: "Store not found" });
    res.json(updatedStore);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a store
storeRoutes.delete("/:id", async (req, res) => {
  try {
    const deletedStore = await Store.findByIdAndDelete(req.params.id);
    if (!deletedStore)
      return res.status(404).json({ message: "Store not found" });
    res.json({ message: "Store deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = storeRoutes;
