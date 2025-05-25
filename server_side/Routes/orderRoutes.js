const express = require("express");
const { UserModel, OrderModel } = require("../Modals/UserModal");
const { verifyToken, verifyAdmin } = require("../Middlewares/VerifyToken");
const ProductModal = require("../Modals/productModal");

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
    const items = Array.from(user.cart.values()).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      image: item.image,
      size: item.size,
    }));

    console.log("Processed items for order:", items);

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

    // Update product quantities using $inc to avoid validation issues
    for (const item of items) {
      try {
        console.log(
          `Updating product ${item.productId}, size ${item.size}, deducting ${item.quantity}`
        );

        await ProductModal.findByIdAndUpdate(
          item.productId,
          {
            $inc: { "sizes.$[elem].quantity": -item.quantity },
          },
          {
            arrayFilters: [{ "elem.size": item.size }],
            runValidators: false,
          }
        );

        console.log(`Product ${item.productId} updated successfully`);
      } catch (updateError) {
        console.error(`Error updating product ${item.productId}:`, updateError);
        // Consider failing the entire order if product update fails
        throw new Error(`Failed to update product ${item.productId}`);
      }
    }

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
}); // Get all orders (admin)

// Update order status
orderRoutes.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = {
      status,
      updatedAt: Date.now(),
    };

    // Reset return data when status changes
    updateData.$unset = { "items.$[].returnRequest": 1 };

    if (status === "delivered") {
      updateData.canReturn = true;
      updateData.returnWindow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    } else {
      updateData.canReturn = false;
      updateData.returnWindow = null;
    }

    const order = await OrderModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

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

// Request return/exchange
// orderRoutes.post("/:orderId/return", verifyToken, async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { itemId, type, reason, exchangeSize, exchangeColor, exchangeProductId } = req.body;
//     const userId = req.user.userId;

//     if (!type || !reason || (type === "exchange" && (!exchangeSize || !exchangeColor))) {
//       return res.status(400).json({ message: "Missing required fields for exchange" });
//     }

//     const order = await OrderModel.findOne({
//       _id: orderId,
//       userId,
//       status: "delivered",
//       canReturn: true,
//     });

//     if (!order) {
//       return res.status(404).json({
//         message: "Order not found or not eligible for return",
//       });
//     }

//     // Check return window
//     if (new Date() > order.returnWindow) {
//       return res.status(400).json({
//         message: "Return window has expired (7 days from delivery)",
//       });
//     }

//     const item = order.items.id(itemId);
//     if (!item) {
//       return res.status(404).json({ message: "Item not found in order" });
//     }

//     // Check for existing active request
//     if (
//       item.returnRequest &&
//       ["requested", "approved", "processing", "shipped"].includes(item.returnRequest.status)
//     ) {
//       return res.status(400).json({
//         message: "Active request already exists for this item",
//       });
//     }

//     // Create return/exchange request
//     item.returnRequest = {
//       type,
//       reason,
//       status: "requested",
//       requestedAt: new Date(),
//       updatedAt: new Date(),
//       ...(type === "exchange" && {
//         exchangeSize,
//         exchangeColor,
//         ...(exchangeProductId && { exchangeProductId })
//       }),
//     };

//     await order.save();

//     res.status(200).json({
//       message: "Return/exchange request submitted successfully",
//       order,
//     });
//   } catch (error) {
//     console.error("Error creating return request:", error);
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

// Request return/exchange
orderRoutes.post("/:orderId/return", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      itemId,
      type,
      reason,
      exchangeSize,
      exchangeColor,
      exchangeProductId,
    } = req.body;
    const userId = req.user.userId;

    if (!type || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (type === "exchange" && (!exchangeSize || !exchangeColor)) {
      return res.status(400).json({
        message: "For exchanges, both size and color are required",
      });
    }

    const order = await OrderModel.findOne({
      _id: orderId,
      userId,
      status: "delivered",
      canReturn: true,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or not eligible for return",
      });
    }

    // Check return window
    if (new Date() > order.returnWindow) {
      return res.status(400).json({
        message: "Return window has expired (7 days from delivery)",
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    // Check for existing active request
    // if (item.returnRequest && item.returnRequest.status !== "rejected") {
    //   return res.status(400).json({
    //     message: "Active request already exists for this item",
    //   });
    // }

    // Create return request
    item.returnRequest = {
      type,
      reason,
      status: "requested",
      requestedAt: new Date(),
      updatedAt: new Date(),
      ...(type === "exchange" && {
        exchangeSize,
        exchangeColor,
        exchangeProductId: exchangeProductId || item.productId,
      }),
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
orderRoutes.put(
  "/:orderId/return/:itemId",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { orderId, itemId } = req.params;
      const { status } = req.body;

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

      const validStatuses = ["approved", "rejected", "completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // If approving or completing, restock
      if (status === "approved" || status === "completed") {
        const product = await ProductModal.findById(item.productId);
        if (product) {
          const sizeObj = product.sizes.find((s) => s.size === item.size);
          if (sizeObj) {
            sizeObj.quantity += item.quantity;
            await product.save();
          }
        }
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
  }
);

// Get return requests (admin only)
orderRoutes.get("/returns", verifyToken, verifyAdmin, async (req, res) => {
  try {
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
          image: item.image,
          type: item.returnRequest.type,
          reason: item.returnRequest.reason,
          status: item.returnRequest.status,
          requestedAt: item.returnRequest.requestedAt,
          updatedAt: item.returnRequest.updatedAt,
          exchangeSize: item.returnRequest.exchangeSize,
        }))
    );

    res.status(200).json(returnRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add this route to orderRoutes.js
orderRoutes.get("/sold-products", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to current month if no dates provided
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const filter = {
      status: "delivered",
      updatedAt: {
        $gte: startDate ? new Date(startDate) : firstDayOfMonth,
        $lte: endDate ? new Date(endDate + "T23:59:59.999Z") : lastDayOfMonth
      }
    };

    const orders = await OrderModel.find(filter)
      .populate({
        path: "items.productId",
        model: "Product"
      })
      .sort({ updatedAt: -1 });

    // Extract sold products data
    const soldProducts = orders.flatMap(order => 
      order.items.map(item => ({
        orderId: order._id,
        deliveredDate: order.updatedAt,
        title: item.productId?.title || item.name,
        price: item.price,
        category: item.productId?.category,
        wearCategory: item.productId?.wearCategory,
        color: item.color || "N/A",
        size: item.size,
        sku: item.productId?.sku || "N/A",
        quantity: item.quantity,
        total: item.price * item.quantity
      }))
    );

    res.status(200).json(soldProducts);
  } catch (error) {
    console.error("Error fetching sold products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = { orderRoutes };
