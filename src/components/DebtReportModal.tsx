import React, { useState } from 'react';
import { DailySession, Member, MemberDebtSummary, UserRole } from '../types';
import { formatVND, getTodayString } from '../utils/dateUtils';
import { calculateMemberDebts } from '../utils/storage';
import { AlertCircle, CheckCircle2, DollarSign, ShieldAlert, X } from 'lucide-react';

interface DebtReportModalProps {
  allSessions: Record<string, DailySession>;
  members: Member[];
  role: UserRole;
  onClose: () => void;
  onSettleMemberDebt?: (memberId: string) => void;
}

export const DebtReportModal: React.FC<DebtReportModalProps> = ({
  allSessions,
  members,
  role,
  onClose,
  onSettleMemberDebt,
}) => {
  const todayStr = getTodayString();
  const debtSummaries = calculateMemberDebts(allSessions, members, todayStr);

  const totalClubOwed = debtSummaries.reduce((sum, d) => sum + d.totalOwedAmount, 0);
  const totalBaseUnpaid = debtSummaries.reduce((sum, d) => sum + d.totalUnpaidBaseAmount, 0);
  const totalFineOwed = debtSummaries.reduce((sum, d) => sum + d.totalLateFineAmount, 0);

  // Filter or sort members who owe money first
  const sortedSummaries = [...debtSummaries].sort((a, b) => b.totalOwedAmount - a.totalOwedAmount);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm text-amber-400 tracking-tight">
              SỔ NỢ & PHẠT TRỄ CLB
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Club Summary Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Tổng nợ gốc:</span>
            <span className="font-bold text-red-400">{formatVND(totalBaseUnpaid)}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Tiền phạt trễ:</span>
            <span className="font-bold text-purple-400">+{formatVND(totalFineOwed)}</span>
          </div>
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/30">
            <span className="text-[10px] text-amber-300 block font-medium">Tổng cần thu:</span>
            <span className="font-black text-amber-400 text-sm">{formatVND(totalClubOwed)}</span>
          </div>
        </div>

        {/* Members Debt List */}
        <div className="p-2 flex-1 overflow-y-auto divide-y divide-slate-800/60 text-xs">
          {sortedSummaries.map((summary) => {
            const hasOwed = summary.totalOwedAmount > 0;

            return (
              <div
                key={summary.memberId}
                className={`py-2 px-2.5 flex items-center justify-between rounded-lg my-1 transition-colors ${
                  hasOwed ? 'bg-slate-950/40 hover:bg-slate-800/50' : 'opacity-60'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{summary.memberName}</span>
                    {hasOwed ? (
                      <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Chưa xong ({summary.unpaidSessionsCount} buổi)
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Không nợ
                      </span>
                    )}
                  </div>

                  {hasOwed && (
                    <div className="text-[10.5px] text-slate-400 flex items-center gap-2">
                      <span>Phí cầu: {formatVND(summary.totalUnpaidBaseAmount)}</span>
                      {summary.totalLateFineAmount > 0 && (
                        <span className="text-purple-300 font-medium">
                          + Phạt trễ: {formatVND(summary.totalLateFineAmount)} ({summary.lateSessionsCount} buổi)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={`font-black text-sm block ${hasOwed ? 'text-amber-400' : 'text-slate-400'}`}>
                      {formatVND(summary.totalOwedAmount)}
                    </span>
                  </div>

                  {role === 'admin' && hasOwed && onSettleMemberDebt && (
                    <button
                      onClick={() => onSettleMemberDebt(summary.memberId)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded-md shadow active:scale-95 transition-all"
                      title="Xác nhận đã thanh toán hết nợ cũ"
                    >
                      Duyệt đóng
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-400">
          * Phạt đóng trễ: 10.000 VNĐ / ngày trễ cho mỗi buổi chưa thanh toán.
        </div>
      </div>
    </div>
  );
};
