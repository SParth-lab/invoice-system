import { fmt, toWords } from "../utils/helpers";

export default function LiveCalc({
  subtotal, cgstAmt, sgstAmt, totalTax, grandTotal, rate,
  invoiceNo, invoiceDate, dueDate, items, totalQty, seller, buyer,
}) {
  const checkItems = [
    { label: "Seller selected", done: !!seller },
    { label: "Buyer selected", done: !!buyer },
    { label: "At least 1 item", done: items.some((i) => i.description && parseFloat(i.qty) > 0 && parseFloat(i.unitPrice) > 0) },
    { label: "Invoice number set", done: !!invoiceNo },
    { label: "Invoice date set", done: !!invoiceDate },
  ];
  const allDone = checkItems.every((c) => c.done);

  return (
    <div className="sticky top-28 flex flex-col gap-6">
      {/* Live Totals */}
      <div className="bg-gradient-to-br from-white to-primary-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="text-lg">⚡</span> Live Calculation
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-slate-100/60">
          <span className="text-sm text-slate-500 font-medium">Subtotal</span>
          <span className="text-[15px] font-bold text-slate-900 font-mono">₹{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center py-2.5 border-b border-slate-100/60">
          <span className="text-sm text-slate-500 font-medium">CGST ({rate.cgst}%)</span>
          <span className="text-[15px] font-bold text-amber-600 font-mono">₹{fmt(cgstAmt)}</span>
        </div>
        <div className="flex justify-between items-center py-2.5 border-b border-slate-100/60">
          <span className="text-sm text-slate-500 font-medium">SGST ({rate.sgst}%)</span>
          <span className="text-[15px] font-bold text-amber-600 font-mono">₹{fmt(sgstAmt)}</span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-sm font-semibold text-slate-700">Total Tax</span>
          <span className="text-[15px] font-bold text-orange-600 font-mono">₹{fmt(totalTax)}</span>
        </div>

        {/* Grand Total */}
        <div className="mt-4 p-5 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl text-white shadow-md shadow-primary-500/20">
          <div className="text-[11px] font-bold tracking-wider opacity-90 mb-1">GRAND TOTAL</div>
          <div className="text-3xl font-bold tracking-tight font-mono">₹{fmt(grandTotal)}</div>
          {grandTotal > 0 && (
            <div className="text-[10px] opacity-80 mt-2 font-medium italic leading-snug">{toWords(grandTotal)}</div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-lg">📋</span> Summary
        </div>
        <div className="flex flex-col gap-3.5">
          {[
            { label: "Invoice No.", value: invoiceNo || "—" },
            { label: "Invoice Date", value: invoiceDate || "—" },
            { label: "Due Date", value: dueDate || "—" },
            { label: "Total Items", value: `${items.filter((i) => i.description).length} item(s)` },
            { label: "Total Qty", value: totalQty || "0" },
            { label: "GST Slab", value: rate.label },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <span className="text-[13px] font-bold text-slate-900 font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Party Info */}
      {(seller || buyer) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-lg">🏢</span> Parties
          </div>
          <div className="flex flex-col gap-3">
            {seller && (
              <div className="p-3 bg-primary-50 rounded-xl border-l-4 border-primary-500">
                <div className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">SELLER</div>
                <div className="text-sm font-bold text-primary-800 truncate">{seller.name}</div>
                <div className="text-[11px] font-semibold font-mono text-primary-600/70 mt-0.5">{seller.gst}</div>
              </div>
            )}
            {seller && buyer && <div className="text-center text-slate-300 text-lg font-bold">↓</div>}
            {buyer && (
              <div className="p-3 bg-emerald-50 rounded-xl border-l-4 border-emerald-500">
                <div className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">BUYER</div>
                <div className="text-sm font-bold text-emerald-800 truncate">{buyer.name}</div>
                <div className="text-[11px] font-semibold font-mono text-emerald-600/70 mt-0.5">{buyer.gst}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-lg">✅</span> Checklist
        </div>
        <div className="space-y-3">
          {checkItems.map(({ label, done }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-colors ${done ? "bg-emerald-50 border-emerald-500 text-emerald-500" : "bg-slate-50 border-slate-200 text-transparent"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className={`text-xs font-semibold ${done ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
            </div>
          ))}
        </div>
        {allDone && (
          <div className="mt-5 py-2.5 px-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-[13px] font-bold text-center flex items-center justify-center gap-2 shadow-sm">
            ✓ Ready to save!
          </div>
        )}
      </div>
    </div>
  );
}
