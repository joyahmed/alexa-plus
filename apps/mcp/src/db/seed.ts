import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { openDb, type Db } from "./index.js";

// Fictional demo data only — see PLAN.md standing rules. Idempotent: wipes and reinserts.
// Three houses, one host. Dates are relative to today so the demo never goes stale:
//   lakeview  — Priya is mid-stay (out in 3 days), the Okafors arrive the day after.
//   harbor    — Marcus leaves TOMORROW and Elena & Tom arrive the day after: two changeover days
//               in a row, so a repair reported today visibly lands three days out.
//   pineridge — the Lindqvists checked in TODAY (the welcome moment); no electrician on the list.

type Guide = [topic: string, keywords: string, answer: string, image: string | null];
type Stay = [id: string, guest: string, guests: number, inOffset: number, outOffset: number];
type Vendor = [trade: string, name: string, phone: string];
type Supply = [item: string, location: string, quantity: number, reorderAt: number, sku: string];
type Property = {
  id: string; name: string; address: string; checkoutTime: string; wifi: [ssid: string, password: string];
  guide: Guide[]; stays: Stay[]; vendors: Vendor[]; supplies: Supply[];
};

export const PROPERTIES: Property[] = [
  {
    id: "lakeview", name: "Lakeview Cabin", address: "14 Shore Road, Lake Placid, NY", checkoutTime: "11:00", wifi: ["Lakeview-Guest", "paddle2026"],
    guide: [
      ["hot tub", "hot tub,jacuzzi,spa", "Lift the grey cover and fold it onto the rail. Press the power button on the panel by the steps, then JETS. It takes about 15 minutes to warm up. Please put the cover back when you're done.", "/img/lakeview/hot-tub.svg"],
      ["wifi", "wifi,wi-fi,internet,password", "The network is Lakeview-Guest and the password is paddle2026. The router is in the hall cupboard if it ever needs a restart.", "/img/lakeview/wifi-qr.png"],
      ["heating", "heating,thermostat,cold,heat", "The thermostat is on the wall by the kitchen door. Turn the dial to raise the temperature; it is set to 20 degrees by default.", null],
      ["checkout", "checkout,check out,leave,leaving", "Checkout is 11 am. Leave the keys on the kitchen table, put the towels in the bath, and pull the door shut behind you — it locks itself.", null],
      ["bins", "bins,trash,garbage,rubbish,recycling", "The bins are in the shed to the left of the porch. Blue is recycling, green is general. Collection is Tuesday morning.", null],
      ["coffee", "coffee,machine,pods,espresso", "The coffee machine takes Nespresso-style pods. Pods are in the tin next to it; there is a spare box in the hall cupboard.", null],
    ],
    stays: [["stay-current", "Priya", 2, -1, 3], ["stay-next", "The Okafors", 4, 4, 9]],
    vendors: [
      ["plumber", "Dan Whitlock Plumbing", "+1 518 555 0142"],
      ["electrician", "Adirondack Electric", "+1 518 555 0187"],
      ["cleaner", "Marta Ruiz", "+1 518 555 0110"],
      ["handyman", "Lake Placid Handyman Co.", "+1 518 555 0199"],
    ],
    supplies: [
      ["coffee pods", "tin by the machine; spare box in the hall cupboard", 4, 10, "POD-LUNGO-40"],
      ["toilet paper", "bathroom cabinet", 6, 4, "TP-12"],
      ["dishwasher tablets", "under the sink", 12, 6, "DW-TAB-30"],
      ["firewood bundle", "shed", 2, 2, "WOOD-BNDL"],
    ],
  },
  {
    id: "harbor", name: "Harbor Loft", address: "22 Quay Street, 3rd floor, Portland, ME", checkoutTime: "10:00", wifi: ["HarborLoft", "foghorn-22"],
    guide: [
      ["wifi", "wifi,wi-fi,internet,password", "The network is HarborLoft and the password is foghorn-22. The router sits on the bookshelf by the window.", null],
      ["door", "door,lock,code,keypad,key,locked out", "The street door code is 4471, then press the bell icon. The apartment door locks itself — take the fob from the hook by the door whenever you go out.", null],
      ["parking", "parking,park,car,garage", "Your space is number 8 in the garage under the building. The fob on the hook opens the garage gate. Street parking is free after 6 pm.", null],
      ["heating", "heating,radiator,cold,heat,warm", "The radiators have a dial at the bottom; 3 is comfortable. The boiler is on a timer, 6 am to 11 pm, so the flat can feel cool first thing.", null],
      ["laundry", "laundry,washer,washing machine,dryer,clothes", "The washer-dryer is behind the folding door in the kitchen. Program 3 is a 40-degree wash; 'Dry' runs on afterward if you press it.", null],
      ["checkout", "checkout,check out,leave,leaving", "Checkout is 10 am. Leave the fob on the hook, run the dishwasher, and just pull the door shut — it locks itself.", null],
    ],
    stays: [["harbor-current", "Marcus", 1, -3, 1], ["harbor-next", "Elena and Tom", 2, 2, 6]],
    vendors: [
      ["plumber", "Casco Bay Plumbing", "+1 207 555 0161"],
      ["electrician", "Old Port Electric", "+1 207 555 0128"],
      ["cleaner", "Nadia Petrov", "+1 207 555 0173"],
      ["handyman", "Quay Street Repairs", "+1 207 555 0195"],
    ],
    supplies: [
      ["coffee beans", "jar beside the grinder", 1, 1, "BEAN-1KG"],
      ["toilet paper", "cupboard under the bathroom sink", 3, 4, "TP-12"],
      ["laundry pods", "shelf above the washer", 8, 5, "LNDRY-POD-30"],
      ["paper towels", "under the kitchen sink", 2, 2, "PT-6"],
    ],
  },
  {
    id: "pineridge", name: "Pine Ridge Chalet", address: "7 Summit Trail, Stowe, VT", checkoutTime: "11:00", wifi: ["PineRidge", "powder-day"],
    guide: [
      ["sauna", "sauna,steam,hot room", "The sauna is off the downstairs bathroom. Turn the timer dial on the wall outside to 45 minutes and it heats in about 20. Pour water on the stones from the bucket, not the tap. Leave the door open afterwards to dry it out.", null],
      ["wood stove", "stove,fire,fireplace,wood,log,burner", "Open the air vent fully, light the firelighter under two small logs, and close the door once the flames catch. After ten minutes turn the vent halfway. Logs are stacked on the porch; the kindling box is beside the stove.", null],
      ["wifi", "wifi,wi-fi,internet,password", "The network is PineRidge and the password is powder-day. The signal is weakest in the loft; the router is under the stairs.", null],
      ["ski storage", "ski,skis,snowboard,boots,storage,gear", "Skis and boards go in the heated room off the garage — the door on the left as you come in. Boot warmers are on the shelf; switch them off when you take the boots out.", null],
      ["driveway", "driveway,snow,plough,plow,shovel,drive", "The driveway is ploughed by 7 am after any snowfall. The shovel and a bag of salt are just inside the garage door if you need the steps cleared.", null],
      ["checkout", "checkout,check out,leave,leaving", "Checkout is 11 am. Close the stove vent, leave the keys in the lockbox by the door, and set the thermostat to 15.", null],
    ],
    stays: [["pine-prev", "Jonah", 3, -6, -2], ["pine-current", "The Lindqvists", 5, 0, 5], ["pine-next", "Aisha", 2, 7, 10]],
    vendors: [
      ["plumber", "Green Mountain Plumbing", "+1 802 555 0134"],
      ["cleaner", "Summit Clean Co.", "+1 802 555 0156"],
      ["handyman", "Stowe Handyman", "+1 802 555 0177"],
    ],
    supplies: [
      ["firewood bundle", "stacked on the porch; more in the garage", 3, 3, "WOOD-BNDL"],
      ["coffee pods", "drawer under the machine", 14, 10, "POD-LUNGO-40"],
      ["toilet paper", "hall cupboard, top shelf", 10, 4, "TP-12"],
      ["dishwasher tablets", "under the sink", 4, 6, "DW-TAB-30"],
      ["firelighters", "kindling box beside the stove", 2, 4, "FIRE-LTR-48"],
    ],
  },
];

export const seed = (db: Db) => {
  for (const t of ["host_feed", "orders", "supplies", "vendors", "tickets", "stays", "guide_entries", "properties"]) {
    db.exec(`DELETE FROM ${t}`);
  }
  db.exec(`DELETE FROM sqlite_sequence`); // ticket/order numbers start at 1 again after a reseed

  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const plus = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };

  const property = db.prepare(`INSERT INTO properties (id, name, address, checkout_time, wifi_ssid, wifi_password) VALUES (?, ?, ?, ?, ?, ?)`);
  const guide = db.prepare(`INSERT INTO guide_entries (property_id, topic, keywords, answer, image_url) VALUES (?, ?, ?, ?, ?)`);
  const stay = db.prepare(`INSERT INTO stays (id, property_id, guest_name, guests, check_in, check_out) VALUES (?, ?, ?, ?, ?, ?)`);
  const vendor = db.prepare(`INSERT INTO vendors (property_id, trade, name, phone) VALUES (?, ?, ?, ?)`);
  const supply = db.prepare(`INSERT INTO supplies (property_id, item, location, quantity, reorder_at, sku) VALUES (?, ?, ?, ?, ?, ?)`);

  for (const p of PROPERTIES) {
    property.run(p.id, p.name, p.address, p.checkoutTime, p.wifi[0], p.wifi[1]);
    for (const g of p.guide) guide.run(p.id, ...g);
    for (const [id, guest, guests, inOff, outOff] of p.stays) stay.run(id, p.id, guest, guests, plus(inOff), plus(outOff));
    for (const v of p.vendors) vendor.run(p.id, ...v);
    for (const s of p.supplies) supply.run(p.id, ...s);
  }
};

if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  const path = process.env.DB_PATH ?? "data/house.sqlite";
  mkdirSync(dirname(path), { recursive: true });
  seed(openDb(path));
  console.log(`seeded ${path}: ${PROPERTIES.map((p) => p.id).join(", ")}`);
}
