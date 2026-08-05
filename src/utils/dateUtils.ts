// Helper utility functions for Date operations and formatting

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns default active display date based on 18:00 (6:00 PM) rule:
 * - Before 18:00 (6:00 PM), returns yesterday's date string (YYYY-MM-DD).
 * - From 18:00 (6:00 PM) onwards, returns today's date string (YYYY-MM-DD).
 */
export function getDefaultDisplayDate(now: Date = new Date()): string {
  const currentHour = now.getHours();
  const todayStr = getTodayString();
  if (currentHour < 18) {
    return addDaysToDateStr(todayStr, -1);
  }
  return todayStr;
}

/**
 * Format YYYY-MM-DD to friendly Vietnamese date: "Thứ 3, 04/08/2026"
 */
export function formatVietnameseDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[dateObj.getDay()];
  
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  
  return `${dayName}, ${formattedDay}/${formattedMonth}/${year}`;
}

/**
 * Format number to Vietnamese currency string: 28000 -> "28.000đ"
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

/**
 * Calculate payment deadline Date object for a given session date and cutoff time string (e.g. "21:00")
 * Deadline is on sessionDate + 1 day at cutoffTime.
 */
export function getPaymentDeadline(sessionDateStr: string, cutoffTimeStr: string = '21:00'): Date {
  const [year, month, day] = sessionDateStr.split('-').map(Number);
  const deadlineDate = new Date(year, month - 1, day);
  deadlineDate.setDate(deadlineDate.getDate() + 1);

  const [hours, minutes] = (cutoffTimeStr || '21:00').split(':').map(Number);
  deadlineDate.setHours(hours || 21, minutes || 0, 0, 0);

  return deadlineDate;
}

/**
 * Calculate the number of late days past payment deadline
 * E.g. sessionDate = "2026-08-04", cutoff = "21:00" -> deadline is 2026-08-05 21:00.
 * If current time > 2026-08-05 21:00, returns >= 1 late day.
 */
export function calculateDaysLate(
  sessionDateStr: string,
  now: Date = new Date(),
  cutoffTimeStr: string = '21:00'
): number {
  if (!sessionDateStr) return 0;

  const deadline = getPaymentDeadline(sessionDateStr, cutoffTimeStr);

  if (now.getTime() <= deadline.getTime()) {
    return 0; // Still within grace period / deadline
  }

  // Time elapsed since deadline passed
  const diffTimeMs = now.getTime() - deadline.getTime();
  const diffDays = Math.floor(diffTimeMs / (1000 * 3600 * 24));

  // As soon as deadline passes, it is 1 late day
  return 1 + diffDays;
}

/**
 * Add or subtract days from YYYY-MM-DD
 */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  dateObj.setDate(dateObj.getDate() + days);
  
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
