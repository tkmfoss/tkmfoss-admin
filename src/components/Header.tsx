import React from 'react';
import {
  Menu,
  Search,
  Plus,
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
      case 'projects': return 'Open Source Projects';
      default: return 'Control Center';
    }
  };

  const getAddButtonText = (tab: ActiveTab) => {
    switch (tab) {
      case 'events': return 'New Event';
      case 'announcements': return 'New Alert';
      case 'execom': return 'Add Member';
      case 'reports': return 'New Report';
      case 'projects': return 'New Project';
      default: return 'Quick Add';
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          onClick={onToggleMobileMenu}
          className="btn btn-secondary btn-icon mobile-menu-btn"
          aria-label="Toggle Navigation Menu"
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
        {currentTab !== 'overview' && (
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

        {/* Action Button */}
        {currentTab !== 'overview' && (
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
