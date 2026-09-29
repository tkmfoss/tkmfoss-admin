import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  AlertTriangle,
  Pin,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Announcement, AnnouncementCategory, AnnouncementPriority } from '../types';
import { addAnnouncement, updateAnnouncement, deleteAnnouncement } from '../services/dataService';
import { useToast } from '../context/ToastContext';

interface AnnouncementsManagerProps {
  announcements: Announcement[];
  searchQuery: string;
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
}

export const AnnouncementsManager: React.FC<AnnouncementsManagerProps> = ({
  announcements,
  searchQuery,
  isCreateModalOpen,
  onCloseCreateModal
}) => {
  const { success, error } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('GENERAL');
  const [priority, setPriority] = useState<AnnouncementPriority>('NORMAL');
  const [isActive, setIsActive] = useState(true);
  const [actionUrl, setActionUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setTitle('');
    setContent('');
    setCategory('GENERAL');
    setPriority('NORMAL');
    setIsActive(true);
    setActionUrl('');
    setActionLabel('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (a: Announcement) => {
    setEditingAnnouncement(a);
    setTitle(a.title || '');
    setContent(a.content || '');
    setCategory(a.category || 'GENERAL');
    setPriority(a.priority || 'NORMAL');
    setIsActive(a.isActive !== false);
    setActionUrl(a.actionUrl || '');
    setActionLabel(a.actionLabel || '');
    setDate(a.date || new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Sync external header trigger
  React.useEffect(() => {
    if (isCreateModalOpen) {
      openCreateModal();
      onCloseCreateModal();
    }
  }, [isCreateModalOpen]);

  const handleToggleActive = async (a: Announcement) => {
    try {
      await updateAnnouncement(a.id, { isActive: !a.isActive });
      success(`Broadcast marked as ${!a.isActive ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      error(err.message || 'Failed to update status.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      error('Title and Content are required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      content,
      category,
      priority,
      isActive,
      actionUrl,
      actionLabel,
      date: date || new Date().toISOString().split('T')[0]
    };

    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, payload);
        success(`Announcement "${title}" updated.`);
      } else {
        await addAnnouncement(payload);
        success(`Announcement broadcasted.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to save announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete announcement "${title}"?`)) {
      try {
        await deleteAnnouncement(id);
        success(`Deleted announcement "${title}".`);
      } catch (err: any) {
        error(err.message || 'Failed to delete.');
      }
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  return (
    <div>
      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-pills">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category:</span>
          {['ALL', 'GENERAL', 'EVENT', 'RECRUITMENT', 'ALERT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="filter-pills">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority:</span>
          {['ALL', 'URGENT', 'PINNED', 'NORMAL'].map((pri) => (
            <button
              key={pri}
              onClick={() => setPriorityFilter(pri)}
              className={`filter-pill ${priorityFilter === pri ? 'active' : ''}`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAnnouncements.map((a) => (
          <div
            key={a.id}
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${a.priority === 'URGENT' ? 'rgba(244, 63, 94, 0.3)' : a.priority === 'PINNED' ? 'rgba(251, 191, 36, 0.3)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              opacity: a.isActive ? 1 : 0.6,
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge badge-${a.priority.toLowerCase()}`}>
                  {a.priority === 'PINNED' && <Pin size={11} />}
                  {a.priority === 'URGENT' && <AlertTriangle size={11} />}
                  {a.priority}
                </span>

                <span className={`badge badge-${a.category.toLowerCase()}`}>
                  {a.category}
                </span>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {a.date}
                </span>
              </div>

              {/* Status Switch & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => handleToggleActive(a)}
                  className={`btn btn-sm ${a.isActive ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Toggle Active/Inactive"
                >
                  {a.isActive ? <Eye size={13} color="var(--accent-green)" /> : <EyeOff size={13} />}
                  <span>{a.isActive ? 'Live' : 'Hidden'}</span>
                </button>

                <button
                  onClick={() => openEditModal(a)}
                  className="btn btn-secondary btn-sm btn-icon"
                  title="Edit"
                >
                  <Edit2 size={13} />
                </button>

                <button
                  onClick={() => handleDelete(a.id, a.title)}
                  className="btn btn-danger btn-sm btn-icon"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                {a.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {a.content}
              </p>
            </div>

            {a.actionUrl && (
              <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <a
                  href={a.actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--accent-green)',
                    fontWeight: 600
                  }}
                >
                  <span>{a.actionLabel || 'Visit Action Link'}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Bell size={44} color="var(--border-medium)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No announcements found
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
              Broadcasting an announcement or notification alerts all club members instantly.
            </p>
            <button onClick={openCreateModal} className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Broadcast Announcement</span>
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingAnnouncement ? 'Edit Announcement' : 'New Broadcast / Notification'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost btn-sm btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Headline / Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Execom 2026-27 Applications Open"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                    >
                      <option value="GENERAL">GENERAL</option>
                      <option value="EVENT">EVENT</option>
                      <option value="RECRUITMENT">RECRUITMENT</option>
                      <option value="ALERT">ALERT</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="PINNED">PINNED (Sticky)</option>
                      <option value="URGENT">URGENT (Red Alert)</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Broadcast Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Live Active State</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '42px', gap: '10px' }}>
                      <input
                        type="checkbox"
                        id="annActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-green)' }}
                      />
                      <label htmlFor="annActive" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                        {isActive ? 'Published & Active' : 'Draft / Hidden'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Content / Body *</label>
                  <textarea
                    required
                    rows={4}
                    className="form-control"
                    placeholder="Enter announcement text, details, instructions..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Call-to-Action URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://forms.gle/... or link"
                      value={actionUrl}
                      onChange={(e) => setActionUrl(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Button Label</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Apply Now / Join Discord"
                      value={actionLabel}
                      onChange={(e) => setActionLabel(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Broadcasting...' : editingAnnouncement ? 'Update Broadcast' : 'Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
