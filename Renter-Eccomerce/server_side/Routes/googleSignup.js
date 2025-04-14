const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { oauth2Client } = require("../utils/googleClient");
const { UserModel } = require("../Modals/UserModal");
const router = express.Router();

// Add this route to INITIATE Google auth
router.get("/", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "select_account",
  });
  res.redirect(url);
});

// router.get("/callback", async (req, res) => {
//   const code = req.query.code;
//   try {
//     // 1. Exchange code for tokens
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);

//     // 2. Get user info from Google
//     const { data } = await axios.get(
//       "https://www.googleapis.com/oauth2/v3/userinfo",
//       {
//         headers: { Authorization: `Bearer ${tokens.access_token}` },
//       }
//     );

//     // 3. Generate a random password for Google-authenticated users
//     const randomPassword =
//       Math.random().toString(36).slice(-8) +
//       Math.random().toString(36).slice(-8);

//     // 4. Find or create user
//     let user = await UserModel.findOne({ email: data.email });

//     if (!user) {
//       user = new UserModel({
//         name: data.name || data.email.split("@")[0],
//         email: data.email,
//         password: randomPassword, // Store plain password (not recommended for production)
//         isGoogleAuth: true,
//         cart: {},
//         address: "",
//         phoneNumber: null,
//         profilePicture: data.picture || null,
//       });
//       await user.save();
//       console.log("New user created:", user);
//     } else if (!user.password) {
//       // Update existing Google user with password if missing
//       user.password = randomPassword;
//       await user.save();
//     }

//     // 5. Generate JWT token
//     const token = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//         isGoogleAuth: true,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     // 6. Store token in MongoDB (optional but recommended)
//     user.tokens = user.tokens || [];
//     user.tokens.push({
//       token,
//       createdAt: new Date(),
//     });
//     await user.save();

//     // 7. Redirect with token and user data
//     const redirectUrl = `${
//       process.env.FRONTEND_URL
//     }/auth-redirect?token=${token}&userId=${user._id}&name=${encodeURIComponent(
//       user.name
//     )}&email=${encodeURIComponent(user.email)}`;
//     res.redirect(redirectUrl);
//   } catch (error) {
//     console.error("Google auth error:", error);
//     res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
//   }
// });


// googleSignup.js
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  try {
    // 1. Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2. Get user info from Google
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    // 3. Generate a random password for Google-authenticated users
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash the password

    // 4. Find or create user
    let user = await UserModel.findOne({ email: data.email });

    if (!user) {
      user = new UserModel({
        name: data.name || data.email.split("@")[0],
        email: data.email,
        password: hashedPassword,
        isGoogleAuth: true,
        cart: {},
        address: "",
        phoneNumber: null,
        profilePicture: data.picture || null,
      });
      await user.save();
    } else if (!user.password) {
      // Update existing Google user with password if missing
      user.password = hashedPassword;
      await user.save();
    }

    // 5. Generate JWT token (same as manual login)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 6. Store token in MongoDB (optional but recommended)
    user.tokens = user.tokens || [];
    user.tokens.push({
      token,
      createdAt: new Date(),
    });
    await user.save();

    // 7. Redirect to frontend with token in URL
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-redirect?token=${token}&userId=${user._id}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google auth error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
});


module.exports = router;
