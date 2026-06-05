const express = require('express');
const router = express.Router();

// Mock coupon logic
// POST /api/coupons/apply { code }
router.post('/apply', (req, res) => {
  const { code } = req.body || {};
  const coupons = {
    SAVE10: { type: 'percent', value: 10 },
    SAVE20: { type: 'percent', value: 20 },
    FLAT5: { type: 'flat', value: 5 }
  };

  const c = coupons[(code || '').toUpperCase()];
  if (!c) return res.status(404).json({ message: 'Invalid coupon' });
  res.json({ code: (code || '').toUpperCase(), discount: c });
});

module.exports = router;
