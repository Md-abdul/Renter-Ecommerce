const express = require("express");
const { UserModel, OrderModel } = require("../Modals/UserModal");
const { verifyToken } = require("../Middlewares/VerifyToken");

const orderRoutes = express.Router();

// Create order
orderRoutes.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingAddress, paymentMethod } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.cart.size === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Convert cart items to array
    const items = Array.from(user.cart.entries()).map(([productId, item]) => ({
      productId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      image: item.image,
    }));

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create new order
    const order = new OrderModel({
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: "pending",
    });

    await order.save();

    // Clear user's cart
    user.cart = new Map();
    await user.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user orders
orderRoutes.get("/user", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Get all orders (admin)
orderRoutes.get("/admin", verifyToken, async (req, res) => {
  try {
    // Check if user is admin (you'll need to implement this check)
    const orders = await OrderModel.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// In the status update route, ensure canReturn and returnWindow are set when status is delivered
orderRoutes.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = {
      status,
      updatedAt: Date.now()
    };

    // If status is delivered, set canReturn and returnWindow
    if (status === "delivered") {
      updateData.canReturn = true;
      updateData.returnWindow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (status !== "delivered") {
      updateData.canReturn = false;
      updateData.returnWindow = null;
    }

    const order = await OrderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all orders (admin)
orderRoutes.get("/admin", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await UserModel.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const orders = await OrderModel.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Add these routes to orderRoutes.js

// Request return/exchange
orderRoutes.post("/:orderId/return", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { itemId, type, reason, exchangeSize } = req.body;
    const userId = req.user.userId;

    // Validate request
    if (!type || !reason || (type === "exchange" && !exchangeSize)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await OrderModel.findOne({
      _id: orderId,
      userId,
      status: "delivered",
      canReturn: true
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or not eligible for return",
      });
    }

    // Check return window (7 days)
    const returnDeadline = order.returnWindow || 
      new Date(new Date(order.updatedAt).getTime() + 7 * 24 * 60 * 60 * 1000);

    if (new Date() > returnDeadline) {
      return res.status(400).json({
        message: "Return window has expired (7 days from delivery)",
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    // Check for existing active request
    if (item.returnRequest && item.returnRequest.status !== "rejected") {
      return res.status(400).json({
        message: "Active request already exists for this item",
      });
    }

    // Create return request
    item.returnRequest = {
      type,
      reason,
      status: "requested",
      requestedAt: new Date(),
      updatedAt: new Date(),
      ...(type === "exchange" && { exchangeSize })
    };

    await order.save();

    res.status(200).json({
      message: "Return/exchange request submitted successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating return request:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Admin approve/reject return
orderRoutes.put("/:orderId/return/:itemId", verifyToken, async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    // Check if user is admin
    const user = await UserModel.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const item = order.items.id(itemId);
    if (!item || !item.returnRequest) {
      return res
        .status(404)
        .json({ message: "Item or return request not found" });
    }

    item.returnRequest.status = status;
    item.returnRequest.updatedAt = new Date();

    await order.save();

    res.status(200).json({
      message: `Return request ${status} successfully`,
      order,
    });
  } catch (error) {
    console.error("Error updating return request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get return requests (admin)
orderRoutes.get("/returns", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await UserModel.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const orders = await OrderModel.find({
      "items.returnRequest": { $exists: true, $ne: null },
    }).populate("userId", "name email");

    const returnRequests = orders.flatMap((order) =>
      order.items
        .filter((item) => item.returnRequest)
        .map((item) => ({
          orderId: order._id,
          orderNumber: order._id.toString().slice(-6).toUpperCase(),
          customer: order.userId.name,
          email: order.userId.email,
          itemId: item._id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          type: item.returnRequest.type,
          reason: item.returnRequest.reason,
          status: item.returnRequest.status,
          requestedAt: item.returnRequest.requestedAt,
          exchangeSize: item.returnRequest.exchangeSize,
        }))
    );

    res.status(200).json(returnRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = { orderRoutes };
