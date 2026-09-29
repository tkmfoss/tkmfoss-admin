import React from 'react';
import {
  Calendar,
  Bell,
  Users,
  FileText,
  Plus,
  ArrowRight,
  Database,
  Sparkles,
  ExternalLink,
  MapPin,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import { FosEvent, Announcement, ExecomMember, PostEventReport, ActiveTab } from '../types';
import { useToast } from '../context/ToastContext';
import { seedDatabase } from '../services/dataService';
import confetti from 'canvas-confetti';

interface DashboardOverviewProps {
  events: FosEvent[];
  announcements: Announcement[];
  execom: ExecomMember[];
  reports: PostEventReport[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenCreate: (tab: ActiveTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  events,
  announcements,
  execom,
  reports,
  onNavigate,
  onOpenCreate
}) => {
  const { success, error } = useToast();

  const upcomingEvents = events.filter((e) => e.status === 'UPCOMING');
  const completedEvents = events.filter((e) => e.status === 'COMPLETED');
  const activeAnnouncements = announcements.filter((a) => a.isActive);
  const currentExecom = execom.filter((m) => m.isCurrent);
  const totalAttendees = reports.reduce((acc, r) => acc + (r.attendeeCount || 0), 0);

  const handleSeedClick = async () => {
    try {
      const res = await seedDatabase();
      confetti({ particleCount: 80, spread: 60 });
      success(`Seeded initial TKMFOSS data (${res.count} records) into Firebase!`);
    } catch (err: any) {
      error(err.message || 'Seeding failed. Cached offline.');
    }
  };

  return (
    <div className="overview-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 255, 102, 0.08) 0%, rgba(0, 210, 255, 0.04) 50%, rgba(19, 23, 34, 0.8) 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-elevated)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-green)',
            padding: '3px 10px',
            borderRadius: '99px',
            background: 'rgba(0, 255, 102, 0.1)',
            border: '1px solid rgba(0, 255, 102, 0.3)',
            marginBottom: '10px'
          }}>
            <Sparkles size={12} />
            <span>FOSS Control Plane Connected</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '6px' }}>
            TKMFOSS Content Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '640px' }}>
            Manage public events, announcements, previous & current execom leadership, and post-event impact reports directly synced with Firebase and Cloudinary.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onOpenCreate('events')}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Create Event</span>
          </button>

          <button
            onClick={handleSeedClick}
            className="btn btn-secondary"
            title="Populate Firebase collections with official TKMFOSS historical records"
          >
            <Database size={16} color="var(--accent-cyan)" />
            <span>Seed Initial FOSS Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        {/* Events Stat */}
        <div className="stat-card" onClick={() => onNavigate('events')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span className="stat-title">Events</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 210, 255, 0.12)', color: 'var(--accent-cyan)' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-subtext" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{upcomingEvents.length} Upcoming</span>
            <span>•</span>
            <span>{completedEvents.length} Concluded</span>
          </div>
        </div>

        {/* Announcements Stat */}
        <div className="stat-card" onClick={() => onNavigate('announcements')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span className="stat-title">Announcements</span>
            <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.12)', color: 'var(--accent-amber)' }}>
              <Bell size={18} />
            </div>
          </div>
          <div className="stat-value">{announcements.length}</div>
          <div className="stat-subtext">
            <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{activeAnnouncements.length} Active Broadcasts</span>
          </div>
        </div>

        {/* Execom Stat */}
        <div className="stat-card" onClick={() => onNavigate('execom')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span className="stat-title">Execom Directory</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 255, 102, 0.12)', color: 'var(--accent-green)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{execom.length}</div>
          <div className="stat-subtext">
            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{currentExecom.length} Current Leaders</span>
            <span> • {execom.length - currentExecom.length} Alumni</span>
          </div>
        </div>

        {/* Reports Stat */}
        <div className="stat-card" onClick={() => onNavigate('reports')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <span className="stat-title">Impact & Reports</span>
            <div className="stat-icon" style={{ background: 'rgba(192, 132, 252, 0.12)', color: 'var(--accent-purple)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-value">{reports.length}</div>
          <div className="stat-subtext">
            <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{totalAttendees}+ Participants Tracked</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid for Live Previews */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px' }}>
        {/* Latest Events */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="var(--accent-green)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Upcoming & Recent Events</h3>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="btn btn-ghost btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {events.slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <img
                  src={ev.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80'}
                  alt={ev.title}
                  style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`badge badge-${ev.status.toLowerCase()}`}>
                      {ev.status}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {ev.date}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ev.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <MapPin size={12} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.location || 'TKMCE Campus'}</span>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                No events recorded yet. Click "Seed Initial FOSS Data" or "Create Event" to get started.
              </div>
            )}
          </div>
        </div>

        {/* Live Announcements & Execom Snapshot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Active Announcements */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={18} color="var(--accent-amber)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Active Broadcasts</h3>
              </div>
              <button
                onClick={() => onNavigate('announcements')}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--accent-amber)' }}
              >
                <span>Manage</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className={`badge badge-${a.priority.toLowerCase()}`}>
                      {a.priority}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {a.date}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>
                    {a.title}
                  </div>
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {a.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Current Execom Snapshot */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Execom Leadership</h3>
              </div>
              <button
                onClick={() => onNavigate('execom')}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--accent-cyan)' }}
              >
                <span>View Execom</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {currentExecom.slice(0, 8).map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '99px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--accent-green)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{member.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
