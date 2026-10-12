import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  fetchTrackedProducts,
  addTrackedProduct,
  type TrackedProductItem,
} from '../services/api';

const MERCHANTS = [
  { name: 'Amazon India', icon: '🛒', url: 'https://www.amazon.in' },
  { name: 'Flipkart', icon: '🛍️', url: 'https://www.flipkart.com' },
  { name: 'Myntra', icon: '👗', url: 'https://www.myntra.com' },
  { name: 'Ajio', icon: '👔', url: 'https://www.ajio.com' },
  { name: 'Croma', icon: '⚡', url: 'https://www.croma.com' },
  { name: 'Reliance Digital', icon: '📱', url: 'https://www.reliancedigital.in' },
];

export const ShoppingMonitor: React.FC = () => {
  const [products, setProducts] = useState<TrackedProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New item form state
  const [title, setTitle] = useState('');
  const [merchantName, setMerchantName] = useState('Amazon India');
  const [currentPrice, setCurrentPrice] = useState('14999');
  const [targetPrice, setTargetPrice] = useState('13500');
  const [category, setCategory] = useState('Electronics');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTrackedProducts();
      setProducts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addTrackedProduct({
        title,
        merchant_name: merchantName,
        current_price: parseFloat(currentPrice),
        target_price: targetPrice ? parseFloat(targetPrice) : undefined,
        category,
      });
      setShowAddModal(false);
      setTitle('');
      await loadProducts();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#18080a] via-[#100406] to-[#070707] border border-[#FF3038]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Authorized Public Merchant Feed Monitor</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#FF3038]" />
            Shopping & Price Monitor
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-1 max-w-xl">
            Monitors real price fluctuations across Amazon, Flipkart, Myntra, Ajio, Croma, and Reliance Digital. Deterministically computes best card reward matches and alert thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Track New Product
          </button>
          <button
            onClick={loadProducts}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF3038]' : ''}`} />
          </button>
        </div>
      </div>

      {/* SUPPORTED MERCHANTS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {MERCHANTS.map((m) => (
          <div
            key={m.name}
            className="p-3 rounded-2xl bg-[#12080a] border border-white/10 hover:border-[#FF3038]/40 transition-all text-center flex flex-col items-center justify-center gap-1"
          >
            <span className="text-lg">{m.icon}</span>
            <span className="text-xs font-bold text-white">{m.name}</span>
            <span className="text-[9px] font-mono text-emerald-400">Feed Active</span>
          </div>
        ))}
      </div>

      {/* TRACKED PRODUCTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => {
          const discountPct = p.original_price > p.current_price
            ? Math.round(((p.original_price - p.current_price) / p.original_price) * 100)
            : 0;

          return (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-[#12080a] border border-white/10 hover:border-[#FF3038]/50 transition-all flex flex-col justify-between shadow-lg space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                    {p.merchant_name}
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> In Stock
                  </span>
                </div>

                {p.image_url && (
                  <div className="h-36 w-full rounded-xl overflow-hidden mb-2.5 relative">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    {discountPct > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF3038] text-white text-[10px] font-bold">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>
                )}

                <h4 className="font-bold text-xs text-white line-clamp-2 leading-tight">{p.title}</h4>

                <div className="flex items-baseline gap-2 mt-2 font-mono">
                  <span className="text-base font-black text-white">
                    ₹{p.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {p.original_price > p.current_price && (
                    <span className="text-xs text-[#A6A6A6] line-through">
                      ₹{p.original_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/10 space-y-2">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] text-[#A6A6A6] block uppercase tracking-wider">Best Card Match</span>
                    <span className="font-bold text-[#E5B567]">{p.best_card_name}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold text-xs">
                    Save ₹{p.estimated_savings.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#A6A6A6] font-mono">
                  <span>Target: ₹{(p.target_price || p.current_price * 0.9).toLocaleString()}</span>
                  <span>Alert Active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#14080a] border border-[#FF3038]/50 shadow-[0_0_50px_rgba(255,48,56,0.4)] text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FF3038]" /> Track Product & Monitor Price
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="text-[11px] text-[#A6A6A6] block mb-1">Product Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5"
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6A6A6] block mb-1">Store / Merchant</label>
                  <select
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white outline-none"
                  >
                    {MERCHANTS.map((m) => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#A6A6A6] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Appliances">Appliances</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6A6A6] block mb-1">Current Price (₹)</label>
                  <input
                    type="number"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white font-mono outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A6A6A6] block mb-1">Target Alert Price (₹)</label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Adding to MySQL Monitor...' : 'Start Monitoring Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
