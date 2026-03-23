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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in relative">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 animate-fade-in ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          <span>{toast.type === "success" ? "✓" : "⚠"}</span>
          {toast.msg}
        </div>
      )}

      {(showModal || editingCompany) && (
        <AddCompanyModal
          initialData={editingCompany}
          onClose={() => { setShowModal(false); setEditingCompany(null); }}
          onSave={handleSaveCompany}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Companies Framework</h1>
          <p className="text-sm text-slate-500 mt-1">Manage global records for sellers and buyers across invoices.</p>
        </div>
        <button 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95" 
          onClick={() => setShowModal(true)}
        >
          <span>➕</span> Add Company
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 text-center py-20 px-6 animate-slide-up">
          <div className="text-6xl mb-6 grayscale opacity-40">🏢</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Companies Found</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
            You haven't registered any entities yet. Add your first company to start compiling your invoices.
          </p>
          <button 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 hover:shadow-lg hover:shadow-primary-600/20" 
            onClick={() => setShowModal(true)}
          >
            + Add Your First Company
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up pb-8">
          {companies.map((company, idx) => (
            <div 
              key={company._id} 
              className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 flex flex-col transition-all group overflow-hidden"
              style={{animationDelay: `${idx * 0.05}s`}}
            >
              <div className="p-6 flex flex-col h-full relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-slate-50/50 rounded-bl-full -z-0"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="font-bold text-lg text-slate-900 tracking-tight leading-tight truncate mb-1.5" title={company.name}>{company.name}</div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 border border-primary-100/50 text-[10px] font-bold font-mono text-primary-600 tracking-wide uppercase">
                      GST: {company.gst}
                    </span>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl shrink-0 shadow-inner flex items-center justify-center font-bold text-white text-sm border border-white/20"
                    style={{ background: company.themeColor }}
                    title={`Theme: ${company.themeColor}`}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="text-[13px] font-medium text-slate-500 leading-relaxed flex-1 mb-5 line-clamp-2 relative z-10" title={company.address}>
                  {company.address}
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-xl mb-5 text-[12px] border border-slate-100 flex flex-col gap-2 relative z-10 group-hover:bg-primary-50/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-400 tracking-wide uppercase text-[10px]">Invoice Prefix</span>
                    <span className="font-bold text-slate-700 font-mono text-[13px]">{company.invoicePrefix || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-400 tracking-wide uppercase text-[10px]">Current Sequence</span>
                    <span className="font-bold text-slate-700 font-mono text-[13px]">{company.lastInvoiceSequence || 0}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto relative z-10">
                  <button 
                    className="flex-1 py-2.5 bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 rounded-xl text-sm font-semibold text-slate-600 transition-colors active:scale-95"
                    onClick={() => setEditingCompany(company)}
                  >
                    Edit
                  </button>
                  <button 
                    className="flex-1 py-2.5 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 rounded-xl text-sm font-semibold text-red-500 transition-colors active:scale-95"
                    onClick={() => handleDelete(company._id, company.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
