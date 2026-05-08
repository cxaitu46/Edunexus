import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Plus, Search } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function SocialFeed() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/social${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setPosts(await res.json());
    } catch (e) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newPostContent })
      });
      if (res.ok) {
        const post = await res.json();
        setPosts([post, ...posts]);
        setNewPostContent('');
        toast.success('Post shared!');
      }
    } catch (e) {
      toast.error('Failed to share post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`/api/social/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: updated.likes } : p));
      }
    } catch (e) {
      toast.error('Failed to like');
    }
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`/api/social/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText })
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts(prev => prev.map(p => p._id === postId ? updated : p));
        setCommentText('');
        setActiveCommentId(null);
        toast.success('Comment added!');
      }
    } catch (e) {
      toast.error('Failed to add comment');
    }
  };

  const uid = user?.id || '';
  const isLiked = (post) => post.likes.some(id => id.toString() === uid);
  const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Social Feed</h1>
        <p>Share updates and connect with the student community</p>
      </div>
      <div className="search-bar">
        <Search size={16} style={{ color: '#9ca3af' }} />
        <input
          placeholder="Search posts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchPosts()}
        />
      </div>
      <div className="create-post">
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div className="avatar">{getInitial(user?.name || '')}</div>
          <form onSubmit={handleCreatePost} style={{ flex: 1 }}>
            <textarea
              placeholder="Share something with the community..."
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isPosting || !newPostContent.trim()}>
                <Plus size={14} />
                {isPosting ? 'Sharing...' : 'Share Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {isLoading ? (
        <div className="loading">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post._id} className="post-card">
            <div className="flex-center gap-12">
              <div className="avatar">
                {post.userId.avatar ? <img src={post.userId.avatar} alt="" /> : getInitial(post.userId.name)}
              </div>
              <div>
                <Link to={`/app/profile/${post.userId._id}`} style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>
                  {post.userId.name}
                </Link>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {post.userId.role} • {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <p className="post-content">{post.content}</p>
            <div className="post-actions">
              <button type="button" className={`post-action-btn ${isLiked(post) ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>
                <Heart size={16} fill={isLiked(post) ? '#ef4444' : 'none'} />
                {post.likes.length} Likes
              </button>
              <button type="button" className="post-action-btn" onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)}>
                <MessageCircle size={16} />
                {post.comments.length} Comments
              </button>
            </div>
            {activeCommentId === post._id && (
              <div className="comments-section">
                {post.comments.map(c => (
                  <div key={c._id} className="comment-item">
                    <div className="avatar" style={{ width: 26, height: 26, fontSize: 11 }}>
                      {getInitial(c.userId.name)}
                    </div>
                    <div className="comment-text">
                      <strong style={{ fontSize: 12 }}>{c.userId.name}</strong>
                      <span style={{ marginLeft: 6 }}>{c.content}</span>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    style={{ flex: 1, padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleComment(post._id)}
                  />
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleComment(post._id)}>Send</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
