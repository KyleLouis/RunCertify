const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT raceName
    FROM (
      SELECT raceName, createdAt FROM finishers WHERE raceName IS NOT NULL AND raceName != ''
      UNION ALL
      SELECT raceName, createdAt FROM volunteers WHERE raceName IS NOT NULL AND raceName != ''
    )
    GROUP BY raceName
    ORDER BY MAX(datetime(createdAt)) DESC, raceName ASC
  `).all();
  res.json(rows.map(r => r.raceName));
});

module.exports = router;
