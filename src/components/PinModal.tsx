import React, { useState } from 'react';
import { Lock, KeyRound, X } from 'lucide-react';

interface PinModalProps {
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  correctPin,
  onSuccess,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === correctPin) {
      onSuccess();
    } else {
      setErrorMsg('Mã PIN không đúng! Vui lòng thử lại.');
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xs text-slate-100 shadow-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Lock className="w-4 h-4" />
            <h3 className="font-bold text-sm tracking-tight">NHẬP PIN QUẢN TRỊ VIÊN</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <p className="text-slate-300">
            Vui lòng nhập mã PIN để kích hoạt quyền Quản trị (Admin) đánh dấu đóng tiền:
          </p>

          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              maxLength={6}
              autoFocus
              value={pinInput}
              onChange={(e) => {
                setErrorMsg('');
                setPinInput(e.target.value);
              }}
              placeholder="Mã PIN"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-center font-mono font-bold text-amber-400 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] font-medium text-red-400 text-center animate-shake">
              {errorMsg}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-xl active:scale-95 transition-transform"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl shadow active:scale-95 transition-transform"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
