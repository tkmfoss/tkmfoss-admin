import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Upload,
  X,
  Plus,
  Maximize2
} from 'lucide-react';
import { FosEvent, EventCategory, EventStatus } from '../types';
import { addEvent, updateEvent, deleteEvent } from '../services/dataService';
import { smartUploadImage } from '../services/cloudinaryService';
import { useToast } from '../context/ToastContext';

interface EventsManagerProps {
  events: FosEvent[];
  searchQuery: string;
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
}

export const EventsManager: React.FC<EventsManagerProps> = ({
  events,
  searchQuery,
  isCreateModalOpen,
  onCloseCreateModal
}) => {
  const { success, error, info } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Full-size poster preview state
  const [previewPoster, setPreviewPoster] = useState<{ url: string; title: string } | null>(null);

  // Edit / Create state
  const [editingEvent, setEditingEvent] = useState<FosEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('WORKSHOP');
  const [status, setStatus] = useState<EventStatus>('UPCOMING');
  const [location, setLocation] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [maxSeats, setMaxSeats] = useState<number | undefined>(undefined);
  const [contactPerson, setContactPerson] = useState('');

  // Uploading state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Open modal in create mode
  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setYear(new Date().getFullYear());
    setDate(new Date().toISOString().split('T')[0]);
    setTime('16:00 IST');
    setDescription('');
    setCategory('WORKSHOP');
    setStatus('UPCOMING');
    setLocation('TKMCE Campus');
    setCoverImage('');
    setHighlights([]);
    setRegistrationUrl('');
    setRegistrationOpen(true);
    setMaxSeats(undefined);
    setContactPerson('foss@tkmce.ac.in');
    setIsModalOpen(true);
  };

  // Open modal in edit mode
  const openEditModal = (event: FosEvent) => {
    setEditingEvent(event);
    setTitle(event.title || '');
    setYear(event.year || new Date().getFullYear());
    setDate(event.date || '');
    setTime(event.time || '');
    setDescription(event.description || '');
    setCategory(event.category || 'WORKSHOP');
    setStatus(event.status || 'UPCOMING');
    setLocation(event.location || '');
    setCoverImage(event.coverImage || '');
    setHighlights(event.highlights || []);
    setRegistrationUrl(event.registrationUrl || '');
    setRegistrationOpen(event.registrationOpen !== false);
    setMaxSeats(event.maxSeats);
    setContactPerson(event.contactPerson || '');
    setIsModalOpen(true);
  };

  // Handle external modal trigger from Header
  React.useEffect(() => {
    if (isCreateModalOpen) {
      openCreateModal();
      onCloseCreateModal();
    }
  }, [isCreateModalOpen]);

  const handleAddHighlight = () => {
    if (highlightInput.trim() && !highlights.includes(highlightInput.trim())) {
      setHighlights([...highlights, highlightInput.trim()]);
      setHighlightInput('');
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    info('Uploading cover image...');
    try {
      const res = await smartUploadImage(file);
      setCoverImage(res.url);
      success(`Image uploaded successfully (${res.service})!`);
    } catch (err: any) {
      error(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      error('Title and Date are required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      year: Number(year) || new Date().getFullYear(),
      date,
      time,
      description,
      category,
      status,
      location,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      highlights,
      registrationUrl,
      registrationOpen,
      ...(maxSeats ? { maxSeats: Number(maxSeats) } : {}),
      contactPerson
    };

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
        success(`Event "${title}" updated successfully.`);
      } else {
        await addEvent(payload);
        success(`Event "${title}" published to Firebase.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteEvent(id);
        success(`Deleted event "${title}".`);
      } catch (err: any) {
        error(err.message || 'Failed to delete event.');
      }
    }
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || ev.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || ev.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div>
      {/* Filter and Control Bar */}
      <div className="filter-bar">
        <div className="filter-pills">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>Category:</span>
          {['ALL', 'WORKSHOP', 'HACKATHON', 'COMMUNITY', 'TALK', 'COMPETITION'].map((cat) => (
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>Status:</span>
          {['ALL', 'UPCOMING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events Card Grid */}
      <div className="card-grid">
        {filteredEvents.map((ev) => (
          <div key={ev.id} className="item-card">
            <div
              className="card-media"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (ev.coverImage) {
                  setPreviewPoster({ url: ev.coverImage, title: ev.title });
                }
              }}
              title="Click to view full size poster"
            >
              <img
                src={ev.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'}
                alt={ev.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="media-badge">
                <span className={`badge badge-${ev.category.toLowerCase()}`}>
                  {ev.category}
                </span>
              </div>
              <div className="media-status">
                <span className={`badge badge-${ev.status.toLowerCase()}`}>
                  {ev.status}
                </span>
              </div>
            </div>

            <div className="card-body">
              <div className="card-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} color="var(--accent-green)" />
                  {ev.date}
                </span>
                {ev.time && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    {ev.time}
                  </span>
                )}
              </div>

              <h3 className="card-title">{ev.title}</h3>

              <p className="card-desc">{ev.description}</p>

              {ev.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <MapPin size={13} />
                  <span>{ev.location}</span>
                </div>
              )}

              {/* Highlights */}
              {ev.highlights && ev.highlights.length > 0 && (
                <div className="tags-row">
                  {ev.highlights.slice(0, 3).map((h, i) => (
                    <span key={i} className="tag-chip">
                      #{h}
                    </span>
                  ))}
                  {ev.highlights.length > 3 && (
                    <span className="tag-chip">+{ev.highlights.length - 3} more</span>
                  )}
                </div>
              )}

              {/* Card Footer */}
              <div className="card-footer">
                <div>
                  {(() => {
                    const isPast = ev.status === 'COMPLETED' || (ev.date && ev.date < new Date().toISOString().split('T')[0]);
                    if (isPast) {
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            opacity: 0.65,
                            cursor: 'not-allowed',
                            pointerEvents: 'none',
                            userSelect: 'none'
                          }}
                          title="Event date is over. Registration is not available."
                        >
                          <span>Reg Closed (Past Event)</span>
                        </span>
                      );
                    }
                    if (ev.registrationUrl) {
                      return (
                        <a
                          href={ev.registrationUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.75rem',
                            color: ev.registrationOpen ? 'var(--accent-green)' : 'var(--text-muted)',
                            fontWeight: 600
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>{ev.registrationOpen ? 'Registration Active' : 'Reg Closed'}</span>
                        </a>
                      );
                    }
                    return <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No Reg Link</span>;
                  })()}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openEditModal(ev)}
                    className="btn btn-secondary btn-sm btn-icon"
                    title="Edit Event"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id, ev.title)}
                    className="btn btn-danger btn-sm btn-icon"
                    title="Delete Event"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <Calendar size={48} color="var(--border-medium)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No events match your criteria
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Adjust your search or category filters, or create a brand new event.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Create New Event</span>
          </button>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingEvent ? 'Edit Event Details' : 'Create New Event'}
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
                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Season of Commits 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Category & Status */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as EventCategory)}
                    >
                      <option value="WORKSHOP">WORKSHOP</option>
                      <option value="HACKATHON">HACKATHON</option>
                      <option value="COMMUNITY">COMMUNITY</option>
                      <option value="TALK">TALK</option>
                      <option value="MEETUP">MEETUP</option>
                      <option value="COMPETITION">COMPETITION</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as EventStatus)}
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Event Date *</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Time & Timezone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 16:30 IST"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location & Year */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Location / Venue</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. APJ Hall / Online Discord"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <input
                      type="number"
                      className="form-control"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide overview of the event, topics covered, and prerequisites..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Image Upload / Poster */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Cover Photo / Poster</span>
                    <span className="form-label-desc">Cloudinary / Firebase / Direct URL</span>
                  </label>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://... or upload below"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                      <Upload size={14} />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {coverImage && (
                    <div className="upload-preview" style={{ marginTop: '10px' }}>
                      <img src={coverImage} alt="Cover Preview" />
                    </div>
                  )}
                </div>

                {/* Registration URL & Open Toggle */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Registration Link (URL)</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://forms.gle/... or website link"
                      value={registrationUrl}
                      onChange={(e) => setRegistrationUrl(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Registration Active?</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '42px', gap: '10px' }}>
                      <input
                        type="checkbox"
                        id="regOpen"
                        checked={registrationOpen}
                        onChange={(e) => setRegistrationOpen(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-green)' }}
                      />
                      <label htmlFor="regOpen" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                        {registrationOpen ? 'Open for registration' : 'Registration Closed'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Highlights tags */}
                <div className="form-group">
                  <label className="form-label">Key Highlights / Tags</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type a highlight and press Add..."
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddHighlight();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="tags-row" style={{ marginTop: '8px' }}>
                    {highlights.map((h, i) => (
                      <span key={i} className="tag-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{h}</span>
                        <X
                          size={12}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleRemoveHighlight(i)}
                        />
                      </span>
                    ))}
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
                  disabled={submitting || uploadingImage}
                >
                  {submitting ? 'Saving to Firebase...' : editingEvent ? 'Update Event' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Poster Preview Modal */}
      {previewPoster && (
        <div
          className="modal-overlay"
          onClick={() => setPreviewPoster(null)}
          style={{ zIndex: 1100 }}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '800px',
              width: '90vw',
              maxHeight: '92vh',
              padding: '20px',
              background: '#090a0d',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Maximize2 size={16} color="var(--accent-green)" />
                <h3 className="modal-title" style={{ fontSize: '15px' }}>{previewPoster.title}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={previewPoster.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                >
                  <ExternalLink size={13} />
                  <span>Open Original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPoster(null)}
                  className="btn-icon"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                padding: '12px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <img
                src={previewPoster.url}
                alt={previewPoster.title}
                style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain' }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <span>FULL-RESOLUTION POSTER ARCHIVE</span>
              <span>1:1 UNCOMPRESSED ORIGINAL</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
