import { Receipt, Info } from 'lucide-react';
import type { BillSummaryData } from '../../types/cart';

interface BillSummaryProps {
  bill: BillSummaryData;
  diningMode: 'dine-in' | 'takeaway' | 'delivery';
}

export function BillSummary({ bill, diningMode }: BillSummaryProps) {
  return (
    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-stone-200/80 text-xs font-bold text-stone-700 uppercase tracking-wider">
        <Receipt className="w-4 h-4 text-brand-red-700" />
        <span>Bill Summary</span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-stone-600">
          <span>Item Total</span>
          <span className="font-semibold text-stone-900">₹{bill.itemTotal}</span>
        </div>

        <div className="flex justify-between text-stone-600">
          <span className="flex items-center gap-1">
            <span>GST & Restaurant Taxes (5%)</span>
            <span title="Government GST on restaurant dining">
              <Info className="w-3 h-3 text-stone-400" />
            </span>
          </span>
          <span className="font-semibold text-stone-900">₹{bill.gst}</span>
        </div>

        {diningMode === 'takeaway' && (
          <div className="flex justify-between text-stone-600">
            <span>Eco-Friendly Takeaway Packaging</span>
            <span className="font-semibold text-stone-900">₹{bill.packagingCharge}</span>
          </div>
        )}

        <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-serif">
          <span className="font-bold text-sm text-stone-900">To Pay</span>
          <span className="font-black text-lg text-brand-red-800">
            ₹{bill.grandTotal}
          </span>
        </div>
      </div>
    </div>
  );
}

