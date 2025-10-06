const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

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

      // In development, log OTP to console
      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP for ${phoneNumber}: ${otp}`);
      }

      res.json({ 
        message: 'OTP sent successfully',
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

      // In a real app, you would verify against database
      // For demo, we'll just log and return success
      console.log(`Verifying OTP ${otp} for ${phoneNumber}`);

      // Generate JWT token
      const token = jwt.sign(
        { userId: 'demo-user', phoneNumber: phoneNumber },
        process.env.JWT_SECRET || 'demo-secret',
        { expiresIn: '30d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: 'demo-user',
          phone_number: phoneNumber,
          business_name: `My Business (${phoneNumber})`,
          business_type: 'retail',
          currency: 'NGN',
          language: 'en',
          is_premium: false
        }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

module.exports = router;
