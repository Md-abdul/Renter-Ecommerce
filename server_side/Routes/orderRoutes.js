const express = require("express");
const { UserModel, OrderModel, CounterModel } = require("../Modals/UserModal");
const { verifyToken, verifyAdmin } = require("../Middlewares/VerifyToken");
const ProductModal = require("../Modals/productModal");
const CouponModel = require("../Modals/coupanModal");
const { sendOrderConfirmationEmail } = require("../utils/orderProdctService");

const orderRoutes = express.Router();

// Get user orders
// Helper function to generate order number
const getNextOrderNumber = async () => {
  try {
    const counter = await CounterModel.findByIdAndUpdate(
      "orderNumber",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return `${String(counter.seq).padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating order number:", error);
    throw new Error("Failed to generate order number");
  }
};

// Create order
orderRoutes.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    // Validate required fields
    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.address ||
      !shippingAddress.address.street ||
      !shippingAddress.address.city ||
      !shippingAddress.address.zipCode ||
      !shippingAddress.phoneNumber
    ) {
      return res.status(400).json({
        message: "Missing required shipping information",
      });
    }

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
      color: item.color,
    }));

    // Calculate total amount
    let totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Apply coupon if provided
    let appliedCoupon = null;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        couponCode: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: new Date() },
      });

      if (coupon) {
        // Check minimum purchase amount
        if (totalAmount >= coupon.minimumPurchaseAmount) {
          // Calculate discount
          discountAmount = (totalAmount * coupon.discountPercentage) / 100;
          const finalDiscount = Math.min(
            discountAmount,
            coupon.maxDiscountAmount
          );

          // Apply discount
          totalAmount -= finalDiscount;
          appliedCoupon = coupon;

          // Increment coupon usage
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const shippingDetails = {
      name: shippingAddress.name,
      address: {
        street: shippingAddress.address.street || "",
        city: shippingAddress.address.city || "",
        zipCode: shippingAddress.address.zipCode || "",
        state: shippingAddress.address.state || "",
        alternatePhone: shippingAddress.address.alternatePhone || "",
        addressType: shippingAddress.address.addressType || "home",
      },
      phoneNumber: shippingAddress.phoneNumber || "",
    };

    // Create new order
    const order = new OrderModel({
      userId,
      items,
      totalAmount,
      shippingAddress: shippingDetails,
      paymentMethod,
      status: "pending",
      orderNumber: await getNextOrderNumber(), // Use the helper function
      appliedCoupon: appliedCoupon
        ? {
            couponCode: appliedCoupon.couponCode,
            discountPercentage: appliedCoupon.discountPercentage,
            discountAmount: discountAmount,
          }
        : null,
    });

    // Update product quantities
    for (const item of items) {
      try {
        const product = await ProductModal.findById(item.productId);
        if (!product) {
          console.error(`Product ${item.productId} not found`);
          continue;
        }

        const colorIndex = product.colors.findIndex(
          (c) => c.name === item.color
        );

        if (colorIndex === -1) {
          console.error(`Color not found for product ${item.productId}`);
          continue;
        }

        const sizeIndex = product.colors[colorIndex].sizes.findIndex(
          (s) => s.size === item.size
        );

        if (sizeIndex === -1) {
          console.error(
            `Size ${item.size} not found for product ${item.productId}`
          );
          continue;
        }

        product.colors[colorIndex].sizes[sizeIndex].quantity -= item.quantity;
        await product.save();
      } catch (updateError) {
        console.error(`Error updating product ${item.productId}:`, updateError);
        throw new Error(`Failed to update product ${item.productId}`);
      }
    }

    await order.save();

    // Clear user's cart
    user.cart = new Map();
    await user.save();

    console.log(`Starting email send process for order ${order._id}`);
    // Send order confirmation email
    try {
      const success = await sendOrderConfirmationEmail(order._id);
      if (!success) {
        console.error("Failed to send order confirmation email");
      }
    } catch (emailError) {
      console.error("Email sending failed with error:", {
        orderId: order._id,
        error: emailError.message,
        stack: emailError.stack,
      });
    }

    res.status(201).json({
      message: "Order created successfully",
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        appliedCoupon: order.appliedCoupon,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

orderRoutes.get("/user", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await OrderModel.find({ userId, orderNumber: { $not: /_COPY$/ }, }).sort({ createdAt: -1 });
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

// orderRoutes.post("/:orderId/return", verifyToken, async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const {
//       itemId,
//       type,
//       reason,
//       exchangeSize,
//       exchangeColor,
//       exchangeProductId,
//     } = req.body;
//     const userId = req.user.userId;

//     if (!type || !reason) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     if (type === "exchange" && (!exchangeSize || !exchangeColor)) {
//       return res.status(400).json({
//         message: "For exchanges, both size and color are required",
//       });
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
//     // if (item.returnRequest && item.returnRequest.status !== "rejected") {
//     //   return res.status(400).json({
//     //     message: "Active request already exists for this item",
//     //   });
//     // }

//     // Create return request
//     item.returnRequest = {
//       type,
//       reason,
//       status: "requested",
//       requestedAt: new Date(),
//       updatedAt: new Date(),
//       ...(type === "exchange" && {
//         exchangeSize,
//         exchangeColor,
//         exchangeProductId: exchangeProductId || item.productId,
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

// Update the return request endpoint

// Admin approve/reject return

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
      requestedQuantity, // This handles both return and exchange quantities
    } = req.body;
    const userId = req.user.userId;

    // ... existing validation ...

    // Validate return/exchange quantity
    const requestedQty = requestedQuantity ? parseInt(requestedQuantity) : 1;
    if (isNaN(requestedQty)) {
      return res.status(400).json({
        message: "Invalid quantity format",
      });
    }

    if (requestedQty <= 0) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    // Get the order and item
    const order = await OrderModel.findOne({
      _id: orderId,
      userId,
      status: "delivered",
      canReturn: true,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found or not eligible for return/exchange",
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    // Check if requested quantity is valid
    if (requestedQty > item.quantity) {
      return res.status(400).json({
        message: `Requested quantity (${requestedQty}) exceeds ordered quantity (${item.quantity})`,
      });
    }

    // Check for existing active request
    if (
      item.returnRequest &&
      ["requested", "approved", "processing", "shipped"].includes(
        item.returnRequest.status
      )
    ) {
      return res.status(400).json({
        message: "Active request already exists for this item",
        existingRequest: item.returnRequest,
      });
    }

    // Create return/exchange request with quantity
    item.returnRequest = {
      type,
      reason,
      status: "requested",
      requestedAt: new Date(),
      updatedAt: new Date(),
      requestedQuantity: requestedQty, // Store the requested quantity
      ...(type === "exchange" && {
        exchangeSize,
        exchangeColor,
        exchangeProductId: exchangeProductId || item.productId,
      }),
    };

    await order.save();

    res.status(200).json({
      message: `${
        type === "return" ? "Return" : "Exchange"
      } request submitted successfully`,
      order,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

orderRoutes.put(
  "/:orderId/return/:itemId",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { orderId, itemId } = req.params;
      const { status, trackingNumber } = req.body;

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

      const validStatuses = [
        "approved",
        "rejected",
        "processing",
        "pickuped",
        "shipped",
        "delivered",
        "refund_completed",
        "completed",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // If approving or completing, handle quantities
      if (status === "approved" || status === "completed") {
        // Restock the returned items (using requested quantity)
        const product = await ProductModal.findById(item.productId);
        if (product) {
          const colorObj = product.colors.find((c) => c.name === item.color);
          if (colorObj) {
            const sizeObj = colorObj.sizes.find((s) => s.size === item.size);
            if (sizeObj) {
              sizeObj.quantity +=
                item.returnRequest.requestedQuantity || item.quantity;
              await product.save();
            }
          }
        }

        // For exchanges, reduce stock of the new item
        if (item.returnRequest.type === "exchange" && status === "completed") {
          const exchangeProduct = await ProductModal.findById(
            item.returnRequest.exchangeProductId || item.productId
          );
          if (exchangeProduct) {
            const exchangeColorObj = exchangeProduct.colors.find(
              (c) => c.name === item.returnRequest.exchangeColor
            );
            if (exchangeColorObj) {
              const exchangeSizeObj = exchangeColorObj.sizes.find(
                (s) => s.size === item.returnRequest.exchangeSize
              );
              if (exchangeSizeObj) {
                exchangeSizeObj.quantity -=
                  item.returnRequest.requestedQuantity || item.quantity;
                await exchangeProduct.save();
              }
            }
          }
        }
      }

      // Update the request status
      item.returnRequest.status = status;
      item.returnRequest.updatedAt = new Date();

      // Add tracking number if provided
      if (trackingNumber) {
        item.returnRequest.trackingNumber = trackingNumber;
      }

      await order.save();

      res.status(200).json({
        message: `Request ${status} successfully`,
        order,
      });
    } catch (error) {
      console.error("Error updating request:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);
// Update the admin approve/reject endpoint
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

      const validStatuses = [
        "approved",
        "rejected",
        "processing",
        "pickuped",
        "shipped",
        "delivered",
        "refund_completed",
        "completed",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // If approving or completing, restock only the requested quantity
      if (status === "approved" || status === "completed") {
        const product = await ProductModal.findById(item.productId);
        if (product) {
          const colorObj = product.colors.find((c) => c.name === item.color);
          if (colorObj) {
            const sizeObj = colorObj.sizes.find((s) => s.size === item.size);
            if (sizeObj) {
              sizeObj.quantity +=
                item.returnRequest.requestedQuantity || item.quantity;
              await product.save();
            }
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

orderRoutes.get("/returns", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await OrderModel.find({
      "items.returnRequest.status": {
        $in: [
          "requested",
          "approved",
          "processing",
          "pickuped",
          "shipped",
          "delivered",
          "refund_completed",
          "completed", // <-- ADD THIS
        ],
      },
    }).populate("userId", "name email");

    const returnRequests = [];

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (
          item.returnRequest &&
          item.returnRequest.status &&
          item.returnRequest.status !== "null"
        ) {
          returnRequests.push({
            orderId: order._id,
            orderNumber: order.orderNumber,
            itemId: item._id,
            productId: item.productId,
            name: item.name,
            image: item.image,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            user: order.userId,
            type: item.returnRequest.type,
            status: item.returnRequest.status,
            reason: item.returnRequest.reason,
            requestedQuantity: item.returnRequest.requestedQuantity,
            requestedAt: item.returnRequest.requestedAt,
            exchangeSize: item.returnRequest.exchangeSize,
            exchangeColor: item.returnRequest.exchangeColor,
            exchangeProductId: item.returnRequest.exchangeProductId,
            trackingNumber: item.returnRequest.trackingNumber || "",
            paymentDetails: item.returnRequest.paymentDetails || null,
            paymentDetailsProvided:
              item.returnRequest.paymentDetailsProvided || false,
            paymentDetailsProvidedAt:
              item.returnRequest.paymentDetailsProvidedAt || null,
          });
        }
      });
    });

    return res.status(200).json(returnRequests);
  } catch (error) {
    console.error("Error fetching return requests:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});
// Add this route to orderRoutes.js
orderRoutes.get(
  "/sold-products",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      // Default to current month if no dates provided
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const filter = {
        status: "delivered",
        updatedAt: {
          $gte: startDate ? new Date(startDate) : firstDayOfMonth,
          $lte: endDate ? new Date(endDate + "T23:59:59.999Z") : lastDayOfMonth,
        },
      };

      const orders = await OrderModel.find(filter)
        .populate({
          path: "items.productId",
          model: "Product",
        })
        .sort({ updatedAt: -1 });

      // Extract sold products data
      const soldProducts = orders.flatMap((order) => {
        // Calculate discount per item if coupon was applied
        const discountPerItem = order.appliedCoupon
          ? order.appliedCoupon.discountAmount /
            order.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            )
          : 0;

        return order.items.map((item) => {
          // Calculate discounted price
          const discountedPrice = order.appliedCoupon
            ? item.price * (1 - discountPerItem)
            : item.price;

          return {
            orderId: order._id,
            deliveredDate: order.updatedAt,
            title: item.productId?.title || item.name,
            originalPrice: item.price, // Keep original price for reference
            price: discountedPrice, // Show discounted price
            category: item.productId?.category,
            wearCategory: item.productId?.wearCategory,
            color: item.color || "N/A",
            size: item.size,
            sku: item.productId?.sku || "N/A",
            quantity: item.quantity,
            total: discountedPrice * item.quantity,
            couponApplied: order.appliedCoupon
              ? order.appliedCoupon.couponCode
              : null,
            discountPercentage: order.appliedCoupon
              ? order.appliedCoupon.discountPercentage
              : null,
            discountAmount: order.appliedCoupon
              ? item.price * item.quantity * discountPerItem
              : null,
          };
        });
      });

      res.status(200).json(soldProducts);
    } catch (error) {
      console.error("Error fetching sold products:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Create a pending order (for PhonePe payments)
orderRoutes.post("/pending", verifyToken, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, items, totalAmount } =
      req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!shippingAddress || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get the next order number
    const getNextOrderNumber = async () => {
      try {
        const counter = await CounterModel.findByIdAndUpdate(
          "orderId",
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        return `RANTER_A${String(counter.seq).padStart(4, "0")}`;
      } catch (error) {
        console.error("Error generating order number:", error);
        throw new Error("Failed to generate order number");
      }
    };

    // Create a new order with pending status
    const order = new OrderModel({
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: "pending", // Mark as pending until payment is complete
      orderNumber: await getNextOrderNumber(),
      paymentDetails: {
        paymentStatus: "INITIATED",
        paymentMethod: "PHONEPE",
      },
      appliedCoupon: couponCode
        ? {
            couponCode,
            discountPercentage: appliedCoupon?.discountPercentage || 0,
            discountAmount: appliedCoupon?.discountAmount || 0,
          }
        : null,
    });

    await order.save();

    res.status(201).json({
      message: "Pending order created",
      order,
    });
  } catch (error) {
    console.error("Error creating pending order:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Complete a pending order after payment is verified
orderRoutes.post("/complete/:orderId", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await OrderModel.findOne({
      _id: orderId,
      userId,
      status: "pending",
    });

    if (!order) {
      return res.status(404).json({ message: "Pending order not found" });
    }

    // Update order status to processing
    order.status = "processing";
    await order.save();

    // Clear user's cart
    await UserModel.findByIdAndUpdate(userId, { $set: { cart: {} } });

    res.status(200).json({
      message: "Order completed successfully",
      order,
    });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get order by ID
orderRoutes.get("/:orderId", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the user is authorized to view this order
    if (order.user.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});

orderRoutes.get("/returns", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await OrderModel.find().populate("userId", "name email");

    const returnRequests = [];

    for (const order of orders) {
      for (const item of order.items) {
        if (item.returnRequest && item.returnRequest.status) {
          returnRequests.push({
            orderId: order._id,
            orderNumber: order.orderNumber,
            user: order.userId,
            itemId: item._id,
            productId: item.productId,
            productName: item.name,
            image: item.image,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            ...item.returnRequest,
          });
        }
      }
    }

    return res.status(200).json(returnRequests);
  } catch (error) {
    console.error("Error fetching return requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Save payment details for a return/exchange
orderRoutes.post(
  "/:orderId/return/:itemId/payment-details",
  verifyToken,
  async (req, res) => {
    try {
      const { orderId, itemId } = req.params;
      const { bankAccount, upiId } = req.body;
      const userId = req.user.userId;

      const order = await OrderModel.findOne({ _id: orderId, userId });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Find the item by its _id
      const item = order.items.find((i) => i._id.toString() === itemId);
      console.log("orderId:", orderId, "itemId:", itemId);
      console.log("Found item:", item);
      if (!item || !item.returnRequest) {
        return res.status(400).json({
          message: "Invalid selection. Please select a return item again.",
        });
      }

      if (item.returnRequest.status !== "approved") {
        return res.status(400).json({
          message:
            "Return/exchange must be approved before adding payment details",
        });
      }

      // Save payment details
      item.returnRequest.paymentDetails = {
        bankAccount: bankAccount || null,
        upiId: upiId || null,
      };
      item.returnRequest.paymentDetailsProvided = true;
      item.returnRequest.paymentDetailsProvidedAt = new Date();

      await order.save();

      res
        .status(200)
        .json({ message: "Payment details submitted successfully" });
    } catch (error) {
      console.error("Error submitting payment details:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Admin refund processing route
orderRoutes.post(
  "/:orderId/return/:itemId/process-refund",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { orderId, itemId } = req.params;
      const { refundAmount, refundMethod } = req.body;

      // Validate input
      if (!refundAmount || isNaN(refundAmount) || !refundMethod) {
        return res
          .status(400)
          .json({ message: "Valid refund amount and method are required" });
      }

      const order = await OrderModel.findById(orderId).populate("userId");
      if (!order) return res.status(404).json({ message: "Order not found" });

      const item = order.items.id(itemId);
      if (!item || !item.returnRequest) {
        return res
          .status(404)
          .json({ message: "Item or return request not found" });
      }

      if (item.returnRequest.status !== "approved") {
        return res.status(400).json({
          message: "Return must be approved before processing refund",
        });
      }

      if (!item.returnRequest.paymentDetailsProvided) {
        return res
          .status(400)
          .json({ message: "User has not provided payment details" });
      }

      // Update return status
      item.returnRequest.status = "refund_processing";
      item.returnRequest.refundAmount = refundAmount;
      item.returnRequest.refundMethod = refundMethod;
      item.returnRequest.refundInitiatedAt = new Date();
      await order.save();

      // Here you would typically integrate with your payment gateway to process the refund
      // For now, we'll just simulate it

      // Simulate processing delay
      setTimeout(async () => {
        try {
          item.returnRequest.status = "refund_completed";
          item.returnRequest.refundCompletedAt = new Date();
          await order.save();

          // In a real implementation, you would send a notification to the user
        } catch (error) {
          console.error("Error completing refund:", error);
        }
      }, 5000);

      res.status(200).json({
        message: "Refund processing initiated",
        order,
      });
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// POST /api/orders/:orderId/copy/:itemId
orderRoutes.post("/:orderId/copy/:itemId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const originalOrder = await OrderModel.findById(orderId).populate("userId");

    if (!originalOrder) {
      return res.status(404).json({ message: "Original order not found" });
    }

    const item = originalOrder.items.id(itemId);
    if (!item || !item.returnRequest || !["exchange", "return"].includes(item.returnRequest.type)) {
      return res.status(400).json({ message: "Invalid return/exchange item" });
    }

    const exchangeData = item.returnRequest;
    const copiedItem = {
      productId: exchangeData.exchangeProductId || item.productId,
      quantity: exchangeData.requestedQuantity || item.quantity,
      price: item.price,
      name: item.name,
      image: item.image,
      size: exchangeData.exchangeSize || item.size,
      color: exchangeData.exchangeColor || item.color,
    };

    const copiedOrder = new OrderModel({
      userId: originalOrder.userId,
      items: [copiedItem],
      totalAmount: copiedItem.price * copiedItem.quantity,
      shippingAddress: originalOrder.shippingAddress,
      paymentMethod: originalOrder.paymentMethod,
      status: "processing",
      orderNumber: `EX#${originalOrder.orderNumber}_COPY`,
      canReturn: false,
      returnWindow: null,
    });

    await copiedOrder.save();
    res.status(201).json({ message: "Exchange copy order created", order: copiedOrder });
  } catch (error) {
    console.error("Error creating copy order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = { orderRoutes };
