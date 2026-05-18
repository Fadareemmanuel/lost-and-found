import Database from "better-sqlite3";

const db = new Database("lostfound.db");

try {
  // Delete all claims first (they reference items)
  db.exec("DELETE FROM claims");
  console.log("✓ Cleared claims table");

  // Delete all messages (they reference claims)
  db.exec("DELETE FROM messages");
  console.log("✓ Cleared messages table");

  // Delete all notifications
  db.exec("DELETE FROM notifications");
  console.log("✓ Cleared notifications table");

  // Delete all items
  db.exec("DELETE FROM items");
  console.log("✓ Cleared items table");

  console.log("\n✅ Database cleared successfully!");
  console.log("You can now test with a fresh database.\n");

  process.exit(0);
} catch (err) {
  console.error("❌ Error clearing database:", err.message);
  process.exit(1);
}
