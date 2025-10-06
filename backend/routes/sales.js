const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');

const db = require('../database/db');

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - total_amount
 *               - amount_paid
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                     - unit_price
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     product_name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unit_price:
 *                       type: number
 *               total_amount:
 *                 type: number
 *               amount_paid:
 *                 type: number
 *               payment_method:
 *                 type: string
 *                 enum: [cash, transfer, card, ussd]
 *               customer_phone:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale created successfully
 */
router.post('/', 
  auth,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('total_amount').isNumeric().withMessage('Valid total amount required'),
    body('amount_paid').isNumeric().withMessage('Valid amount paid required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        items,
        total_amount,
        amount_paid,
        payment_method = 'cash',
        customer_phone,
        notes
      } = req.body;

      const balance = total_amount - amount_paid;

      // Generate transaction ID
      const transactionId = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const trx = await db.transaction();

      try {
        // Create sale record
        const [sale] = await trx('sales')
          .insert({
            user_id: req.user.userId,
            transaction_id: transactionId,
            total_amount,
            amount_paid,
            balance,
            payment_method,
            customer_phone,
            notes,
            sale_date: new Date()
          })
          .returning('*');

        // Create sale items and update stock
        for (const item of items) {
          await trx('sale_items').insert({
            sale_id: sale.id,
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total_price: item.unit_price * item.quantity
          });

          // Update product stock if product_id is provided
          if (item.product_id) {
            await trx('products')
              .where('id', item.product_id)
              .andWhere('user_id', req.user.userId)
              .decrement('current_stock', item.quantity);
          }
        }

        await trx.commit();

        res.status(201).json({
          message: 'Sale recorded successfully',
          sale: {
            ...sale,
            items
          }
        });
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Sale creation error:', error);
      res.status(500).json({ error: 'Failed to record sale' });
    }
  }
);

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get sales with pagination and filters
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Sales list retrieved successfully
 */
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;

    let query = db('sales as s')
      .leftJoin('sale_items as si', 's.id', 'si.sale_id')
      .where('s.user_id', req.user.userId)
      .select(
        's.*',
        db.raw('JSON_AGG(JSON_BUILD_OBJECT(
          \'id\', si.id,
          \'product_id\', si.product_id,
          \'product_name\', si.product_name,
          \'unit_price\', si.unit_price,
          \'quantity\', si.quantity,
          \'total_price\', si.total_price
        )) as items')
      )
      .groupBy('s.id')
      .orderBy('s.sale_date', 'desc');

    // Date filtering
    if (startDate) {
      query = query.where('s.sale_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('s.sale_date', '<=', endDate);
    }

    const sales = await query
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countQuery = db('sales').where('user_id', req.user.userId);
    if (startDate) countQuery.where('sale_date', '>=', startDate);
    if (endDate) countQuery.where('sale_date', '<=', endDate);
    
    const total = await countQuery.count('* as count').first();

    res.json({
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Sales fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

/**
 * @swagger
 * /api/sales/daily-summary:
 *   get:
 *     summary: Get daily sales summary
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Specific date (defaults to today)
 *     responses:
 *       200:
 *         description: Daily summary retrieved successfully
 */
router.get('/daily-summary', auth, async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;

    const summary = await db('sales')
      .where('user_id', req.user.userId)
      .whereRaw('DATE(sale_date) = ?', [date])
      .select(
        db.raw('COUNT(*) as total_transactions'),
        db.raw('COALESCE(SUM(total_amount), 0) as total_sales'),
        db.raw('COALESCE(SUM(amount_paid), 0) as total_cash_collected'),
        db.raw('COALESCE(SUM(balance), 0) as total_balance')
      )
      .first();

    // Payment method breakdown
    const paymentMethods = await db('sales')
      .where('user_id', req.user.userId)
      .whereRaw('DATE(sale_date) = ?', [date])
      .groupBy('payment_method')
      .select(
        'payment_method',
        db.raw('COUNT(*) as transaction_count'),
        db.raw('COALESCE(SUM(total_amount), 0) as total_amount')
      );

    res.json({
      date,
      summary: {
        ...summary,
        total_transactions: parseInt(summary.total_transactions),
        total_sales: parseFloat(summary.total_sales),
        total_cash_collected: parseFloat(summary.total_cash_collected),
        total_balance: parseFloat(summary.total_balance)
      },
      payment_methods: paymentMethods
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({ error: 'Failed to fetch daily summary' });
  }
});

module.exports = router;
