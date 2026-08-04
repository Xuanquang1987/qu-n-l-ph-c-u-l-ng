/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AdminConfigModal } from './components/AdminConfigModal';
import { CalendarModal } from './components/CalendarModal';
import { DebtReportModal } from './components/DebtReportModal';
import { Header } from './components/Header';
import { PinModal } from './components/PinModal';
import { PlayerGrid } from './components/PlayerGrid';
import { ShuttleCalculator } from './components/ShuttleCalculator';
import { StatusLegend } from './components/StatusLegend';
import { ClubConfig, DailySession, Member, PaymentStatus, UserRole } from './types';
import { getTodayString } from './utils/dateUtils';
import {
  calculateSessionPerPersonFee,
  getEffectiveStatus,
  INITIAL_MEMBERS,
  loadAllSessions,
  loadClubConfig,
  saveAllSessions,
  saveClubConfig,
} from './utils/storage';

export default function App() {
  // State initialization
  const [currentDateStr, setCurrentDateStr] = useState<string>(getTodayString());
  const [allSessions, setAllSessions] = useState<Record<string, DailySession>>({});
  const [config, setConfig] = useState<ClubConfig>(loadClubConfig());
  const [role, setRole] = useState<UserRole>('member');

  // Modals state
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showDebtReportModal, setShowDebtReportModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Auto real-time date sync
  useEffect(() => {
    const loadedSessions = loadAllSessions();
    const loadedConfig = loadClubConfig();
    setAllSessions(loadedSessions);
    setConfig(loadedConfig);

    // Periodically update date string if app is left open across midnight
    const interval = setInterval(() => {
      const today = getTodayString();
      if (today !== currentDateStr && currentDateStr === getTodayString()) {
        setCurrentDateStr(today);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Ensure current date session exists
  const currentSession: DailySession = allSessions[currentDateStr] || {
    date: currentDateStr,
    shuttlecocks: 0,
    pricePerShuttlecock: config.defaultPricePerShuttlecock,
    memberStatuses: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Helper to persist sessions state updates
  const updateSessionsState = (updated: Record<string, DailySession>) => {
    setAllSessions(updated);
    saveAllSessions(updated);
  };

  // Handler: Update shuttlecocks count for current session
  const handleUpdateShuttlecocks = (count: number) => {
    const updatedSession: DailySession = {
      ...currentSession,
      shuttlecocks: count,
      updatedAt: new Date().toISOString(),
    };

    const updatedAll = {
      ...allSessions,
      [currentDateStr]: updatedSession,
    };
    updateSessionsState(updatedAll);
  };

  // Handler: Update individual member status for current date
  const handleStatusChange = (memberId: string, nextStatus: PaymentStatus) => {
    const updatedStatuses = {
      ...currentSession.memberStatuses,
      [memberId]: nextStatus,
    };

    const updatedSession: DailySession = {
      ...currentSession,
      memberStatuses: updatedStatuses,
      updatedAt: new Date().toISOString(),
    };

    const updatedAll = {
      ...allSessions,
      [currentDateStr]: updatedSession,
    };
    updateSessionsState(updatedAll);
  };

  // Handler: Select all members as participating (unpaid / red)
  const handleSelectAll = () => {
    const newStatuses: Record<string, PaymentStatus> = {};
    INITIAL_MEMBERS.forEach((m) => {
      newStatuses[m.id] = 'unpaid';
    });

    const updatedSession: DailySession = {
      ...currentSession,
      memberStatuses: newStatuses,
      updatedAt: new Date().toISOString(),
    };

    const updatedAll = {
      ...allSessions,
      [currentDateStr]: updatedSession,
    };
    updateSessionsState(updatedAll);
  };

  // Handler: Mark all participating members as paid (green)
  const handleMarkAllPaid = () => {
    const newStatuses: Record<string, PaymentStatus> = {};
    INITIAL_MEMBERS.forEach((m) => {
      const currentSt = currentSession.memberStatuses[m.id];
      if (currentSt === 'unpaid' || currentSt === 'paid') {
        newStatuses[m.id] = 'paid';
      } else {
        newStatuses[m.id] = 'none';
      }
    });

    const updatedSession: DailySession = {
      ...currentSession,
      memberStatuses: newStatuses,
      updatedAt: new Date().toISOString(),
    };

    const updatedAll = {
      ...allSessions,
      [currentDateStr]: updatedSession,
    };
    updateSessionsState(updatedAll);
  };

  // Handler: Reset all members to unselected (white)
  const handleResetAll = () => {
    const updatedSession: DailySession = {
      ...currentSession,
      memberStatuses: {},
      updatedAt: new Date().toISOString(),
    };

    const updatedAll = {
      ...allSessions,
      [currentDateStr]: updatedSession,
    };
    updateSessionsState(updatedAll);
  };

  // Handler: Role Toggle
  const handleToggleRoleRequest = () => {
    if (role === 'admin') {
      setRole('member');
    } else {
      setShowPinModal(true);
    }
  };

  // Handler: Admin PIN Success
  const handlePinSuccess = () => {
    setRole('admin');
    setShowPinModal(false);
  };

  // Handler: Save Club Config
  const handleSaveConfig = (newConfig: ClubConfig) => {
    setConfig(newConfig);
    saveClubConfig(newConfig);

    // Also update price on current session if unchanged
    if (currentSession.shuttlecocks === 0) {
      const updatedSession = {
        ...currentSession,
        pricePerShuttlecock: newConfig.defaultPricePerShuttlecock,
      };
      updateSessionsState({
        ...allSessions,
        [currentDateStr]: updatedSession,
      });
    }
  };

  // Handler: Settle debt for a member across all sessions
  const handleSettleMemberDebt = (memberId: string) => {
    const updatedAll = { ...allSessions };

    Object.keys(updatedAll).forEach((dateKey) => {
      const session = updatedAll[dateKey];
      if (session.memberStatuses[memberId] === 'unpaid') {
        updatedAll[dateKey] = {
          ...session,
          memberStatuses: {
            ...session.memberStatuses,
            [memberId]: 'paid',
          },
          updatedAt: new Date().toISOString(),
        };
      }
    });

    updateSessionsState(updatedAll);
  };

  // Handler: Reset all data to seed
  const handleResetData = () => {
    localStorage.clear();
    const freshSessions = loadAllSessions();
    const freshConfig = loadClubConfig();
    setAllSessions(freshSessions);
    setConfig(freshConfig);
    setRole('member');
  };

  // Calculate statistics for current session
  const perPersonFee = calculateSessionPerPersonFee(currentSession);
  const now = new Date();

  let paidCount = 0;
  let unpaidCount = 0;
  let lateCount = 0;
  let noneCount = 0;

  INITIAL_MEMBERS.forEach((m) => {
    const rawSt = currentSession.memberStatuses[m.id] || 'none';
    const effective = getEffectiveStatus(rawSt, currentDateStr, config.paymentCutoffTime, now);
    if (effective === 'paid') paidCount++;
    else if (effective === 'unpaid') unpaidCount++;
    else if (effective === 'late') lateCount++;
    else noneCount++;
  });

  const participantsCount = paidCount + unpaidCount + lateCount;

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col justify-between p-2 overflow-hidden select-none font-sans max-w-md mx-auto shadow-2xl border-x border-slate-900">
      {/* 1. Header with Date Navigator & Admin Mode Switch */}
      <Header
        currentDateStr={currentDateStr}
        onDateChange={setCurrentDateStr}
        role={role}
        onToggleRoleRequest={handleToggleRoleRequest}
        onOpenCalendar={() => setShowCalendarModal(true)}
      />

      {/* 2. Shuttlecock Fee Calculator section */}
      <ShuttleCalculator
        session={currentSession}
        role={role}
        onUpdateShuttlecocks={handleUpdateShuttlecocks}
        onOpenConfig={() => setShowConfigModal(true)}
        onOpenDebtReport={() => setShowDebtReportModal(true)}
        participantsCount={participantsCount}
        paidCount={paidCount}
        unpaidCount={unpaidCount}
        lateCount={lateCount}
      />

      {/* 3. Color Key Legend Bar */}
      <StatusLegend
        paidCount={paidCount}
        unpaidCount={unpaidCount}
        lateCount={lateCount}
        noneCount={noneCount}
      />

      {/* 4. 18 Member Compact Button Matrix (Fits 1 Mobile Screen!) */}
      <PlayerGrid
        members={INITIAL_MEMBERS}
        memberStatuses={currentSession.memberStatuses}
        sessionDateStr={currentDateStr}
        perPersonFee={perPersonFee}
        role={role}
        cutoffTime={config.paymentCutoffTime}
        finePerLateDay={config.finePerLateDay}
        onStatusChange={handleStatusChange}
        onSelectAll={handleSelectAll}
        onMarkAllPaid={handleMarkAllPaid}
        onResetAll={handleResetAll}
      />

      {/* MODALS */}
      {showCalendarModal && (
        <CalendarModal
          currentDateStr={currentDateStr}
          allSessions={allSessions}
          onSelectDate={(newDateStr) => setCurrentDateStr(newDateStr)}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      {showPinModal && (
        <PinModal
          correctPin={config.adminPin || '1234'}
          onSuccess={handlePinSuccess}
          onClose={() => setShowPinModal(false)}
        />
      )}

      {showConfigModal && (
        <AdminConfigModal
          config={config}
          onSaveConfig={handleSaveConfig}
          onResetData={handleResetData}
          onClose={() => setShowConfigModal(false)}
        />
      )}

      {showDebtReportModal && (
        <DebtReportModal
          allSessions={allSessions}
          members={INITIAL_MEMBERS}
          role={role}
          onClose={() => setShowDebtReportModal(false)}
          onSettleMemberDebt={handleSettleMemberDebt}
        />
      )}
    </div>
  );
}
