const express = require("express");
const cors = require("cors");
const connectDB = require("./database");
const { ProductRoutes } = require("./Routes/productRoutes");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { UserRoutes } = require("./Routes/userRoutes");
const { adminRoutes } = require("./Routes/adminRoutes");

const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Connect to the database
connectDB();

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Welcome to Renter ..");
});

app.use("/api/products", ProductRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
