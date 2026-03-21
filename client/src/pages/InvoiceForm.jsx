import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { GST_RATES, fmt, num } from "../utils/helpers";
import ItemsTable from "../components/ItemsTable";
import LiveCalc from "../components/LiveCalc";
import AddCompanyModal from "../components/AddCompanyModal";

const EMPTY_ITEM = () => ({ _localId: Date.now() + Math.random(), description: "", qty: "", unitPrice: "" });

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const today = new Date().toISOString().split("T")[0];
  const defaultDue = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [companies, setCompanies] = useState([]);
  const [sellerId, setSellerId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState(defaultDue);
  const [gstRateIdx, setGstRateIdx] = useState(1);
  const [items, setItems] = useState([EMPTY_ITEM()]);
  const [terms, setTerms] = useState(
    "1. Goods Once Sold Will Not Be Accepted.\n2. Interest @ 24% will be charged from the due date.\n3. Subject to SURAT Jurisdiction Only. E.&.O.E"
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCompany, setShowAddCompany] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [compRes, numRes] = await Promise.all([
          api.get("/companies"),
          !isEdit ? api.get("/invoices/next-number/generate") : Promise.resolve(null),
        ]);
        setCompanies(compRes.data);
        if (numRes) setInvoiceNo(numRes.data.invoiceNo);

        if (isEdit) {
          const { data: inv } = await api.get(`/invoices/${id}`);
          setSellerId(inv.seller?._id || "");
          setBuyerId(inv.buyer?._id || "");
          setInvoiceNo(inv.invoiceNo);
          setInvoiceDate(inv.invoiceDate?.split("T")[0] || today);
          setDueDate(inv.dueDate?.split("T")[0] || defaultDue);
          setTerms(inv.terms || "");
          const idx = GST_RATES.findIndex((r) => r.cgst === inv.gstRate?.cgst && r.sgst === inv.gstRate?.sgst);
          setGstRateIdx(idx >= 0 ? idx : 1);
          setItems(
            inv.items.map((it, i) => ({
              _localId: Date.now() + i,
              description: it.description,
              qty: it.qty.toString(),
              unitPrice: it.unitPrice.toString(),
            }))
          );
        }
      } catch (err) {
        console.error("Init error:", err);
        showToast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCompanyAdded = (newCompany) => {
    setCompanies((prev) => [...prev, newCompany].sort((a, b) => a.name.localeCompare(b.name)));
    setShowAddCompany(false);
    showToast(`Company "${newCompany.name}" added!`);
  };

  const seller = companies.find((c) => c._id === sellerId);
  const buyer = companies.find((c) => c._id === buyerId);
  const rate = GST_RATES[gstRateIdx];

  const itemTotals = items.map((it) => num(it.qty) * num(it.unitPrice));
  const subtotal = itemTotals.reduce((s, v) => s + v, 0);
  const cgstAmt = (subtotal * rate.cgst) / 100;
  const sgstAmt = (subtotal * rate.sgst) / 100;
  const totalTax = cgstAmt + sgstAmt;
  const grandTotal = subtotal + totalTax;
  const totalQty = items.reduce((s, it) => s + num(it.qty), 0);

  const addItem = () => setItems((prev) => [...prev, EMPTY_ITEM()]);
  const removeItem = (localId) => setItems((prev) => (prev.length > 1 ? prev.filter((i) => i._localId !== localId) : prev));
  const updateItem = useCallback((localId, field, value) => {
    setItems((prev) => prev.map((i) => (i._localId === localId ? { ...i, [field]: value } : i)));
  }, []);

  const handleSave = async () => {
    if (!sellerId) return showToast("Please select a seller", "error");
    if (!buyerId) return showToast("Please select a buyer", "error");
    if (!invoiceNo) return showToast("Please set an invoice number", "error");
    const validItems = items.filter((i) => i.description && num(i.qty) > 0 && num(i.unitPrice) > 0);
    if (validItems.length === 0) return showToast("Add at least one valid item", "error");

    setSaving(true);
    try {
      const payload = {
        invoiceNo, invoiceDate, dueDate,
        seller: sellerId, buyer: buyerId,
        items: validItems.map((i) => ({ description: i.description, qty: num(i.qty), unitPrice: num(i.unitPrice) })),
        gstRate: rate, terms, status: "draft",
      };
      if (isEdit) {
        await api.put(`/invoices/${id}`, payload);
        showToast("Invoice updated!");
      } else {
        await api.post("/invoices", payload);
        showToast("Invoice saved!");
      }
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      showToast(`Error: ${err.response?.data?.error || err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-body)" }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === "success" ? "✓ " : "⚠ "}{toast.msg}</div>}

      {showAddCompany && (
        <AddCompanyModal onClose={() => setShowAddCompany(false)} onAdded={handleCompanyAdded} />
      )}

      {/* Top bar */}
      <div
        style={{
          background: "var(--bg-white)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
          {isEdit ? `Edit Invoice ${invoiceNo}` : "New Invoice"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/")}>← Back</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving..." : isEdit ? "Update Invoice" : "💾 Save Invoice"}
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          padding: "24px 20px",
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="fade-in">
          {/* Invoice Details */}
          <div className="card">
            <div className="section-title"><span className="icon">📋</span> Invoice Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <label className="label-field">Invoice No.</label>
                <input className="input-field" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="INV-001" />
              </div>
              <div>
                <label className="label-field">Invoice Date</label>
                <input className="input-field" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div>
                <label className="label-field">Due Date</label>
                <input className="input-field" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Company Selection */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="section-title" style={{ marginBottom: 0 }}><span className="icon">🏢</span> Companies</div>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddCompany(true)}>
                + Add Company
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Seller */}
              <div>
                <label className="label-field">Seller (From)</label>
                <select className="input-field" value={sellerId} onChange={(e) => setSellerId(e.target.value)} style={{ cursor: "pointer" }}>
                  <option value="">— Select Seller —</option>
                  {companies.filter((c) => c._id !== buyerId).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {seller && (
                  <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--accent-bg)", border: "1px solid var(--border)", borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--accent)", marginBottom: 4 }}>{seller.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6 }}>{seller.address}</div>
                    <div style={{ marginTop: 6 }}>
                      <span className="tag tag-blue">GST: {seller.gst}</span>
                    </div>
                  </div>
                )}
              </div>
              {/* Buyer */}
              <div>
                <label className="label-field">Buyer (Bill To)</label>
                <select className="input-field" value={buyerId} onChange={(e) => setBuyerId(e.target.value)} style={{ cursor: "pointer" }}>
                  <option value="">— Select Buyer —</option>
                  {companies.filter((c) => c._id !== sellerId).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {buyer && (
                  <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--accent-green-bg)", border: "1px solid var(--border)", borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--accent-green)", marginBottom: 4 }}>{buyer.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6 }}>{buyer.address}</div>
                    <div style={{ marginTop: 6 }}>
                      <span className="tag tag-green">GST: {buyer.gst}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <ItemsTable items={items} onAdd={addItem} onRemove={removeItem} onUpdate={updateItem} />

          {/* GST + Terms */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <div className="section-title"><span className="icon">💹</span> GST Rate</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {GST_RATES.map((r, i) => (
                  <label
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: gstRateIdx === i ? "var(--accent-bg)" : "var(--bg-input)",
                      border: `1.5px solid ${gstRateIdx === i ? "var(--accent)" : "var(--border-light)"}`,
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    <input type="radio" name="gst" checked={gstRateIdx === i} onChange={() => setGstRateIdx(i)} style={{ accentColor: "var(--accent)" }} />
                    <span style={{ fontSize: 13, fontWeight: gstRateIdx === i ? 600 : 400, color: gstRateIdx === i ? "var(--accent)" : "var(--text-secondary)" }}>
                      {r.label}
                    </span>
                    {i > 0 && (
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
                        CGST {r.cgst}% + SGST {r.sgst}%
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="section-title"><span className="icon">📝</span> Terms & Conditions</div>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                style={{
                  width: "100%",
                  height: 174,
                  background: "var(--bg-input)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  lineHeight: 1.7,
                  resize: "none",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — Live Calculation */}
        <LiveCalc
          subtotal={subtotal} cgstAmt={cgstAmt} sgstAmt={sgstAmt} totalTax={totalTax}
          grandTotal={grandTotal} rate={rate} invoiceNo={invoiceNo} invoiceDate={invoiceDate}
          dueDate={dueDate} items={items} totalQty={totalQty} seller={seller} buyer={buyer}
        />
      </div>
    </div>
  );
}
