import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cloud,
  Database,
  Download,
  Copy,
  Check,
  Save,
  ShieldCheck,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { firebaseConfig } from '../firebase/config';
import { getCloudinaryConfig, saveCloudinaryConfig, uploadToCloudinary } from '../services/cloudinaryService';
import { seedDatabase, getClubSettings, saveClubSettings } from '../services/dataService';
import { FosEvent, ExecomMember, Announcement, PostEventReport, ClubSettings } from '../types';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

interface SettingsManagerProps {
  events: FosEvent[];
  announcements: Announcement[];
  execom: ExecomMember[];
  reports: PostEventReport[];
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  events,
  announcements,
  execom,
  reports
}) => {
  const { success, error, info } = useToast();

  // Cloudinary state
  const [cloudName, setCloudName] = useState('');
  const [uploadPreset, setUploadPreset] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testingCloudinary, setTestingCloudinary] = useState(false);

  // Club details
  const [clubSettings, setClubSettings] = useState<ClubSettings>({
    clubName: 'TKMFOSS',
    tagline: 'TKMCE Free and Open Source Software Cell',
    manifesto: 'Promoting software freedom, open hardware, and digital autonomy since 2012.',
    email: 'foss@tkmce.ac.in',
    github: 'https://github.com/tkmfoss',
    instagram: 'https://instagram.com/tkmfoss',
    discord: 'https://discord.gg/tkmfoss'
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  useEffect(() => {
    const cConfig = getCloudinaryConfig();
    setCloudName(cConfig.cloudName || '');
    setUploadPreset(cConfig.uploadPreset || '');
    setApiKey(cConfig.apiKey || '');

    getClubSettings().then((s) => {
      if (s) setClubSettings(s);
    });
  }, []);

  const handleSaveCloudinary = () => {
    saveCloudinaryConfig({ cloudName, uploadPreset, apiKey });
    success('Cloudinary configurations saved successfully!');
  };

  const handleTestCloudinary = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cloudName || !uploadPreset) {
      error('Please enter Cloud Name and Upload Preset first.');
      return;
    }

    setTestingCloudinary(true);
    info('Testing Cloudinary upload...');
    try {
      saveCloudinaryConfig({ cloudName, uploadPreset, apiKey });
      const url = await uploadToCloudinary(file);
      confetti({ particleCount: 70, spread: 50 });
      success(`Cloudinary connected! Image uploaded to: ${url.substring(0, 35)}...`);
    } catch (err: any) {
      error(err.message || 'Cloudinary test upload failed.');
    } finally {
      setTestingCloudinary(false);
    }
  };

  const handleSaveClubSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveClubSettings({
        ...clubSettings,
        cloudinaryCloudName: cloudName,
        cloudinaryUploadPreset: uploadPreset
      });
      success('Club profile and preferences updated.');
    } catch (err: any) {
      error(err.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSeed = async () => {
    if (window.confirm('This will seed the initial TKMFOSS historical records into Firebase Firestore. Proceed?')) {
      setSeeding(true);
      try {
        const res = await seedDatabase();
        confetti({ particleCount: 100, spread: 70 });
        success(`Successfully populated ${res.count} records in Firebase!`);
      } catch (err: any) {
        error(err.message || 'Seed failed.');
      } finally {
        setSeeding(false);
      }
    }
  };

  const handleCopyJson = (type: 'events' | 'execom' | 'all') => {
    let content = '';
    if (type === 'events') {
      content = JSON.stringify(events, null, 2);
    } else if (type === 'execom') {
      content = JSON.stringify(execom, null, 2);
    } else {
      content = JSON.stringify({ events, announcements, execom, reports, settings: clubSettings }, null, 2);
    }

    navigator.clipboard.writeText(content);
    setCopiedType(type);
    success(`Copied ${type.toUpperCase()} JSON to clipboard!`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadBackup = () => {
    const data = {
      backupDate: new Date().toISOString(),
      events,
      announcements,
      execom,
      reports,
      settings: clubSettings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tkmfoss-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Backup downloaded.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Cloudinary Configuration Section */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 210, 255, 0.15)',
            color: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cloud size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Cloudinary Media Integration</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Configure Cloudinary for high-performance CDN image uploads and transformations.
            </p>
          </div>
        </div>

        <div style={{
          padding: '14px 18px',
          background: 'rgba(0, 210, 255, 0.05)',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          fontSize: '0.8rem',
          color: '#bae6fd',
          display: 'flex',
          gap: '10px'
        }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            Provide your <strong>Cloud Name</strong> and an <strong>Unsigned Upload Preset</strong> from your Cloudinary console (Settings &gt; Upload &gt; Add upload preset &gt; Signing Mode: Unsigned). You can update these anytime.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Cloud Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. tkmfoss-media"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Preset (Unsigned)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. foss_events_preset"
              value={uploadPreset}
              onChange={(e) => setUploadPreset(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">API Key (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Cloudinary API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSaveCloudinary}
            className="btn btn-primary btn-sm"
          >
            <Save size={14} />
            <span>Save Cloudinary Settings</span>
          </button>

          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
            <span>{testingCloudinary ? 'Testing Upload...' : 'Test Upload with Photo'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleTestCloudinary}
              style={{ display: 'none' }}
              disabled={testingCloudinary}
            />
          </label>
        </div>
      </div>

      {/* Firebase Infrastructure Status */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 255, 102, 0.15)',
            color: 'var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Firebase Configuration</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Active credentials powering Firestore Realtime Database & Firebase Auth.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          marginBottom: '20px'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Project ID: </span>
            <span style={{ color: 'var(--accent-green)' }}>{firebaseConfig.projectId}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Auth Domain: </span>
            <span style={{ color: 'var(--text-primary)' }}>{firebaseConfig.authDomain}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Storage Bucket: </span>
            <span style={{ color: 'var(--text-primary)' }}>{firebaseConfig.storageBucket}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>App ID: </span>
            <span style={{ color: 'var(--text-primary)' }}>{firebaseConfig.appId.substring(0, 16)}...</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn btn-secondary btn-sm"
          >
            <Sparkles size={14} color="var(--accent-green)" />
            <span>{seeding ? 'Seeding Firestore...' : 'Seed Initial TKMFOSS Data'}</span>
          </button>
        </div>
      </div>

      {/* Website Sync & Data Export */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(251, 191, 36, 0.15)',
            color: 'var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Download size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Data Export & Sync to Website</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Export collections directly for use in the public website (<code style={{ fontFamily: 'var(--font-mono)' }}>tkmfoss.github.io</code>).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleCopyJson('events')}
            className="btn btn-secondary btn-sm"
          >
            {copiedType === 'events' ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
            <span>Copy Events JSON ({events.length})</span>
          </button>

          <button
            onClick={() => handleCopyJson('execom')}
            className="btn btn-secondary btn-sm"
          >
            {copiedType === 'execom' ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
            <span>Copy Execom JSON ({execom.length})</span>
          </button>

          <button
            onClick={handleDownloadBackup}
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} />
            <span>Download Complete JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Club Profile & Social Details */}
      <form onSubmit={handleSaveClubSettings}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Organization Details</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Basic metadata and communication channels for TKMFOSS.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Club Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={clubSettings.clubName}
                  onChange={(e) => setClubSettings({ ...clubSettings, clubName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input
                  type="text"
                  className="form-control"
                  value={clubSettings.tagline}
                  onChange={(e) => setClubSettings({ ...clubSettings, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Manifesto Excerpt</label>
              <textarea
                rows={2}
                className="form-control"
                value={clubSettings.manifesto}
                onChange={(e) => setClubSettings({ ...clubSettings, manifesto: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={clubSettings.email}
                  onChange={(e) => setClubSettings({ ...clubSettings, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Organization</label>
                <input
                  type="url"
                  className="form-control"
                  value={clubSettings.github}
                  onChange={(e) => setClubSettings({ ...clubSettings, github: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Discord Server</label>
                <input
                  type="url"
                  className="form-control"
                  value={clubSettings.discord}
                  onChange={(e) => setClubSettings({ ...clubSettings, discord: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instagram Handle</label>
                <input
                  type="url"
                  className="form-control"
                  value={clubSettings.instagram}
                  onChange={(e) => setClubSettings({ ...clubSettings, instagram: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={savingSettings}
                className="btn btn-primary btn-sm"
              >
                <Save size={14} />
                <span>{savingSettings ? 'Saving Profile...' : 'Save Organization Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
