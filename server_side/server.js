const express = require("express");
const cors = require("cors");
const connectDB = require("./database");
const { ProductRoutes } = require("./Routes/productRoutes");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { UserRoutes } = require("./Routes/userRoutes");
const { adminRoutes } = require("./Routes/adminRoutes");
const { CartRoutes } = require("./Routes/cartRoutes");
const { orderRoutes } = require("./Routes/orderRoutes");
const { couponRoutes } = require("./Routes/couponRoutes");
const router = require("./Routes/googleSignup");
const contactRoutes = require("./Routes/ContactRoutes");
const storeRoutes = require("./Routes/storeRoutes");
const couponExpiryCheck = require("./utils/couponCron");
// near top of server.js add:
const { phonepeRoutes } = require("./Routes/phonepeRoutes");

const app = express();
dotenv.config();

// Connect to the database
connectDB();
couponExpiryCheck.start();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://www.ranterstore.in", // ✅ actual frontend
  "https://ranterstore.in", // optional (non-www in case)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed from this origin: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Renter ..");
});

app.use("/api/products", ProductRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/auth/google", router);
app.use("/api/coupons", couponRoutes);
app.use("/api/contact", contactRoutes); // Add this line for PhonePe routes====
app.use("/api/stores", storeRoutes);
app.use("/api/phonepe", phonepeRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
