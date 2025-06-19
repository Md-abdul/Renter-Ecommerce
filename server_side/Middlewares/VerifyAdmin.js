const { UserModel } = require("../Modals/UserModal");

const verifyAdmin = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying admin status",
      error: error.message,
    });
  }
};

module.exports = { verifyAdmin }; 