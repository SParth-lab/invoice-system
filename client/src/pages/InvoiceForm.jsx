import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { GST_RATES, num } from "../utils/helpers";
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
  const [status, setStatus] = useState("draft");
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
        const [compRes] = await Promise.all([
          api.get("/companies"),
        ]);
        setCompanies(compRes.data);

        if (isEdit) {
          const { data: inv } = await api.get(`/invoices/${id}`);
          setSellerId(inv.seller?._id || "");
          setBuyerId(inv.buyer?._id || "");
          setInvoiceNo(inv.invoiceNo);
          setInvoiceDate(inv.invoiceDate?.split("T")[0] || today);
          setDueDate(inv.dueDate?.split("T")[0] || defaultDue);
          setTerms(inv.terms || "");
          setStatus(inv.status || "draft");
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

  useEffect(() => {
    const fetchNextNumber = async () => {
      if (!isEdit && sellerId) {
        try {
          const { data } = await api.get(`/invoices/next-number/generate?companyId=${sellerId}`);
          setInvoiceNo(data.invoiceNo);
        } catch (err) {
          console.error("Failed to fetch next invoice number", err);
        }
      } else if (!isEdit && !sellerId) {
        setInvoiceNo("");
      }
    };
    fetchNextNumber();
  }, [sellerId, isEdit]);

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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in relative pb-20 md:pb-8">
      {/* Toast Notification */}
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

      {showAddCompany && (
        <AddCompanyModal onClose={() => setShowAddCompany(false)} onSave={(newComp) => handleCompanyAdded(newComp)} />
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="text-slate-500 hover:text-slate-900 text-sm font-medium flex items-center gap-1 mb-2 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEdit ? `Edit Invoice: ${invoiceNo}` : "Create New Invoice"}
          </h1>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {status === "finalized" ? (
            <div className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold flex items-center gap-2 w-full justify-center">
              🔒 Finalized - Read Only
            </div>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                "💾"
              )}
              {saving ? "Saving..." : isEdit ? "Update Invoice" : "Save Invoice"}
            </button>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6 xl:gap-8 items-start ${status === "finalized" ? "pointer-events-none opacity-80 backdrop-grayscale-[0.5]" : ""}`}>
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6 lg:gap-8 animate-slide-up">
          
          {/* Top Info Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-5">
              <span className="text-lg">📋</span> Document Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Invoice No.</label>
                <input 
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 font-mono cursor-not-allowed" 
                  value={invoiceNo} 
                  onChange={(e) => setInvoiceNo(e.target.value)} 
                  placeholder="Auto-generated" 
                  disabled 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Invoice Date</label>
                <input 
                  className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-medium text-slate-900 transition-all outline-none" 
                  type="date" 
                  value={invoiceDate} 
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setInvoiceDate(newDate);
                    if (newDate) {
                      const dateObj = new Date(newDate);
                      dateObj.setDate(dateObj.getDate() + 45);
                      setDueDate(dateObj.toISOString().split("T")[0]);
                    }
                  }} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                <input 
                  className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-medium text-slate-900 transition-all outline-none" 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Companies Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-5">
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="text-lg">🏢</span> Parties & Companies
              </div>
              <button 
                className="text-[12px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors border border-primary-100" 
                onClick={() => setShowAddCompany(true)}
              >
                + Add Company
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seller */}
              <div className="flex flex-col">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Seller (From)</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-sm font-medium text-slate-900 transition-all outline-none appearance-none cursor-pointer" 
                  value={sellerId} 
                  onChange={(e) => setSellerId(e.target.value)}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                >
                  <option value="">— Select Seller —</option>
                  {companies.filter((c) => c._id !== buyerId).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {seller && (
                  <div className="mt-3 p-4 bg-primary-50 border border-primary-100/50 rounded-xl">
                    <div className="font-bold text-sm text-primary-800 mb-1">{seller.name}</div>
                    <div className="text-[11px] text-primary-600/80 leading-relaxed mb-3 pr-4">{seller.address}</div>
                    <span className="inline-flex items-center px-2 py-1 rounded bg-white border border-primary-100 text-[10px] font-bold font-mono text-primary-600 shadow-sm">
                      GST: {seller.gst}
                    </span>
                  </div>
                )}
              </div>

              {/* Buyer */}
              <div className="flex flex-col">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Buyer (Bill To)</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm font-medium text-slate-900 transition-all outline-none appearance-none cursor-pointer" 
                  value={buyerId} 
                  onChange={(e) => setBuyerId(e.target.value)}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                >
                  <option value="">— Select Buyer —</option>
                  {companies.filter((c) => c._id !== sellerId).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {buyer && (
                  <div className="mt-3 p-4 bg-emerald-50 border border-emerald-100/50 rounded-xl">
                    <div className="font-bold text-sm text-emerald-800 mb-1">{buyer.name}</div>
                    <div className="text-[11px] text-emerald-600/80 leading-relaxed mb-3 pr-4">{buyer.address}</div>
                    <span className="inline-flex items-center px-2 py-1 rounded bg-white border border-emerald-100 text-[10px] font-bold font-mono text-emerald-600 shadow-sm">
                      GST: {buyer.gst}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <ItemsTable items={items} onAdd={addItem} onRemove={removeItem} onUpdate={updateItem} />

          {/* GST and Terms Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 lg:mb-0">
            {/* GST Rate */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="text-lg">💹</span> Select GST Rate
              </div>
              <div className="flex flex-col gap-2.5">
                {GST_RATES.map((r, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      gstRateIdx === i 
                        ? "bg-primary-50/50 border-primary-500 shadow-sm" 
                        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="gst" 
                      checked={gstRateIdx === i} 
                      onChange={() => setGstRateIdx(i)} 
                      className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" 
                    />
                    <span className={`text-sm tracking-tight ${gstRateIdx === i ? "font-bold text-primary-700" : "font-medium text-slate-600"}`}>
                      {r.label}
                    </span>
                    {i > 0 && (
                      <span className="ml-auto text-[11px] font-bold font-mono text-slate-400">
                        CGST {r.cgst}% + SGST {r.sgst}%
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="text-lg">📝</span> Terms & Conditions
              </div>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full flex-1 min-h-[160px] p-4 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl text-[13px] font-medium text-slate-600 transition-all outline-none resize-none leading-relaxed"
                placeholder="Enter invoice terms and conditions here..."
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Live Calculation */}
        <div className="animate-slide-up" style={{animationDelay: "0.1s"}}>
          <LiveCalc
            subtotal={subtotal} cgstAmt={cgstAmt} sgstAmt={sgstAmt} totalTax={totalTax}
            grandTotal={grandTotal} rate={rate} invoiceNo={invoiceNo} invoiceDate={invoiceDate}
            dueDate={dueDate} items={items} totalQty={totalQty} seller={seller} buyer={buyer}
          />
        </div>
        
      </div>
    </div>
  );
}
