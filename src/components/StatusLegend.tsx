import React from 'react';
import { UserRole } from '../types';
import { formatVND } from '../utils/dateUtils';
import { Minus, Plus, Users, Zap } from 'lucide-react';

interface StatusLegendProps {
  paidCount: number;
  unpaidCount: number;
  lateCount: number;
  noneCount: number;
  guestCount?: number;
  guestFee?: number;
  electricityPaidCount?: number;
  electricityTotalCount?: number;
  role?: UserRole;
  onUpdateGuestCount?: (count: number) => void;
  onOpenElectricityModal?: () => void;
}

export const StatusLegend: React.FC<StatusLegendProps> = ({
  paidCount,
  unpaidCount,
  lateCount,
  noneCount,
  guestCount = 0,
  guestFee = 40000,
  electricityPaidCount = 0,
  electricityTotalCount = 13,
  role = 'member',
  onUpdateGuestCount,
  onOpenElectricityModal,
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

      {/* Row 2: Late Count + Electricity Button (In Red Box) + Guest Controls */}
      <div className="w-full flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800/60">
        {/* Yellow / Late */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block shadow-sm shrink-0" />
          <span className="text-xs font-black text-yellow-400">
            Trễ <span className="text-yellow-300">({lateCount})</span>
          </span>
        </div>

        {/* Electricity Button in middle (Red box from prompt) */}
        <button
          type="button"
          onClick={onOpenElectricityModal}
          className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/50 px-2 py-0.5 rounded-lg active:scale-95 transition-all text-amber-300 font-bold text-xs shrink-0 cursor-pointer shadow-sm"
          title="Mở danh sách quản lý Tiền Điện tháng này"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
          <span className="whitespace-nowrap">Tiền điện</span>
          <span className="bg-amber-400/20 text-amber-200 px-1 py-0.2 rounded text-[10px] font-black">
            {electricityPaidCount}/{electricityTotalCount}
          </span>
        </button>

        {/* Guest Players (Giao lưu) Section */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded-lg shrink-0">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-0.5 shrink-0">
            <Users className="w-3 h-3 text-amber-400" />
            <span>Giao lưu:</span>
          </span>

          {role === 'admin' && onUpdateGuestCount ? (
            /* Admin mode: Increment / Decrement buttons */
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onUpdateGuestCount(Math.max(0, guestCount - 1))}
                className="w-4 h-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold rounded flex items-center justify-center border border-slate-700 text-[10px]"
                title="Giảm 1 người giao lưu"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>

              <span className="font-black text-xs text-yellow-300 min-w-[14px] text-center">
                {guestCount}
              </span>

              <button
                type="button"
                onClick={() => onUpdateGuestCount(guestCount + 1)}
                className="w-4 h-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black rounded flex items-center justify-center text-[10px] shadow"
                title="Thêm 1 người giao lưu"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>

              <span className="text-[10px] font-extrabold text-emerald-400 ml-0.5">
                (+{formatVND(totalGuestRevenue)})
              </span>
            </div>
          ) : (
            /* Member mode: Plain display */
            <span className="text-xs font-black text-slate-100">
              {guestCount}{' '}
              <span className="text-emerald-400 font-extrabold text-[10px]">
                (+{formatVND(totalGuestRevenue)})
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
