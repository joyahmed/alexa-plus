// Supplier adapter. One interface, one implementation: a simulated supplier that accepts every
// order and delivers next day. The video and README say so plainly — no card, no real store.
// A real supplier (Amazon Business, a wholesaler API) is a second implementation of this interface.

export type SupplierOrder = { sku: string; quantity: number; deliverTo: string };
export type SupplierResult = { ref: string; status: "ordered"; eta: string };

export interface Supplier {
  order(o: SupplierOrder): Promise<SupplierResult>;
}

export const simulatedSupplier: Supplier = {
  async order(o) {
    const eta = new Date();
    eta.setUTCDate(eta.getUTCDate() + 1);
    return { ref: `SIM-${o.sku}-${Date.now().toString(36)}`, status: "ordered", eta: eta.toISOString().slice(0, 10) };
  },
};

export const orderFromSupplier = (o: SupplierOrder, supplier: Supplier = simulatedSupplier) => supplier.order(o);
