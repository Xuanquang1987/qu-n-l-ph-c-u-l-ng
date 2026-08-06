import React, { useState } from 'react';
import { ClubConfig, Member, UserRole } from '../types';
import { formatVND } from '../utils/dateUtils';
import { hasPaidElectricity, isElectricityMember } from '../utils/storage';
import { Zap, Check, X, ShieldAlert, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface ElectricityModalProps {
  currentDateStr: string; // YYYY-MM-DD
  members: Member[];
  config: ClubConfig;
  role: UserRole;
  onClose: () => void;
  onTogglePayment: (memberId: string, monthStr: string, isPaid: boolean) => void;
}

export const ElectricityModal: React.FC<ElectricityModalProps> = ({
  currentDateStr,
  members,
  config,
  role,
  onClose,
  onTogglePayment,
}) => {
  // Parse default month and year from currentDateStr
  const defaultYear = Number(currentDateStr.split('-')[0]) || new Date().getFullYear();
  const defaultMonth = Number(currentDateStr.split('-')[1]) || new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [showMonthGrid, setShowMonthGrid] = useState<boolean>(false);

  // Formatted selected month string YYYY-MM
  const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const displayMonthYear = `Tháng ${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;

  const feeAmount = config.monthlyElectricityFee || 20000;

  // Filter 13 fixed members subject to electricity fee
  const electricityMembers = members.filter((m) => isElectricityMember(m));

  let paidCount = 0;
  electricityMembers.forEach((m) => {
    if (hasPaidElectricity(config, m.id, monthStr)) {
      paidCount += 1;
    }
  });

  const unpaidCount = electricityMembers.length - paidCount;
  const totalPaidRevenue = paidCount * feeAmount;

  // Handle month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-full max-w-sm text-slate-100 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-amber-300 leading-tight">
                Tiền điện {displayMonthYear}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Mức thu: <span className="text-amber-400 font-bold">{formatVND(feeAmount)}</span> / thành viên cố định
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800 text-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Month Selector Bar & Calendar Picker Toggle */}
        <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-2 shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95 transition-all border border-slate-800 cursor-pointer"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowMonthGrid(!showMonthGrid)}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 font-black text-sm active:scale-95 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{displayMonthYear}</span>
              <span className="text-[10px] text-amber-400/70 font-normal">
                ({showMonthGrid ? 'Đóng lịch' : 'Chọn tháng'})
              </span>
            </button>

            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 active:scale-95 transition-all border border-slate-800 cursor-pointer"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 12-Month Calendar Grid Picker */}
          {showMonthGrid && (
            <div className="pt-2 border-t border-slate-800/80 animate-fade-in">
              {/* Year selection */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-slate-400">Chọn Năm:</span>
                <div className="flex items-center gap-1">
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold transition-all ${
                        selectedYear === y
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const isSelected = selectedMonth === m;
                  const isCurrentDefault =
                    m === defaultMonth && selectedYear === defaultYear;

                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMonth(m);
                        setShowMonthGrid(false);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-black transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-102'
                          : isCurrentDefault
                          ? 'bg-slate-900 text-amber-300 border-amber-500/50 hover:bg-slate-800'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      Tháng {m}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2 text-center">
            <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">
              Đã đóng {displayMonthYear}
            </span>
            <span className="text-lg font-black text-emerald-400">
              {paidCount} / {electricityMembers.length}
            </span>
            <span className="text-[10px] text-emerald-300/80 block font-semibold">
              (+{formatVND(totalPaidRevenue)})
            </span>
          </div>

          <div className="bg-red-950/60 border border-red-500/40 rounded-xl p-2 text-center">
            <span className="text-[10px] text-red-300 font-bold block uppercase tracking-wider">
              Chưa đóng điện
            </span>
            <span className="text-lg font-black text-red-400">
              {unpaidCount} người
            </span>
            <span className="text-[10px] text-red-300/80 block font-semibold">
              (Nợ {formatVND(unpaidCount * feeAmount)})
            </span>
          </div>
        </div>

        {role === 'admin' ? (
          <p className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/60 p-2 rounded-xl text-center font-medium shrink-0">
            💡 <span className="font-bold">Admin:</span> Chạm vào tên thành viên để đánh dấu <span className="text-emerald-400 font-bold">Đã đóng</span> / <span className="text-red-400 font-bold">Chưa đóng</span> cho <span className="text-amber-300 font-bold">{displayMonthYear}</span>.
          </p>
        ) : (
          <p className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800 text-center italic shrink-0">
            * Nhờ Quản trị viên (Admin) cập nhật sau khi bạn đóng tiền điện.
          </p>
        )}

        {/* Member List */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {electricityMembers.map((m, idx) => {
            const isPaid = hasPaidElectricity(config, m.id, monthStr);

            return (
              <div
                key={m.id}
                onClick={() => {
                  if (role === 'admin') {
                    onTogglePayment(m.id, monthStr, !isPaid);
                  }
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  role === 'admin' ? 'cursor-pointer active:scale-98' : ''
                } ${
                  isPaid
                    ? 'bg-emerald-950/30 border-emerald-800/80 hover:border-emerald-500/60 text-slate-100'
                    : 'bg-red-950/30 border-red-800/80 hover:border-red-500/60 text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-5">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-sm text-slate-100">
                    {m.name}
                  </span>
                </div>

                {isPaid ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Đã đóng 20k
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-sm animate-pulse-slow">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                    Chưa đóng ⚡
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Thành viên chưa đóng sẽ tự cộng {formatVND(feeAmount)} vào phí cầu.</span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-1.5 rounded-xl text-xs cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
