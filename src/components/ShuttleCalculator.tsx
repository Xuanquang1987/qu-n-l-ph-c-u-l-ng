import React from 'react';
import { Minus, Plus, Settings, Users, Calculator } from 'lucide-react';
import { DailySession, UserRole } from '../types';
import { formatVND } from '../utils/dateUtils';

interface ShuttleCalculatorProps {
  session: DailySession;
  role: UserRole;
  onUpdateShuttlecocks: (count: number) => void;
  onOpenConfig: () => void;
  onOpenDebtReport: () => void;
  participantsCount: number;
  paidCount: number;
  unpaidCount: number;
  lateCount: number;
  defaultGuestFee?: number;
}

export const ShuttleCalculator: React.FC<ShuttleCalculatorProps> = ({
  session,
  role,
  onUpdateShuttlecocks,
  participantsCount,
  defaultGuestFee = 40000,
}) => {
  const shuttleCount = session.shuttlecocks || 0;
  const price = session.pricePerShuttlecock || 28000;
  const totalCost = shuttleCount * price;

  const guestCount = session.guestCount || 0;
  const guestFee = session.guestFee ?? defaultGuestFee;
  const guestRevenue = guestCount * guestFee;
  const netMemberCost = Math.max(0, totalCost - guestRevenue);

  const perPersonFee = participantsCount > 0 ? Math.ceil(netMemberCost / participantsCount) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-md text-slate-100 flex flex-col gap-2 shrink-0">
      {/* Main calculation cards - Prominent display */}
      <div className="grid grid-cols-12 gap-2 items-stretch">
        {/* Shuttlecock Counter Box */}
        <div className="col-span-6 bg-slate-950 p-2 rounded-xl border border-slate-800/90 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Số quả cầu:</span>
            <span className="text-[11px] font-bold text-amber-400/90">{formatVND(price)}/quả</span>
          </div>

          <div className="flex items-center justify-between mt-1.5">
            {role === 'admin' ? (
              <button
                onClick={() => onUpdateShuttlecocks(Math.max(0, shuttleCount - 1))}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-extrabold rounded-lg flex items-center justify-center border border-slate-700/80 shadow-sm"
                title="Giảm 1 quả"
              >
                <Minus className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 sm:w-9" />
            )}

            <div className="flex items-center gap-1">
              {role === 'admin' ? (
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max="999"
                  value={shuttleCount === 0 ? '' : shuttleCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onUpdateShuttlecocks(isNaN(val) || val < 0 ? 0 : val);
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '' || parseInt(e.target.value, 10) < 0) {
                      onUpdateShuttlecocks(0);
                    }
                  }}
                  placeholder="0"
                  className="w-14 sm:w-16 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg text-center text-2xl sm:text-3xl font-black text-amber-400 focus:outline-none py-0.5 tracking-tight"
                  title="Nhập trực tiếp số quả cầu"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                  {shuttleCount}
                </span>
              )}
              <span className="text-xs text-slate-400 font-bold">quả</span>
            </div>

            {role === 'admin' ? (
              <button
                onClick={() => onUpdateShuttlecocks(shuttleCount + 1)}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold rounded-lg flex items-center justify-center shadow-md"
                title="Thêm 1 quả"
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 sm:w-9" />
            )}
          </div>
        </div>

        {/* Highlighted Per Person Fee Banner */}
        <div className="col-span-6 bg-gradient-to-br from-emerald-950/90 via-slate-950 to-slate-950 border border-emerald-500/50 p-2 rounded-xl flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
            <span>Mỗi người đóng:</span>
            <span className="text-[11px] font-bold text-emerald-400/80">({participantsCount} TV)</span>
          </div>

          <div className="mt-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 block tracking-tight leading-none drop-shadow">
              {perPersonFee > 0 ? formatVND(perPersonFee) : '0đ'}
            </span>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
              {guestRevenue > 0 ? (
                <span title={`(Tổng ${formatVND(totalCost)} - Khách ${formatVND(guestRevenue)}) / ${participantsCount}`}>
                  ({formatVND(totalCost)} - {formatVND(guestRevenue)}) / {participantsCount} TV
                </span>
              ) : (
                <>
                  Tổng tiền: <span className="font-bold text-slate-200">{formatVND(totalCost)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
