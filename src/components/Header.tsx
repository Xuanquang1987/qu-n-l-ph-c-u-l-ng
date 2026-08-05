import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Lock, Unlock, Clock, Calculator } from 'lucide-react';
import { UserRole } from '../types';
import { formatVietnameseDate, getDefaultDisplayDate, getTodayString } from '../utils/dateUtils';

interface HeaderProps {
  currentDateStr: string;
  onDateChange: (newDateStr: string) => void;
  role: UserRole;
  onToggleRoleRequest: () => void;
  onOpenCalendar: () => void;
  onOpenDebtReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateStr,
  onDateChange,
  role,
  onToggleRoleRequest,
  onOpenCalendar,
  onOpenDebtReport,
}) => {
  const todayStr = getTodayString();
  const defaultDateStr = getDefaultDisplayDate();
  const isToday = currentDateStr === todayStr;
  const isDefaultDate = currentDateStr === defaultDateStr;
  const isBefore18h = new Date().getHours() < 18;

  const handlePrevDay = () => {
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    onDateChange(`${newY}-${newM}-${newD}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + 1);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    onDateChange(`${newY}-${newM}-${newD}`);
  };

  return (
    <header className="bg-slate-900 text-white p-2 rounded-xl shadow-md border border-slate-800 flex flex-col gap-1.5 shrink-0 select-none">
      {/* Top row: Centered Admin Button + Compact Sổ Nợ button in top right */}
      <div className="flex items-center justify-between w-full gap-2">
        <button
          onClick={onToggleRoleRequest}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
            role === 'admin'
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-950/50 hover:bg-emerald-400'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
          title={role === 'admin' ? 'Đang ở quyền Admin. Bấm để thoát về Chế độ Thành viên' : 'Đang ở Chế độ Thành viên. Bấm để đăng nhập Admin'}
        >
          {role === 'admin' ? (
            <>
              <Unlock className="w-4 h-4 text-slate-950" />
              <span className="tracking-wide text-[11px] sm:text-xs">QUYỀN ADMIN (ĐANG BẬT) - BẤM ĐỂ THOÁT</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="tracking-wide text-[11px] sm:text-xs">CHẾ ĐỘ THÀNH VIÊN (VÀO ADMIN)</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenDebtReport}
          className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0 shadow"
          title="Xem Sổ Nợ"
        >
          <Calculator className="w-3.5 h-3.5 text-amber-400" />
          <span>Sổ Nợ</span>
        </button>
      </div>

      {/* Date Navigator Bar */}
      <div className="flex items-center justify-between bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
        <button
          onClick={handlePrevDay}
          className="p-1 hover:bg-slate-800 rounded text-slate-300 active:scale-90 transition-transform"
          title="Ngày trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-2 py-1 rounded-md cursor-pointer transition-colors group"
            title="Mở bảng lịch chọn ngày"
          >
            <Calendar className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
              {formatVietnameseDate(currentDateStr)}
            </span>
          </button>

          {isBefore18h && isDefaultDate && currentDateStr !== todayStr && (
            <span
              className="inline-flex items-center gap-1 bg-amber-950/90 text-amber-300 border border-amber-800/80 text-[9px] font-semibold px-1.5 py-0.5 rounded"
              title="Đang hiển thị buổi hôm qua trước 18h để rà soát đóng phí tránh bị phạt"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Trước 18h</span>
            </span>
          )}

          {!isDefaultDate && (
            <button
              onClick={() => onDateChange(defaultDateStr)}
              className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors"
              title="Quay lại ngày hiển thị mặc định"
            >
              Mặc định
            </button>
          )}

          {!isToday && isDefaultDate && (
            <button
              onClick={() => onDateChange(todayStr)}
              className="bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors"
              title="Xem buổi hôm nay"
            >
              Hôm nay
            </button>
          )}
        </div>

        <button
          onClick={handleNextDay}
          className="p-1 hover:bg-slate-800 rounded text-slate-300 active:scale-90 transition-transform"
          title="Ngày sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
