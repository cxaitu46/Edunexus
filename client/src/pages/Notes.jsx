import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Download, Heart, Plus, Star, Trash2, Lock } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';

const SUBJECTS = ['Computer Science', 'Mathematics', 'Physics', 'Economics', 'History', 'Literature', 'Other'];

export default function Notes() {
  const { token, user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '', subject: '', customSubject: '', university: '', description: '', file: null
  });
  const [reviewModal, setReviewModal] = useState({ open: false, noteId: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: '' });

  useEffect(() => {
    fetchNotes();
  }, [subjectFilter]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (subjectFilter) params.append('subject', subjectFilter);
      if (search) params.append('search', search);
      const res = await fetch(`/api/notes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setNotes(await res.json());
    } catch (e) {
      toast.error('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('Please select a file');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('subject', uploadForm.subject === 'Other' ? uploadForm.customSubject : uploadForm.subject);
      formData.append('university', uploadForm.university);
      formData.append('description', uploadForm.description);
      formData.append('file', uploadForm.file);
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        toast.success('Note uploaded! +40 reputation points');
        setShowUploadModal(false);
        setUploadForm({ title: '', subject: '', customSubject: '', university: '', description: '', file: null });
        fetchNotes();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Upload failed');
      }
    } catch (e) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLike = async (noteId) => {
    try {
      const res = await fetch(`/api/notes/${noteId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setNotes(prev => prev.map(n => n._id === noteId ? { ...n, likes: updated.likes } : n));
      }
    } catch (e) {
      toast.error('Failed to like');
    }
  };

  const handleUnlock = async (noteId) => {
    if (!window.confirm('Unlock this note for 10 reputation points?')) return;
    try {
      const res = await fetch(`/api/notes/${noteId}/unlock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Note unlocked!');
        setNotes(prev => prev.map(n => n._id === noteId ? { ...n, isUnlocked: true } : n));
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error('Failed to unlock');
    }
  };

  const handleRate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/notes/${reviewModal.noteId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(reviewForm)
      });
      if (res.ok) {
        toast.success('Review submitted!');
        setReviewModal({ open: false, noteId: '' });
        fetchNotes();
      }
    } catch (e) {
      toast.error('Failed to submit review');
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Note deleted');
        setNotes(prev => prev.filter(n => n._id !== noteId));
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const uid = user?.id || '';
  const isLiked = (note) => note.likes.some(id => id.toString() === uid);
  const isOwner = (note) => note.userId._id?.toString() === uid;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Notes Sharing</h1>
          <p>Upload and discover study notes shared by students</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          <Plus size={16} /> Upload Note
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div className="search-bar" style={{ flex: 1, margin: 0 }}>
          <Search size={16} style={{ color: '#9ca3af' }} />
          <input
            placeholder="Search notes by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchNotes()}
          />
        </div>
        <select
          className="form-group"
          style={{ margin: 0, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {isLoading ? (
        <div className="loading">Loading notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={40} style={{ margin: '0 auto 12px', color: '#d1d5db' }} />
          <h3>No notes found</h3>
          <p>Be the first to upload a note!</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map(note => (
            <div key={note._id} className="note-card">
              <div className="flex-between">
                <span className="note-subject">{note.subject}</span>
                {isOwner(note) && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(note._id)}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <div className="note-title">{note.title}</div>
              {note.description && <p style={{ fontSize: 13, color: '#6b7280' }}>{note.description}</p>}
              <div className="note-meta">
                <span>By {note.userId.name}</span>
                {note.university && <span>• {note.university}</span>}
                <span>⭐ {note.averageRating?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="note-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleLike(note._id)} style={{ color: isLiked(note) ? '#ef4444' : '#6b7280' }}>
                  <Heart size={14} fill={isLiked(note) ? '#ef4444' : 'none'} />
                  {note.likes.length}
                </button>
                {note.isUnlocked ? (
                  <>
                    <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                      <Download size={14} /> View
                    </a>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReviewModal({ open: true, noteId: note._id })}>
                      <Star size={14} /> Rate
                    </button>
                  </>
                ) : (
                  <div className="locked-overlay" style={{ flex: 1 }}>
                    <Lock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Locked —{' '}
                    <button type="button" onClick={() => handleUnlock(note._id)} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 600 }}>
                      Unlock (10 pts)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)} role="presentation">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Note</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Title *</label>
                <input required placeholder="e.g. Data Structures Notes - Unit 2" value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <select required value={uploadForm.subject} onChange={e => setUploadForm({ ...uploadForm, subject: e.target.value })}>
                  <option value="">Select subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {uploadForm.subject === 'Other' && (
                <div className="form-group">
                  <label>Custom Subject *</label>
                  <input required placeholder="Enter subject name" value={uploadForm.customSubject} onChange={e => setUploadForm({ ...uploadForm, customSubject: e.target.value })} />
                </div>
              )}
              <div className="form-group">
                <label>University (optional)</label>
                <input placeholder="Your university name" value={uploadForm.university} onChange={e => setUploadForm({ ...uploadForm, university: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea placeholder="Briefly describe what topics are covered" value={uploadForm.description} onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>File (PDF, DOC, etc.) *</label>
                <input type="file" required accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={e => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isUploading} style={{ width: '100%', justifyContent: 'center' }}>
                {isUploading ? 'Uploading...' : 'Upload Note'}
              </button>
            </form>
          </div>
        </div>
      )}
      {reviewModal.open && (
        <div className="modal-overlay" onClick={() => setReviewModal({ open: false, noteId: '' })} role="presentation">
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rate this Note</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReviewModal({ open: false, noteId: '' })}>✕</button>
            </div>
            <form onSubmit={handleRate}>
              <div className="form-group">
                <label>Rating (1-5)</label>
                <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} ({n})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Review (optional)</label>
                <textarea placeholder="Share your thoughts about this note..." value={reviewForm.review} onChange={e => setReviewForm({ ...reviewForm, review: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Submit Review</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
