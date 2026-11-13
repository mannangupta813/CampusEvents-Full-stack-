import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getCurrentUser } from '../services/api';

const AppFeaturesContext = createContext(null);

export function AppFeaturesProvider({ children }) {
  // 1. Dark Mode Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ce_theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ce_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 2. Wishlist / Saved Events State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('ce_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ce_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (event) => {
    if (!event || !event.id) return;
    setWishlist(prev => {
      const exists = prev.some(item => item.id === event.id);
      if (exists) {
        showToast(`Removed "${event.title}" from saved events`, 'info');
        return prev.filter(item => item.id !== event.id);
      } else {
        showToast(`Added "${event.title}" to saved events ❤️`, 'success');
        return [...prev, event];
      }
    });
  };

  const isWishlisted = (eventId) => {
    return wishlist.some(item => item.id === eventId);
  };

  // 3. Global Toast Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 3500) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  // 4. Feedback & Ratings Store
  const [feedbacks, setFeedbacks] = useState(() => {
    try {
      const saved = localStorage.getItem('ce_feedbacks');
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          eventId: 1,
          userName: 'Rhea Sen',
          rating: 5,
          comment: 'Incredible hackathon experience! Mentors were very supportive and challenges were top tier.',
          createdAt: '2026-11-10'
        },
        {
          id: 2,
          eventId: 2,
          userName: 'Vikram Mehta',
          rating: 5,
          comment: 'Pitching before real angel investors was surreal. Best summit on campus!',
          createdAt: '2026-11-08'
        },
        {
          id: 3,
          eventId: 3,
          userName: 'Ananya Roy',
          rating: 4,
          comment: 'Great hands-on workshop on generative AI. Would love a part two.',
          createdAt: '2026-11-05'
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ce_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addFeedback = (eventId, rating, comment) => {
    const user = getCurrentUser();
    const newFeedback = {
      id: Date.now(),
      eventId: Number(eventId),
      userName: user ? user.fullName : 'Verified Student',
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setFeedbacks(prev => [newFeedback, ...prev]);
    showToast('Thank you! Your feedback has been submitted.', 'success');
  };

  const getEventFeedbacks = (eventId) => {
    return feedbacks.filter(f => f.eventId === Number(eventId));
  };

  // 5. Active Club Modal State
  const [activeClub, setActiveClub] = useState(null);

  const openClubModal = (club) => {
    setActiveClub(club);
  };

  const closeClubModal = () => {
    setActiveClub(null);
  };

  // 6. Share Event Helper
  const shareEvent = async (event) => {
    const url = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on Campus Events!`,
          url: url
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    showToast('Event link copied to clipboard! 📋', 'success');
  };

  return (
    <AppFeaturesContext.Provider value={{
      theme,
      toggleTheme,
      wishlist,
      toggleWishlist,
      isWishlisted,
      toast,
      showToast,
      feedbacks,
      addFeedback,
      getEventFeedbacks,
      activeClub,
      openClubModal,
      closeClubModal,
      shareEvent
    }}>
      {children}
    </AppFeaturesContext.Provider>
  );
}

export function useAppFeatures() {
  const context = useContext(AppFeaturesContext);
  if (!context) {
    throw new Error('useAppFeatures must be used within an AppFeaturesProvider');
  }
  return context;
}
