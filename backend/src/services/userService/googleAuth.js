import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../../../models/User.js';
import { oauth2client } from '../../utils/googleConfig.js';

export async function googleAuth(req, res) {
  try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                message: 'Google authorization code is required',
            });
        }

        const { tokens } = await oauth2client.getToken(code);

        if (!tokens.access_token) {
            return res.status(401).json({
                message: 'Failed to obtain Google access token',
            });
        }

        const userRes = await axios.get(
            'https://openidconnect.googleapis.com/v1/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            }
        );

        const { sub: googleId, email, name, picture, email_verified } =
            userRes.data;

        if (!googleId || !email || !email_verified) {
            return res.status(401).json({
                message: 'Unable to verify Google account',
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                googleId,
                name,
                email,
                image: picture || '',
            });
        }

       const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_TIMEOUT,
            }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
            },
        });
  } catch (error) {
    console.error('Google authentication error:', error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
        message: 'Google authentication failed',
        details: error.response?.data || error.message,
    });
}
    
}
