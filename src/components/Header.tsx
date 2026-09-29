import React from 'react';
import {
  Menu,
  Search,
  Plus,
  Radio,
  Layers
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  currentTab: ActiveTab;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  onToggleMobileMenu: () => void;
  firebaseActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onToggleMobileMenu,
  firebaseActive
}) => {
  const getTabLabel = (tab: ActiveTab) => {
    switch (tab) {
      case 'overview': return 'Command Center';
      case 'events': return 'Events & Workshops';
      case 'announcements': return 'Announcements & Alerts';
      case 'execom': return 'Execom Leadership';
      case 'reports': return 'Post-Event Reports';
      case 'settings': return 'Cloud & Configuration';
    }
  };

  const getAddButtonText = (tab: ActiveTab) => {
    switch (tab) {
      case 'events': return 'New Event';
      case 'announcements': return 'New Alert';
      case 'execom': return 'Add Member';
      case 'reports': return 'New Report';
      default: return 'Quick Add';
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          onClick={onToggleMobileMenu}
          className="btn btn-secondary btn-icon"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          <Menu size={18} />
        </button>

        <h1 className="page-title">
          <Layers size={22} color="var(--accent-green)" />
          <span>{getTabLabel(currentTab)}</span>
        </h1>
      </div>

      <div className="topbar-right">
        {/* Search Input (visible on content tabs) */}
        {currentTab !== 'overview' && currentTab !== 'settings' && (
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={`Search ${currentTab}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {/* Live sync badge */}
        <div
          title={firebaseActive ? "Connected to Firebase Firestore & Auth" : "Running in Local Offline Mode"}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            padding: '5px 10px',
            borderRadius: '99px',
            background: firebaseActive ? 'rgba(0, 255, 102, 0.1)' : 'rgba(251, 191, 36, 0.1)',
            border: `1px solid ${firebaseActive ? 'rgba(0, 255, 102, 0.25)' : 'rgba(251, 191, 36, 0.25)'}`,
            color: firebaseActive ? 'var(--accent-green)' : 'var(--accent-amber)'
          }}
        >
          <Radio size={12} className={firebaseActive ? "pulse-icon" : ""} />
          <span>{firebaseActive ? 'Firebase Live' : 'Local Cached'}</span>
        </div>

        {/* Action Button */}
        {currentTab !== 'overview' && currentTab !== 'settings' && (
          <button
            onClick={onOpenCreateModal}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>{getAddButtonText(currentTab)}</span>
          </button>
        )}
      </div>
    </header>
  );
};
