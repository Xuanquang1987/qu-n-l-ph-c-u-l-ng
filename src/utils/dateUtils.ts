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
 * Calculate the number of late days between session date and current date
 * E.g. sessionDate = "2026-08-02", currentDate = "2026-08-04" -> 2 days late
 */
export function calculateDaysLate(sessionDateStr: string, currentDateStr: string = getTodayString()): number {
  if (!sessionDateStr || sessionDateStr >= currentDateStr) return 0;
  
  const [sYear, sMonth, sDay] = sessionDateStr.split('-').map(Number);
  const [cYear, cMonth, cDay] = currentDateStr.split('-').map(Number);
  
  const sDate = new Date(sYear, sMonth - 1, sDay);
  const cDate = new Date(cYear, cMonth - 1, cDay);
  
  const diffTime = cDate.getTime() - sDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
  
  return Math.max(0, diffDays);
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
