import React from 'react';
import {
  Calendar,
  Bell,
  Users,
  FileText,
  Plus,
  ArrowRight,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';
import { FosEvent, Announcement, ExecomMember, PostEventReport, ActiveTab } from '../types';

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
  const upcomingEvents = events.filter((e) => e.status === 'UPCOMING');
  const completedEvents = events.filter((e) => e.status === 'COMPLETED');
  const activeAnnouncements = announcements.filter((a) => a.isActive);
  const currentExecom = execom.filter((m) => m.isCurrent);
  const totalAttendees = reports.reduce((acc, r) => acc + (r.attendeeCount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: 'var(--font-mono)' }}>
      {/* Header Banner */}
      <div style={{
        background: '#101115',
        border: '2px solid #2b2c31',
        boxShadow: '4px 4px 0px #000000',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.72rem',
            color: '#00ff66',
            marginBottom: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', background: '#00ff66', display: 'inline-block' }}></span>
            <span>// CONTROL_PLANE</span>
          </div>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.5px',
            color: '#ffffff',
            margin: '0 0 6px 0',
            fontFamily: 'var(--font-sans)'
          }}>
            TKMFOSS Admin Center
          </h1>
          <p style={{
            color: '#a1a1aa',
            fontSize: '0.82rem',
            maxWidth: '620px',
            margin: 0,
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.5
          }}>
            Authoritative console for events, public notices, executive committee rosters, and post-event reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onOpenCreate('events')}
            style={{
              background: '#00ff66',
              color: '#000000',
              border: '2px solid #000000',
              boxShadow: '3px 3px 0px #000000',
              padding: '10px 16px',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            <Plus size={15} />
            <span>New Event</span>
          </button>

          <button
            onClick={() => onOpenCreate('announcements')}
            style={{
              background: '#16171d',
              color: '#00f0ff',
              border: '2px solid #27272a',
              boxShadow: '3px 3px 0px #000000',
              padding: '10px 16px',
              fontWeight: 800,
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            <Plus size={15} />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Events Stat */}
        <div
          onClick={() => onNavigate('events')}
          style={{
            background: '#101115',
            border: '2px solid #2b2c31',
            boxShadow: '3px 3px 0px #000000',
            padding: '18px 20px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#a1a1aa', textTransform: 'uppercase' }}>[EVENTS]</span>
            <Calendar size={16} color="#00ff66" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>{events.length}</div>
          <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '4px' }}>
            {upcomingEvents.length} UPCOMING // {completedEvents.length} CONCLUDED
          </div>
        </div>

        {/* Announcements Stat */}
        <div
          onClick={() => onNavigate('announcements')}
          style={{
            background: '#101115',
            border: '2px solid #2b2c31',
            boxShadow: '3px 3px 0px #000000',
            padding: '18px 20px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#a1a1aa', textTransform: 'uppercase' }}>[BROADCASTS]</span>
            <Bell size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>{announcements.length}</div>
          <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '4px' }}>
            {activeAnnouncements.length} ACTIVE BROADCASTS
          </div>
        </div>

        {/* Execom Stat */}
        <div
          onClick={() => onNavigate('execom')}
          style={{
            background: '#101115',
            border: '2px solid #2b2c31',
            boxShadow: '3px 3px 0px #000000',
            padding: '18px 20px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#a1a1aa', textTransform: 'uppercase' }}>[EXECOM]</span>
            <Users size={16} color="#00f0ff" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>{execom.length}</div>
          <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '4px' }}>
            {currentExecom.length} CURRENT // {execom.length - currentExecom.length} ALUMNI
          </div>
        </div>

        {/* Reports Stat */}
        <div
          onClick={() => onNavigate('reports')}
          style={{
            background: '#101115',
            border: '2px solid #2b2c31',
            boxShadow: '3px 3px 0px #000000',
            padding: '18px 20px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#a1a1aa', textTransform: 'uppercase' }}>[REPORTS]</span>
            <FileText size={16} color="#ffffff" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>{reports.length}</div>
          <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '4px' }}>
            {totalAttendees} ATTENDEES RECORDED
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Recent Events Card */}
        <div style={{
          background: '#101115',
          border: '2px solid #2b2c31',
          boxShadow: '4px 4px 0px #000000',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #232429',
            paddingBottom: '12px',
            marginBottom: '16px'
          }}>
            <span style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '0.82rem' }}>
              // EVENT DISPATCHES ({events.length})
            </span>
            <button
              onClick={() => onNavigate('events')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00ff66',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>VIEW ALL</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {events.slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                style={{
                  background: '#14151a',
                  border: '1px solid #222329',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '1px 5px',
                      background: ev.status === 'UPCOMING' ? '#112415' : '#17181d',
                      color: ev.status === 'UPCOMING' ? '#00ff66' : '#a1a1aa',
                      border: '1px solid #27272a'
                    }}>
                      [{ev.status}]
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#71717a' }}>{ev.date}</span>
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {ev.title}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('events')}
                  style={{
                    background: '#1b1c22',
                    border: '1px solid #2e3039',
                    color: '#d4d4d8',
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  DETAILS
                </button>
              </div>
            ))}

            {events.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '36px 16px',
                border: '1px dashed #27272a',
                color: '#71717a',
                fontSize: '0.75rem'
              }}>
                <div>NO EVENTS RECORDED</div>
                <button
                  onClick={() => onOpenCreate('events')}
                  style={{
                    marginTop: '10px',
                    background: '#00ff66',
                    color: '#000000',
                    border: '1px solid #000000',
                    padding: '6px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  + CREATE FIRST EVENT
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Announcements Card */}
        <div style={{
          background: '#101115',
          border: '2px solid #2b2c31',
          boxShadow: '4px 4px 0px #000000',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #232429',
            paddingBottom: '12px',
            marginBottom: '16px'
          }}>
            <span style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '0.82rem' }}>
              // BROADCAST FEED ({announcements.length})
            </span>
            <button
              onClick={() => onNavigate('announcements')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f59e0b',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>MANAGE</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {announcements.slice(0, 4).map((a) => (
              <div
                key={a.id}
                style={{
                  background: '#14151a',
                  border: '1px solid #222329',
                  padding: '10px 12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                    background: '#231808',
                    color: '#f59e0b',
                    border: '1px solid #452c08'
                  }}>
                    [{a.priority}] // {a.category}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#71717a' }}>{a.date}</span>
                </div>
                <div style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '0.82rem', marginBottom: '2px' }}>
                  {a.title}
                </div>
                <p style={{
                  color: '#a1a1aa',
                  fontSize: '0.72rem',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {a.content}
                </p>
              </div>
            ))}

            {announcements.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '36px 16px',
                border: '1px dashed #27272a',
                color: '#71717a',
                fontSize: '0.75rem'
              }}>
                <div>NO ACTIVE BROADCASTS</div>
                <button
                  onClick={() => onOpenCreate('announcements')}
                  style={{
                    marginTop: '10px',
                    background: '#f59e0b',
                    color: '#000000',
                    border: '1px solid #000000',
                    padding: '6px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  + BROADCAST ANNOUNCEMENT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
