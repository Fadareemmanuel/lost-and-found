import Database from "better-sqlite3";

const db = new Database("lostfound.db");

function migrateUsers() {
  const cols = db.prepare("PRAGMA table_info(users)").all();
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("auth_provider")) {
    db.exec(
      "ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'password'"
    );
  }
}

function migrateItems() {
  const cols = db.prepare("PRAGMA table_info(items)").all();
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("color")) {
    db.exec("ALTER TABLE items ADD COLUMN color TEXT");
  }
  if (!names.has("size_bucket")) {
    db.exec("ALTER TABLE items ADD COLUMN size_bucket TEXT");
    if (!names.has("latitude")) {
  db.exec("ALTER TABLE items ADD COLUMN latitude REAL");
}
if (!names.has("longitude")) {
  db.exec("ALTER TABLE items ADD COLUMN longitude REAL");
}
if (!names.has("location_label")) {
  db.exec("ALTER TABLE items ADD COLUMN location_label TEXT");
}
  }
}

function migrateClaimsAndNotifications() {
  const claimCols = db.prepare("PRAGMA table_info(claims)").all();
  const claimNames = new Set(claimCols.map((c) => c.name));
  if (!claimNames.has("claim_type")) {
    db.exec(
      "ALTER TABLE claims ADD COLUMN claim_type TEXT NOT NULL DEFAULT 'claim_found'"
    );
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      item_id INTEGER,
      claim_id INTEGER,
      read_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (item_id) REFERENCES items(id),
      FOREIGN KEY (claim_id) REFERENCES claims(id)
    );
  `);
}

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT,
      location TEXT,
      date TEXT,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      posted_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (posted_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      claimant_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id),
      FOREIGN KEY (claimant_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      claim_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (claim_id) REFERENCES claims(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );
  `);
  migrateUsers();
  migrateItems();
  migrateClaimsAndNotifications();
}

export default db;