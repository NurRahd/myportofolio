import { useEffect, useState, useRef } from 'react';
import { api, imageUrl } from '../lib/api';
import { supabase } from '../lib/supabase';
import './Admin.css';

// ─── Image helper ─────────────────────────────────────────────────────────────
function resolveImg(src) {
  if (!src) return null;
  const url = imageUrl(src);
  if (url) return url;
  try { return new URL(`../assets/${src}`, import.meta.url).href; } catch { return null; }
}

// ─── Reusable small components ─────────────────────────────────────────────────
function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`adm-toast adm-toast--${type}`}>
      {msg}
      <button onClick={onClose}>×</button>
    </div>
  );
}

function ConfirmDialog({ msg, onConfirm, onCancel }) {
  return (
    <div className="adm-overlay" onClick={onCancel}>
      <div className="adm-confirm" onClick={(e) => e.stopPropagation()}>
        <p>{msg}</p>
        <div className="adm-confirm-btns">
          <button className="adm-btn adm-btn--danger" onClick={onConfirm}>Delete</button>
          <button className="adm-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ImagePreview({ src, size = 56 }) {
  const url = resolveImg(src);
  if (!url) return <div className="adm-img-placeholder" style={{ width: size, height: size }}>No img</div>;
  return <img src={url} alt="" style={{ width: size, height: size, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }} />;
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login(form.email, form.password);
      onLogin(data.username);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-box">
        <div className="adm-login-logo">Admin Panel</div>
        <p className="adm-login-sub">Portfolio CMS</p>
        <form onSubmit={handleSubmit} className="adm-form">
          <label>Email
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="admin@example.com" required autoFocus />
          </label>
          <label>Password
            <input type="password" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••" required />
          </label>
          {error && <p className="adm-error">{error}</p>}
          <button type="submit" className="adm-btn adm-btn--primary adm-btn--full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Profile section ──────────────────────────────────────────────────────────
function ProfileSection({ showToast }) {
  const [profile, setProfile] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.getProfile().then(setProfile).catch(console.error); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(profile);
      showToast('Profile saved!');
    } catch (err) { showToast(err.message, 'error'); }
    setSaving(false);
  };

  const fields = [
    { key: 'navbar_brand', label: 'Navbar Brand' },
    { key: 'hero_greeting', label: 'Hero Greeting (script label)' },
    { key: 'hero_rotating_words', label: 'Hero Rotating Words (pisah dengan koma)', textarea: true, hint: 'Contoh: Nisa, a Fullstack Dev, an AI Learner, a UI Crafter' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', textarea: true },
    { key: 'about_subtitle', label: 'About Subtitle' },
    { key: 'about_description', label: 'About Description', textarea: true },
    { key: 'footer_copy', label: 'Footer Copyright' },
  ];

  return (
    <div className="adm-section">
      <h2>Profile & Text Settings</h2>
      <div className="adm-form adm-form--grid">
        {fields.map(({ key, label, textarea, hint }) => (
          <label key={key} className={textarea ? 'adm-label--full' : ''}>
            {label}
            {textarea
              ? <textarea rows={3} value={profile[key] || ''} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} />
              : <input value={profile[key] || ''} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} />
            }
            {hint && <small style={{ color: 'var(--a-muted)', marginTop: 3 }}>{hint}</small>}
          </label>
        ))}
      </div>
      <div className="adm-actions">
        <button className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

// ─── Social Links section ─────────────────────────────────────────────────────
function SocialLinksSection({ showToast }) {
  const [links, setLinks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const empty = { platform: '', label: '', value: '', href: '', iconType: 'image', iconName: '', iconImage: '', order: 0 };

  useEffect(() => { api.getSocialLinks().then(setLinks).catch(console.error); }, []);

  const save = async () => {
    try {
      const payload = { ...editing };
      if (iconFile && editing.iconType === 'image') {
        payload.iconImage = await api.uploadFileToStorage(iconFile);
      }
      if (editing.id) {
        const updated = await api.updateSocialLink(editing.id, payload);
        setLinks((l) => l.map((x) => x.id === editing.id ? updated : x));
      } else {
        const created = await api.createSocialLink(payload);
        setLinks((l) => [...l, created]);
      }
      setEditing(null);
      setIconFile(null);
      showToast('Social link saved!');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const del = async (id) => {
    try {
      await api.deleteSocialLink(id);
      setLinks((l) => l.filter((x) => x.id !== id));
      showToast('Deleted!');
    } catch (err) { showToast(err.message, 'error'); }
    setConfirm(null);
  };

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Social Links</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing({ ...empty }); setIconFile(null); }}>+ Add Link</button>
      </div>
      <table className="adm-table">
        <thead><tr><th>Platform</th><th>Label</th><th>Value</th><th>Icon</th><th>Actions</th></tr></thead>
        <tbody>
          {links.map((item) => (
            <tr key={item.id}>
              <td>{item.platform}</td>
              <td>{item.label}</td>
              <td><a href={item.href} target="_blank" rel="noreferrer">{item.value}</a></td>
              <td>{item.iconType === 'lucide' ? `Lucide: ${item.iconName}` : <ImagePreview src={item.iconImage} size={24} />}</td>
              <td className="adm-td-actions">
                <button className="adm-btn adm-btn--sm" onClick={() => { setEditing({ ...item }); setIconFile(null); }}>Edit</button>
                <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setConfirm(item.id)}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="adm-overlay">
          <div className="adm-modal">
            <h3>{editing.id ? 'Edit' : 'New'} Social Link</h3>
            <div className="adm-form adm-form--grid">
              {[['platform','Platform'],['label','Label'],['value','Display Value'],['href','URL'],['order','Order']].map(([k,l]) => (
                <label key={k}>{l}<input value={editing[k] || ''} onChange={(e) => setEditing((x) => ({ ...x, [k]: e.target.value }))} /></label>
              ))}
              <label>Icon Type
                <select value={editing.iconType} onChange={(e) => setEditing((x) => ({ ...x, iconType: e.target.value }))}>
                  <option value="image">Upload gambar</option>
                  <option value="lucide">Lucide icon</option>
                </select>
              </label>
              {editing.iconType === 'lucide'
                ? <label>Lucide Icon Name<input value={editing.iconName || ''} onChange={(e) => setEditing((x) => ({ ...x, iconName: e.target.value }))} placeholder="Mail, Github..." /></label>
                : <label>Upload Icon (PNG/SVG/WebP)
                    <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files[0])} />
                    {editing.iconImage && !iconFile && (
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--a-muted)' }}>Icon saat ini:</span>
                        <ImagePreview src={editing.iconImage} size={32} />
                      </div>
                    )}
                  </label>
              }
            </div>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--primary" onClick={save}>Save</button>
              <button className="adm-btn" onClick={() => { setEditing(null); setIconFile(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {confirm && <ConfirmDialog msg="Delete this link?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Skills section ───────────────────────────────────────────────────────────
function SkillsSection({ showToast }) {
  const [groups, setGroups] = useState([]);
  const [editGroup, setEditGroup] = useState(null);
  const [editSkill, setEditSkill] = useState(null);
  const [skillIconFile, setSkillIconFile] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const reload = () => api.getSkills().then(setGroups).catch(console.error);
  useEffect(() => { reload(); }, []);

  const saveGroup = async () => {
    try {
      if (editGroup.id) {
        await api.updateSkillGroup(editGroup.id, { title: editGroup.title, order: editGroup.order });
      } else {
        await api.createSkillGroup({ title: editGroup.title, order: editGroup.order || 0 });
      }
      reload(); setEditGroup(null); showToast('Group saved!');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const delGroup = async (id) => {
    try { await api.deleteSkillGroup(id); reload(); showToast('Deleted!'); } catch (err) { showToast(err.message, 'error'); }
    setConfirm(null);
  };

  const saveSkill = async () => {
    try {
      const fd = new FormData();
      fd.append('name', editSkill.name);
      fd.append('iconType', editSkill.iconType || 'lucide');
      fd.append('order', editSkill.order || 0);
      if (editSkill.iconType === 'lucide') {
        fd.append('iconName', editSkill.iconName || '');
      }
      if (!editSkill.id) {
        fd.append('skillGroupId', editSkill.skillGroupId);
      }
      if (skillIconFile) fd.append('iconImage', skillIconFile);

      if (editSkill.id) {
        await api.updateSkill(editSkill.id, fd);
      } else {
        await api.createSkill(fd);
      }
      reload(); setEditSkill(null); setSkillIconFile(null); showToast('Skill saved!');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const delSkill = async (id) => {
    try { await api.deleteSkill(id); reload(); showToast('Deleted!'); } catch (err) { showToast(err.message, 'error'); }
    setConfirm(null);
  };

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Skills</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => setEditGroup({ title: '', order: groups.length })}>+ Add Group</button>
      </div>
      {groups.map((group) => (
        <div className="adm-skill-group" key={group.id}>
          <div className="adm-skill-group-header">
            <strong>{group.title}</strong>
            <div>
              <button className="adm-btn adm-btn--sm" onClick={() => { setEditSkill({ name: '', iconType: 'lucide', iconName: 'Box', order: 0, skillGroupId: group.id }); setSkillIconFile(null); }}>+ Skill</button>
              <button className="adm-btn adm-btn--sm" onClick={() => setEditGroup({ ...group })}>Edit</button>
              <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setConfirm({ type: 'group', id: group.id })}>Del</button>
            </div>
          </div>
          <div className="adm-skill-chips">
            {group.skills.map((skill) => (
              <span className="adm-skill-chip" key={skill.id}>
                {skill.iconType === 'image' && skill.iconImage
                  ? <ImagePreview src={skill.iconImage} size={16} />
                  : <em>({skill.iconName || '—'})</em>
                }
                {skill.name}
                <button onClick={() => { setEditSkill({ ...skill, skillGroupId: group.id }); setSkillIconFile(null); }}>✎</button>
                <button onClick={() => setConfirm({ type: 'skill', id: skill.id })}>✕</button>
              </span>
            ))}
          </div>
        </div>
      ))}

      {editGroup && (
        <div className="adm-overlay">
          <div className="adm-modal">
            <h3>{editGroup.id ? 'Edit' : 'New'} Skill Group</h3>
            <div className="adm-form">
              <label>Title<input value={editGroup.title} onChange={(e) => setEditGroup((g) => ({ ...g, title: e.target.value }))} /></label>
              <label>Order<input type="number" value={editGroup.order || 0} onChange={(e) => setEditGroup((g) => ({ ...g, order: Number(e.target.value) }))} /></label>
            </div>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--primary" onClick={saveGroup}>Save</button>
              <button className="adm-btn" onClick={() => setEditGroup(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {editSkill && (
        <div className="adm-overlay">
          <div className="adm-modal">
            <h3>{editSkill.id ? 'Edit' : 'New'} Skill</h3>
            <div className="adm-form adm-form--grid">
              <label className="adm-label--full">Name
                <input value={editSkill.name} onChange={(e) => setEditSkill((s) => ({ ...s, name: e.target.value }))} />
              </label>
              <label>Order
                <input type="number" value={editSkill.order || 0} onChange={(e) => setEditSkill((s) => ({ ...s, order: Number(e.target.value) }))} />
              </label>
              <label>Icon Type
                <select value={editSkill.iconType || 'lucide'} onChange={(e) => setEditSkill((s) => ({ ...s, iconType: e.target.value }))}>
                  <option value="lucide">Lucide icon</option>
                  <option value="image">Upload gambar</option>
                </select>
              </label>

              {editSkill.iconType === 'lucide' ? (
                <label className="adm-label--full">Nama Icon Lucide
                  <input value={editSkill.iconName || ''} onChange={(e) => setEditSkill((s) => ({ ...s, iconName: e.target.value }))} placeholder="Code2, Database, Server…" />
                  <small style={{ color: 'var(--a-muted)', marginTop: 4 }}>
                    Lihat daftar: <a href="https://lucide.dev/icons/" target="_blank" rel="noreferrer">lucide.dev/icons</a>
                  </small>
                </label>
              ) : (
                <label className="adm-label--full">Upload Icon (PNG/SVG/WebP)
                  <input type="file" accept="image/*" onChange={(e) => setSkillIconFile(e.target.files[0])} />
                  {editSkill.iconImage && !skillIconFile && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--a-muted)' }}>Icon saat ini:</span>
                      <ImagePreview src={editSkill.iconImage} size={32} />
                    </div>
                  )}
                </label>
              )}
            </div>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--primary" onClick={saveSkill}>Save</button>
              <button className="adm-btn" onClick={() => { setEditSkill(null); setSkillIconFile(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          msg={`Delete this ${confirm.type}?`}
          onConfirm={() => confirm.type === 'group' ? delGroup(confirm.id) : delSkill(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

// ─── Experience section ───────────────────────────────────────────────────────
const emptyExp = { period: '', duration: '', title: '', institution: '', bullets: [''], skills: [''], order: 0 };

function ExperienceSection({ showToast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const reload = () => api.getExperiences().then(setItems).catch(console.error);
  useEffect(() => { reload(); }, []);

  const arrChange = (key, idx, val) => setEditing((e) => {
    const arr = [...e[key]]; arr[idx] = val; return { ...e, [key]: arr };
  });
  const arrAdd = (key) => setEditing((e) => ({ ...e, [key]: [...e[key], ''] }));
  const arrDel = (key, idx) => setEditing((e) => ({ ...e, [key]: e[key].filter((_, i) => i !== idx) }));

  const save = async () => {
    try {
      const fd = new FormData();
      Object.entries(editing).forEach(([k, v]) => {
        if (k === 'id') return;
        fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v ?? '');
      });
      if (logoFile) fd.append('logo', logoFile);
      if (editing.id) {
        const updated = await api.updateExperience(editing.id, fd);
        setItems((i) => i.map((x) => x.id === editing.id ? updated : x));
      } else {
        const created = await api.createExperience(fd);
        setItems((i) => [...i, created]);
      }
      setEditing(null); setLogoFile(null); showToast('Experience saved!');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.deleteExperience(id); setItems((i) => i.filter((x) => x.id !== id)); showToast('Deleted!'); }
    catch (err) { showToast(err.message, 'error'); }
    setConfirm(null);
  };

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Experience</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing({ ...emptyExp }); setLogoFile(null); }}>+ Add</button>
      </div>
      {items.map((item) => (
        <div className="adm-list-item" key={item.id}>
          <ImagePreview src={item.logoImage} />
          <div className="adm-list-item-body">
            <strong>{item.title}</strong>
            <span>{item.period} · {item.duration}</span>
            <span>{item.institution}</span>
          </div>
          <div className="adm-list-item-actions">
            <button className="adm-btn adm-btn--sm" onClick={() => { setEditing({ ...item, bullets: [...item.bullets], skills: [...item.skills] }); setLogoFile(null); }}>Edit</button>
            <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setConfirm(item.id)}>Del</button>
          </div>
        </div>
      ))}

      {editing && (
        <div className="adm-overlay">
          <div className="adm-modal adm-modal--lg">
            <h3>{editing.id ? 'Edit' : 'New'} Experience</h3>
            <div className="adm-form adm-form--grid">
              <label>Period<input value={editing.period} onChange={(e) => setEditing((x) => ({ ...x, period: e.target.value }))} /></label>
              <label>Duration<input value={editing.duration} onChange={(e) => setEditing((x) => ({ ...x, duration: e.target.value }))} /></label>
              <label className="adm-label--full">Title<input value={editing.title} onChange={(e) => setEditing((x) => ({ ...x, title: e.target.value }))} /></label>
              <label className="adm-label--full">Institution<input value={editing.institution} onChange={(e) => setEditing((x) => ({ ...x, institution: e.target.value }))} /></label>
              <label>Order<input type="number" value={editing.order || 0} onChange={(e) => setEditing((x) => ({ ...x, order: Number(e.target.value) }))} /></label>
              <label>Logo Image<input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} /></label>
            </div>
            <label className="adm-array-label">Bullet Points
              {editing.bullets.map((b, i) => (
                <div className="adm-array-row" key={i}>
                  <input value={b} onChange={(e) => arrChange('bullets', i, e.target.value)} />
                  <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => arrDel('bullets', i)}>✕</button>
                </div>
              ))}
              <button type="button" className="adm-btn adm-btn--sm" onClick={() => arrAdd('bullets')}>+ Add bullet</button>
            </label>
            <label className="adm-array-label">Skills (comma tags)
              {editing.skills.map((s, i) => (
                <div className="adm-array-row" key={i}>
                  <input value={s} onChange={(e) => arrChange('skills', i, e.target.value)} />
                  <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => arrDel('skills', i)}>✕</button>
                </div>
              ))}
              <button type="button" className="adm-btn adm-btn--sm" onClick={() => arrAdd('skills')}>+ Add skill</button>
            </label>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--primary" onClick={save}>Save</button>
              <button className="adm-btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {confirm && <ConfirmDialog msg="Delete this experience?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Education section ────────────────────────────────────────────────────────
function EducationSection({ showToast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const reload = () => api.getEducation().then(setItems).catch(console.error);
  useEffect(() => { reload(); }, []);

  const save = async () => {
    try {
      const fd = new FormData();
      ['school', 'degree', 'period', 'score', 'order'].forEach((k) => fd.append(k, editing[k] ?? ''));
      if (logoFile) fd.append('logo', logoFile);
      if (editing.id) {
        const updated = await api.updateEducation(editing.id, fd);
        setItems((i) => i.map((x) => x.id === editing.id ? updated : x));
      } else {
        const created = await api.createEducation(fd);
        setItems((i) => [...i, created]);
      }
      setEditing(null); setLogoFile(null); showToast('Education saved!');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.deleteEducation(id); setItems((i) => i.filter((x) => x.id !== id)); showToast('Deleted!'); }
    catch (err) { showToast(err.message, 'error'); }
    setConfirm(null);
  };

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Education</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing({ school: '', degree: '', period: '', score: '', order: 0 }); setLogoFile(null); }}>+ Add</button>
      </div>
      {items.map((item) => (
        <div className="adm-list-item" key={item.id}>
          <ImagePreview src={item.logoImage} />
          <div className="adm-list-item-body">
            <strong>{item.school}</strong>
            <span>{item.degree}</span>
            <span>{item.period} | {item.score}</span>
          </div>
          <div className="adm-list-item-actions">
            <button className="adm-btn adm-btn--sm" onClick={() => { setEditing({ ...item }); setLogoFile(null); }}>Edit</button>
            <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setConfirm(item.id)}>Del</button>
          </div>
        </div>
      ))}

      {editing && (
        <div className="adm-overlay">
          <div className="adm-modal">
            <h3>{editing.id ? 'Edit' : 'New'} Education</h3>
            <div className="adm-form adm-form--grid">
              <label className="adm-label--full">School / University<input value={editing.school} onChange={(e) => setEditing((x) => ({ ...x, school: e.target.value }))} /></label>
              <label>Degree / Program<input value={editing.degree} onChange={(e) => setEditing((x) => ({ ...x, degree: e.target.value }))} /></label>
              <label>Period<input value={editing.period} onChange={(e) => setEditing((x) => ({ ...x, period: e.target.value }))} /></label>
              <label>Score / GPA<input value={editing.score} onChange={(e) => setEditing((x) => ({ ...x, score: e.target.value }))} /></label>
              <label>Order<input type="number" value={editing.order || 0} onChange={(e) => setEditing((x) => ({ ...x, order: Number(e.target.value) }))} /></label>
              <label>Logo Image<input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} /></label>
            </div>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--primary" onClick={save}>Save</button>
              <button className="adm-btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {confirm && <ConfirmDialog msg="Delete this education?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Certificates section ─────────────────────────────────────────────────────
function CertificatesSection({ showToast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const reload = () => api.getCertificates().then(setItems).catch(console.error);
  useEffect(() => { reload(); }, []);

  const save = async () => {
    try {
      const fd = new FormData();
      ['name', 'issuer', 'certificateId', 'issued', 'expires', 'file', 'imagePos', 'imageFit', 'imageZoom', 'order'].forEach((k) => fd.append(k, editing[k] ?? ''));
      if (imgFile) fd.append('image', imgFile);
      if (editing.id) {
        const updated = await api.updateCertificate(editing.id, fd);
        setItems((i) => i.map((x) => x.id === editing.id ? updated : x));
      } else {
        const created = await api.createCertificate(fd);
        setItems((i) => [...i, created]);
      }
      setEditing(null); setImgFile(null); showToast('Certificate saved!');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.deleteCertificate(id); setItems((i) => i.filter((x) => x.id !== id)); showToast('Deleted!'); }
    catch (err) { showToast(err.message, 'error'); }
    setConfirm(null);
  };

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Certificates</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing({ name: '', issuer: '', certificateId: '', issued: '', expires: '', file: '', imagePos: '50% 50%', imageFit: 'cover', imageZoom: 1, order: 0 }); setImgFile(null); }}>+ Add</button>
      </div>
      <div className="adm-card-grid">
        {items.map((item) => (
          <div className="adm-cert-card" key={item.id}>
            <ImagePreview src={item.image} size={72} />
            <div className="adm-list-item-body">
              <strong>{item.name}</strong>
              <span>{item.issuer}</span>
              <span>{item.issued}</span>
            </div>
            <div className="adm-list-item-actions">
              <button className="adm-btn adm-btn--sm" onClick={() => { setEditing({ ...item }); setImgFile(null); }}>Edit</button>
              <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setConfirm(item.id)}>Del</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="adm-overlay">
          <div className="adm-modal adm-modal--lg">
            <h3>{editing.id ? 'Edit' : 'New'} Certificate</h3>
            <div className="adm-form adm-form--grid">
              <label className="adm-label--full">Name<input value={editing.name} onChange={(e) => setEditing((x) => ({ ...x, name: e.target.value }))} /></label>
              <label>Issuer<input value={editing.issuer} onChange={(e) => setEditing((x) => ({ ...x, issuer: e.target.value }))} /></label>
              <label>Certificate ID<input value={editing.certificateId} onChange={(e) => setEditing((x) => ({ ...x, certificateId: e.target.value }))} /></label>
              <label>Issued (text)<input value={editing.issued} onChange={(e) => setEditing((x) => ({ ...x, issued: e.target.value }))} placeholder="Issued: 2025" /></label>
              <label>Expires (text)<input value={editing.expires} onChange={(e) => setEditing((x) => ({ ...x, expires: e.target.value }))} placeholder="Expires: 2028" /></label>
              <label className="adm-label--full">Certificate URL<input value={editing.file || ''} onChange={(e) => setEditing((x) => ({ ...x, file: e.target.value }))} placeholder="https://…" /></label>
              <label>Image Pos (CSS)<input value={editing.imagePos} onChange={(e) => setEditing((x) => ({ ...x, imagePos: e.target.value }))} placeholder="50% 50%" /></label>
              <label>Image Fit
                <select value={editing.imageFit} onChange={(e) => setEditing((x) => ({ ...x, imageFit: e.target.value }))}>
                  <option value="cover">cover</option>
                  <option value="contain">contain</option>
                </select>
              </label>
              <label>Image Zoom<input type="number" step="0.05" value={editing.imageZoom} onChange={(e) => setEditing((x) => ({ ...x, imageZoom: e.target.value }))} /></label>
              <label>Order<input type="number" value={editing.order || 0} onChange={(e) => setEditing((x) => ({ ...x, order: Number(e.target.value) }))} /></label>
              <label>Certificate Image<input type="file" accept="image/*" onChange={(e) => setImgFile(e.target.files[0])} /></label>
            </div>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--primary" onClick={save}>Save</button>
              <button className="adm-btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {confirm && <ConfirmDialog msg="Delete this certificate?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Activities section ───────────────────────────────────────────────────────
function ActivitiesSection({ showToast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [imgFiles, setImgFiles] = useState([]);
  const [confirm, setConfirm] = useState(null);

  const reload = () => api.getActivities().then(setItems).catch(console.error);
  useEffect(() => { reload(); }, []);

  const arrChange = (key, idx, val) => setEditing((e) => { const arr = [...e[key]]; arr[idx] = val; return { ...e, [key]: arr }; });
  const arrAdd = (key) => setEditing((e) => ({ ...e, [key]: [...e[key], ''] }));
  const arrDel = (key, idx) => setEditing((e) => ({ ...e, [key]: e[key].filter((_, i) => i !== idx) }));

  const save = async () => {
    try {
      const fd = new FormData();
      ['title', 'date', 'description', 'longDesc', 'order'].forEach((k) => fd.append(k, editing[k] ?? ''));
      fd.append('details', JSON.stringify(editing.details));
      fd.append('tags', JSON.stringify(editing.tags));
      if (editing.id) {
        fd.append('keepImages', JSON.stringify((editing.images || []).map((img) => img.id)));
      }
      imgFiles.forEach((f) => fd.append('images', f));
      if (editing.id) {
        const updated = await api.updateActivity(editing.id, fd);
        setItems((i) => i.map((x) => x.id === editing.id ? updated : x));
      } else {
        const created = await api.createActivity(fd);
        setItems((i) => [...i, created]);
      }
      setEditing(null); setImgFiles([]); showToast('Activity saved!');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.deleteActivity(id); setItems((i) => i.filter((x) => x.id !== id)); showToast('Deleted!'); }
    catch (err) { showToast(err.message, 'error'); }
    setConfirm(null);
  };

  const removeExistingImg = (imgId) => setEditing((e) => ({ ...e, images: e.images.filter((img) => img.id !== imgId) }));

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Activities</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing({ title: '', date: '', description: '', longDesc: '', details: [''], tags: [''], order: 0, images: [] }); setImgFiles([]); }}>+ Add</button>
      </div>
      {items.map((item) => (
        <div className="adm-list-item" key={item.id}>
          {item.images[0] && <ImagePreview src={item.images[0].src} />}
          <div className="adm-list-item-body">
            <strong>{item.title}</strong>
            <span>{item.date}</span>
            <span>{item.tags?.join(', ')}</span>
          </div>
          <div className="adm-list-item-actions">
            <button className="adm-btn adm-btn--sm" onClick={() => { setEditing({ ...item, details: [...item.details], tags: [...item.tags], images: [...item.images] }); setImgFiles([]); }}>Edit</button>
            <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setConfirm(item.id)}>Del</button>
          </div>
        </div>
      ))}

      {editing && (
        <div className="adm-overlay">
          <div className="adm-modal adm-modal--lg">
            <h3>{editing.id ? 'Edit' : 'New'} Activity</h3>
            <div className="adm-form adm-form--grid">
              <label className="adm-label--full">Title<input value={editing.title} onChange={(e) => setEditing((x) => ({ ...x, title: e.target.value }))} /></label>
              <label>Date<input value={editing.date} onChange={(e) => setEditing((x) => ({ ...x, date: e.target.value }))} /></label>
              <label>Order<input type="number" value={editing.order || 0} onChange={(e) => setEditing((x) => ({ ...x, order: Number(e.target.value) }))} /></label>
              <label className="adm-label--full">Short Description<textarea rows={2} value={editing.description} onChange={(e) => setEditing((x) => ({ ...x, description: e.target.value }))} /></label>
              <label className="adm-label--full">Long Description<textarea rows={3} value={editing.longDesc} onChange={(e) => setEditing((x) => ({ ...x, longDesc: e.target.value }))} /></label>
            </div>
            <label className="adm-array-label">Details / Key Points
              {editing.details.map((d, i) => (
                <div className="adm-array-row" key={i}>
                  <input value={d} onChange={(e) => arrChange('details', i, e.target.value)} />
                  <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => arrDel('details', i)}>✕</button>
                </div>
              ))}
              <button type="button" className="adm-btn adm-btn--sm" onClick={() => arrAdd('details')}>+ Add</button>
            </label>
            <label className="adm-array-label">Tags
              {editing.tags.map((t, i) => (
                <div className="adm-array-row" key={i}>
                  <input value={t} onChange={(e) => arrChange('tags', i, e.target.value)} />
                  <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => arrDel('tags', i)}>✕</button>
                </div>
              ))}
              <button type="button" className="adm-btn adm-btn--sm" onClick={() => arrAdd('tags')}>+ Add</button>
            </label>
            {editing.images?.length > 0 && (
              <div className="adm-existing-imgs">
                <p><strong>Current Images (click to remove):</strong></p>
                <div className="adm-img-row">
                  {editing.images.map((img) => (
                    <div key={img.id} className="adm-img-thumb" onClick={() => removeExistingImg(img.id)}>
                      <ImagePreview src={img.src} size={64} />
                      <span className="adm-img-remove">✕</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label>Add New Images (multiple)
              <input type="file" accept="image/*" multiple onChange={(e) => setImgFiles([...e.target.files])} />
            </label>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--primary" onClick={save}>Save</button>
              <button className="adm-btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {confirm && <ConfirmDialog msg="Delete this activity?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Projects section ─────────────────────────────────────────────────────────
const CATS = ['Web Development', 'Mobile Development', 'Machine Learning', 'Other'];

function ProjectsSection({ showToast }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [imgFiles, setImgFiles] = useState([]);
  const [confirm, setConfirm] = useState(null);

  const reload = () => api.getProjects().then(setItems).catch(console.error);
  useEffect(() => { reload(); }, []);

  const arrChange = (key, idx, val) => setEditing((e) => { const arr = [...e[key]]; arr[idx] = val; return { ...e, [key]: arr }; });
  const arrAdd = (key) => setEditing((e) => ({ ...e, [key]: [...e[key], ''] }));
  const arrDel = (key, idx) => setEditing((e) => ({ ...e, [key]: e[key].filter((_, i) => i !== idx) }));

  const save = async () => {
    try {
      const fd = new FormData();
      ['title', 'desc', 'longDesc', 'cat', 'pos', 'github', 'demo', 'order'].forEach((k) => fd.append(k, editing[k] ?? ''));
      fd.append('features', JSON.stringify(editing.features));
      fd.append('tags', JSON.stringify(editing.tags));
      fd.append('featured', String(editing.featured || false));
      if (editing.id) {
        fd.append('keepImages', JSON.stringify((editing.images || []).map((img) => img.id)));
      }
      imgFiles.forEach((f) => fd.append('images', f));
      if (editing.id) {
        const updated = await api.updateProject(editing.id, fd);
        setItems((i) => i.map((x) => x.id === editing.id ? updated : x));
      } else {
        const created = await api.createProject(fd);
        setItems((i) => [...i, created]);
      }
      setEditing(null); setImgFiles([]); showToast('Project saved!');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.deleteProject(id); setItems((i) => i.filter((x) => x.id !== id)); showToast('Deleted!'); }
    catch (err) { showToast(err.message, 'error'); }
    setConfirm(null);
  };

  const removeExistingImg = (imgId) => setEditing((e) => ({ ...e, images: e.images.filter((img) => img.id !== imgId) }));

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Projects</h2>
        <button className="adm-btn adm-btn--primary" onClick={() => { setEditing({ title: '', desc: '', longDesc: '', features: [''], tags: [''], cat: 'Web Development', pos: '50% 50%', github: '', demo: '', featured: false, order: 0, images: [] }); setImgFiles([]); }}>+ Add</button>
      </div>
      <table className="adm-table">
        <thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Featured</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td><ImagePreview src={item.images?.[0]?.src || item.image} size={44} /></td>
              <td><strong>{item.title}</strong><br /><small>{item.desc}</small></td>
              <td>{item.cat}</td>
              <td>{item.featured ? '★' : '–'}</td>
              <td className="adm-td-actions">
                <button className="adm-btn adm-btn--sm" onClick={() => { setEditing({ ...item, features: [...item.features], tags: [...item.tags], images: [...(item.images || [])] }); setImgFiles([]); }}>Edit</button>
                <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setConfirm(item.id)}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="adm-overlay">
          <div className="adm-modal adm-modal--lg">
            <h3>{editing.id ? 'Edit' : 'New'} Project</h3>
            <div className="adm-form adm-form--grid">
              <label className="adm-label--full">Title<input value={editing.title} onChange={(e) => setEditing((x) => ({ ...x, title: e.target.value }))} /></label>
              <label className="adm-label--full">Short Description<input value={editing.desc} onChange={(e) => setEditing((x) => ({ ...x, desc: e.target.value }))} /></label>
              <label className="adm-label--full">Long Description<textarea rows={3} value={editing.longDesc} onChange={(e) => setEditing((x) => ({ ...x, longDesc: e.target.value }))} /></label>
              <label>Category
                <select value={editing.cat} onChange={(e) => setEditing((x) => ({ ...x, cat: e.target.value }))}>
                  {CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Image Position (CSS)<input value={editing.pos} onChange={(e) => setEditing((x) => ({ ...x, pos: e.target.value }))} placeholder="50% 50%" /></label>
              <label>GitHub URL<input value={editing.github || ''} onChange={(e) => setEditing((x) => ({ ...x, github: e.target.value }))} /></label>
              <label>Demo URL<input value={editing.demo || ''} onChange={(e) => setEditing((x) => ({ ...x, demo: e.target.value }))} /></label>
              <label>Order<input type="number" value={editing.order || 0} onChange={(e) => setEditing((x) => ({ ...x, order: Number(e.target.value) }))} /></label>
              <label className="adm-checkbox-label">
                <input type="checkbox" checked={editing.featured || false} onChange={(e) => setEditing((x) => ({ ...x, featured: e.target.checked }))} />
                Show in Featured (Home page)
              </label>
            </div>
            <label className="adm-array-label">Features
              {editing.features.map((f, i) => (
                <div className="adm-array-row" key={i}>
                  <input value={f} onChange={(e) => arrChange('features', i, e.target.value)} />
                  <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => arrDel('features', i)}>✕</button>
                </div>
              ))}
              <button type="button" className="adm-btn adm-btn--sm" onClick={() => arrAdd('features')}>+ Add</button>
            </label>
            <label className="adm-array-label">Tags
              {editing.tags.map((t, i) => (
                <div className="adm-array-row" key={i}>
                  <input value={t} onChange={(e) => arrChange('tags', i, e.target.value)} />
                  <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => arrDel('tags', i)}>✕</button>
                </div>
              ))}
              <button type="button" className="adm-btn adm-btn--sm" onClick={() => arrAdd('tags')}>+ Add</button>
            </label>
            {editing.images?.length > 0 && (
              <div className="adm-existing-imgs">
                <p><strong>Gambar saat ini (klik untuk hapus):</strong></p>
                <div className="adm-img-row">
                  {editing.images.map((img) => (
                    <div key={img.id} className="adm-img-thumb" onClick={() => removeExistingImg(img.id)}>
                      <ImagePreview src={img.src} size={64} />
                      <span className="adm-img-remove">✕</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label>Tambah Gambar (bisa lebih dari 1)
              <input type="file" accept="image/*" multiple onChange={(e) => setImgFiles([...e.target.files])} />
              {imgFiles.length > 0 && <small style={{ color: 'var(--a-muted)', marginTop: 4 }}>{imgFiles.length} file dipilih</small>}
            </label>
            <div className="adm-actions">
              <button className="adm-btn adm-btn--primary" onClick={save}>Save</button>
              <button className="adm-btn" onClick={() => { setEditing(null); setImgFiles([]); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {confirm && <ConfirmDialog msg="Delete this project?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Messages section ─────────────────────────────────────────────────────────
function MessagesSection({ showToast }) {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const reload = () => api.getMessages().then(setMessages).catch(console.error);
  useEffect(() => { reload(); }, []);

  const markRead = async (id) => {
    try {
      const updated = await api.markMessageRead(id);
      setMessages((m) => m.map((x) => x.id === id ? updated : x));
    } catch (err) { showToast(err.message, 'error'); }
  };

  const del = async (id) => {
    try { await api.deleteMessage(id); setMessages((m) => m.filter((x) => x.id !== id)); setSelected(null); showToast('Deleted!'); }
    catch (err) { showToast(err.message, 'error'); }
    setConfirm(null);
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Messages {unread > 0 && <span className="adm-badge">{unread} unread</span>}</h2>
      </div>
      {messages.length === 0 && <p className="adm-empty">No messages yet.</p>}
      <div className="adm-messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`adm-msg-item ${msg.read ? '' : 'adm-msg-unread'}`}
            onClick={() => { setSelected(msg); if (!msg.read) markRead(msg.id); }}>
            <div className="adm-msg-head">
              <strong>{msg.name}</strong>
              <span>{msg.email}</span>
              <span className="adm-msg-date">{new Date(msg.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="adm-msg-subject">{msg.subject}</div>
            <div className="adm-msg-preview">{msg.message.slice(0, 100)}…</div>
            {!msg.read && <span className="adm-unread-dot" />}
          </div>
        ))}
      </div>

      {selected && (
        <div className="adm-overlay" onClick={() => setSelected(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Message from {selected.name}</h3>
            <div className="adm-msg-detail">
              <p><strong>Email:</strong> <a href={`mailto:${selected.email}`}>{selected.email}</a></p>
              <p><strong>Subject:</strong> {selected.subject}</p>
              <p><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
              <hr />
              <p className="adm-msg-body">{selected.message}</p>
            </div>
            <div className="adm-actions">
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="adm-btn adm-btn--primary">Reply via Email</a>
              <button className="adm-btn adm-btn--danger" onClick={() => setConfirm(selected.id)}>Delete</button>
              <button className="adm-btn" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {confirm && <ConfirmDialog msg="Delete this message?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── Change Password section ──────────────────────────────────────────────────
function ChangePasswordSection({ showToast }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (form.newPassword !== form.confirm) { showToast('Passwords do not match', 'error'); return; }
    setSaving(true);
    try {
      await api.changePassword(form.currentPassword, form.newPassword);
      showToast('Password changed!');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { showToast(err.message, 'error'); }
    setSaving(false);
  };

  return (
    <div className="adm-section">
      <h2>Change Password</h2>
      <div className="adm-form" style={{ maxWidth: 400 }}>
        <label>Current Password<input type="password" value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} /></label>
        <label>New Password<input type="password" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} /></label>
        <label>Confirm New Password<input type="password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} /></label>
        <div className="adm-actions">
          <button className="adm-btn adm-btn--primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Change Password'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin App ───────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'profile', label: '⚙ Profile' },
  { id: 'social', label: '🔗 Social Links' },
  { id: 'skills', label: '🛠 Skills' },
  { id: 'experience', label: '💼 Experience' },
  { id: 'education', label: '🎓 Education' },
  { id: 'certificates', label: '📜 Certificates' },
  { id: 'activities', label: '🏃 Activities' },
  { id: 'projects', label: '🚀 Projects' },
  { id: 'messages', label: '✉ Messages' },
  { id: 'password', label: '🔒 Password' },
];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // Check existing Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user.email);
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div className="adm-login-wrap"><p style={{ color: '#999' }}>Loading...</p></div>;
  if (!user) return <LoginScreen onLogin={setUser} />;

  const renderSection = () => {
    const props = { showToast };
    switch (activeSection) {
      case 'profile': return <ProfileSection {...props} />;
      case 'social': return <SocialLinksSection {...props} />;
      case 'skills': return <SkillsSection {...props} />;
      case 'experience': return <ExperienceSection {...props} />;
      case 'education': return <EducationSection {...props} />;
      case 'certificates': return <CertificatesSection {...props} />;
      case 'activities': return <ActivitiesSection {...props} />;
      case 'projects': return <ProjectsSection {...props} />;
      case 'messages': return <MessagesSection {...props} />;
      case 'password': return <ChangePasswordSection {...props} />;
      default: return null;
    }
  };

  return (
    <div className="adm-app">
      {/* Sidebar */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'adm-sidebar--open' : ''}`}>
        <div className="adm-sidebar-logo">
          <span>Portfolio CMS</span>
          <button className="adm-sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <nav className="adm-nav">
          {SECTIONS.map((s) => (
            <button key={s.id}
              className={`adm-nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => { setActiveSection(s.id); setSidebarOpen(false); }}>
              {s.label}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <span>Logged in as <strong>{user}</strong></span>
          <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={logout}>Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <div className="adm-main">
        <header className="adm-header">
          <button className="adm-menu-toggle" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
          <h1>{SECTIONS.find((s) => s.id === activeSection)?.label}</h1>
          <a href="/" target="_blank" className="adm-btn adm-btn--sm">↗ View Site</a>
        </header>
        <div className="adm-content">
          {renderSection()}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Mobile overlay */}
      {sidebarOpen && <div className="adm-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
