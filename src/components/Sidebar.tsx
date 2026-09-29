import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Bell,
  Users,
  FileText,
  Settings,
  LogOut,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  counts: {
    events: number;
    announcements: number;
    execom: number;
    reports: number;
  };
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  counts,
  isOpen,
  onCloseMobile
}) => {
  const { userDisplayName, userEmail, userPhoto, logout, isGuestAdmin } = useAuth();

  const handleTabClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 95
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon">
              <Terminal size={20} />
            </div>
            <div>
              <div className="brand-title">
                TKMFOSS <span className="brand-tag">Admin</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                v2.6 Control Plane
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Core Management</div>

          <button
            onClick={() => handleTabClick('overview')}
            className={`nav-item ${currentTab === 'overview' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleTabClick('events')}
            className={`nav-item ${currentTab === 'events' ? 'active' : ''}`}
          >
            <Calendar size={18} />
            <span>Events</span>
            {counts.events > 0 && <span className="nav-badge">{counts.events}</span>}
          </button>

          <button
            onClick={() => handleTabClick('announcements')}
            className={`nav-item ${currentTab === 'announcements' ? 'active' : ''}`}
          >
            <Bell size={18} />
            <span>Announcements</span>
            {counts.announcements > 0 && <span className="nav-badge">{counts.announcements}</span>}
          </button>

          <button
            onClick={() => handleTabClick('execom')}
            className={`nav-item ${currentTab === 'execom' ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>Execom Directory</span>
            {counts.execom > 0 && <span className="nav-badge">{counts.execom}</span>}
          </button>

          <button
            onClick={() => handleTabClick('reports')}
            className={`nav-item ${currentTab === 'reports' ? 'active' : ''}`}
          >
            <FileText size={18} />
            <span>Event Reports</span>
            {counts.reports > 0 && <span className="nav-badge">{counts.reports}</span>}
          </button>

          <div className="nav-section-label" style={{ marginTop: '16px' }}>System & Integration</div>

          <button
            onClick={() => handleTabClick('settings')}
            className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          >
            <Settings size={18} />
            <span>Cloud & Settings</span>
          </button>

          {/* Quick link to main site */}
          <a
            href="https://foss.tkmce.ac.in"
            target="_blank"
            rel="noreferrer"
            className="nav-item"
            style={{ marginTop: 'auto', opacity: 0.8 }}
          >
            <ExternalLink size={16} />
            <span style={{ fontSize: '0.8rem' }}>Public Website</span>
          </a>
        </nav>

        {/* Footer Admin Card */}
        <div className="sidebar-footer">
          <div className="admin-badge-card">
            <img src={userPhoto} alt={userDisplayName} className="admin-avatar" />
            <div className="admin-info">
              <div className="admin-name" title={userDisplayName}>{userDisplayName}</div>
              <div className="admin-status">
                <span className="status-dot"></span>
                <span>{isGuestAdmin ? 'Demo Session' : 'Firebase Sync'}</span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="btn btn-ghost btn-sm btn-icon"
              style={{ color: 'var(--accent-red)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
