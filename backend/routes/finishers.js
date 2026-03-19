const router = require('express').Router();
const db = require('../db');
const auth = require('./auth_middleware');
const { processObjectImages } = require('../imageHelper');

const COLS = 'id,name,bibNumber,raceName,category,finishTime,netTime,genderRank,overallRank,date,inspirationalQuote,badgeImageUrl,logoUrl,themeImageUrl,runnerImageUrl,signatureUrl,styleJson';
const LIST_COLS = 'id,name,bibNumber,raceName,category,finishTime,netTime,genderRank,overallRank,date,inspirationalQuote,styleJson';

function vals(f) {
  return [f.id,f.name,f.bibNumber??null,f.raceName,f.category,f.finishTime,f.netTime??null,f.genderRank??null,f.overallRank??null,f.date,f.inspirationalQuote??null,f.badgeImageUrl??null,f.logoUrl??null,f.themeImageUrl??null,f.runnerImageUrl??null,f.signatureUrl??null,f.styleJson??null];
}

router.get('/', (req, res) => {
  const { race } = req.query;
  const rows = race
    ? db.prepare(`SELECT ${LIST_COLS} FROM finishers WHERE raceName = ?`).all(race)
    : db.prepare(`SELECT ${LIST_COLS} FROM finishers`).all();
  res.json(rows);
});

router.get('/search', (req, res) => {
  const { name, race } = req.query;
  let query = `SELECT * FROM finishers WHERE name = ?`;
  let params = [name];
  if (race) {
    query += ` AND raceName = ?`;
    params.push(race);
  }
  const row = db.prepare(query).get(...params);
  if (row) {
    // Make sure we return full URL if needed, but since it's /api/images/xxx, it's fine.
    // If the frontend needs absolute URL, we can prepend host. But frontend probably handles /api/images/...
    res.json(row);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM finishers WHERE id = ?').get(req.params.id);
  if (row) {
    res.json(row);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

router.post('/batch', auth, (req, res) => {
  const items = req.body.map(processObjectImages);
  const ins = db.prepare(`INSERT OR REPLACE INTO finishers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  db.transaction((rows) => { for (const f of rows) ins.run(vals(f)); })(items);
  res.json({ count: items.length });
});

router.post('/', auth, (req, res) => {
  const item = processObjectImages(req.body);
  db.prepare(`INSERT OR REPLACE INTO finishers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(vals(item));
  res.json(item);
});

router.put('/:id', auth, (req, res) => {
  const f = processObjectImages({ ...req.body, id: req.params.id });
  db.prepare(`INSERT OR REPLACE INTO finishers (${COLS}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(vals(f));
  res.json(f);
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM finishers WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.post('/batch-delete', auth, (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.json({ count: 0 });
  }
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM finishers WHERE id IN (${placeholders})`);
  stmt.run(...ids);
  res.json({ count: ids.length });
});

module.exports = router;
