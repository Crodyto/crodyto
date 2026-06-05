const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const admin = require('../../middleware/adminMiddleware');
const settingsCtrl = require('../../controllers/settingsController');

router.get('/', settingsCtrl.getAll);
router.get('/defaults', settingsCtrl.getDefaults);
router.get('/:key', settingsCtrl.get);
router.put('/:key', auth, admin, settingsCtrl.set);

module.exports = router;
