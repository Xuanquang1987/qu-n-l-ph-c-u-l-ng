import { ClubConfig, DailySession, Member, MemberDebtSummary, PaymentStatus } from '../types';
import { calculateDaysLate, getTodayString } from './dateUtils';

export const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'Cường' },
  { id: 'm2', name: 'Quang' },
  { id: 'm3', name: 'Bảo' },
  { id: 'm4', name: 'Tuyển' },
  { id: 'm5', name: 'Đức' },
  { id: 'm6', name: 'Phong' },
  { id: 'm7', name: 'Trụ' },
  { id: 'm8', name: 'Dũng' },
  { id: 'm9', name: 'Tuyền' },
  { id: 'm10', name: 'Hiển' },
  { id: 'm11', name: 'Việt' },
  { id: 'm12', name: 'Hoàng' },
  { id: 'm13', name: 'Nghĩa' },
  { id: 'm14', name: 'Miết' },
  { id: 'm15', name: 'Kiêm' },
  { id: 'm16', name: 'Quyết' },
  { id: 'm17', name: 'Thịnh' },
  { id: 'm18', name: 'Vững' },
];

export const DEFAULT_CONFIG: ClubConfig = {
  defaultPricePerShuttlecock: 28000,
  adminPin: '1234',
  finePerLateDay: 10000,
};

const STORAGE_KEYS = {
  SESSIONS: 'badminton_club_sessions_v1',
  CONFIG: 'badminton_club_config_v1',
};

// Generate sample historical data so the user can see late payments immediately
function generateSeedSessions(): Record<string, DailySession> {
  const today = getTodayString();
  
  // Create 2 days ago session
  const twoDaysAgoStr = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
  // Create 1 day ago session
  const yesterdayStr = new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0];

  const seed: Record<string, DailySession> = {};

  // Session 2 days ago: 8 shuttlecocks, 6 players played
  // Some paid, some unpaid (so they show purple with late fine!)
  seed[twoDaysAgoStr] = {
    date: twoDaysAgoStr,
    shuttlecocks: 8,
    pricePerShuttlecock: 28000,
    memberStatuses: {
      m1: 'paid',   // Cường - đã đóng
      m2: 'unpaid', // Quang - chưa đóng (trễ 2 ngày -> +20k)
      m3: 'unpaid', // Bảo - chưa đóng (trễ 2 ngày -> +20k)
      m4: 'paid',   // Tuyển - đã đóng
      m5: 'unpaid', // Đức - chưa đóng
      m6: 'none',
      m7: 'none',
      m8: 'paid',
      m9: 'none',
      m10: 'none',
      m11: 'none',
      m12: 'none',
      m13: 'none',
      m14: 'none',
      m15: 'none',
      m16: 'none',
      m17: 'none',
      m18: 'none',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Session yesterday: 10 shuttlecocks, 8 players played
  seed[yesterdayStr] = {
    date: yesterdayStr,
    shuttlecocks: 10,
    pricePerShuttlecock: 28000,
    memberStatuses: {
      m1: 'paid',
      m2: 'unpaid', // Quang - trễ 1 ngày (+10k)
      m3: 'paid',
      m4: 'paid',
      m5: 'unpaid', // Đức - trễ 1 ngày (+10k)
      m6: 'paid',
      m7: 'unpaid', // Trụ - trễ 1 ngày (+10k)
      m8: 'none',
      m9: 'none',
      m10: 'none',
      m11: 'none',
      m12: 'none',
      m13: 'none',
      m14: 'none',
      m15: 'none',
      m16: 'none',
      m17: 'none',
      m18: 'none',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Session today: default empty/0
  seed[today] = {
    date: today,
    shuttlecocks: 0,
    pricePerShuttlecock: 28000,
    memberStatuses: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return seed;
}

export function loadClubConfig(): ClubConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load club config:', e);
  }
  return DEFAULT_CONFIG;
}

export function saveClubConfig(config: ClubConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save club config:', e);
  }
}

export function loadAllSessions(): Record<string, DailySession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load sessions:', e);
  }
  
  // If no data saved, initialize seed
  const seed = generateSeedSessions();
  saveAllSessions(seed);
  return seed;
}

export function saveAllSessions(sessions: Record<string, DailySession>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
}

export function getSessionForDate(dateStr: string): DailySession {
  const allSessions = loadAllSessions();
  const config = loadClubConfig();
  
  if (allSessions[dateStr]) {
    return allSessions[dateStr];
  }
  
  // Create a default session for this new date
  const newSession: DailySession = {
    date: dateStr,
    shuttlecocks: 0,
    pricePerShuttlecock: config.defaultPricePerShuttlecock,
    memberStatuses: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  allSessions[dateStr] = newSession;
  saveAllSessions(allSessions);
  return newSession;
}

/**
 * Get effective status for a member on a given date:
 * - 'none' -> White (Không tham gia)
 * - 'paid' -> Green (Đã đóng)
 * - 'unpaid':
 *    - If session.date < today -> 'late' (Màu Tím - Đóng trễ)
 *    - If session.date >= today -> 'unpaid' (Màu Đỏ - Chưa đóng)
 */
export function getEffectiveStatus(
  status: PaymentStatus | undefined,
  sessionDateStr: string,
  currentTodayStr: string = getTodayString()
): 'none' | 'unpaid' | 'paid' | 'late' {
  if (!status || status === 'none') return 'none';
  if (status === 'paid') return 'paid';
  
  // status === 'unpaid'
  if (sessionDateStr < currentTodayStr) {
    return 'late'; // Automatically turns purple!
  }
  return 'unpaid';
}

/**
 * Calculate per-person fee for a session
 */
export function calculateSessionPerPersonFee(session: DailySession): number {
  const participantsCount = Object.values(session.memberStatuses).filter(
    (st) => st === 'unpaid' || st === 'paid'
  ).length;
  
  if (participantsCount === 0 || session.shuttlecocks <= 0) return 0;
  
  const totalCost = session.shuttlecocks * session.pricePerShuttlecock;
  return Math.ceil(totalCost / participantsCount);
}

/**
 * Calculate total debts & late fines for all 18 members across all historical sessions
 */
export function calculateMemberDebts(
  allSessions: Record<string, DailySession>,
  members: Member[] = INITIAL_MEMBERS,
  currentTodayStr: string = getTodayString(),
  config: ClubConfig = DEFAULT_CONFIG
): MemberDebtSummary[] {
  const summaries: Record<string, MemberDebtSummary> = {};

  members.forEach((m) => {
    summaries[m.id] = {
      memberId: m.id,
      memberName: m.name,
      unpaidSessionsCount: 0,
      lateSessionsCount: 0,
      totalUnpaidBaseAmount: 0,
      totalLateFineAmount: 0,
      totalOwedAmount: 0,
    };
  });

  Object.values(allSessions).forEach((session) => {
    const feePerPerson = calculateSessionPerPersonFee(session);
    
    Object.entries(session.memberStatuses).forEach(([memberId, status]) => {
      if (!summaries[memberId]) return;

      if (status === 'unpaid') {
        const effective = getEffectiveStatus(status, session.date, currentTodayStr);
        summaries[memberId].unpaidSessionsCount += 1;
        summaries[memberId].totalUnpaidBaseAmount += feePerPerson;

        if (effective === 'late') {
          const daysLate = calculateDaysLate(session.date, currentTodayStr);
          const fine = daysLate * config.finePerLateDay;
          summaries[memberId].lateSessionsCount += 1;
          summaries[memberId].totalLateFineAmount += fine;
        }
      }
    });
  });

  Object.values(summaries).forEach((s) => {
    s.totalOwedAmount = s.totalUnpaidBaseAmount + s.totalLateFineAmount;
  });

  return Object.values(summaries);
}
