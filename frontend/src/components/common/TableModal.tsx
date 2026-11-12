import { useState, useEffect } from 'react';
import { Utensils, X, Check, QrCode, Bike, ShoppingBag, Users } from 'lucide-react';
import { useCart } from '../../context/useCart';
import type { DiningMode } from '../../types/cart';

export function TableModal() {
  const {
    diningMode,
    setDiningMode,
    tableNumber,
    setTableNumber,
    isTableModalOpen,
    setIsTableModalOpen,
    tables,
    isTableOrderingEnabled,
  } = useCart();

  const [selectedMode, setSelectedMode] = useState<DiningMode>(diningMode);
  const [selectedTable, setSelectedTable] = useState<string>(tableNumber);
  const [customTable, setCustomTable] = useState('');

  useEffect(() => {
    if (isTableModalOpen) {
      setSelectedMode(diningMode);
      setSelectedTable(tableNumber);
    }
  }, [isTableModalOpen, diningMode, tableNumber]);

  if (!isTableModalOpen || !isTableOrderingEnabled) return null;

  const handleSave = () => {
    setDiningMode(selectedMode);
    if (selectedMode === 'dine-in') {
      const finalTable = customTable.trim() || selectedTable || 'Table 01';
      setTableNumber(finalTable);
    }
    setIsTableModalOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => setIsTableModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-slideUp"
      >
        {/* Modal Header */}
        <div className="bg-stone-950 text-white p-5 flex items-center justify-between border-b border-amber-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-800/80 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-stone-50">
                Dining Option & Table
              </h3>
              <p className="text-[11px] text-amber-200/80">
                Choose how you want to enjoy your meal
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTableModalOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 block">
              Choose Service Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMode('dine-in')}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMode === 'dine-in'
                    ? 'border-red-800 bg-red-50/70 text-red-900 shadow-sm ring-1 ring-red-700/20'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Utensils className={`w-5 h-5 ${selectedMode === 'dine-in' ? 'text-red-800' : 'text-stone-400'}`} />
                <span className="text-xs font-extrabold">Dine-In</span>
                <span className="text-[10px] text-stone-500 leading-none">At Restaurant</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('delivery')}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMode === 'delivery'
                    ? 'border-red-800 bg-red-50/70 text-red-900 shadow-sm ring-1 ring-red-700/20'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Bike className={`w-5 h-5 ${selectedMode === 'delivery' ? 'text-red-800' : 'text-stone-400'}`} />
                <span className="text-xs font-extrabold">Delivery</span>
                <span className="text-[10px] text-stone-500 leading-none">Home / Office</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('takeaway')}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMode === 'takeaway'
                    ? 'border-red-800 bg-red-50/70 text-red-900 shadow-sm ring-1 ring-red-700/20'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <ShoppingBag className={`w-5 h-5 ${selectedMode === 'takeaway' ? 'text-red-800' : 'text-stone-400'}`} />
                <span className="text-xs font-extrabold">Takeaway</span>
                <span className="text-[10px] text-stone-500 leading-none">Self Pick-up</span>
              </button>
            </div>
          </div>

          {/* Table Selection for Dine-In */}
          {selectedMode === 'dine-in' && (
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-amber-600" />
                  Select Your Table
                </label>
                <span className="text-[10px] text-stone-400">
                  {tables.length} tables configured
                </span>
              </div>

              {/* Table Buttons Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {tables.map((t) => {
                  const isSelected = selectedTable === t.tableNumber;
                  return (
                    <button
                      key={t._id || t.id || t.tableNumber}
                      type="button"
                      onClick={() => {
                        setSelectedTable(t.tableNumber);
                        setCustomTable('');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-red-800 bg-red-800 text-white shadow-sm'
                          : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-800'
                      }`}
                    >
                      <div>
                        <p className={`font-black text-xs ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                          {t.tableNumber}
                        </p>
                        {t.name && (
                          <p className={`text-[10px] truncate max-w-[120px] ${isSelected ? 'text-amber-200' : 'text-stone-500'}`}>
                            {t.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {t.capacity && (
                          <span className={`text-[10px] flex items-center gap-0.5 ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                            <Users className="w-3 h-3" />
                            {t.capacity}
                          </span>
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 ml-1" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Or Type Custom Table */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  Or enter table number / note:
                </label>
                <input
                  type="text"
                  value={customTable}
                  onChange={(e) => {
                    setCustomTable(e.target.value);
                    if (e.target.value.trim()) setSelectedTable(e.target.value.trim());
                  }}
                  placeholder="e.g. Table 07, Outdoor T3, VIP Lounge"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-red-800 focus:ring-2 focus:ring-red-800/15"
                />
              </div>

              {/* Info Pill */}
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
                <span className="text-base">🛎️</span>
                <p className="leading-snug">
                  Food will be served directly at <b>{customTable || selectedTable || 'your table'}</b>. No delivery address or delivery fee is required!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsTableModalOpen(false)}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950 text-white text-xs font-bold shadow-md shadow-red-900/20 transition-all cursor-pointer active:scale-98"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
}
