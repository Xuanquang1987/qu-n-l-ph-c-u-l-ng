import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, X, Delete } from 'lucide-react';

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const processPinChange = (val: string) => {
    setErrorMsg('');
    setPinInput(val);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!val) return;

    // Instant match -> Auto login immediately
    if (val === correctPin) {
      onSuccess();
      return;
    }

    // Short debounce timer (500ms) after typing stops
    timerRef.current = setTimeout(() => {
      if (val === correctPin) {
        onSuccess();
      } else if (val.length >= correctPin.length) {
        setErrorMsg('Mã PIN không đúng! Vui lòng thử lại.');
      }
    }, 500);
  };

  const handleKeypadPress = (digit: string) => {
    processPinChange(pinInput + digit);
  };

  const handleBackspace = () => {
    processPinChange(pinInput.slice(0, -1));
  };

  const handleClear = () => {
    processPinChange('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === correctPin) {
      onSuccess();
    } else {
      setErrorMsg('Mã PIN không đúng! Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
            Nhập PIN (chữ hoặc số). Tự động đăng nhập Admin khi khớp:
          </p>

          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              autoFocus
              value={pinInput}
              onChange={(e) => processPinChange(e.target.value)}
              placeholder="Mã PIN"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-center font-mono font-bold text-amber-400 text-base tracking-widest focus:outline-none focus:border-amber-500"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] font-semibold text-red-400 text-center animate-shake">
              {errorMsg}
            </p>
          )}

          {/* Onscreen Numpad for Fast Number Entry */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl py-2 shadow border border-slate-700/60 flex items-center justify-center transition-all select-none"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-950/40 hover:bg-red-900/60 active:scale-95 text-red-400 font-bold text-xs rounded-xl py-2 border border-red-800/50 flex items-center justify-center transition-all select-none"
              title="Xóa hết"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-lg rounded-xl py-2 shadow border border-slate-700/60 flex items-center justify-center transition-all select-none"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-amber-400 font-bold text-sm rounded-xl py-2 border border-slate-700/60 flex items-center justify-center transition-all select-none"
              title="Xóa 1 ký tự"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

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
