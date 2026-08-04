import React, { useState } from 'react';
import { Member, PaymentStatus, UserRole } from '../types';
import { calculateDaysLate, formatVND, getTodayString } from '../utils/dateUtils';
import { getEffectiveStatus } from '../utils/storage';
import { Check, Info, AlertTriangle, Clock } from 'lucide-react';

interface PlayerGridProps {
  members: Member[];
  memberStatuses: Record<string, PaymentStatus>;
  sessionDateStr: string;
  perPersonFee: number;
  role: UserRole;
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
  onStatusChange,
  onSelectAll,
  onMarkAllPaid,
  onResetAll,
}) => {
  const todayStr = getTodayString();
  const [selectedMemberForInfo, setSelectedMemberForInfo] = useState<Member | null>(null);

  // Helper to handle player button click
  const handlePlayerClick = (member: Member) => {
    const rawStatus = memberStatuses[member.id] || 'none';
    const effective = getEffectiveStatus(rawStatus, sessionDateStr, todayStr);

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
          const effectiveStatus = getEffectiveStatus(rawStatus, sessionDateStr, todayStr);
          const daysLate = calculateDaysLate(sessionDateStr, todayStr);
          const fineAmount = daysLate * 10000;

          // Color themes based on strict user requirements:
          // 1. White: 'none'
          // 2. Red: 'unpaid'
          // 3. Green: 'paid'
          // 4. Purple: 'late'
          let styleClasses = '';
          let statusBadgeText = '';
          let feeBadgeText = '';

          switch (effectiveStatus) {
            case 'paid':
              styleClasses = 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 shadow-emerald-950/40';
              statusBadgeText = 'Đã đóng';
              feeBadgeText = perPersonFee > 0 ? `${perPersonFee / 1000}k` : '✓';
              break;

            case 'unpaid':
              styleClasses = 'bg-red-600 text-white border-red-500 hover:bg-red-500 shadow-red-950/40 animate-pulse-slow';
              statusBadgeText = 'Chưa đóng';
              feeBadgeText = perPersonFee > 0 ? `${perPersonFee / 1000}k` : 'Cần đóng';
              break;

            case 'late':
              styleClasses = 'bg-purple-600 text-white border-purple-500 hover:bg-purple-500 shadow-purple-950/40';
              statusBadgeText = `Trễ ${daysLate}d (+${fineAmount / 1000}k)`;
              feeBadgeText = `${(perPersonFee + fineAmount) / 1000}k`;
              break;

            case 'none':
            default:
              styleClasses = 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 shadow-sm';
              statusBadgeText = 'Nghỉ';
              feeBadgeText = '-';
              break;
          }

          return (
            <button
              key={m.id}
              onClick={() => handlePlayerClick(m)}
              className={`relative rounded-xl border-2 p-1 px-1.5 flex flex-col justify-between items-center transition-all duration-150 active:scale-95 shadow overflow-hidden ${styleClasses}`}
            >
              {/* Top row: Fee badge positioned top right */}
              <div className="w-full flex items-center justify-between">
                <span className="text-[9px] font-bold opacity-60">
                  #{m.id.replace('m', '')}
                </span>

                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-black/25 tracking-tighter">
                  {feeBadgeText}
                </span>
              </div>

              {/* CENTER: Member Name - BIG, BOLD, CENTERED */}
              <div className="w-full flex-1 flex items-center justify-center my-0.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-center leading-tight drop-shadow-xs">
                  {m.name}
                </span>
              </div>

              {/* Bottom row: Status badge */}
              <div className="w-full flex items-center justify-center gap-0.5 text-[9.5px] font-bold leading-none py-0.5 opacity-95">
                {effectiveStatus === 'paid' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                {effectiveStatus === 'unpaid' && <AlertTriangle className="w-2.5 h-2.5 text-yellow-300" />}
                {effectiveStatus === 'late' && <Clock className="w-2.5 h-2.5" />}
                <span className="truncate">{statusBadgeText}</span>
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
              const effSt = getEffectiveStatus(rawSt, sessionDateStr, todayStr);
              const daysLate = calculateDaysLate(sessionDateStr, todayStr);
              const fine = daysLate * 10000;

              return (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Buổi ngày:</span>
                    <span className="font-medium">{sessionDateStr}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Trạng thái:</span>
                    {effSt === 'paid' && (
                      <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                        Đã đóng tiền ✓
                      </span>
                    )}
                    {effSt === 'unpaid' && (
                      <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                        Chưa đóng tiền
                      </span>
                    )}
                    {effSt === 'late' && (
                      <span className="bg-purple-600 text-white px-2 py-0.5 rounded font-bold">
                        Đóng trễ ({daysLate} ngày)
                      </span>
                    )}
                    {effSt === 'none' && (
                      <span className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded">
                        Không tham gia
                      </span>
                    )}
                  </div>

                  {effSt !== 'none' && (
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phí sân + cầu:</span>
                        <span>{formatVND(perPersonFee)}</span>
                      </div>
                      {effSt === 'late' && (
                        <div className="flex justify-between text-purple-300 font-medium">
                          <span>Tiền phạt trễ (10k/ngày):</span>
                          <span>+{formatVND(fine)}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-amber-400">
                        <span>Tổng cần thanh toán:</span>
                        <span>
                          {formatVND(effSt === 'late' ? perPersonFee + fine : perPersonFee)}
                        </span>
                      </div>
                    </div>
                  )}

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
