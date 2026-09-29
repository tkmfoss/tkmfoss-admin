import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Mail,
  GraduationCap,
  Globe
} from 'lucide-react';
import type { ExecomMember } from '../types';
import { addExecomMember, updateExecomMember, deleteExecomMember } from '../services/dataService';
import { smartUploadImage } from '../services/cloudinaryService';
import { useToast } from '../context/ToastContext';

interface ExecomManagerProps {
  execom: ExecomMember[];
  searchQuery: string;
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
}

export const ExecomManager: React.FC<ExecomManagerProps> = ({
  execom,
  searchQuery,
  isCreateModalOpen,
  onCloseCreateModal
}) => {
  const { success, error, info } = useToast();

  const [tenureFilter, setTenureFilter] = useState<string>('CURRENT');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ExecomMember | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [tenure, setTenure] = useState('2025-26');
  const [isCurrent, setIsCurrent] = useState(true);
  const [department, setDepartment] = useState('Computer Science');
  const [photo, setPhoto] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<number>(10);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Collect unique tenures dynamically
  const existingTenures = Array.from(new Set(execom.map((m) => m.tenure || '2025-26'))).sort().reverse();

  const openCreateModal = () => {
    setEditingMember(null);
    setName('');
    setRole('');
    setTenure('2025-26');
    setIsCurrent(true);
    setDepartment('Computer Science');
    setPhoto('');
    setGithub('');
    setLinkedin('');
    setEmail('');
    setOrder(execom.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (m: ExecomMember) => {
    setEditingMember(m);
    setName(m.name || '');
    setRole(m.role || '');
    setTenure(m.tenure || '2025-26');
    setIsCurrent(m.isCurrent !== false);
    setDepartment(m.department || '');
    setPhoto(m.photo || '');
    setGithub(m.github || '');
    setLinkedin(m.linkedin || '');
    setEmail(m.email || '');
    setOrder(m.order || 10);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    if (isCreateModalOpen) {
      openCreateModal();
      onCloseCreateModal();
    }
  }, [isCreateModalOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    info('Uploading member avatar...');
    try {
      const res = await smartUploadImage(file);
      setPhoto(res.url);
      success(`Member photo uploaded (${res.service})!`);
    } catch (err: any) {
      error(err.message || 'Avatar upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) {
      error('Name and Role are required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      role,
      tenure,
      isCurrent,
      department,
      photo: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ff66&color=000&size=200`,
      github,
      linkedin,
      email,
      order: Number(order) || 10
    };

    try {
      if (editingMember) {
        await updateExecomMember(editingMember.id, payload);
        success(`Updated execom member "${name}".`);
      } else {
        await addExecomMember(payload);
        success(`Added "${name}" to Execom Directory.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to save member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, memberName: string) => {
    if (window.confirm(`Remove "${memberName}" from Execom directory?`)) {
      try {
        await deleteExecomMember(id);
        success(`Removed "${memberName}".`);
      } catch (err: any) {
        error(err.message || 'Failed to delete member.');
      }
    }
  };

  const filteredMembers = execom.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTenure = true;
    if (tenureFilter === 'CURRENT') {
      matchesTenure = m.isCurrent;
    } else if (tenureFilter === 'PAST') {
      matchesTenure = !m.isCurrent;
    } else if (tenureFilter !== 'ALL') {
      matchesTenure = m.tenure === tenureFilter;
    }

    return matchesSearch && matchesTenure;
  });

  return (
    <div>
      {/* Tenure Tabs */}
      <div className="filter-bar">
        <div className="filter-pills">
          <button
            onClick={() => setTenureFilter('CURRENT')}
            className={`filter-pill ${tenureFilter === 'CURRENT' ? 'active' : ''}`}
          >
            🌟 Current Execom (Active)
          </button>

          <button
            onClick={() => setTenureFilter('PAST')}
            className={`filter-pill ${tenureFilter === 'PAST' ? 'active' : ''}`}
          >
            🏛️ Past Execom (Alumni)
          </button>

          <button
            onClick={() => setTenureFilter('ALL')}
            className={`filter-pill ${tenureFilter === 'ALL' ? 'active' : ''}`}
          >
            All Members ({execom.length})
          </button>

          {existingTenures.map((t) => (
            <button
              key={t}
              onClick={() => setTenureFilter(t)}
              className={`filter-pill ${tenureFilter === t ? 'active' : ''}`}
            >
              Tenure {t}
            </button>
          ))}
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {filteredMembers.map((m) => (
          <div
            key={m.id}
            className="item-card"
            style={{
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            {/* Status indicator badge */}
            <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
              <span className={`badge ${m.isCurrent ? 'badge-upcoming' : 'badge-completed'}`}>
                {m.isCurrent ? 'Current' : 'Alumni'}
              </span>
            </div>

            {/* Avatar photo */}
            <div style={{ position: 'relative', width: '92px', height: '92px', marginBottom: '14px' }}>
              <img
                src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=00ff66&color=000&size=200`}
                alt={m.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${m.isCurrent ? 'var(--accent-green)' : 'var(--border-medium)'}`,
                  boxShadow: m.isCurrent ? '0 0 16px var(--accent-green-glow)' : 'none'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=141822&color=00ff66&size=200`;
                }}
              />
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>{m.name}</h3>

            <div style={{
              fontSize: '0.8125rem',
              color: 'var(--accent-green)',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              marginBottom: '6px'
            }}>
              {m.role}
            </div>

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '14px'
            }}>
              <GraduationCap size={14} />
              <span>{m.department || 'TKMCE'} • {m.tenure}</span>
            </div>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              {m.github && (
                <a
                  href={m.github}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm btn-icon"
                  title="GitHub"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </a>
              )}
              {m.linkedin && (
                <a
                  href={m.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm btn-icon"
                  title="LinkedIn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
              )}
              {m.email && (
                <a
                  href={`mailto:${m.email}`}
                  className="btn btn-secondary btn-sm btn-icon"
                  title="Email"
                >
                  <Mail size={14} />
                </a>
              )}
            </div>

            {/* Footer controls */}
            <div style={{
              width: '100%',
              marginTop: 'auto',
              paddingTop: '14px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <button
                onClick={() => openEditModal(m)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(m.id, m.name)}
                className="btn btn-danger btn-sm btn-icon"
                title="Delete Member"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Users size={44} color="var(--border-medium)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No members found in this group
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
            Add previous or current execom members to recognize leadership and contributors.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Add Execom Member</span>
          </button>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingMember ? 'Edit Execom Member' : 'Add Execom Member'}
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
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Muhammed Rasal"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role / Position *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Chairperson / Web Head"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tenure Period</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2025-26 or 2024-25"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Leadership Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '42px', gap: '10px' }}>
                      <input
                        type="checkbox"
                        id="isCurrCheck"
                        checked={isCurrent}
                        onChange={(e) => setIsCurrent(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-green)' }}
                      />
                      <label htmlFor="isCurrCheck" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                        {isCurrent ? 'Current Execom (Active)' : 'Past Execom (Alumni)'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department / Branch</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Computer Science / ECE"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Display Order Rank</label>
                    <input
                      type="number"
                      className="form-control"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Avatar Photo */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Profile Photo</span>
                    <span className="form-label-desc">Cloudinary / Firebase / Direct URL</span>
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Image URL or upload"
                      value={photo}
                      onChange={(e) => setPhoto(e.target.value)}
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
                </div>

                {/* Social links */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://github.com/username"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">LinkedIn URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="member@foss.tkmce.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                  {submitting ? 'Saving...' : editingMember ? 'Update Member' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
