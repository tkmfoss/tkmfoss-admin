import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { DashboardOverview } from './components/DashboardOverview';
import { EventsManager } from './components/EventsManager';
import { AnnouncementsManager } from './components/AnnouncementsManager';
import { ExecomManager } from './components/ExecomManager';
import { ReportsManager } from './components/ReportsManager';
import { SettingsManager } from './components/SettingsManager';
import { FosEvent, Announcement, ExecomMember, PostEventReport, ActiveTab } from './types';
import {
  subscribeEvents,
  subscribeAnnouncements,
  subscribeExecom,
  subscribeReports
} from './services/dataService';
import { Terminal, Loader2 } from 'lucide-react';

const AdminPortal: React.FC = () => {
  const { user, isGuestAdmin, isLoading: authLoading } = useAuth();
  const { info } = useToast();

  const [currentTab, setCurrentTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [createModalTrigger, setCreateModalTrigger] = useState(false);

  // Live state
  const [events, setEvents] = useState<FosEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [execom, setExecom] = useState<ExecomMember[]>([]);
  const [reports, setReports] = useState<PostEventReport[]>([]);
  const [firebaseActive, setFirebaseActive] = useState(true);

  // Subscribe to real-time collections
  useEffect(() => {
    if (!user && !isGuestAdmin) return;

    const unsubs: (() => void)[] = [];

    unsubs.push(
      subscribeEvents(
        (data) => setEvents(data),
        () => setFirebaseActive(false)
      )
    );

    unsubs.push(
      subscribeAnnouncements(
        (data) => setAnnouncements(data),
        () => setFirebaseActive(false)
      )
    );

    unsubs.push(
      subscribeExecom(
        (data) => setExecom(data),
        () => setFirebaseActive(false)
      )
    );

    unsubs.push(
      subscribeReports(
        (data) => setReports(data),
        () => setFirebaseActive(false)
      )
    );

    return () => {
      unsubs.forEach((unsub) => unsub && unsub());
    };
  }, [user, isGuestAdmin]);

  // Reset search when tab changes
  useEffect(() => {
    setSearchQuery('');
  }, [currentTab]);

  if (authLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--bg-canvas)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 255, 102, 0.1)',
          border: '1px solid var(--accent-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-green)'
        }}>
          <Terminal size={24} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          <Loader2 size={16} className="animate-spin" />
          <span>INITIALIZING TKMFOSS ADMIN...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login
  if (!user && !isGuestAdmin) {
    return <LoginModal />;
  }

  const handleOpenCreate = (tab?: ActiveTab) => {
    if (tab && tab !== currentTab) {
      setCurrentTab(tab);
    }
    setCreateModalTrigger(true);
  };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        counts={{
          events: events.length,
          announcements: announcements.length,
          execom: execom.length,
          reports: reports.length
        }}
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <div className="main-wrapper">
        <Header
          currentTab={currentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreateModal={() => handleOpenCreate()}
          onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          firebaseActive={firebaseActive}
        />

        <main className="page-container">
          {currentTab === 'overview' && (
            <DashboardOverview
              events={events}
              announcements={announcements}
              execom={execom}
              reports={reports}
              onNavigate={setCurrentTab}
              onOpenCreate={handleOpenCreate}
            />
          )}

          {currentTab === 'events' && (
            <EventsManager
              events={events}
              searchQuery={searchQuery}
              isCreateModalOpen={createModalTrigger}
              onCloseCreateModal={() => setCreateModalTrigger(false)}
            />
          )}

          {currentTab === 'announcements' && (
            <AnnouncementsManager
              announcements={announcements}
              searchQuery={searchQuery}
              isCreateModalOpen={createModalTrigger}
              onCloseCreateModal={() => setCreateModalTrigger(false)}
            />
          )}

          {currentTab === 'execom' && (
            <ExecomManager
              execom={execom}
              searchQuery={searchQuery}
              isCreateModalOpen={createModalTrigger}
              onCloseCreateModal={() => setCreateModalTrigger(false)}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsManager
              reports={reports}
              events={events}
              searchQuery={searchQuery}
              isCreateModalOpen={createModalTrigger}
              onCloseCreateModal={() => setCreateModalTrigger(false)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsManager
              events={events}
              announcements={announcements}
              execom={execom}
              reports={reports}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminPortal />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
