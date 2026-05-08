import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Github, Linkedin, Globe, Award, Plus, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, token } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', bio: '', skills: '',
    socialLinks: { github: '', linkedin: '', website: '' }
  });
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', githubLink: '', liveLink: '', techStack: ''
  });

  const userId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    fetchProfile();
    fetchProjects();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const url = isOwnProfile ? '/api/auth/me' : `/api/users/${userId}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProfileUser(data);
        setEditForm({
          name: data.name || '',
          bio: data.bio || '',
          skills: (data.skills || []).join(', '),
          socialLinks: {
            github: data.socialLinks?.github || '',
            linkedin: data.socialLinks?.linkedin || '',
            website: data.socialLinks?.website || '',
          }
        });
      }
    } catch (e) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/projects?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setProjects(await res.json());
    } catch (e) {}
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editForm.name,
          bio: editForm.bio,
          skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
          socialLinks: editForm.socialLinks
        })
      });
      if (res.ok) {
        toast.success('Profile updated!');
        setShowEditModal(false);
        fetchProfile();
      }
    } catch (e) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...projectForm,
          techStack: projectForm.techStack.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        toast.success('Project added!');
        setShowProjectModal(false);
        setProjectForm({ title: '', description: '', githubLink: '', liveLink: '', techStack: '' });
        fetchProjects();
      }
    } catch (e) {
      toast.error('Failed to add project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p._id !== projectId));
        toast.success('Project deleted');
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

  if (isLoading) return <div className="loading">Loading profile...</div>;
  if (!profileUser) return <div className="empty-state"><h3>User not found</h3></div>;

  return (
    <div>
      <div className="profile-header">
        <div className="avatar avatar-lg">
          {profileUser.avatar ? <img src={profileUser.avatar} alt="" /> : getInitial(profileUser.name)}
        </div>
        <div className="profile-info" style={{ flex: 1 }}>
          <div className="flex-between">
            <h1>{profileUser.name}</h1>
            {isOwnProfile && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(true)}>
                <Edit3 size={14} /> Edit Profile
              </button>
            )}
          </div>
          <span className="badge" style={{ marginTop: 4 }}>{profileUser.role}</span>
          {profileUser.bio && <p className="bio" style={{ marginTop: 8 }}>{profileUser.bio}</p>}
          <div className="profile-stats">
            <div className="stat">
              <div className="num">{profileUser.reputation || 0}</div>
              <div className="lbl">Reputation</div>
            </div>
            <div className="stat">
              <div className="num">{profileUser.streak || 0}</div>
              <div className="lbl">Day Streak 🔥</div>
            </div>
            {profileUser.stats && (
              <>
                <div className="stat">
                  <div className="num">{profileUser.stats.notesCount}</div>
                  <div className="lbl">Notes</div>
                </div>
                <div className="stat">
                  <div className="num">{profileUser.stats.questionsCount}</div>
                  <div className="lbl">Questions</div>
                </div>
              </>
            )}
          </div>
          {profileUser.socialLinks && (
            <div className="social-links">
              {profileUser.socialLinks.github && (
                <a href={profileUser.socialLinks.github} target="_blank" rel="noopener noreferrer">
                  <Github size={14} /> GitHub
                </a>
              )}
              {profileUser.socialLinks.linkedin && (
                <a href={profileUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
              {profileUser.socialLinks.website && (
                <a href={profileUser.socialLinks.website} target="_blank" rel="noopener noreferrer">
                  <Globe size={14} /> Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      {profileUser.skills?.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profileUser.skills.map((skill) => (
              <span key={skill} className="badge">{skill}</span>
            ))}
          </div>
        </div>
      )}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Projects</h2>
          {isOwnProfile && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowProjectModal(true)}>
              <Plus size={14} /> Add Project
            </button>
          )}
        </div>
        {projects.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <p>No projects added yet.</p>
          </div>
        ) : (
          <div className="grid-2">
            {projects.map(project => (
              <div key={project._id} className="entry-row">
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <h3 style={{ fontWeight: 600, fontSize: 14 }}>{project.title}</h3>
                  {isOwnProfile && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteProject(project._id)}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{project.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {project.techStack?.map(tech => (
                    <span key={tech} className="badge" style={{ fontSize: 11 }}>{tech}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                      <Github size={12} /> GitHub
                    </a>
                  )}
                  {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                      <ExternalLink size={12} /> Live
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)} role="presentation">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="form-group">
                <label>Name</label>
                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input placeholder="React, Node.js, MongoDB" value={editForm.skills} onChange={e => setEditForm({ ...editForm, skills: e.target.value })} />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input type="url" placeholder="https://github.com/..." value={editForm.socialLinks.github} onChange={e => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, github: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input type="url" placeholder="https://linkedin.com/in/..." value={editForm.socialLinks.linkedin} onChange={e => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, linkedin: e.target.value } })} />
              </div>
              <div className="form-group">
                <label>Website URL</label>
                <input type="url" placeholder="https://yoursite.com" value={editForm.socialLinks.website} onChange={e => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, website: e.target.value } })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
      {showProjectModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)} role="presentation">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Project</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowProjectModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddProject}>
              <div className="form-group">
                <label>Project Title *</label>
                <input required placeholder="e.g. EduNexus Platform" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea required placeholder="What does this project do?" value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tech Stack (comma-separated)</label>
                <input placeholder="React, Node.js, MongoDB" value={projectForm.techStack} onChange={e => setProjectForm({ ...projectForm, techStack: e.target.value })} />
              </div>
              <div className="form-group">
                <label>GitHub Link</label>
                <input type="url" placeholder="https://github.com/..." value={projectForm.githubLink} onChange={e => setProjectForm({ ...projectForm, githubLink: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Live Link</label>
                <input type="url" placeholder="https://myproject.com" value={projectForm.liveLink} onChange={e => setProjectForm({ ...projectForm, liveLink: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Add Project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
