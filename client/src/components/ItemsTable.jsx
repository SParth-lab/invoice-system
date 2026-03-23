import { num } from "../utils/helpers";

export default function ItemsTable({ items, onAdd, onRemove, onUpdate }) {
  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const subtotal = items.reduce((s, it) => s + num(it.qty) * num(it.unitPrice), 0);
  const totalQty = items.reduce((s, it) => s + num(it.qty), 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="text-lg">📦</span> Line Items
        </div>
        <button 
          onClick={onAdd} 
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 text-[13px] font-bold rounded-lg transition-colors border border-primary-100 shadow-sm active:scale-95"
        >
          <span>➕</span> Add Item
        </button>
      </div>

      {/* Header */}
      <div className="hidden md:grid grid-cols-[40px_2fr_90px_120px_120px_40px] gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        <div className="text-center">#</div>
        <div>Description</div>
        <div className="text-center">Qty</div>
        <div className="text-right">Unit Price (₹)</div>
        <div className="text-right">Total (₹)</div>
        <div></div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => {
          const rowTotal = num(item.qty) * num(item.unitPrice);
          return (
            <div
              key={item._localId}
              className="group animate-fade-in grid grid-cols-1 md:grid-cols-[40px_2fr_90px_120px_120px_40px] gap-3 md:gap-2 items-center p-4 md:p-2 border border-slate-200 md:border-transparent md:hover:border-slate-200 md:hover:bg-white rounded-xl bg-slate-50 md:bg-transparent transition-all"
            >
              <div className="hidden md:block text-[13px] font-bold text-slate-400 text-center">
                {idx + 1}
              </div>
              <input
                className="w-full px-4 py-2 bg-white md:bg-slate-50 md:group-hover:bg-white border md:border-transparent md:hover:border-slate-300 md:focus:border-primary-400 rounded-lg text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder-slate-400 transition-all"
                placeholder="Item designation..."
                value={item.description}
                onChange={(e) => onUpdate(item._localId, "description", e.target.value)}
              />
              <div className="flex items-center gap-3 md:block">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider md:hidden w-16">Qty</span>
                <input
                  className="flex-1 text-center px-4 py-2 bg-white md:bg-slate-50 md:group-hover:bg-white border md:border-transparent md:hover:border-slate-300 md:focus:border-primary-400 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder-slate-400 transition-all font-mono"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={item.qty}
                  onChange={(e) => onUpdate(item._localId, "qty", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 md:block">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider md:hidden w-16">Price</span>
                <input
                  className="flex-1 text-right px-4 py-2 bg-white md:bg-slate-50 md:group-hover:bg-white border md:border-transparent md:hover:border-slate-300 md:focus:border-primary-400 rounded-lg text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder-slate-400 transition-all font-mono"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={item.unitPrice}
                  onChange={(e) => onUpdate(item._localId, "unitPrice", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 md:block">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider md:hidden w-16">Total</span>
                <div
                  className={`flex-1 text-right px-3 py-2 rounded-lg text-[13px] font-bold font-mono transition-colors ${
                    rowTotal > 0 ? "bg-primary-50 text-primary-700 border border-primary-100/50" : "bg-slate-100 text-slate-400 border border-transparent"
                  }`}
                >
                  ₹{fmt(rowTotal)}
                </div>
              </div>
              <div className="flex justify-end mt-2 md:mt-0">
                <button
                  className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-100 hover:border-red-500 mx-auto md:mx-0 flex items-center justify-center transition-all md:opacity-0 md:group-hover:opacity-100 active:scale-95"
                  onClick={() => onRemove(item._localId)}
                  title="Remove Item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals row */}
      {items.length > 0 && (
        <div className="mt-5 p-4 md:px-3 md:py-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="hidden md:grid grid-cols-[40px_2fr_90px_120px_120px_40px] gap-2">
            <div></div>
            <div className="text-[12px] font-bold text-slate-400 content-center tracking-wider text-right pr-4">TOTALS</div>
            <div className="text-center text-[14px] font-bold text-slate-700 font-mono content-center">{totalQty || "—"}</div>
            <div></div>
            <div className="text-right text-[15px] font-black text-primary-600 font-mono content-center">
              ₹{fmt(subtotal)}
            </div>
            <div></div>
          </div>
          <div className="flex md:hidden justify-between items-center">
            <div className="text-[12px] font-bold text-slate-400 tracking-wider">TOTAL QTY: <span className="text-slate-700">{totalQty || "0"}</span></div>
            <div className="text-[15px] font-black text-primary-600 font-mono">₹{fmt(subtotal)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
