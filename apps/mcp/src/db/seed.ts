import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { openDb, type Db } from "./index.js";

// Fictional demo data only — see PLAN.md standing rules. Idempotent: wipes and reinserts.
export const seed = (db: Db) => {
  for (const t of ["host_feed", "orders", "supplies", "vendors", "tickets", "stays", "guide_entries", "properties"]) {
    db.exec(`DELETE FROM ${t}`);
  }
  db.prepare(
    `INSERT INTO properties (id, name, address, checkout_time, wifi_ssid, wifi_password) VALUES (?, ?, ?, ?, ?, ?)`,
  ).run("lakeview", "Lakeview Cabin", "14 Shore Road, Lake Placid, NY", "11:00", "Lakeview-Guest", "paddle2026");

  const guide = db.prepare(
    `INSERT INTO guide_entries (property_id, topic, keywords, answer, image_url) VALUES ('lakeview', ?, ?, ?, ?)`,
  );
  guide.run("hot tub", "hot tub,jacuzzi,spa", "Lift the grey cover and fold it onto the rail. Press the power button on the panel by the steps, then JETS. It takes about 15 minutes to warm up. Please put the cover back when you're done.", "/img/lakeview/hot-tub.jpg");
  guide.run("wifi", "wifi,wi-fi,internet,password", "The network is Lakeview-Guest and the password is paddle2026. The router is in the hall cupboard if it ever needs a restart.", "/img/lakeview/wifi-qr.png");
  guide.run("heating", "heating,thermostat,cold,heat", "The thermostat is on the wall by the kitchen door. Turn the dial to raise the temperature; it is set to 20 degrees by default.", null);
  guide.run("checkout", "checkout,check out,leave,leaving", "Checkout is 11 am. Leave the keys on the kitchen table, put the towels in the bath, and pull the door shut behind you — it locks itself.", null);
  guide.run("bins", "bins,trash,garbage,rubbish,recycling", "The bins are in the shed to the left of the porch. Blue is recycling, green is general. Collection is Tuesday morning.", null);
  guide.run("coffee", "coffee,machine,pods,espresso", "The coffee machine takes Nespresso-style pods. Pods are in the tin next to it; there is a spare box in the hall cupboard.", null);

  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const plus = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
  const stay = db.prepare(
    `INSERT INTO stays (id, property_id, guest_name, guests, check_in, check_out) VALUES (?, 'lakeview', ?, ?, ?, ?)`,
  );
  stay.run("stay-current", "Priya", 2, iso(plus(-1)), iso(plus(3)));
  stay.run("stay-next", "The Okafors", 4, iso(plus(4)), iso(plus(9)));

  const vendor = db.prepare(`INSERT INTO vendors (property_id, trade, name, phone) VALUES ('lakeview', ?, ?, ?)`);
  vendor.run("plumber", "Dan Whitlock Plumbing", "+1 518 555 0142");
  vendor.run("electrician", "Adirondack Electric", "+1 518 555 0187");
  vendor.run("cleaner", "Marta Ruiz", "+1 518 555 0110");

  const supply = db.prepare(
    `INSERT INTO supplies (property_id, item, location, quantity, reorder_at, sku) VALUES ('lakeview', ?, ?, ?, ?, ?)`,
  );
  supply.run("coffee pods", "tin by the machine; spare box in the hall cupboard", 4, 10, "POD-LUNGO-40");
  supply.run("toilet paper", "bathroom cabinet", 6, 4, "TP-12");
  supply.run("dishwasher tablets", "under the sink", 12, 6, "DW-TAB-30");
  supply.run("firewood bundle", "shed", 2, 2, "WOOD-BNDL");
};

if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  const path = process.env.DB_PATH ?? "data/house.sqlite";
  mkdirSync(dirname(path), { recursive: true });
  seed(openDb(path));
  console.log(`seeded ${path}`);
}
