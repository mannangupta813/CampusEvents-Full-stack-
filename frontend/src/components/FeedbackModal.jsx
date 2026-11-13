import React, { useState } from 'react';
import { useAppFeatures } from '../context/AppFeaturesContext';
import { Star, X, CheckCircle, MessageSquare } from 'lucide-react';

export default function FeedbackModal({ event, isOpen, onClose }) {
  const { addFeedback } = useAppFeatures();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !event) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addFeedback(event.id, rating, comment.trim());
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment('');
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card feedback-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} className="text-primary" />
            <h3 className="modal-title">Event Feedback & Review</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-body text-center" style={{ padding: '2rem 1rem' }}>
            <CheckCircle size={48} className="text-success" style={{ margin: '0 auto 1rem' }} />
            <h3>Feedback Submitted!</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Thank you for sharing your experience. Your feedback helps organizers improve future campus events.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              How was your experience attending <strong>{event.title}</strong>?
            </p>

            {/* Star Rating Select */}
            <div className="star-rating-group">
              <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Your Overall Rating
              </label>
              <div className="star-buttons">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star size={26} fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'} stroke="#F59E0B" />
                  </button>
                ))}
                <span className="rating-label">
                  {rating === 5 ? 'Exceptional! 🌟' : rating === 4 ? 'Great Experience 👍' : rating === 3 ? 'Good / Average ⚖️' : rating === 2 ? 'Needs Improvement ⚠️' : 'Poor Experience 👎'}
                </span>
              </div>
            </div>

            {/* Comment Input */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="input-label">Written Feedback</label>
              <textarea
                className="input-field"
                rows="4"
                placeholder="Share what you liked most about the speakers, venue, organization, or what could be improved..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!comment.trim()}>
                Submit Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

