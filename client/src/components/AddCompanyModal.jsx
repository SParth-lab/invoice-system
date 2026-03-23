import { useState } from "react";
import api from "../api";

export default function AddCompanyModal({ onClose, onSave, initialData }) {
  const [name, setName] = useState(initialData?.name || "");
  const [gst, setGst] = useState(initialData?.gst || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [themeColor, setThemeColor] = useState(initialData?.themeColor || "#6366f1");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in px-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl animate-scale-in border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{initialData ? "Edit Company Details" : "Add New Company"}</h2>
            <p className="text-[13px] font-medium text-slate-500 mt-1">Configure business settings and branding for invoices.</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="overflow-y-auto px-8 py-8 scrollbar-thin">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-700 flex items-center gap-3 shadow-sm animate-fade-in">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-red-100/50 text-red-600 shrink-0">⚠</span> 
              <span>{error}</span>
            </div>
          )}

          <form id="company-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
              <input 
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-semibold text-slate-900 transition-all outline-none" 
                placeholder="e.g. Acme Corporation" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                autoFocus 
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">GST Number</label>
              <input
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-[15px] font-bold text-slate-900 font-mono transition-all outline-none uppercase tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-medium"
                placeholder="e.g. 24AELPI2850K1ZF"
                value={gst}
                onChange={(e) => setGst(e.target.value.toUpperCase())}
                maxLength={15}
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Address</label>
              <textarea
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none resize-none leading-relaxed"
                placeholder="Enter full address including street, city, state, and pincode..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Invoice Prefix</label>
                <input 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-[14px] font-bold text-slate-700 font-mono transition-all outline-none" 
                  placeholder="e.g. INV-" 
                  value={invoicePrefix} 
                  onChange={(e) => setInvoicePrefix(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Starting Sequence</label>
                <input 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-[14px] font-bold text-slate-700 font-mono transition-all outline-none" 
                  type="number" 
                  min="1" 
                  value={startingSequence} 
                  onChange={(e) => setStartingSequence(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Invoice Theme Color</label>
              <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-14 h-14 rounded-xl cursor-pointer bg-slate-50 border border-slate-200 p-1 block shadow-inner"
                />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-slate-700 mb-0.5">Brand Identity</div>
                  <span className="text-[12px] font-medium text-slate-500 leading-snug">
                    Select a core brand primary color. This will be used for PDF boundaries and header backgrounds.
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">PDF Template Style</label>
                <select 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-semibold text-slate-700 transition-all outline-none appearance-none cursor-pointer" 
                  value={pdfTemplate} 
                  onChange={(e) => setPdfTemplate(e.target.value)}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                >
                  <option value="standard">Standard (Default)</option>
                  <option value="modern">Modern (Centered Logo)</option>
                  <option value="minimal">Minimal (Clean UI)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Logo Image URL</label>
                <input 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-[13px] font-medium text-slate-900 transition-all outline-none placeholder-slate-400" 
                  placeholder="https://example.com/logo.png" 
                  value={logoUrl} 
                  onChange={(e) => setLogoUrl(e.target.value)} 
                />
              </div>
            </div>
          </form>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3 rounded-b-3xl mt-auto">
          <button 
            type="button" 
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="company-form"
            className={`px-7 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
            disabled={saving}
          >
            {saving ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : null}
            {saving ? "Saving..." : initialData ? "Save Changes" : "Save Company"}
          </button>
        </div>
      </div>
    </div>
  );
}
