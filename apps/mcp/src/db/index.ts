import { DatabaseSync } from "node:sqlite";
import { schema } from "./schema.js";

// One SQLite file (or ":memory:" in tests) holds every property, stay, ticket and order.
// node:sqlite is built into Node 24 — no native module to compile on the VPS.
export type Db = DatabaseSync;

export const openDb = (path = process.env.DB_PATH ?? "data/house.sqlite"): Db => {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(schema);
  return db;
};

export const now = () => new Date().toISOString();
