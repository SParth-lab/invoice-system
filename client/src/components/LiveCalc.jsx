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
    <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Live Totals */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, var(--bg-white), var(--accent-bg))",
          border: "1px solid var(--border)",
          padding: 20,
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="section-title" style={{ marginBottom: 14 }}>
          <span className="icon">⚡</span> Live Calculation
        </div>

        <div className="calc-row">
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Subtotal</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>₹{fmt(subtotal)}</span>
        </div>
        <div className="calc-row">
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>CGST ({rate.cgst}%)</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-yellow)" }}>₹{fmt(cgstAmt)}</span>
        </div>
        <div className="calc-row">
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>SGST ({rate.sgst}%)</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-yellow)" }}>₹{fmt(sgstAmt)}</span>
        </div>
        <div className="calc-row" style={{ borderBottom: "none" }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Tax</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--accent-orange)" }}>₹{fmt(totalTax)}</span>
        </div>

        {/* Grand Total */}
        <div
          style={{
            marginTop: 12,
            padding: "16px",
            background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
            borderRadius: "var(--radius-md)",
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 4, fontWeight: 600, letterSpacing: "0.04em" }}>GRAND TOTAL</div>
          <div className="mono" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px" }}>₹{fmt(grandTotal)}</div>
          {grandTotal > 0 && (
            <div style={{ fontSize: 10, opacity: 0.8, marginTop: 6, lineHeight: 1.5, fontStyle: "italic" }}>{toWords(grandTotal)}</div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="card" style={{ padding: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          <span className="icon">📋</span> Summary
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Invoice No.", value: invoiceNo || "—" },
            { label: "Invoice Date", value: invoiceDate || "—" },
            { label: "Due Date", value: dueDate || "—" },
            { label: "Total Items", value: `${items.filter((i) => i.description).length} item(s)` },
            { label: "Total Qty", value: totalQty || "0" },
            { label: "GST Slab", value: rate.label },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Party Info */}
      {(seller || buyer) && (
        <div className="card" style={{ padding: 16 }}>
          <div className="section-title" style={{ marginBottom: 12 }}>
            <span className="icon">🏢</span> Parties
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {seller && (
              <div style={{ padding: "8px 12px", background: "var(--accent-bg)", borderRadius: 8, borderLeft: "3px solid var(--accent)" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>SELLER</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{seller.name}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{seller.gst}</div>
              </div>
            )}
            {seller && buyer && <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-dim)" }}>↓</div>}
            {buyer && (
              <div style={{ padding: "8px 12px", background: "var(--accent-green-bg)", borderRadius: 8, borderLeft: "3px solid var(--accent-green)" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>BUYER</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-green)" }}>{buyer.name}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{buyer.gst}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="card" style={{ padding: 16 }}>
        <div className="section-title" style={{ marginBottom: 10 }}>
          <span className="icon">✅</span> Checklist
        </div>
        {checkItems.map(({ label, done }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: done ? "var(--accent-green-bg)" : "var(--bg-body)",
                border: `1.5px solid ${done ? "var(--accent-green)" : "var(--border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: done ? "var(--accent-green)" : "var(--text-dim)",
                flexShrink: 0,
              }}
            >
              {done ? "✓" : ""}
            </div>
            <span style={{ fontSize: 12, color: done ? "var(--text-secondary)" : "var(--text-dim)" }}>{label}</span>
          </div>
        ))}
        {allDone && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              background: "var(--accent-green-bg)",
              border: "1px solid var(--accent-green-light)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--accent-green)",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            ✓ Ready to save!
          </div>
        )}
      </div>
    </div>
  );
}
