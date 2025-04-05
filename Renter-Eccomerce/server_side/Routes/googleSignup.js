const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { oauth2Client } = require('../utils/googleClient');
const { UserModel } = require("../Modals/UserModal");
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/callback', async (req, res) => {
    const code = req.query.code;
    try {
        // 1. Get tokens from Google
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        // 2. Get user info from Google
        const userInfo = await axios.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            {
                headers: { Authorization: `Bearer ${tokens.access_token}` }
            }
        );
        
        const { email, name } = userInfo.data;
        
        // 3. Check if user exists or create new one
        let user = await UserModel.findOne({ email });
        
        if (!user) {
            // Create new user with Google auth
            user = new UserModel({
                name: name || email.split('@')[0],
                email,
                isGoogleAuth: true,
                cart: {},
                address: "",
                phoneNumber: null
            });
            
            await user.save();
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                isGoogleAuth: true 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 5. Send success response with token and user data
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message
        });
    }
});

module.exports = router;