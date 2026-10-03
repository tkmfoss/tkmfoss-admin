import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Star,
  GitFork,
  Code2,
  Shield,
  Tag,
  GitBranch
} from 'lucide-react';
import { FossProject, ProjectStatus } from '../types';
import { addProject, updateProject, deleteProject } from '../services/dataService';
import { useToast } from '../context/ToastContext';

interface ProjectsManagerProps {
  projects: FossProject[];
  searchQuery: string;
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  searchQuery,
  isCreateModalOpen,
  onCloseCreateModal
}) => {
  const { success, error } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<FossProject | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [repoName, setRepoName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [license, setLicense] = useState('GPL-3.0');
  const [stars, setStars] = useState<number>(0);
  const [forks, setForks] = useState<number>(0);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingProject(null);
    setName('');
    setRepoName('');
    setDescription('');
    setLanguage('TypeScript');
    setLicense('GPL-3.0');
    setStars(0);
    setForks(0);
    setUrl('');
    setStatus('ACTIVE');
    setTags(['Web', 'FOSS']);
    setTagInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (project: FossProject) => {
    setEditingProject(project);
    setName(project.name || '');
    setRepoName(project.repoName || '');
    setDescription(project.description || '');
    setLanguage(project.language || 'TypeScript');
    setLicense(project.license || 'GPL-3.0');
    setStars(project.stars || 0);
    setForks(project.forks || 0);
    setUrl(project.url || '');
    setStatus(project.status || 'ACTIVE');
    setTags(project.tags || []);
    setTagInput('');
    setIsModalOpen(true);
  };

  // External trigger from header
  React.useEffect(() => {
    if (isCreateModalOpen) {
      openCreateModal();
      onCloseCreateModal();
    }
  }, [isCreateModalOpen]);

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !url) {
      error('Project Name, Description, and URL are required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      repoName: repoName || name,
      description,
      language: language || 'TypeScript',
      license: license || 'GPL-3.0',
      stars: Number(stars) || 0,
      forks: Number(forks) || 0,
      url,
      status,
      tags
    };

    try {
      if (editingProject) {
        await updateProject(editingProject.id, payload);
        success(`Project "${name}" updated successfully.`);
      } else {
        await addProject(payload);
        success(`Project "${name}" added to Open Source Catalog.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, projName: string) => {
    if (window.confirm(`Are you sure you want to delete project "${projName}"?`)) {
      try {
        await deleteProject(id);
        success(`Project "${projName}" deleted.`);
      } catch (err: any) {
        error(err.message || 'Failed to delete project.');
      }
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.repoName?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.language?.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const totalStars = projects.reduce((sum, p) => sum + (p.stars || 0), 0);
  const totalForks = projects.reduce((sum, p) => sum + (p.forks || 0), 0);
  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Stats Banner */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">TOTAL REPOSITORIES</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 255, 102, 0.1)', color: 'var(--accent-green)' }}>
              <FolderGit2 size={18} />
            </div>
          </div>
          <div className="stat-value">{projects.length}</div>
          <div className="stat-subtext">Managed by FOSS Cell</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">ACTIVE PROJECTS</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 255, 102, 0.1)', color: 'var(--accent-green)' }}>
              <GitBranch size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
            {activeCount}
          </div>
          <div className="stat-subtext">Under active development</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">GITHUB STARS</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)' }}>
              <Star size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>
            {totalStars}
          </div>
          <div className="stat-subtext">Community stargazers</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">TOTAL FORKS</span>
            <div className="stat-icon" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)' }}>
              <GitFork size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
            {totalForks}
          </div>
          <div className="stat-subtext">Open-source contributions</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="filter-bar">
        <div className="filter-pills">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '6px', fontFamily: 'var(--font-mono)' }}>STATUS:</span>
          {['ALL', 'ACTIVE', 'MAINTAINED', 'INCUBATING', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
            >
              {st}
            </button>
          ))}
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} />
          <span>ADD NEW PROJECT</span>
        </button>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <FolderGit2 size={36} color="var(--text-muted)" />
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>No Projects Cataloged</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '400px' }}>
            {projects.length === 0
              ? 'Your project catalog is currently empty. Click "Add New Project" to list student repositories, tools, or open-source packages.'
              : 'No projects match your active search and status filter.'}
          </p>
          {projects.length === 0 && (
            <button onClick={openCreateModal} className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Plus size={15} />
              <span>CREATE FIRST PROJECT</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'border-color 0.15s ease'
              }}
              className="project-card"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {project.name}
                    </h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                      {project.repoName || project.name}
                    </div>
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      background:
                        project.status === 'ACTIVE'
                          ? 'rgba(0, 255, 102, 0.1)'
                          : project.status === 'MAINTAINED'
                          ? 'rgba(0, 210, 255, 0.1)'
                          : 'rgba(251, 191, 36, 0.1)',
                      color:
                        project.status === 'ACTIVE'
                          ? 'var(--accent-green)'
                          : project.status === 'MAINTAINED'
                          ? 'var(--accent-cyan)'
                          : 'var(--accent-amber)',
                      border: `1px solid ${
                        project.status === 'ACTIVE'
                          ? 'rgba(0, 255, 102, 0.3)'
                          : project.status === 'MAINTAINED'
                          ? 'rgba(0, 210, 255, 0.3)'
                          : 'rgba(251, 191, 36, 0.3)'
                      }`
                    }}
                  >
                    {project.status}
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {project.description}
                </p>

                {/* Metadata Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Code2 size={13} color="var(--accent-green)" />
                    <span>{project.language}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={13} color="var(--accent-cyan)" />
                    <span>{project.license}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={13} color="var(--accent-amber)" />
                    <span>{project.stars || 0}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <GitFork size={13} />
                    <span>{project.forks || 0}</span>
                  </span>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={12} />
                  <span>VIEW REPO</span>
                </a>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(project)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    <Edit2 size={12} />
                    <span>EDIT</span>
                  </button>
                  <button onClick={() => handleDelete(project.id, project.name)} className="btn btn-danger" style={{ padding: '4px 8px' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FolderGit2 size={18} color="var(--accent-green)" />
                <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editingProject ? 'EDIT PROJECT' : 'ADD NEW REPOSITORY'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-field">
                    <label className="form-label">PROJECT NAME *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. tkmfoss.github.io"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">REPO HANDLE</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. tkmfoss/tkmfoss.github.io"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">REPOSITORY URL *</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://github.com/tkmfoss/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">DESCRIPTION *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Brief architectural summary and purpose of the project..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-field">
                    <label className="form-label">LANGUAGE</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="TypeScript, Python..."
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">LICENSE</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="GPL-3.0, MIT..."
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">STATUS</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="MAINTAINED">MAINTAINED</option>
                      <option value="INCUBATING">INCUBATING</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-field">
                    <label className="form-label">GITHUB STARS</label>
                    <input
                      type="number"
                      className="form-input"
                      min={0}
                      value={stars}
                      onChange={(e) => setStars(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">FORKS</label>
                    <input
                      type="number"
                      className="form-input"
                      min={0}
                      value={forks}
                      onChange={(e) => setForks(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Tag Manager */}
                <div className="form-field">
                  <label className="form-label">TOPIC TAGS</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Web, React, Python..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                    <button type="button" onClick={handleAddTag} className="btn btn-secondary" style={{ padding: '0 14px' }}>
                      <Tag size={14} />
                      <span>ADD</span>
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            background: 'rgba(0, 255, 102, 0.1)',
                            border: '1px solid rgba(0, 255, 102, 0.3)',
                            color: 'var(--accent-green)',
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(idx)}
                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  CANCEL
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'SAVING...' : editingProject ? 'UPDATE PROJECT' : 'PUBLISH PROJECT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
