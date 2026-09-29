import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Users,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Image,
  FolderOpen,
  CheckSquare
} from 'lucide-react';
import { PostEventReport, FosEvent } from '../types';
import { addReport, updateReport, deleteReport } from '../services/dataService';
import { smartUploadImage } from '../services/cloudinaryService';
import { useToast } from '../context/ToastContext';

interface ReportsManagerProps {
  reports: PostEventReport[];
  events: FosEvent[];
  searchQuery: string;
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  reports,
  events,
  searchQuery,
  isCreateModalOpen,
  onCloseCreateModal
}) => {
  const { success, error, info } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<PostEventReport | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [eventId, setEventId] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [attendeeCount, setAttendeeCount] = useState<number>(50);
  const [speaker, setSpeaker] = useState('');
  const [summary, setSummary] = useState('');
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [outcomeInput, setOutcomeInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [reportDocUrl, setReportDocUrl] = useState('');
  const [submittedBy, setSubmittedBy] = useState('TKMFOSS Documentation Team');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingReport(null);
    setTitle('');
    setEventId('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setAttendeeCount(50);
    setSpeaker('');
    setSummary('');
    setOutcomes([]);
    setCoverImage('');
    setGallery([]);
    setDriveFolderUrl('');
    setReportDocUrl('');
    setSubmittedBy('TKMFOSS Documentation Lead');
    setIsModalOpen(true);
  };

  const openEditModal = (r: PostEventReport) => {
    setEditingReport(r);
    setTitle(r.title || '');
    setEventId(r.eventId || '');
    setEventDate(r.eventDate || '');
    setAttendeeCount(r.attendeeCount || 0);
    setSpeaker(r.speaker || '');
    setSummary(r.summary || '');
    setOutcomes(r.outcomes || []);
    setCoverImage(r.coverImage || '');
    setGallery(r.gallery || []);
    setDriveFolderUrl(r.driveFolderUrl || '');
    setReportDocUrl(r.reportDocUrl || '');
    setSubmittedBy(r.submittedBy || '');
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    if (isCreateModalOpen) {
      openCreateModal();
      onCloseCreateModal();
    }
  }, [isCreateModalOpen]);

  const handleSelectEvent = (selectedId: string) => {
    setEventId(selectedId);
    const ev = events.find((e) => e.id === selectedId);
    if (ev) {
      setTitle(`${ev.title} - Post-Event Report`);
      setEventDate(ev.date);
      if (ev.coverImage) setCoverImage(ev.coverImage);
    }
  };

  const handleAddOutcome = () => {
    if (outcomeInput.trim()) {
      setOutcomes([...outcomes, outcomeInput.trim()]);
      setOutcomeInput('');
    }
  };

  const handleRemoveOutcome = (idx: number) => {
    setOutcomes(outcomes.filter((_, i) => i !== idx));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    info('Uploading cover image...');
    try {
      const res = await smartUploadImage(file);
      setCoverImage(res.url);
      success('Cover image uploaded!');
    } catch (err: any) {
      error(err.message || 'Cover upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    info(`Uploading ${files.length} gallery photos...`);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await smartUploadImage(files[i]);
        newUrls.push(res.url);
      }
      setGallery([...gallery, ...newUrls]);
      success(`Uploaded ${newUrls.length} photos to report gallery.`);
    } catch (err: any) {
      error(err.message || 'Gallery upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) {
      error('Report Title and Summary are required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      eventId: eventId || undefined,
      eventDate,
      attendeeCount: Number(attendeeCount) || 0,
      speaker,
      summary,
      outcomes,
      coverImage,
      gallery,
      driveFolderUrl,
      reportDocUrl,
      submittedBy
    };

    try {
      if (editingReport) {
        await updateReport(editingReport.id, payload);
        success(`Report "${title}" updated.`);
      } else {
        await addReport(payload);
        success(`Report "${title}" saved to Firebase.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to save report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, repTitle: string) => {
    if (window.confirm(`Delete report "${repTitle}"?`)) {
      try {
        await deleteReport(id);
        success(`Deleted report "${repTitle}".`);
      } catch (err: any) {
        error(err.message || 'Failed to delete report.');
      }
    }
  };

  const filteredReports = reports.filter((r) => {
    return (
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.speaker?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div>
      {/* Reports Grid */}
      <div className="card-grid">
        {filteredReports.map((r) => (
          <div key={r.id} className="item-card">
            {r.coverImage && (
              <div className="card-media">
                <img src={r.coverImage} alt={r.title} />
                <div className="media-badge">
                  <span className="badge badge-talk">
                    <Users size={11} /> {r.attendeeCount} Attendees
                  </span>
                </div>
              </div>
            )}

            <div className="card-body">
              <div className="card-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} color="var(--accent-green)" />
                  {r.eventDate}
                </span>
                {r.speaker && <span>By {r.speaker}</span>}
              </div>

              <h3 className="card-title">{r.title}</h3>

              <p className="card-desc">{r.summary}</p>

              {/* Outcomes */}
              {r.outcomes && r.outcomes.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Key Outcomes:
                  </div>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {r.outcomes.slice(0, 3).map((outc, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{outc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gallery Thumbnails */}
              {r.gallery && r.gallery.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {r.gallery.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt="Gallery"
                      style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                  ))}
                </div>
              )}

              <div className="card-footer">
                <div style={{ display: 'flex', gap: '10px' }}>
                  {r.driveFolderUrl && (
                    <a
                      href={r.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}
                      title="Google Drive Folder"
                    >
                      <FolderOpen size={13} />
                      <span>Drive</span>
                    </a>
                  )}
                  {r.reportDocUrl && (
                    <a
                      href={r.reportDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-green)' }}
                      title="Documentation Document"
                    >
                      <FileText size={13} />
                      <span>Doc</span>
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openEditModal(r)}
                    className="btn btn-secondary btn-sm btn-icon"
                    title="Edit Report"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id, r.title)}
                    className="btn btn-danger btn-sm btn-icon"
                    title="Delete Report"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <FileText size={44} color="var(--border-medium)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No post-event reports documented yet
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
            Compile official post-event summaries, attendee stats, photo galleries, and takeaways.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Create Event Report</span>
          </button>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingReport ? 'Edit Event Report' : 'Document Post-Event Report'}
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
                {/* Link to existing event */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Link to Event (Optional)</span>
                    <span className="form-label-desc">Autofills details from existing events</span>
                  </label>
                  <select
                    className="form-control"
                    value={eventId}
                    onChange={(e) => handleSelectEvent(e.target.value)}
                  >
                    <option value="">-- Choose an event or create standalone report --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Report Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Hacktoberfest TKMCE - Event Documentation & Impact"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date Conducted</label>
                    <input
                      type="date"
                      className="form-control"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Attendees / Participants</label>
                    <input
                      type="number"
                      className="form-control"
                      value={attendeeCount}
                      onChange={(e) => setAttendeeCount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Speaker / Facilitator</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Yoshua Immanuel / Dr. Aneesh"
                      value={speaker}
                      onChange={(e) => setSpeaker(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Compiled By</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Documentation Head"
                      value={submittedBy}
                      onChange={(e) => setSubmittedBy(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Executive Summary *</label>
                  <textarea
                    required
                    rows={4}
                    className="form-control"
                    placeholder="Describe what occurred, participant engagement, notable activities..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                {/* Key Outcomes */}
                <div className="form-group">
                  <label className="form-label">Key Outcomes & Deliverables</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 50+ GitHub pull requests merged"
                      value={outcomeInput}
                      onChange={(e) => setOutcomeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOutcome();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddOutcome}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {outcomes.map((outc, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span>• {outc}</span>
                        <X
                          size={12}
                          style={{ cursor: 'pointer', color: 'var(--accent-red)' }}
                          onClick={() => handleRemoveOutcome(i)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cover & Gallery */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cover Photo</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Cover image URL"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                      />
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                        <Upload size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          style={{ display: 'none' }}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Gallery Photos ({gallery.length})</span>
                    </label>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', width: '100%' }}>
                      <Image size={14} />
                      <span>Upload Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGalleryUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>

                {/* External links */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Google Drive Folder Link</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={driveFolderUrl}
                      onChange={(e) => setDriveFolderUrl(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Document / PDF Link</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://docs.google.com/document/d/..."
                      value={reportDocUrl}
                      onChange={(e) => setReportDocUrl(e.target.value)}
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
                  disabled={submitting || uploadingImage}
                >
                  {submitting ? 'Saving...' : editingReport ? 'Update Report' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
