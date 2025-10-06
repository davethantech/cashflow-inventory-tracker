const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const twilio = require('twilio');
const router = express.Router();

const db = require('../database/db');
const auth = require('../middleware/auth');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generate random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * @swagger
 * /api/auth/request-otp:
 *   post:
 *     summary: Request OTP for login/registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       500:
 *         description: Server error
 */
router.post('/request-otp', 
  [
    body('phoneNumber').isMobilePhone().withMessage('Valid phone number required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber } = req.body;
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database (in production, use Redis)
      await db('otp_verifications')
        .insert({
          phone_number: phoneNumber,
          otp: otp,
          expires_at: otpExpiry
        })
        .onConflict('phone_number')
        .merge();

      // Send OTP via Twilio (mock in development)
      if (process.env.NODE_ENV === 'production') {
        await twilioClient.messages.create({
          body: `Your Cashflow Tracker OTP is: ${otp}. Valid for 10 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
      } else {
        console.log(`OTP for ${phoneNumber}: ${otp}`);
      }

      res.json({ 
        message: 'OTP sent successfully',
        // Include OTP in development for testing
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error) {
      console.error('OTP request error:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }
);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login/register
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post('/verify-otp',
  [
    body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phoneNumber, otp } = req.body;

      // Verify OTP
      const otpRecord = await db('otp_verifications')
        .where('phone_number', phoneNumber)
        .where('expires_at', '>', new Date())
        .first();

      if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Find or create user
      let user = await db('users').where('phone_number', phoneNumber).first();

      if (!user) {
        [user] = await db('users')
          .insert({
            phone_number: phoneNumber,
            business_name: `My Business (${phoneNumber})`
          })
          .returning('*');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, phoneNumber: user.phone_number },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Clean up used OTP
      await db('otp_verifications').where('phone_number', phoneNumber).delete();

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          phone_number: user.phone_number,
          business_name: user.business_name,
          business_type: user.business_type,
          currency: user.currency,
          language: user.language,
          is_premium: user.is_premium
        }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await db('users')
      .where('id', req.user.userId)
      .select('id', 'phone_number', 'business_name', 'business_type', 'currency', 'language', 'is_premium', 'premium_expires_at')
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               business_name:
 *                 type: string
 *               business_type:
 *                 type: string
 *               currency:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { business_name, business_type, currency, language } = req.body;

    const [updatedUser] = await db('users')
      .where('id', req.user.userId)
      .update({
        business_name,
        business_type,
        currency,
        language,
        updated_at: new Date()
      })
      .returning('*');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        phone_number: updatedUser.phone_number,
        business_name: updatedUser.business_name,
        business_type: updatedUser.business_type,
        currency: updatedUser.currency,
        language: updatedUser.language,
        is_premium: updatedUser.is_premium
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
