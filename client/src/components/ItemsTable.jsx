import { num } from "../utils/helpers";

export default function ItemsTable({ items, onAdd, onRemove, onUpdate }) {
  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const subtotal = items.reduce((s, it) => s + num(it.qty) * num(it.unitPrice), 0);
  const totalQty = items.reduce((s, it) => s + num(it.qty), 0);

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>
          <span className="icon">📦</span> Line Items
        </div>
        <button onClick={onAdd} className="btn btn-primary btn-sm">+ Add Item</button>
      </div>

      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px 2fr 90px 120px 120px 36px",
          gap: 8,
          padding: "8px 12px",
          background: "var(--bg-body)",
          borderRadius: "var(--radius-sm)",
          marginBottom: 8,
        }}
      >
        {["#", "Description", "Qty", "Unit Price (₹)", "Total (₹)", ""].map((h, i) => (
          <div
            key={i}
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--text-muted)",
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, idx) => {
          const rowTotal = num(item.qty) * num(item.unitPrice);
          return (
            <div
              key={item._localId}
              className="item-row fade-in"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 2fr 90px 120px 120px 36px",
                gap: 8,
                alignItems: "center",
                padding: "8px 12px",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-white)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textAlign: "center" }}>
                {idx + 1}
              </div>
              <input
                className="input-field"
                style={{ background: "transparent", border: "none", padding: "6px 0", borderBottom: "1px solid var(--border-light)", borderRadius: 0 }}
                placeholder={`Item name...`}
                value={item.description}
                onChange={(e) => onUpdate(item._localId, "description", e.target.value)}
              />
              <input
                className="input-field"
                style={{ textAlign: "center", padding: "6px 8px" }}
                type="number"
                min="0"
                placeholder="0"
                value={item.qty}
                onChange={(e) => onUpdate(item._localId, "qty", e.target.value)}
              />
              <input
                className="input-field"
                style={{ textAlign: "right", padding: "6px 8px" }}
                type="number"
                min="0"
                placeholder="0.00"
                value={item.unitPrice}
                onChange={(e) => onUpdate(item._localId, "unitPrice", e.target.value)}
              />
              <div
                className="mono"
                style={{
                  background: rowTotal > 0 ? "var(--accent-bg)" : "var(--bg-input)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  textAlign: "right",
                  fontSize: 13,
                  fontWeight: 600,
                  color: rowTotal > 0 ? "var(--accent)" : "var(--text-dim)",
                  transition: "all .2s",
                }}
              >
                ₹{fmt(rowTotal)}
              </div>
              <button
                className="remove-btn"
                onClick={() => onRemove(item._localId)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "var(--accent-red-bg)",
                  border: "1px solid #fca5a5",
                  color: "var(--accent-red)",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Totals row */}
      {items.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 2fr 90px 120px 120px 36px",
            gap: 8,
            marginTop: 10,
            padding: "10px 12px",
            background: "var(--bg-body)",
            borderRadius: "var(--radius-sm)",
            borderTop: "2px solid var(--border)",
          }}
        >
          <div></div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>TOTAL</div>
          <div className="mono" style={{ textAlign: "center", fontSize: 13, fontWeight: 700 }}>{totalQty || "—"}</div>
          <div></div>
          <div className="mono" style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
            ₹{fmt(subtotal)}
          </div>
          <div></div>
        </div>
      )}
    </div>
  );
}
