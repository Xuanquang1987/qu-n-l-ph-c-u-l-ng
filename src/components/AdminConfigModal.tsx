import React, { useState } from 'react';
import { ClubConfig } from '../types';
import { formatVND } from '../utils/dateUtils';
import { Clock, KeyRound, RefreshCw, Save, Settings, X } from 'lucide-react';

interface AdminConfigModalProps {
  config: ClubConfig;
  onSaveConfig: (newConfig: ClubConfig) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  config,
  onSaveConfig,
  onResetData,
  onClose,
}) => {
  const [price, setPrice] = useState<number>(config.defaultPricePerShuttlecock || 28000);
  const [fine, setFine] = useState<number>(config.finePerLateDay || 10000);
  const [cutoffTime, setCutoffTime] = useState<string>(config.paymentCutoffTime || '21:00');
  const [pin, setPin] = useState<string>(config.adminPin || '1234');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      defaultPricePerShuttlecock: Number(price) || 28000,
      finePerLateDay: Number(fine) || 10000,
      paymentCutoffTime: cutoffTime || '21:00',
      adminPin: pin || '1234',
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xs text-slate-100 shadow-2xl overflow-hidden flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Settings className="w-4 h-4" />
            <h3 className="font-bold text-sm tracking-tight">CÀI ĐẶT CÂU LẠC BỘ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Price per shuttlecock */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Giá 1 quả cầu (VNĐ):
            </label>
            <div className="relative">
              <input
                type="number"
                step="1000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-bold text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-2 top-2 text-[10px] text-slate-400">
                {formatVND(price)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              * Mặc định là 28.000 VNĐ / quả.
            </p>
          </div>

          {/* Fine per late day */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Mức phạt trễ đóng tiền (VNĐ/ngày):
            </label>
            <div className="relative">
              <input
                type="number"
                step="1000"
                value={fine}
                onChange={(e) => setFine(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-bold text-yellow-400 focus:outline-none focus:border-yellow-500"
              />
              <span className="absolute right-2 top-2 text-[10px] text-slate-400">
                {formatVND(fine)}
              </span>
            </div>
          </div>

          {/* Cutoff Time setting */}
          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              <span>Hạn chót đóng tiền ngày hôm sau:</span>
            </label>
            <input
              type="time"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono font-bold text-yellow-300 text-center text-sm focus:outline-none focus:border-yellow-500"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              * Ví dụ chọn <strong>{cutoffTime}</strong>: Đánh hôm nay, cần đóng tiền trước <strong>{cutoffTime}</strong> ngày hôm sau. Quá giờ chưa đóng sẽ tính trễ +{formatVND(fine)} & tên đổi sang <strong>MÀU VÀNG</strong>.
            </p>
          </div>

          {/* Admin PIN */}
          <div>
            <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span>Mã PIN Quản trị viên (Admin):</span>
            </label>
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono font-bold text-slate-100 text-center tracking-widest text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow active:scale-95 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? 'Đã lưu thành công!' : 'Lưu Thay Đổi'}</span>
          </button>
        </form>

        <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Dữ liệu thử nghiệm:</span>
          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn đặt lại dữ liệu ban đầu?')) {
                onResetData();
                onClose();
              }
            }}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-md font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Khôi phục gốc</span>
          </button>
        </div>
      </div>
    </div>
  );
};
