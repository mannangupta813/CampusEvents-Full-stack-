import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CalendarView({ events = [] }) {
  const [currentDate, setCurrentDate] = useState(() => {
    // Default to the month of the earliest or current event, or today
    if (events.length > 0 && events[0].eventDate) {
      const d = new Date(events[0].eventDate);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Group events by day in this month
  const getEventsForDay = (day) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const targetDateStr = `${year}-${monthStr}-${dayStr}`;

    return events.filter(e => e.eventDate === targetDateStr);
  };

  // Build calendar matrix
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      events: []
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push({
      day,
      isCurrentMonth: true,
      events: getEventsForDay(day)
    });
  }

  // Next month leading days to complete row
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    calendarCells.push({
      day,
      isCurrentMonth: false,
      events: []
    });
  }

  const today = new Date();
  const isToday = (day, isCurrentMonth) => {
    return isCurrentMonth && 
      today.getFullYear() === year && 
      today.getMonth() === month && 
      today.getDate() === day;
  };

  return (
    <div className="calendar-card">
      {/* Calendar Header Controls */}
      <div className="calendar-header">
        <div className="calendar-title-group">
          <CalendarIcon className="text-primary" size={24} />
          <h3 className="calendar-month-title">
            {monthNames[month]} {year}
          </h3>
        </div>
        <div className="calendar-nav-buttons">
          <button onClick={goToToday} className="btn btn-sm btn-outline">
            Today
          </button>
          <button onClick={prevMonth} className="btn-icon-circle" title="Previous Month">
            <ChevronLeft size={18} />
          </button>
          <button onClick={nextMonth} className="btn-icon-circle" title="Next Month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="calendar-grid-weekdays">
        {daysOfWeek.map((dayName, idx) => (
          <div key={idx} className="calendar-weekday-cell">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Day Grid */}
      <div className="calendar-grid-days">
        {calendarCells.map((cell, idx) => (
          <div 
            key={idx} 
            className={`calendar-day-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday(cell.day, cell.isCurrentMonth) ? 'is-today' : ''}`}
          >
            <div className="calendar-day-number">
              <span>{cell.day}</span>
            </div>

            <div className="calendar-events-container">
              {cell.events.map(event => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="calendar-event-chip"
                  title={`${event.title} - ${event.eventTime} at ${event.venue}`}
                >
                  <span className="event-chip-dot"></span>
                  <span className="event-chip-title">{event.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

