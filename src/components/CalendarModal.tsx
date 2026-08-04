import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import { formatVietnameseDate, getTodayString } from '../utils/dateUtils';
import { DailySession } from '../types';

interface CalendarModalProps {
  currentDateStr: string;
  allSessions: Record<string, DailySession>;
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  currentDateStr,
  allSessions,
  onSelectDate,
  onClose,
}) => {
  const todayStr = getTodayString();
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return Number(currentDateStr.split('-')[0]) || new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return Number(currentDateStr.split('-')[1]) || new Date().getMonth() + 1;
  });

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

  // Generate days matrix for selectedMonth / selectedYear
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay(); // 0 = Sun, 1 = Mon ...

  // Convert Sunday=0 to Monday=0 indexing for Vietnamese week (T2 -> CN)
  const startingOffset = (firstDayOfWeek + 6) % 7;

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startingOffset; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const weekHeaders = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xs text-slate-100 shadow-2xl p-3 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-amber-400">
            <CalendarIcon className="w-4 h-4" />
            <h3 className="font-bold text-sm tracking-tight">CHỌN NGÀY ĐÁNH CẦU</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-xs text-amber-300">
            Tháng {selectedMonth} / {selectedYear}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 active:scale-90 transition-transform"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Weekday labels */}
          {weekHeaders.map((header) => (
            <div key={header} className="text-[10px] font-bold text-slate-400 py-0.5">
              {header}
            </div>
          ))}

          {/* Days */}
          {daysArray.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }

            const mStr = String(selectedMonth).padStart(2, '0');
            const dStr = String(dayNum).padStart(2, '0');
            const dateStr = `${selectedYear}-${mStr}-${dStr}`;

            const isSelected = dateStr === currentDateStr;
            const isToday = dateStr === todayStr;
            const session = allSessions[dateStr];
            const hasData = session && session.shuttlecocks > 0;

            return (
              <button
                key={dateStr}
                onClick={() => {
                  onSelectDate(dateStr);
                  onClose();
                }}
                className={`h-8 rounded-lg flex flex-col items-center justify-center relative text-xs font-bold transition-all active:scale-95 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg scale-105 z-10'
                    : isToday
                    ? 'bg-slate-800 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{dayNum}</span>
                {hasData && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 ${
                      isSelected ? 'bg-slate-950' : 'bg-amber-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick jump to today button */}
        <div className="pt-1 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              onSelectDate(todayStr);
              onClose();
            }}
            className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold py-1.5 rounded-xl transition-colors text-center"
          >
            Về Hôm Nay ({formatVietnameseDate(todayStr)})
          </button>
        </div>
      </div>
    </div>
  );
};
