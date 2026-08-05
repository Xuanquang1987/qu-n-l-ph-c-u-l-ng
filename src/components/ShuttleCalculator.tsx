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
}

export const ShuttleCalculator: React.FC<ShuttleCalculatorProps> = ({
  session,
  role,
  onUpdateShuttlecocks,
  onOpenConfig,
  onOpenDebtReport,
  participantsCount,
  paidCount,
  unpaidCount,
  lateCount,
}) => {
  const shuttleCount = session.shuttlecocks || 0;
  const price = session.pricePerShuttlecock || 28000;
  const totalCost = shuttleCount * price;
  
  const perPersonFee = participantsCount > 0 ? Math.ceil(totalCost / participantsCount) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-sm text-slate-100 flex flex-col gap-2 shrink-0">
      {/* Top calculation controls */}
      <div className="grid grid-cols-12 gap-2 items-center">
        {/* Shuttlecock Counter Box */}
        <div className="col-span-6 bg-slate-950 p-1.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Số quả cầu:</span>
            <span className="text-[10px] text-amber-400">{formatVND(price)}/quả</span>
          </div>

          <div className="flex items-center justify-between mt-1">
            {role === 'admin' ? (
              <button
                onClick={() => onUpdateShuttlecocks(Math.max(0, shuttleCount - 1))}
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded flex items-center justify-center border border-slate-700"
                title="Giảm 1 quả"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="w-7" />
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
                  className="w-12 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded text-center text-xl font-black text-amber-400 focus:outline-none py-0.5"
                  title="Nhập trực tiếp số quả cầu"
                />
              ) : (
                <span className="text-xl font-black text-amber-400 tracking-tight">
                  {shuttleCount}
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-medium">quả</span>
            </div>

            {role === 'admin' ? (
              <button
                onClick={() => onUpdateShuttlecocks(shuttleCount + 1)}
                className="w-7 h-7 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded flex items-center justify-center shadow"
                title="Thêm 1 quả"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="w-7" />
            )}
          </div>
        </div>

        {/* Highlighted Per Person Fee Banner */}
        <div className="col-span-6 bg-gradient-to-br from-emerald-950 to-slate-950 border border-emerald-600/40 p-1.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-medium text-emerald-300">
            <span>Mỗi người đóng:</span>
            <span className="text-[10px] text-slate-400">({participantsCount} người)</span>
          </div>

          <div className="mt-0.5">
            <span className="text-lg font-black text-emerald-400 block tracking-tight">
              {perPersonFee > 0 ? formatVND(perPersonFee) : '0đ'}
            </span>
            <div className="text-[10px] text-slate-400 truncate">
              Tổng tiền buổi: <span className="font-semibold text-slate-300">{formatVND(totalCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-toolbar: Quick action buttons for Admin & Debt overview button */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs gap-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenDebtReport}
            className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0"
          >
            <Calculator className="w-3 h-3 text-amber-400" />
            <span>Xem Sổ Nợ</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {role === 'admin' && (
            <button
              onClick={onOpenConfig}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Cài đặt giá & PIN"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
