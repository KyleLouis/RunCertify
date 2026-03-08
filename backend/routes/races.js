const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT raceName FROM finishers WHERE raceName IS NOT NULL AND raceName != ''
    UNION
    SELECT raceName FROM volunteers WHERE raceName IS NOT NULL AND raceName != ''
  `).all();
  res.json(rows.map(r => r.raceName));
});

module.exports = router;
