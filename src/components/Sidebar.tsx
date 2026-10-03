import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Bell,
  Users,
  FileText,
  FolderGit2,
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
    projects?: number;
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
  const { logout } = useAuth();

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

          <button
            onClick={() => handleTabClick('projects')}
            className={`nav-item ${currentTab === 'projects' ? 'active' : ''}`}
          >
            <FolderGit2 size={18} />
            <span>Projects</span>
            {(counts.projects || 0) > 0 && <span className="nav-badge">{counts.projects}</span>}
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

        {/* Footer Logout */}
        <div className="sidebar-footer">
          <button
            onClick={() => logout()}
            className="nav-item"
            style={{
              width: '100%',
              color: 'var(--accent-red)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
