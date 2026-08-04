import React from 'react';

interface StatusLegendProps {
  paidCount: number;
  unpaidCount: number;
  lateCount: number;
  noneCount: number;
}

export const StatusLegend: React.FC<StatusLegendProps> = ({
  paidCount,
  unpaidCount,
  lateCount,
  noneCount,
}) => {
  return (
    <div className="bg-slate-950/90 border border-slate-800/80 rounded-lg p-1.5 px-2 flex items-center justify-between text-[11px] text-slate-300 shrink-0">
      {/* Legend items */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* White / None */}
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 inline-block shadow-sm" />
          <span className="text-[10px] text-slate-300">
            Nghỉ <span className="text-slate-400">({noneCount})</span>
          </span>
        </div>

        {/* Red / Unpaid */}
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm" />
          <span className="text-[10px] text-red-300 font-medium">
            Chưa đóng <span className="text-red-400 font-bold">({unpaidCount})</span>
          </span>
        </div>

        {/* Green / Paid */}
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
          <span className="text-[10px] text-emerald-300 font-medium">
            Đã đóng <span className="text-emerald-400 font-bold">({paidCount})</span>
          </span>
        </div>

        {/* Purple / Late */}
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm" />
          <span className="text-[10px] text-purple-300 font-medium">
            Đóng trễ (+10k/d) <span className="text-purple-400 font-bold">({lateCount})</span>
          </span>
        </div>
      </div>
    </div>
  );
};
