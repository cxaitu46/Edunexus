import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, ArrowBigUp, ArrowBigDown, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';

export default function QA() {
  const { token, user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [askForm, setAskForm] = useState({ title: '', content: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/qa${query}`);
      if (res.ok) setQuestions(await res.json());
    } catch (e) {
      toast.error('Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: askForm.title,
          content: askForm.content,
          tags: askForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        toast.success('Question posted!');
        setShowAskModal(false);
        setAskForm({ title: '', content: '', tags: '' });
        fetchQuestions();
      }
    } catch (e) {
      toast.error('Failed to post question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    try {
      const res = await fetch(`/api/qa/${selectedQuestion._id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: answerText })
      });
      if (res.ok) {
        const updated = await res.json();
        toast.success('Answer posted! +5 reputation points');
        setAnswerText('');
        setSelectedQuestion(updated);
        setQuestions(prev => prev.map(q => q._id === updated._id ? updated : q));
      }
    } catch (e) {
      toast.error('Failed to post answer');
    }
  };

  const handleQuestionVote = async (questionId, type) => {
    try {
      const res = await fetch(`/api/qa/${questionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        const updated = await res.json();
        setQuestions(prev => prev.map(q => q._id === questionId ? updated : q));
        if (selectedQuestion?._id === questionId) setSelectedQuestion(updated);
      }
    } catch (e) {
      toast.error('Failed to vote');
    }
  };

  const handleAnswerVote = async (questionId, answerId, type) => {
    try {
      const res = await fetch(`/api/qa/${questionId}/answers/${answerId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedQuestion(updated);
        setQuestions(prev => prev.map(q => q._id === questionId ? updated : q));
      }
    } catch (e) {
      toast.error('Failed to vote');
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  const uid = user?.id || '';

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Doubt Solving (Q&amp;A)</h1>
          <p>Ask questions and help fellow students</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowAskModal(true)}>
          <Plus size={16} /> Ask Question
        </button>
      </div>
      <div className="search-bar">
        <Search size={16} style={{ color: '#9ca3af' }} />
        <input
          placeholder="Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchQuestions()}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: selectedQuestion ? '1fr 1.5fr' : '1fr', gap: 16 }}>
        <div>
          {isLoading ? (
            <div className="loading">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={40} style={{ margin: '0 auto 12px', color: '#d1d5db' }} />
              <h3>No questions yet</h3>
              <p>Be the first to ask!</p>
            </div>
          ) : (
            filteredQuestions.map(q => (
              <div
                key={q._id}
                className="question-card"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedQuestion(q)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedQuestion(q)}
                style={{ borderLeft: selectedQuestion?._id === q._id ? '3px solid #4f46e5' : '3px solid transparent' }}
              >
                <div className="question-title">{q.title}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {q.tags.map(tag => (
                    <span key={tag} className="badge">{tag}</span>
                  ))}
                </div>
                <div className="question-meta">
                  <span>▲ {q.upvotes.length - q.downvotes.length} votes</span>
                  <span>💬 {q.answers.length} answers</span>
                  <span>by {q.userId?.name}</span>
                </div>
              </div>
            ))
          )}
        </div>
        {selectedQuestion && (
          <div>
            <div className="question-detail">
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>{selectedQuestion.title}</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedQuestion(null)}>✕</button>
              </div>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 12 }}>{selectedQuestion.content}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {selectedQuestion.tags.map(tag => (
                  <span key={tag} className="badge">{tag}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  className={`vote-btn ${selectedQuestion.upvotes.some(id => id.toString() === uid) ? 'voted' : ''}`}
                  onClick={() => handleQuestionVote(selectedQuestion._id, 'up')}
                >
                  <ArrowBigUp size={16} /> {selectedQuestion.upvotes.length}
                </button>
                <button
                  type="button"
                  className={`vote-btn ${selectedQuestion.downvotes.some(id => id.toString() === uid) ? 'voted' : ''}`}
                  onClick={() => handleQuestionVote(selectedQuestion._id, 'down')}
                >
                  <ArrowBigDown size={16} /> {selectedQuestion.downvotes.length}
                </button>
                <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 'auto' }}>
                  Asked by {selectedQuestion.userId?.name}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{selectedQuestion.answers.length} Answer(s)</h3>
              {selectedQuestion.answers.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: 14 }}>No answers yet. Be the first!</p>
              ) : (
                selectedQuestion.answers.map(ans => (
                  <div key={ans._id} className={`answer-card ${ans.isBest ? 'best' : ''}`}>
                    {ans.isBest && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, marginBottom: 8 }}>
                        <CheckCircle2 size={14} /> Best Answer
                      </div>
                    )}
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 10 }}>{ans.content}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        type="button"
                        className={`vote-btn ${ans.upvotes.some(id => id.toString() === uid) ? 'voted' : ''}`}
                        onClick={() => handleAnswerVote(selectedQuestion._id, ans._id, 'up')}
                      >
                        <ArrowBigUp size={14} /> {ans.upvotes.length}
                      </button>
                      <button
                        type="button"
                        className={`vote-btn ${ans.downvotes.some(id => id.toString() === uid) ? 'voted' : ''}`}
                        onClick={() => handleAnswerVote(selectedQuestion._id, ans._id, 'down')}
                      >
                        <ArrowBigDown size={14} /> {ans.downvotes.length}
                      </button>
                      <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 'auto' }}>by {ans.userId?.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="card" style={{ margin: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Your Answer</h3>
              <form onSubmit={handleAnswer}>
                <textarea
                  className="form-group"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, marginBottom: 10 }}
                  placeholder="Write a helpful answer..."
                  rows={4}
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary">Post Answer (+5 pts)</button>
              </form>
            </div>
          </div>
        )}
      </div>
      {showAskModal && (
        <div className="modal-overlay" onClick={() => setShowAskModal(false)} role="presentation">
          <div className="modal" onClick={e => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h2>Ask a Question</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAskModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAsk}>
              <div className="form-group">
                <label>Question Title *</label>
                <input required placeholder="e.g. How does async/await work in JavaScript?"
                  value={askForm.title}
                  onChange={e => setAskForm({ ...askForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Details *</label>
                <textarea required placeholder="Describe your question in detail..."
                  value={askForm.content}
                  onChange={e => setAskForm({ ...askForm, content: e.target.value })}
                  style={{ minHeight: 100 }} />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input placeholder="e.g. javascript, react, node"
                  value={askForm.tags}
                  onChange={e => setAskForm({ ...askForm, tags: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
                {isSubmitting ? 'Posting...' : 'Post Question'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
