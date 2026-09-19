// Kept as a TS string so `tsc` ships it to dist - a .sql file next to the source is not copied.
export const schema = `
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  checkout_time TEXT NOT NULL DEFAULT '11:00',
  wifi_ssid TEXT,
  wifi_password TEXT
);
CREATE TABLE IF NOT EXISTS guide_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id TEXT NOT NULL REFERENCES properties(id),
  topic TEXT NOT NULL,
  keywords TEXT NOT NULL,
  answer TEXT NOT NULL,
  image_url TEXT
);
CREATE TABLE IF NOT EXISTS stays (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  guest_name TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id TEXT NOT NULL REFERENCES properties(id),
  stay_id TEXT REFERENCES stays(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  scheduled_at TEXT,
  vendor_id INTEGER
);
CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id TEXT NOT NULL REFERENCES properties(id),
  trade TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS supplies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id TEXT NOT NULL REFERENCES properties(id),
  item TEXT NOT NULL,
  location TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reorder_at INTEGER NOT NULL,
  sku TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id TEXT NOT NULL REFERENCES properties(id),
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL,
  eta TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS host_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id TEXT NOT NULL REFERENCES properties(id),
  kind TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;
