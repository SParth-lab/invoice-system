import { useState } from "react";
import api from "../api";

export default function AddCompanyModal({ onClose, onSave, initialData }) {
  const [name, setName] = useState(initialData?.name || "");
  const [gst, setGst] = useState(initialData?.gst || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [themeColor, setThemeColor] = useState(initialData?.themeColor || "#CC0000");
  const [invoicePrefix, setInvoicePrefix] = useState(initialData?.invoicePrefix || "INV-");
  const [startingSequence, setStartingSequence] = useState((initialData?.lastInvoiceSequence || 0) + 1);
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || "");
  const [pdfTemplate, setPdfTemplate] = useState(initialData?.pdfTemplate || "standard");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !gst || !address) return setError("All fields are required");
    if (gst.length < 15) return setError("GST number must be 15 characters");
    setSaving(true);
    try {
      const payload = { 
        name, 
        gst: gst.toUpperCase(), 
        address, 
        themeColor,
        invoicePrefix,
        lastInvoiceSequence: Math.max(0, parseInt(startingSequence) - 1) || 0,
        logoUrl,
        pdfTemplate
      };
      if (initialData) {
        const { data } = await api.put(`/companies/${initialData._id}`, payload);
        onSave(data, true);
      } else {
        const { data } = await api.post("/companies", payload);
        onSave(data, false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add company");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{initialData ? "Edit Company" : "Add New Company"}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>This company will be available for all your invoices</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-input)",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--accent-red-bg)",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              color: "var(--accent-red)",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="label-field">Company Name</label>
            <input className="input-field" placeholder="e.g. Sunday Fashion" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label-field">GST Number</label>
            <input
              className="input-field mono"
              placeholder="e.g. 24AELPI2850K1ZF"
              value={gst}
              onChange={(e) => setGst(e.target.value.toUpperCase())}
              maxLength={15}
              style={{ textTransform: "uppercase", letterSpacing: "1px" }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label-field">Full Address</label>
            <textarea
              className="input-field"
              placeholder="Full address including city, state, and pincode..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              style={{ resize: "none", fontFamily: "var(--font-sans)" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="label-field">Invoice Prefix</label>
              <input className="input-field" placeholder="e.g. INV-" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} />
            </div>
            <div>
              <label className="label-field">Starting Invoice Sequence</label>
              <input className="input-field" type="number" min="1" value={startingSequence} onChange={(e) => setStartingSequence(e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="label-field">Invoice Theme Color</label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                style={{
                  width: "40px",
                  height: "40px",
                  padding: "2px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-white)",
                }}
              />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                This color will be used for PDF headers and accents.
              </span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            <div>
              <label className="label-field">PDF Template Style</label>
              <select className="input-field" value={pdfTemplate} onChange={(e) => setPdfTemplate(e.target.value)}>
                <option value="standard">Standard (Default)</option>
                <option value="modern">Modern (Centered Logo)</option>
                <option value="minimal">Minimal (Clean)</option>
              </select>
            </div>
            <div>
              <label className="label-field">Logo Image URL (Optional)</label>
              <input className="input-field" placeholder="https://example.com/logo.png" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "Saving..." : initialData ? "Save Changes" : "Add Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
