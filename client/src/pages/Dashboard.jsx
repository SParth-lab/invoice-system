import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { fmt } from "../utils/helpers";

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, compRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/companies")
      ]);
      setInvoices(invRes.data);
      setCompanies(compRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice? This cannot be undone.")) return;
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const handleDownloadPdf = async (id, invoiceNo) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF: " + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  // Derived filtered state
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (inv.buyer?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompanyId ? inv.seller?._id === selectedCompanyId : true;
    return matchesSearch && matchesCompany;
  });

  // Stats
  const totalAmount = filteredInvoices.reduce((s, inv) => s + (inv.grandTotal || 0), 0);
  const draftCount = filteredInvoices.filter((i) => i.status === "draft").length;
  const finalizedCount = filteredInvoices.filter((i) => i.status === "finalized").length;

  // Chart Data
  const chartData = {};
  filteredInvoices.forEach(inv => {
    const key = selectedCompanyId ? (inv.buyer?.name || "Unknown Buyer") : (inv.seller?.name || "Unknown Seller");
    chartData[key] = (chartData[key] || 0) + (inv.grandTotal || 0);
  });
  const chartEntries = Object.entries(chartData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxChartValue = Math.max(...chartEntries.map(e => e[1]), 1);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }} className="fade-in">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", margin: 0 }}>Invoices</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
            Manage and track your GST invoices
          </p>
        </div>
        <Link to="/invoice/new" className="btn btn-primary">
          + Create Invoice
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card slide-up" style={{ display: "flex", gap: 16, marginBottom: 24, padding: "16px 20px" }}>
        <div style={{ flex: 1 }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by Invoice No. or Buyer Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: 300 }}>
          <select 
            className="input-field" 
            value={selectedCompanyId} 
            onChange={(e) => setSelectedCompanyId(e.target.value)}
          >
            <option value="">All Companies (Sellers)</option>
            {companies.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Filtered Invoices", value: filteredInvoices.length, icon: "📄", color: "var(--accent)" },
          { label: "Total Revenue", value: `₹${fmt(totalAmount)}`, icon: "💰", color: "var(--accent-green)" },
          { label: "Draft / Finalized", value: `${draftCount} / ${finalizedCount}`, icon: "📊", color: "var(--accent-yellow)" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px" }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: `${stat.color}10`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 2 }}>{stat.label}</div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {chartEntries.length > 0 && (
        <div className="card slide-up" style={{ marginBottom: 24 }}>
          <div className="section-title"><span className="icon">📈</span> Revenue Breakdown (Top 5 {selectedCompanyId ? "Buyers" : "Sellers"})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {chartEntries.map(([name, amount]) => {
              const pct = (amount / maxChartValue) * 100;
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 140, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {name}
                  </div>
                  <div style={{ flex: 1, background: "var(--bg-input)", height: 24, borderRadius: 4, overflow: "hidden" }}>
                    <div 
                      style={{ 
                        width: `${pct}%`, 
                        height: "100%", 
                        background: "linear-gradient(90deg, var(--accent), var(--accent-light))",
                        transition: "width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        borderRadius: 4
                      }} 
                    />
                  </div>
                  <div className="mono" style={{ width: 120, textAlign: "right", fontSize: 13, fontWeight: 600 }}>
                    ₹{fmt(amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoice table */}
      {filteredInvoices.length === 0 ? (
        <div className="card slide-up" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>No invoices yet</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
            Create your first invoice to get started
          </p>
          <Link to="/invoice/new" className="btn btn-primary">+ Create First Invoice</Link>
        </div>
      ) : (
        <div className="card slide-up" style={{ padding: 0, overflow: "hidden" }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr 1fr 130px 90px 160px",
              gap: 12,
              padding: "12px 20px",
              background: "var(--bg-body)",
              borderBottom: "1px solid var(--border)",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
            }}
          >
            <div>Invoice No.</div>
            <div>Seller</div>
            <div>Buyer</div>
            <div style={{ textAlign: "right" }}>Amount</div>
            <div style={{ textAlign: "center" }}>Status</div>
            <div style={{ textAlign: "center" }}>Actions</div>
          </div>

          {filteredInvoices.map((inv) => (
            <div
              key={inv._id}
              className="table-row"
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr 1fr 130px 90px 160px",
                gap: 12,
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-light)",
                alignItems: "center",
              }}
            >
              <div className="mono" style={{ fontWeight: 600, color: "var(--accent)", fontSize: 13 }}>
                {inv.invoiceNo}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{inv.seller?.name || "—"}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{inv.seller?.gst}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{inv.buyer?.name || "—"}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{inv.buyer?.gst}</div>
              </div>
              <div className="mono" style={{ textAlign: "right", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                ₹{fmt(inv.grandTotal)}
              </div>
              <div style={{ textAlign: "center" }}>
                <span className={`tag ${inv.status === "finalized" ? "tag-green" : "tag-blue"}`}>
                  {inv.status}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                <Link to={`/invoice/${inv._id}/edit`} className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
                  Edit
                </Link>
                <button onClick={() => handleDownloadPdf(inv._id, inv.invoiceNo)} className="btn btn-outline btn-sm">
                  PDF
                </button>
                <button
                  onClick={() => handleDelete(inv._id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--accent-red)" }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
