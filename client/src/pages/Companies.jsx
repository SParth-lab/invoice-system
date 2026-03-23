import { useState, useEffect } from "react";
import api from "../api";
import AddCompanyModal from "../components/AddCompanyModal";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get("/companies");
      setCompanies(data);
    } catch (err) {
      showToast("Failed to load companies", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveCompany = (savedCompany, isEdit) => {
    if (isEdit) {
      setCompanies(prev => prev.map(c => c._id === savedCompany._id ? savedCompany : c));
      showToast(`Company "${savedCompany.name}" updated!`);
    } else {
      setCompanies(prev => [...prev, savedCompany].sort((a, b) => a.name.localeCompare(b.name)));
      showToast(`Company "${savedCompany.name}" added!`);
    }
    setShowModal(false);
    setEditingCompany(null);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/companies/${id}`);
      setCompanies(prev => prev.filter(c => c._id !== id));
      showToast(`Company deleted!`);
    } catch (err) {
      showToast(`Failed to delete company: ${err.response?.data?.error || err.message}`, "error");
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
    <div style={{ minHeight: "100vh", background: "var(--bg-body)", padding: "24px" }}>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.type === "success" ? "✓ " : "⚠ "}{toast.msg}</div>}

      {(showModal || editingCompany) && (
        <AddCompanyModal
          initialData={editingCompany}
          onClose={() => { setShowModal(false); setEditingCompany(null); }}
          onSave={handleSaveCompany}
        />
      )}

      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Companies</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Manage your companies and invoice sequences.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Company
          </button>
        </div>

        {companies.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏢</div>
            <h3>No Companies Found</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>You haven't added any companies yet.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Your First Company</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {companies.map(company => (
              <div key={company._id} className="card fade-in" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{company.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                      <span className="tag tag-blue" style={{ padding: "2px 6px", fontSize: 10 }}>GST: {company.gst}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: company.themeColor,
                      border: "1px solid var(--border)"
                    }}
                    title="Theme Color"
                  />
                </div>
                
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, flex: 1, marginBottom: 16 }}>
                  {company.address}
                </div>

                <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: 8, marginBottom: 16, fontSize: 13, border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>Prefix:</span>
                    <span style={{ fontWeight: 600 }}>{company.invoicePrefix || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Current Seq:</span>
                    <span style={{ fontWeight: 600 }}>{company.lastInvoiceSequence || 0}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => setEditingCompany(company)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ flex: 1, color: "var(--accent-red)", borderColor: "#fca5a5", background: "var(--accent-red-bg)" }}
                    onClick={() => handleDelete(company._id, company.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
