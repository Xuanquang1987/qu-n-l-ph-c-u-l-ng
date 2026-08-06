import React, { useState } from 'react';
import { ClubConfig, Member, PaymentStatus, UserRole } from '../types';
import { calculateDaysLate, formatVND, getTodayString } from '../utils/dateUtils';
import { getEffectiveStatus, hasPaidElectricity, isElectricityMember } from '../utils/storage';
import { Check, Info, AlertTriangle, Clock, Zap } from 'lucide-react';

interface PlayerGridProps {
  members: Member[];
  memberStatuses: Record<string, PaymentStatus>;
  sessionDateStr: string;
  perPersonFee: number;
  role: UserRole;
  config: ClubConfig;
  cutoffTime?: string;
  finePerLateDay?: number;
  onStatusChange: (memberId: string, nextStatus: PaymentStatus) => void;
  onSelectAll: () => void;
  onMarkAllPaid: () => void;
  onResetAll: () => void;
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({
  members,
  memberStatuses,
  sessionDateStr,
  perPersonFee,
  role,
  config,
  cutoffTime = '21:00',
  finePerLateDay = 10000,
  onStatusChange,
  onSelectAll,
  onMarkAllPaid,
  onResetAll,
}) => {
  const todayStr = getTodayString();
  const [selectedMemberForInfo, setSelectedMemberForInfo] = useState<Member | null>(null);

  const monthStr = sessionDateStr.substring(0, 7); // YYYY-MM
  const electricityFee = config.monthlyElectricityFee || 20000;

  // Helper to handle player button click
  const handlePlayerClick = (member: Member) => {
    const rawStatus = memberStatuses[member.id] || 'none';

    if (role === 'admin') {
      // Cycle through status in Admin mode:
      // none -> unpaid (red)
      // unpaid / late -> paid (green)
      // paid -> none (white)
      if (rawStatus === 'none') {
        onStatusChange(member.id, 'unpaid');
      } else if (rawStatus === 'unpaid') {
        onStatusChange(member.id, 'paid');
      } else if (rawStatus === 'paid') {
        onStatusChange(member.id, 'none');
      }
    } else {
      // Member mode: open info modal for this member
      setSelectedMemberForInfo(member);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-1.5 justify-between">
      {/* Admin Quick Toolbar */}
      {role === 'admin' && (
        <div className="flex items-center justify-between gap-1 text-[10px] shrink-0">
          <span className="text-amber-400/90 font-medium truncate">Thao tác nhanh:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onSelectAll}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 py-0.5 rounded active:scale-95 transition-transform"
            >
              Đi đánh hết (Đỏ)
            </button>
            <button
              onClick={onMarkAllPaid}
              className="bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded active:scale-95 transition-transform font-medium"
            >
              Đã đóng hết (Xanh)
            </button>
            <button
              onClick={onResetAll}
              className="bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded active:scale-95 transition-transform"
            >
              Đặt lại (Trắng)
            </button>
          </div>
        </div>
      )}

      {/* 18 Player Grid: 3 columns x 6 rows -> Compact 1-screen phone display */}
      <div className="grid grid-cols-3 gap-1.5 flex-1 min-h-0 items-stretch">
        {members.map((m) => {
          const rawStatus = memberStatuses[m.id] || 'none';
          const effectiveStatus = getEffectiveStatus(rawStatus, sessionDateStr, cutoffTime);
          const daysLate = calculateDaysLate(sessionDateStr, new Date(), cutoffTime);
          const fineAmount = daysLate * finePerLateDay;

          // Electricity payment check
          const isElecMember = isElectricityMember(m);
          const hasPaidElec = hasPaidElectricity(config, m.id, monthStr);
          const owesElectricity = isElecMember && !hasPaidElec;

          // Color themes based on user requirements:
          let styleClasses = '';
          let statusBadgeText = '';
          let feeDisplay = '-';

          // Effective fee calculation
          let finalPayable = perPersonFee;
          if (effectiveStatus === 'late') {
            finalPayable += fineAmount;
          }

          // If member hasn't paid monthly electricity, add electricity fee if active or unpaid
          if (owesElectricity && effectiveStatus !== 'none') {
            finalPayable += electricityFee;
          }

          const formatK = (val: number) =>
            val > 0 ? (val % 1000 === 0 ? `${val / 1000}k` : `${(val / 1000).toFixed(1)}k`) : '0k';

          switch (effectiveStatus) {
            case 'paid':
              styleClasses = 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 shadow-emerald-950/40';
              statusBadgeText = 'Đã đóng';
              // If electricity is still owed, show remaining electricity amount. If everything is paid, hide fee badge.
              feeDisplay = owesElectricity ? formatK(electricityFee) : '';
              break;

            case 'unpaid':
              styleClasses = 'bg-red-600 text-white border-red-500 hover:bg-red-500 shadow-red-950/40 animate-pulse-slow';
              statusBadgeText = 'Chưa đóng';
              feeDisplay = formatK(finalPayable);
              break;

            case 'late':
              styleClasses = 'bg-yellow-400 text-slate-950 border-yellow-300 hover:bg-yellow-300 shadow-yellow-500/50 animate-pulse-slow font-black';
              statusBadgeText = `Trễ ${daysLate}d (+${fineAmount / 1000}k)`;
              feeDisplay = formatK(finalPayable);
              break;

            case 'none':
            default:
              styleClasses = 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 shadow-sm';
              statusBadgeText = 'Nghỉ';
              feeDisplay = owesElectricity ? formatK(electricityFee) : '';
              break;
          }

          return (
            <button
              key={m.id}
              onClick={() => handlePlayerClick(m)}
              className={`relative rounded-xl border-2 p-1.5 sm:p-2 flex flex-col justify-between items-center transition-all duration-150 active:scale-95 shadow ${styleClasses}`}
            >
              {/* Top row: Player index + Unpaid Electricity lightning badge + Fee Badge */}
              <div className="w-full flex items-center justify-between px-0.5 pt-0.5 leading-none shrink-0">
                <span className="text-[10px] font-extrabold opacity-75">
                  #{m.id.replace('m', '')}
                </span>

                <div className="flex items-center gap-0.5">
                  {owesElectricity && (
                    <span
                      title={`Chưa đóng tiền điện tháng ${monthStr} (${formatVND(electricityFee)})`}
                      className="inline-flex items-center text-[10px] font-black bg-amber-400 text-slate-950 px-1 py-0.2 rounded-full border border-amber-300 shadow-xs leading-none"
                    >
                      ⚡
                    </span>
                  )}
                  {feeDisplay ? (
                    <span className="text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded bg-black/25 tracking-tight leading-none">
                      {feeDisplay}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* CENTER CONTENT: Member Name + Status Badge */}
              <div className="w-full flex-1 flex flex-col items-center justify-center -mt-0.5 pb-1 gap-0.5 min-h-0">
                <span className="font-black text-sm sm:text-base tracking-tight text-center truncate max-w-full leading-tight drop-shadow-xs">
                  {m.name}
                </span>
                <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold leading-snug opacity-95">
                  {effectiveStatus === 'paid' && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
                  {effectiveStatus === 'unpaid' && <AlertTriangle className="w-3 h-3 text-yellow-300 shrink-0" />}
                  {effectiveStatus === 'late' && <Clock className="w-3 h-3 text-slate-950 stroke-[3] shrink-0" />}
                  <span className="truncate">{statusBadgeText}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Popup Modal when a Member taps their name in member mode */}
      {selectedMemberForInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-full max-w-xs text-white shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-base text-amber-400">
                Thành viên: {selectedMemberForInfo.name}
              </h3>
              <button
                onClick={() => setSelectedMemberForInfo(null)}
                className="text-slate-400 hover:text-white font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {(() => {
              const rawSt = memberStatuses[selectedMemberForInfo.id] || 'none';
              const effSt = getEffectiveStatus(rawSt, sessionDateStr, cutoffTime);
              const daysLate = calculateDaysLate(sessionDateStr, new Date(), cutoffTime);
              const fine = daysLate * finePerLateDay;

              const isElecMember = isElectricityMember(selectedMemberForInfo);
              const hasPaidElec = hasPaidElectricity(config, selectedMemberForInfo.id, monthStr);
              const owesElec = isElecMember && !hasPaidElec;

              let totalOwed = 0;
              if (effSt !== 'none') {
                totalOwed += perPersonFee;
                if (effSt === 'late') totalOwed += fine;
                if (owesElec) totalOwed += electricityFee;
              } else if (owesElec) {
                totalOwed += electricityFee;
              }

              return (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Buổi ngày:</span>
                    <span className="font-medium">{sessionDateStr}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Cầu & Sân:</span>
                    {effSt === 'paid' && (
                      <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                        Đã đóng tiền cầu ✓
                      </span>
                    )}
                    {effSt === 'unpaid' && (
                      <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                        Chưa đóng cầu (Trong hạn)
                      </span>
                    )}
                    {effSt === 'late' && (
                      <span className="bg-yellow-400 text-slate-950 px-2 py-0.5 rounded font-black">
                        Trễ tiền cầu ({daysLate} ngày)
                      </span>
                    )}
                    {effSt === 'none' && (
                      <span className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded">
                        Nghỉ cầu buổi này
                      </span>
                    )}
                  </div>

                  {/* Electricity Status Row */}
                  {isElecMember && (
                    <div className="flex justify-between items-center border-t border-slate-800 pt-1.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Tiền điện tháng {monthStr.split('-')[1]}:
                      </span>
                      {hasPaidElec ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold text-[11px]">
                          ✓ Đã đóng (20k)
                        </span>
                      ) : (
                        <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-extrabold text-[11px]">
                          ⚡ Chưa đóng (+{formatVND(electricityFee)})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Payment Summary Box */}
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1 mt-2">
                    {effSt !== 'none' && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phí sân + cầu:</span>
                        <span>{formatVND(perPersonFee)}</span>
                      </div>
                    )}

                    {effSt === 'late' && (
                      <div className="flex justify-between text-yellow-300 font-medium">
                        <span>Tiền phạt trễ (sau {cutoffTime}):</span>
                        <span>+{formatVND(fine)}</span>
                      </div>
                    )}

                    {owesElec && (
                      <div className="flex justify-between text-amber-300 font-medium">
                        <span>⚡ Tiền điện tháng này:</span>
                        <span>+{formatVND(electricityFee)}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-amber-400">
                      <span>Tổng cần thanh toán:</span>
                      <span>{formatVND(totalOwed)}</span>
                    </div>
                  </div>

                  {role === 'member' && (
                    <p className="text-[11px] text-slate-400 italic text-center mt-1">
                      * Nhờ Quản trị viên (Admin) cập nhật sau khi bạn chuyển khoản.
                    </p>
                  )}
                </div>
              );
            })()}

            <button
              onClick={() => setSelectedMemberForInfo(null)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs active:scale-95 transition-transform"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
