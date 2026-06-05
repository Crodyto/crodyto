const Settings = require('../models/Settings');

async function getSetting(key, defaultValue=null) {
  const doc = await Settings.findOne({ key });
  return doc? doc.value : defaultValue;
}

exports.getAll = async (req, res, next) => {
  try {
    const docs = await Settings.find();
    const out = {};
    for (const d of docs) out[d.key] = d.value;
    res.json(out);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const key = req.params.key;
    const doc = await Settings.findOne({ key });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc.value);
  } catch (err) { next(err); }
};

exports.set = async (req, res, next) => {
  try {
    const key = req.params.key;
    const value = req.body;
    const doc = await Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
    res.json(doc.value);
  } catch (err) { next(err); }
};

exports.getDefaults = async (req, res, next) => {
  try {
    const delivery = await getSetting('delivery', { charge: 0, type: 'flat' });
    const tax = await getSetting('tax', { percent: 0 });
    const terms = await getSetting('terms', '');
    const privacy = await getSetting('privacy', '');
    res.json({ delivery, tax, terms, privacy });
  } catch (err) { next(err); }
};
