const router = require('express').Router();
const db = require('../db');
const auth = require('./auth_middleware');

const COLS = 'id,name,bibNumber,raceName,category,finishTime,netTime,genderRank,overallRank,date,inspirationalQuote,badgeImageUrl,logoUrl,themeImageUrl,runnerImageUrl,signatureUrl,styleJson';

function vals(f) {
  return [f.id,f.name,f.bibNumber??null,f.raceName,f.category,f.finishTime,f.netTime??null,f.genderRank??null,f.overallRank??null,f.date,f.inspirationalQuote??null,f.badgeImageUrl??null,f.logoUrl??null,f.themeImageUrl??null,f.runnerImageUrl??null,f.signatureUrl??null,f.styleJson??null];
}

router.get('/', auth, (req, res) => {
  const { race } = req.query;
  const rows = race
    ? db.prepare('SELECT * FROM finishers WHERE raceName = ?').all(race)
    : db.prepare('SELECT * FROM finishers').all();
  res.json(rows);
});

router.post('/batch', auth, (req, res) => {
  const items = req.body;
  const ins = db.prepare(`INSERT OR REPLACE INTO finishers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  db.transaction((rows) => { for (const f of rows) ins.run(vals(f)); })(items);
  res.json({ count: items.length });
});

router.post('/', auth, (req, res) => {
  db.prepare(`INSERT OR REPLACE INTO finishers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(vals(req.body));
  res.json(req.body);
});

router.put('/:id', auth, (req, res) => {
  const f = { ...req.body, id: req.params.id };
  db.prepare(`INSERT OR REPLACE INTO finishers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(vals(f));
  res.json(f);
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM finishers WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
