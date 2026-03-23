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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
      </div>
    );
  }

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (inv.buyer?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompanyId ? inv.seller?._id === selectedCompanyId : true;
    return matchesSearch && matchesCompany;
  });

  const totalAmount = filteredInvoices.reduce((s, inv) => s + (inv.grandTotal || 0), 0);
  const draftCount = filteredInvoices.filter((i) => i.status === "draft").length;
  const finalizedCount = filteredInvoices.filter((i) => i.status === "finalized").length;

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
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track your GST invoices efficiently.
          </p>
        </div>
        <Link 
          to="/invoice/new" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <span>➕</span> Create Invoice
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-4 animate-slide-up" style={{animationDelay: '0.05s'}}>
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 transition-all outline-none" 
            placeholder="Search by Invoice No. or Buyer Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-72">
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-medium text-slate-900 transition-all outline-none appearance-none" 
            value={selectedCompanyId} 
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
          >
            <option value="">All Companies (Sellers)</option>
            {companies.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
        {[
          { label: "Filtered Invoices", value: filteredInvoices.length, icon: "📄", colorClass: "text-primary-600 bg-primary-50 border-primary-100" },
          { label: "Total Revenue", value: `₹${fmt(totalAmount)}`, icon: "💰", colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Draft / Finalized", value: `${draftCount} / ${finalizedCount}`, icon: "📊", colorClass: "text-amber-600 bg-amber-50 border-amber-100" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border transition-transform group-hover:scale-110 ${stat.colorClass}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {chartEntries.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 animate-slide-up" style={{animationDelay: '0.15s'}}>
          <div className="text-[15px] font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-xl">📈</span> Revenue Breakdown <span className="text-slate-400 font-medium ml-1 text-sm">(Top 5 {selectedCompanyId ? "Buyers" : "Sellers"})</span>
          </div>
          <div className="flex flex-col gap-4">
            {chartEntries.map(([name, amount], index) => {
              const pct = (amount / maxChartValue) * 100;
              return (
                <div key={name} className="flex items-center gap-4">
                  <div className="w-32 sm:w-48 text-sm font-semibold text-slate-700 truncate" title={name}>
                    {name}
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${index % 2 === 0 ? 'from-primary-500 to-primary-400' : 'from-emerald-500 to-emerald-400'}`}
                      style={{ 
                        width: `${pct}%`, 
                        transition: "width 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                      }} 
                    />
                  </div>
                  <div className="w-24 sm:w-32 text-right text-[14px] font-bold text-slate-900 font-mono">
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center py-16 px-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="text-5xl mb-4 grayscale opacity-50">📄</div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">No invoices found</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Get started by creating your first invoice or modify your current search filters.
          </p>
          <Link to="/invoice/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95">
            + Create Invoice
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Invoice No.</th>
                  <th className="py-3.5 px-6">Seller</th>
                  <th className="py-3.5 px-6">Buyer</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[14px]">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold text-primary-600 font-mono">{inv.invoiceNo}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{inv.seller?.name || "—"}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5" title="GST Number">{inv.seller?.gst}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{inv.buyer?.name || "—"}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5" title="GST Number">{inv.buyer?.gst}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-bold text-slate-900 font-mono">₹{fmt(inv.grandTotal)}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${inv.status === "finalized" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-sky-100 text-sky-700 border border-sky-200"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/invoice/${inv._id}/edit`} 
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm hover:shadow"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDownloadPdf(inv._id, inv.invoiceNo)} 
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm hover:shadow flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          PDF
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
