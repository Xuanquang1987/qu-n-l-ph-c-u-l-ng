export type UserRole = 'member' | 'admin';

export type PaymentStatus = 'none' | 'unpaid' | 'paid';
// Note: 'late' is computed dynamically when session.date < today and status === 'unpaid'

export interface MemberSessionStatus {
  memberId: string;
  status: PaymentStatus; // 'none' (không đi), 'unpaid' (chưa đóng), 'paid' (đã đóng)
  paidAt?: string;
  customNote?: string;
}

export interface DailySession {
  date: string; // YYYY-MM-DD
  shuttlecocks: number; // Số quả cầu hao trong ngày
  pricePerShuttlecock: number; // Giá mỗi quả cầu (mặc định 28000)
  guestCount?: number; // Số người đến giao lưu
  guestFee?: number; // Phí thu người giao lưu (mặc định 40000)
  memberStatuses: Record<string, PaymentStatus>; // memberId -> 'none' | 'unpaid' | 'paid'
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
}

export interface ClubConfig {
  defaultPricePerShuttlecock: number; // Default 28000
  adminPin: string; // Default '1234'
  finePerLateDay: number; // Default 10000
  paymentCutoffTime: string; // Default '21:00' (HH:mm cutoff on next day)
  guestFee?: number; // Default 40000 (Phí thu giao lưu / người)
  monthlyElectricityFee?: number; // Default 20000 (Phí tiền điện hàng tháng / người)
  electricityPayments?: Record<string, Record<string, boolean>>; // monthStr YYYY-MM -> memberId -> true/false
}

export interface MemberDebtSummary {
  memberId: string;
  memberName: string;
  unpaidSessionsCount: number;
  lateSessionsCount: number;
  totalUnpaidBaseAmount: number;
  totalLateFineAmount: number;
  totalOwedAmount: number;
}
