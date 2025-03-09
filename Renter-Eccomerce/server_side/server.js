const express = require("express");
const Signuprouter = require("./Routes/userRoutes");
const cors = require("cors");
const connectDB = require("./database");
const { ProductRoutes } = require("./Routes/productRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// Connect to the database
connectDB();

app.use("/api/products", ProductRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Welcome to Renter ..");
});
app.use("/api/user", Signuprouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
