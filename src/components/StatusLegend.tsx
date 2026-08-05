import React from 'react';
import { UserRole } from '../types';
import { formatVND } from '../utils/dateUtils';
import { Minus, Plus, Users } from 'lucide-react';

interface StatusLegendProps {
  paidCount: number;
  unpaidCount: number;
  lateCount: number;
  noneCount: number;
  guestCount?: number;
  guestFee?: number;
  role?: UserRole;
  onUpdateGuestCount?: (count: number) => void;
}

export const StatusLegend: React.FC<StatusLegendProps> = ({
  paidCount,
  unpaidCount,
  lateCount,
  noneCount,
  guestCount = 0,
  guestFee = 40000,
  role = 'member',
  onUpdateGuestCount,
}) => {
  const totalGuestRevenue = guestCount * guestFee;

  return (
    <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-2 px-2.5 flex flex-col gap-2 shrink-0 shadow-inner">
      {/* Row 1: Main Status Legends */}
      <div className="w-full flex items-center justify-between gap-1 sm:gap-2">
        {/* White / None */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white border border-slate-400 inline-block shadow-sm shrink-0" />
          <span className="text-xs sm:text-sm font-extrabold text-slate-200">
            Nghỉ <span className="text-slate-400 font-black">({noneCount})</span>
          </span>
        </div>

        {/* Red / Unpaid */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-500 inline-block shadow-sm shrink-0" />
          <span className="text-xs sm:text-sm font-black text-red-400">
            Chưa đóng <span className="text-red-300">({unpaidCount})</span>
          </span>
        </div>

        {/* Green / Paid */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 inline-block shadow-sm shrink-0" />
          <span className="text-xs sm:text-sm font-black text-emerald-400">
            Đã đóng <span className="text-emerald-300">({paidCount})</span>
          </span>
        </div>
      </div>

      {/* Row 2: Late Count + Guest Player Controls/Summary */}
      <div className="w-full flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
        {/* Yellow / Late */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-yellow-400 inline-block shadow-sm shrink-0" />
          <span className="text-xs sm:text-sm font-black text-yellow-400">
            Đóng trễ <span className="text-yellow-300">({lateCount})</span>
          </span>
        </div>

        {/* Guest Players (Giao lưu) Section - Highlighted in Red Box area from user request */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 px-2 py-1 rounded-lg">
          <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1 shrink-0">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Giao lưu:</span>
          </span>

          {role === 'admin' && onUpdateGuestCount ? (
            /* Admin mode: Increment / Decrement buttons */
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUpdateGuestCount(Math.max(0, guestCount - 1))}
                className="w-5 h-5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold rounded flex items-center justify-center border border-slate-700 text-xs"
                title="Giảm 1 người giao lưu"
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="font-black text-xs sm:text-sm text-yellow-300 min-w-[18px] text-center">
                {guestCount}
              </span>

              <button
                type="button"
                onClick={() => onUpdateGuestCount(guestCount + 1)}
                className="w-5 h-5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded flex items-center justify-center text-xs shadow"
                title="Thêm 1 người giao lưu"
              >
                <Plus className="w-3 h-3" />
              </button>

              <span className="text-[11px] font-extrabold text-emerald-400 ml-1">
                (+{formatVND(totalGuestRevenue)})
              </span>
            </div>
          ) : (
            /* Member mode: Plain display */
            <span className="text-xs sm:text-sm font-black text-slate-100">
              {guestCount} người{' '}
              <span className="text-emerald-400 font-extrabold text-xs">
                (+{formatVND(totalGuestRevenue)})
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
