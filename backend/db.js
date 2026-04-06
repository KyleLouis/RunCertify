const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS finishers (
    id TEXT PRIMARY KEY,
    name TEXT, bibNumber TEXT, raceName TEXT, category TEXT,
    finishTime TEXT, netTime TEXT, genderRank TEXT, overallRank TEXT,
    date TEXT, inspirationalQuote TEXT, badgeImageUrl TEXT,
    logoUrl TEXT, themeImageUrl TEXT, runnerImageUrl TEXT, signatureUrl TEXT,
    createdAt TEXT
  );
  CREATE TABLE IF NOT EXISTS volunteers (
    id TEXT PRIMARY KEY,
    name TEXT, raceName TEXT, role TEXT, serviceHours TEXT,
    date TEXT, certificateNumber TEXT, logoUrl TEXT, signatureUrl TEXT,
    badgeImageUrl TEXT, themeImageUrl TEXT, runnerImageUrl TEXT, createdAt TEXT
  );
`);

try { db.exec('ALTER TABLE finishers ADD COLUMN styleJson TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE volunteers ADD COLUMN styleJson TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE finishers ADD COLUMN createdAt TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE volunteers ADD COLUMN createdAt TEXT'); } catch(e) {}

function backfillCreatedAt(table) {
  const rows = db.prepare(`SELECT rowid FROM ${table} WHERE createdAt IS NULL ORDER BY rowid ASC`).all();
  if (rows.length === 0) return;
  const baseTime = Date.now() - rows.length * 1000;
  const update = db.prepare(`UPDATE ${table} SET createdAt = ? WHERE rowid = ?`);
  db.transaction((items) => {
    items.forEach((row, index) => {
      update.run(new Date(baseTime + index * 1000).toISOString(), row.rowid);
    });
  })(rows);
}

backfillCreatedAt('finishers');
backfillCreatedAt('volunteers');

// Seed admin
const admin = db.prepare('SELECT id FROM admins WHERE account = ?').get('13800009999');
if (!admin) {
  const hash = bcrypt.hashSync('123456', 10);
  db.prepare('INSERT INTO admins (account, password) VALUES (?, ?)').run('13800009999', hash);
}

// Seed finishers
const finisherCount = db.prepare('SELECT COUNT(*) as c FROM finishers').get();
if (finisherCount.c === 0) {
  const ins = db.prepare(`INSERT INTO finishers (id,name,bibNumber,raceName,category,finishTime,netTime,genderRank,overallRank,date,inspirationalQuote) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  ins.run('1','张杰瑞','A2045','2024 城市马拉松','全程马拉松 (42.195km)','03:45:21','03:45:21','142 / 1200','312 / 4500','2024年10月24日','亲爱的张杰瑞：奔跑是不设限的自由，脚步丈量的是勇气的疆域。');
  ins.run('2','李安娜','B1088','2024 城市马拉松','半程马拉松 (21.0975km)','01:52:10','01:51:45','85 / 800','520 / 3000','2024年10月24日','亲爱的李安娜：每一次起跑，都是对平凡生活的一次超越。');
}

// Seed volunteers
const volCount = db.prepare('SELECT COUNT(*) as c FROM volunteers').get();
if (volCount.c === 0) {
  db.prepare(`INSERT INTO volunteers (id,name,raceName,role,serviceHours,date,certificateNumber) VALUES (?,?,?,?,?,?,?)`).run('v1','陈小明','2026 戈赛','医疗志愿者','','2026年03月08日','PHBS-VOL-2026-S1-001');
}

module.exports = db;
