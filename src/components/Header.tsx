import React from 'react';
import { Calendar, ArrowLeft, ArrowRight, Lock, Unlock, Clock, Calculator, Settings } from 'lucide-react';
import { UserRole } from '../types';
import { formatVietnameseDate, getDefaultDisplayDate, getTodayString } from '../utils/dateUtils';

interface HeaderProps {
  currentDateStr: string;
  onDateChange: (newDateStr: string) => void;
  role: UserRole;
  onToggleRoleRequest: () => void;
  onOpenCalendar: () => void;
  onOpenDebtReport: () => void;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateStr,
  onDateChange,
  role,
  onToggleRoleRequest,
  onOpenCalendar,
  onOpenDebtReport,
  onOpenConfig,
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

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenDebtReport}
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow"
            title="Xem Sổ Nợ"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Sổ Nợ</span>
          </button>

          {role === 'admin' && (
            <button
              onClick={onOpenConfig}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl shadow transition-all active:scale-95 flex items-center justify-center"
              title="Cài đặt giá cầu & PIN"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>
          )}
        </div>
      </div>

      {/* Date Navigator Bar with Touch-Friendly Yellow Arrow Buttons */}
      <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-1.5">
        <button
          onClick={handlePrevDay}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-amber-500/20 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          title="Ngày trước"
        >
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
        </button>

        <div className="flex items-center justify-center gap-1.5 flex-1 min-w-0 flex-wrap">
          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3 py-2 rounded-xl cursor-pointer transition-colors group shadow-inner"
            title="Mở bảng lịch chọn ngày"
          >
            <Calendar className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-xs sm:text-sm font-black text-amber-300 group-hover:text-amber-200 transition-colors whitespace-nowrap">
              {formatVietnameseDate(currentDateStr)}
            </span>
          </button>

          {isBefore18h && isDefaultDate && currentDateStr !== todayStr && (
            <span
              className="inline-flex items-center gap-1 bg-amber-950/90 text-amber-300 border border-amber-800/80 text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
              title="Đang hiển thị buổi hôm qua trước 18h để rà soát đóng phí tránh bị phạt"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Trước 18h</span>
            </span>
          )}

          {!isDefaultDate && (
            <button
              onClick={() => onDateChange(defaultDateStr)}
              className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors shrink-0"
              title="Quay lại ngày hiển thị mặc định"
            >
              Mặc định
            </button>
          )}

          {!isToday && isDefaultDate && (
            <button
              onClick={() => onDateChange(todayStr)}
              className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors shrink-0"
              title="Xem buổi hôm nay"
            >
              Hôm nay
            </button>
          )}
        </div>

        <button
          onClick={handleNextDay}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-amber-500/20 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          title="Ngày sau"
        >
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </header>
  );
};
