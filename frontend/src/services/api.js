/**
 * Campus Events: API Client & Resilient Data Service
 * Connects to Spring Boot backend at /api (or http://localhost:8080/api)
 * Automatically attaches JWT Bearer token and includes an offline/demo fallback.
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:8080/api';

// Helper to get auth token
export function getToken() {
  return localStorage.getItem('ce_token');
}

export function setAuthSession(authData) {
  localStorage.setItem('ce_token', authData.token);
  localStorage.setItem('ce_user', JSON.stringify({
    id: authData.id,
    fullName: authData.fullName,
    email: authData.email,
    role: authData.role,
    rollNo: authData.rollNo,
    department: authData.department
  }));
}

export function clearAuthSession() {
  localStorage.removeItem('ce_token');
  localStorage.removeItem('ce_user');
}

export function getCurrentUser() {
  const user = localStorage.getItem('ce_user');
  return user ? JSON.parse(user) : null;
}

// Low-level fetch wrapper with token injection
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, { ...options, headers });
    
    // Check if CSV download
    if (options.responseType === 'blob') {
      if (!res.ok) throw new Error('Download failed');
      return await res.blob();
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || `Request failed with status ${res.status}`);
    }
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    // If backend is unreachable (connection refused), trigger mock fallback seamlessly
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      console.warn(`[Campus Events API] Backend unreachable at ${url}. Operating in local demo mode.`);
      return handleMockFallback(endpoint, options);
    }
    throw err;
  }
}

// API methods
export const api = {
  // Auth
  login: async (email, password) => {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (userData) => {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getProfile: async () => {
    return await request('/auth/me');
  },

  // Events
  getEvents: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.clubId) query.append('clubId', params.clubId);
    if (params.search) query.append('search', params.search);
    if (params.upcomingOnly) query.append('upcomingOnly', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request(`/events${qs}`);
  },

  getEventById: async (id) => {
    return await request(`/events/${id}`);
  },

  createEvent: async (eventData) => {
    return await request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  updateEvent: async (id, eventData) => {
    return await request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  deleteEvent: async (id) => {
    return await request(`/events/${id}`, {
      method: 'DELETE'
    });
  },

  // Registrations
  registerForEvent: async (eventId) => {
    return await request(`/registrations/events/${eventId}`, {
      method: 'POST'
    });
  },

  cancelRegistration: async (regId) => {
    return await request(`/registrations/${regId}`, {
      method: 'DELETE'
    });
  },

  getMyRegistrations: async () => {
    return await request('/registrations/my');
  },

  getEventRegistrations: async (eventId) => {
    return await request(`/registrations/events/${eventId}`);
  },

  getRegistrationByToken: async (token) => {
    return await request(`/registrations/token/${encodeURIComponent(token)}`);
  },

  getRegistrationById: async (id) => {
    return await request(`/registrations/${id}`);
  },

  // Attendance
  checkInAttendance: async (data) => {
    return await request('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getEventAttendance: async (eventId) => {
    return await request(`/attendance/events/${eventId}`);
  },

  exportAttendanceCsv: async (eventId) => {
    return await request(`/attendance/events/${eventId}/export-csv`, {
      responseType: 'blob'
    });
  },

  // Clubs & Categories
  getCategories: async () => {
    return await request('/categories');
  },

  getClubs: async () => {
    return await request('/clubs');
  },

  getMyClubs: async () => {
    return await request('/clubs/my');
  },

  // Stats
  getPublicStats: async () => {
    return await request('/stats/public');
  },

  getOrganizerStats: async (clubId) => {
    const qs = clubId ? `?clubId=${clubId}` : '';
    return await request(`/stats/organizer${qs}`);
  },

  getAdminStats: async () => {
    return await request('/stats/admin');
  },

  // Admin
  getAllUsers: async (role) => {
    const qs = role ? `?role=${role}` : '';
    return await request(`/admin/users${qs}`);
  },

  updateUserRole: async (userId, role) => {
    return await request(`/admin/users/${userId}/role?role=${role}`, {
      method: 'PUT'
    });
  },

  deleteUser: async (userId) => {
    return await request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }
};

// ==========================================================
// RESILIENT OFFLINE/DEMO STORE (Local Fallback)
// Automatically handles requests if Spring Boot is starting up
// ==========================================================
const MOCK_STORAGE_KEY = 'ce_mock_db';

function getMockDb() {
  const existing = localStorage.getItem(MOCK_STORAGE_KEY);
  if (existing) {
    try { return JSON.parse(existing); } catch (e) {}
  }
  
  const initial = {
    users: [
      { id: 1, fullName: 'System Administrator', email: 'admin@campusevents.edu', role: 'ROLE_ADMIN', rollNo: 'ADM-001', department: 'Computer Science' },
      { id: 2, fullName: 'Sarah Jenkins (Tech Lead)', email: 'organizer@campusevents.edu', role: 'ROLE_ORGANIZER', rollNo: 'ORG-101', department: 'Information Technology' },
      { id: 5, fullName: 'Aarav Sharma', email: 'student@campusevents.edu', role: 'ROLE_STUDENT', rollNo: '21BCS1045', department: 'Computer Science & Engineering' }
    ],
    categories: [
      { id: 1, name: 'Hackathons', icon: 'code' },
      { id: 2, name: 'Workshops', icon: 'book-open' },
      { id: 3, name: 'Technical', icon: 'cpu' },
      { id: 4, name: 'Cultural', icon: 'music' },
      { id: 5, name: 'Sports', icon: 'activity' },
      { id: 6, name: 'Entrepreneurship', icon: 'trending-up' },
      { id: 7, name: 'Competitions', icon: 'award' },
      { id: 8, name: 'Seminars', icon: 'users' }
    ],
    clubs: [
      { id: 1, name: 'Coding Club', category: 'Technical', logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&q=80', leadUserId: 2 },
      { id: 2, name: 'E-Cell (Entrepreneurship Cell)', category: 'Entrepreneurship', logoUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&q=80', leadUserId: 2 },
      { id: 3, name: 'AI & Robotics Society', category: 'Technical', logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&q=80', leadUserId: 2 },
      { id: 4, name: 'Campus Sports Board', category: 'Sports', logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&q=80', leadUserId: 1 },
      { id: 5, name: 'Cultural Arts Committee', category: 'Cultural', logoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', leadUserId: 1 }
    ],
    events: [
      {
        id: 1,
        title: 'CodeSprint 2026',
        description: 'Annual 24-hour algorithmic hackathon tackling real-world sustainability and campus automation problems. Cash prizes, swags, and direct interview opportunities with leading technology sponsors.',
        clubId: 1,
        clubName: 'Coding Club',
        categoryId: 1,
        categoryName: 'Hackathons',
        bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&q=80',
        eventDate: '2026-12-15',
        eventTime: '09:00 AM',
        venue: 'Main Tech Complex - Lab 4 & 5',
        maxCapacity: 120,
        registrationDeadline: '2026-12-10',
        eligibility: 'All B.Tech / BCA / MCA students with valid college ID',
        rules: 'Teams of 2 to 4 members. Bring laptops and power adapters.',
        isPublished: true,
        isCancelled: false,
        totalRegistrations: 42,
        availableSeats: 78
      },
      {
        id: 2,
        title: 'E-Summit 2026',
        description: 'Flagship entrepreneurship conclave featuring keynote talks by unicorn startup founders, venture capital masterclasses, student seed funding pitches, and executive networking mixers.',
        clubId: 2,
        clubName: 'E-Cell (Entrepreneurship Cell)',
        categoryId: 6,
        categoryName: 'Entrepreneurship',
        bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&q=80',
        eventDate: '2026-12-18',
        eventTime: '10:00 AM',
        venue: 'Convention Center & Grand Auditorium',
        maxCapacity: 300,
        registrationDeadline: '2026-12-14',
        eligibility: 'Open to all departments and prospective student founders',
        rules: 'Business formal or smart casual attire.',
        isPublished: true,
        isCancelled: false,
        totalRegistrations: 185,
        availableSeats: 115
      },
      {
        id: 3,
        title: 'AI Innovation Workshop',
        description: 'Hands-on deep learning bootcamp covering LLM fine-tuning, retrieval-augmented generation (RAG), and deploying autonomous agent systems on modern cloud platforms.',
        clubId: 3,
        clubName: 'AI & Robotics Society',
        categoryId: 2,
        categoryName: 'Workshops',
        bannerUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&q=80',
        eventDate: '2026-12-22',
        eventTime: '02:00 PM',
        venue: 'Seminar Hall B, Block 3',
        maxCapacity: 80,
        registrationDeadline: '2026-12-20',
        eligibility: 'Students with foundational knowledge of Python',
        rules: 'Individual participation. Jupyter cloud GPU provided.',
        isPublished: true,
        isCancelled: false,
        totalRegistrations: 79,
        availableSeats: 1
      },
      {
        id: 4,
        title: 'Campus Premier League',
        description: 'The most anticipated inter-departmental cricket tournament of the year. Cheer for your branch, experience electrifying matches, food stalls, and music.',
        clubId: 4,
        clubName: 'Campus Sports Board',
        categoryId: 5,
        categoryName: 'Sports',
        bannerUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1000&q=80',
        eventDate: '2026-12-28',
        eventTime: '08:30 AM',
        venue: 'University Central Sports Ground',
        maxCapacity: 500,
        registrationDeadline: '2026-12-25',
        eligibility: 'All enrolled undergraduate and postgraduate students',
        rules: 'Department athletic jersey required.',
        isPublished: true,
        isCancelled: false,
        totalRegistrations: 340,
        availableSeats: 160
      },
      {
        id: 5,
        title: 'Startup Ideathon',
        description: 'Pitch your disruptive product or social impact idea before seasoned venture investors, faculty mentors, and alumni founders. Win up to $5,000 in non-dilutive grant funding.',
        clubId: 2,
        clubName: 'E-Cell (Entrepreneurship Cell)',
        categoryId: 7,
        categoryName: 'Competitions',
        bannerUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1000&q=80',
        eventDate: '2027-01-08',
        eventTime: '10:30 AM',
        venue: 'Incubation Center, 2nd Floor',
        maxCapacity: 60,
        registrationDeadline: '2027-01-05',
        eligibility: 'Open to student teams with an early prototype',
        rules: 'Max 10 slides pitch deck. 5 min pitch + 3 min Q&A.',
        isPublished: true,
        isCancelled: false,
        totalRegistrations: 28,
        availableSeats: 32
      },
      {
        id: 6,
        title: 'Cultural Night 2026',
        description: 'An enchanting evening of live indie fusion bands, classical dance performances, stand-up comedy specials, and celebrity musical headliners.',
        clubId: 5,
        clubName: 'Cultural Arts Committee',
        categoryId: 4,
        categoryName: 'Cultural',
        bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&q=80',
        eventDate: '2027-01-15',
        eventTime: '06:00 PM',
        venue: 'Open Air Theatre (OAT)',
        maxCapacity: 800,
        registrationDeadline: '2027-01-12',
        eligibility: 'All university students, faculty, and alumni',
        rules: 'Digital QR event pass mandatory at gate turnstiles.',
        isPublished: true,
        isCancelled: false,
        totalRegistrations: 620,
        availableSeats: 180
      }
    ],
    registrations: [
      {
        id: 1,
        registrationNumber: 'CE-2026-0001-A1B2C3D4',
        eventId: 1,
        eventTitle: 'CodeSprint 2026',
        eventDate: '2026-12-15',
        eventTime: '09:00 AM',
        venue: 'Main Tech Complex - Lab 4 & 5',
        categoryName: 'Hackathons',
        clubName: 'Coding Club',
        bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&q=80',
        studentId: 5,
        studentName: 'Aarav Sharma',
        studentEmail: 'student@campusevents.edu',
        studentRollNo: '21BCS1045',
        studentDepartment: 'Computer Science & Engineering',
        qrToken: 'CEPASS-CODESPRINT2026-AARAV1045',
        status: 'CONFIRMED',
        isAttended: false,
        registeredAt: '2026-11-01T10:15:00'
      },
      {
        id: 2,
        registrationNumber: 'CE-2026-0002-E5F6G7H8',
        eventId: 2,
        eventTitle: 'E-Summit 2026',
        eventDate: '2026-12-18',
        eventTime: '10:00 AM',
        venue: 'Convention Center & Grand Auditorium',
        categoryName: 'Entrepreneurship',
        clubName: 'E-Cell (Entrepreneurship Cell)',
        bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&q=80',
        studentId: 5,
        studentName: 'Aarav Sharma',
        studentEmail: 'student@campusevents.edu',
        studentRollNo: '21BCS1045',
        studentDepartment: 'Computer Science & Engineering',
        qrToken: 'CEPASS-ESUMMIT2026-AARAV1045',
        status: 'CONFIRMED',
        isAttended: false,
        registeredAt: '2026-11-02T14:30:00'
      },
      {
        id: 3,
        registrationNumber: 'CE-2026-0003-I9J0K1L2',
        eventId: 3,
        eventTitle: 'AI Innovation Workshop',
        eventDate: '2026-12-22',
        eventTime: '02:00 PM',
        venue: 'Seminar Hall B, Block 3',
        categoryName: 'Workshops',
        clubName: 'AI & Robotics Society',
        bannerUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&q=80',
        studentId: 5,
        studentName: 'Aarav Sharma',
        studentEmail: 'student@campusevents.edu',
        studentRollNo: '21BCS1045',
        studentDepartment: 'Computer Science & Engineering',
        qrToken: 'CEPASS-AIWORKSHOP-AARAV1045',
        status: 'ATTENDED',
        isAttended: true,
        checkedInAt: '2026-11-10T14:05:00',
        checkinMethod: 'QR_SCAN',
        registeredAt: '2026-11-03T09:20:00'
      }
    ],
    attendance: [
      {
        id: 1,
        registrationId: 3,
        registrationNumber: 'CE-2026-0003-I9J0K1L2',
        eventId: 3,
        eventTitle: 'AI Innovation Workshop',
        studentId: 5,
        studentName: 'Aarav Sharma',
        studentRollNo: '21BCS1045',
        studentDepartment: 'Computer Science & Engineering',
        checkinMethod: 'QR_SCAN',
        checkedInAt: '2026-11-10T14:05:00',
        checkedInByName: 'Sarah Jenkins (Tech Lead)',
        remarks: 'Checked in on time'
      }
    ]
  };

  saveMockDb(initial);
  return initial;
}

function saveMockDb(db) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
}

// Handler for mock fallback
function handleMockFallback(endpoint, options) {
  const db = getMockDb();
  const user = getCurrentUser() || db.users[2]; // Default to sample student if unauthenticated

  if (endpoint === '/auth/login') {
    const body = JSON.parse(options.body || '{}');
    const found = db.users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
    if (found) {
      const res = { token: 'mock-jwt-token-' + found.id, ...found };
      setAuthSession(res);
      return res;
    }
    // Auto-create test student if unrecognized
    const newUser = { id: Date.now(), fullName: body.email.split('@')[0], email: body.email, role: 'ROLE_STUDENT', rollNo: '23COL00' + Math.floor(Math.random()*900+100), department: 'Engineering' };
    db.users.push(newUser);
    saveMockDb(db);
    const res = { token: 'mock-jwt-token-' + newUser.id, ...newUser };
    setAuthSession(res);
    return res;
  }

  if (endpoint === '/auth/register') {
    const body = JSON.parse(options.body || '{}');
    const newUser = {
      id: Date.now(),
      fullName: body.fullName,
      email: body.email,
      role: body.role ? `ROLE_${body.role.toUpperCase()}` : 'ROLE_STUDENT',
      rollNo: body.rollNo || '23COL' + Math.floor(Math.random()*1000),
      department: body.department || 'General'
    };
    db.users.push(newUser);
    saveMockDb(db);
    const res = { token: 'mock-jwt-token-' + newUser.id, ...newUser };
    setAuthSession(res);
    return res;
  }

  if (endpoint.startsWith('/events')) {
    if (options.method === 'POST') {
      const body = JSON.parse(options.body);
      const cat = db.categories.find(c => c.id === Number(body.categoryId));
      const club = db.clubs.find(c => c.id === Number(body.clubId));
      const newEvent = {
        id: Date.now(),
        ...body,
        categoryName: cat ? cat.name : 'General',
        clubName: club ? club.name : 'College Club',
        totalRegistrations: 0,
        availableSeats: Number(body.maxCapacity),
        isPublished: true,
        isCancelled: false
      };
      db.events.unshift(newEvent);
      saveMockDb(db);
      return newEvent;
    }

    if (options.method === 'PUT') {
      const id = Number(endpoint.split('/')[2]);
      const body = JSON.parse(options.body);
      const idx = db.events.findIndex(e => e.id === id);
      if (idx !== -1) {
        db.events[idx] = { ...db.events[idx], ...body };
        saveMockDb(db);
        return db.events[idx];
      }
    }

    if (options.method === 'DELETE') {
      const id = Number(endpoint.split('/')[2]);
      db.events = db.events.filter(e => e.id !== id);
      saveMockDb(db);
      return { success: true };
    }

    // GET single event
    if (endpoint.split('/').length === 3) {
      const id = Number(endpoint.split('/')[2]);
      const ev = db.events.find(e => e.id === id);
      if (!ev) throw new Error('Event not found');
      const isReg = db.registrations.some(r => r.eventId === id && r.studentId === user.id && r.status !== 'CANCELLED');
      return { ...ev, isRegisteredByCurrentUser: isReg };
    }

    // GET all events with filters
    return db.events.map(ev => {
      const isReg = db.registrations.some(r => r.eventId === ev.id && r.studentId === user.id && r.status !== 'CANCELLED');
      return { ...ev, isRegisteredByCurrentUser: isReg };
    });
  }

  if (endpoint.startsWith('/registrations/events/')) {
    const eventId = Number(endpoint.split('/')[3]);
    const ev = db.events.find(e => e.id === eventId);
    if (!ev) throw new Error('Event not found');

    const alreadyReg = db.registrations.find(r => r.eventId === eventId && r.studentId === user.id && r.status !== 'CANCELLED');
    if (alreadyReg) throw new Error('You are already registered for this event.');

    if (ev.availableSeats <= 0) throw new Error('Event is at maximum capacity.');

    const newReg = {
      id: Date.now(),
      registrationNumber: `CE-2026-${String(ev.id).padStart(4, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      eventId: ev.id,
      eventTitle: ev.title,
      eventDate: ev.eventDate,
      eventTime: ev.eventTime,
      venue: ev.venue,
      categoryName: ev.categoryName,
      clubName: ev.clubName,
      bannerUrl: ev.bannerUrl,
      studentId: user.id,
      studentName: user.fullName,
      studentEmail: user.email,
      studentRollNo: user.rollNo,
      studentDepartment: user.department,
      qrToken: `CEPASS-${ev.id}-${user.id}-${Date.now()}`,
      status: 'CONFIRMED',
      isAttended: false,
      registeredAt: new Date().toISOString()
    };

    db.registrations.unshift(newReg);
    ev.totalRegistrations = (ev.totalRegistrations || 0) + 1;
    ev.availableSeats = Math.max(0, ev.maxCapacity - ev.totalRegistrations);
    saveMockDb(db);
    return newReg;
  }

  if (endpoint === '/registrations/my') {
    return db.registrations.filter(r => r.studentId === user.id);
  }

  if (endpoint.startsWith('/registrations/') && options.method === 'DELETE') {
    const regId = Number(endpoint.split('/')[2]);
    const reg = db.registrations.find(r => r.id === regId);
    if (reg) {
      reg.status = 'CANCELLED';
      saveMockDb(db);
      return reg;
    }
  }

  if (endpoint.startsWith('/registrations/token/')) {
    const token = decodeURIComponent(endpoint.split('/')[3]);
    const reg = db.registrations.find(r => r.qrToken === token);
    if (!reg) throw new Error('Invalid QR Token: No matching registration record found.');
    return reg;
  }

  if (endpoint.startsWith('/registrations/') && endpoint.split('/').length === 3) {
    const id = Number(endpoint.split('/')[2]);
    const reg = db.registrations.find(r => r.id === id);
    if (!reg) throw new Error('Registration not found');
    return reg;
  }

  if (endpoint === '/attendance/check-in') {
    const body = JSON.parse(options.body);
    let reg = null;
    if (body.qrToken) {
      reg = db.registrations.find(r => r.qrToken === body.qrToken.trim());
    } else if (body.registrationId) {
      reg = db.registrations.find(r => r.id === Number(body.registrationId));
    }

    if (!reg) throw new Error('Registration not found for scanned token');
    if (body.eventId && reg.eventId !== Number(body.eventId)) {
      throw new Error(`Pass belongs to another event ('${reg.eventTitle}'), not this event.`);
    }
    if (reg.status === 'CANCELLED') {
      throw new Error('Registration was CANCELLED. Check-in denied.');
    }
    if (reg.isAttended) {
      throw new Error(`Duplicate Check-in Alert: Participant ${reg.studentName} was already checked in!`);
    }

    reg.isAttended = true;
    reg.status = 'ATTENDED';
    reg.checkedInAt = new Date().toISOString();
    reg.checkinMethod = body.checkinMethod || 'QR_SCAN';

    const newAtt = {
      id: Date.now(),
      registrationId: reg.id,
      registrationNumber: reg.registrationNumber,
      eventId: reg.eventId,
      eventTitle: reg.eventTitle,
      studentId: reg.studentId,
      studentName: reg.studentName,
      studentRollNo: reg.studentRollNo,
      studentDepartment: reg.studentDepartment,
      checkinMethod: reg.checkinMethod,
      checkedInAt: reg.checkedInAt,
      checkedInByName: user.fullName || 'Event Organizer',
      remarks: body.remarks || 'Verified'
    };

    db.attendance.unshift(newAtt);
    saveMockDb(db);
    return newAtt;
  }

  if (endpoint.startsWith('/attendance/events/') && !endpoint.includes('export-csv')) {
    const eventId = Number(endpoint.split('/')[3]);
    return db.attendance.filter(a => a.eventId === eventId);
  }

  if (endpoint.includes('export-csv')) {
    const eventId = Number(endpoint.split('/')[3]);
    const list = db.attendance.filter(a => a.eventId === eventId);
    let csv = "S.No,Roll No,Full Name,Email,Department,Registration ID,Checked-In At,Method,Verifier\n";
    list.forEach((a, i) => {
      csv += `${i+1},${a.studentRollNo},"${a.studentName}","user@college.edu","${a.studentDepartment}",${a.registrationNumber},${a.checkedInAt},${a.checkinMethod},"${a.checkedInByName}"\n`;
    });
    return new Blob([csv], { type: 'text/csv' });
  }

  if (endpoint.startsWith('/stats/')) {
    const totalRegs = db.events.reduce((acc, e) => acc + (e.totalRegistrations || 0), 0);
    return {
      totalStudents: db.users.filter(u => u.role === 'ROLE_STUDENT').length,
      totalClubs: db.clubs.length,
      totalEvents: db.events.length,
      totalRegistrations: totalRegs,
      totalAttendance: db.attendance.length,
      upcomingEvents: db.events.filter(e => new Date(e.eventDate) >= new Date()).length,
      activeCategories: db.categories.length,
      registrationsByEvent: db.events.map(e => ({ eventTitle: e.title, registrations: e.totalRegistrations || 0, capacity: e.maxCapacity })),
      attendanceByEvent: db.events.map(e => ({ eventTitle: e.title, attendance: db.attendance.filter(a => a.eventId === e.id).length, registrations: e.totalRegistrations || 0 })),
      monthlyEvents: [
        { month: 'Nov', events: 4, registrations: 150 },
        { month: 'Dec', events: 6, registrations: 320 },
        { month: 'Jan', events: 8, registrations: 490 },
        { month: 'Feb', events: 5, registrations: 210 }
      ]
    };
  }

  if (endpoint === '/categories') return db.categories;
  if (endpoint === '/clubs') return db.clubs;
  if (endpoint === '/clubs/my') return db.clubs.filter(c => c.leadUserId === user.id);
  if (endpoint.startsWith('/admin/users')) return db.users;

  return [];
}
