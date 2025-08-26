import React, { useState, useEffect } from 'react';
import {
  FaUser, FaLock, FaBook, FaChalkboardTeacher, FaCheckCircle, FaClock,
  FaFilePdf, FaLink, FaEdit, FaSave, FaTimes, FaCalendarAlt, FaDownload, FaExclamationTriangle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useUser } from '../context/UserContext';

const API_URL = import.meta.env.VITE_API_URL;
const PERPLEXITY_API_URL = `${API_URL}/gemini/chat`;
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

const Profile = () => {
  const { user, token, logout } = useUser();
  const [userData, setUserData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [materials, setMaterials] = useState([]);
const [selectedDay, setSelectedDay] = useState(1);

  // Editing profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', 'code', 'timetable'

  // Chat Assistant States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Code Insights States
  const [codeInput, setCodeInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [codeResponse, setCodeResponse] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  // ---------- Admin Timetable States ----------
  const [allEnrollments, setAllEnrollments] = useState([]);       // from /admin/enrollments
  const [uniqueCourses, setUniqueCourses] = useState([]);         // de-duped courses from allEnrollments
  const [courseUsersMap, setCourseUsersMap] = useState({});       // courseId -> Set(userIds)
  const [scheduleInputs, setScheduleInputs] = useState({});       // {courseId: {date, time, duration}}
  const [generating, setGenerating] = useState(false);
  const [resolvedSchedules, setResolvedSchedules] = useState([]); // final per-day rows
  const [unresolvedConflicts, setUnresolvedConflicts] = useState([]); // any conflicts we couldn't fix
  const [topicsByCourse, setTopicsByCourse] = useState({});       // {courseId: [14 topics]}
  // -------------------------------------------------------------

  // Fetch profile data, enrollments, and enrich progress
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user profile
        const profileRes = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserData(profileData);

          // Initialize edit form with user profile info
          setEditForm({
            name: profileData.name,
            email: profileData.email,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });

          // Fetch enrollments for user (as original)
          const enrollmentsRes = await fetch(`${API_URL}/users/enrollments`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (enrollmentsRes.ok) {
            const enrollmentData = await enrollmentsRes.json();

            // Enrich each enrollment with detailed progress from admin API
            const enrichedEnrollments = await Promise.all(
              (enrollmentData.data || []).map(async (enrollment) => {
                try {
                  const progressRes = await fetch(`${API_URL}/admin/enrollments/${enrollment._id}/progress`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (progressRes.ok) {
                    const progressData = await progressRes.json();
                    return {
                      ...enrollment,
                      progress: progressData.progress ?? enrollment.progress ?? 0,
                      completedDays: progressData.completedDays ?? enrollment.completedDays ?? [],
                    };
                  }
                } catch (_) {
                  // fallback to basic enrollment info if progress fetch fails
                }
                return enrollment;
              })
            );

            setEnrollments(enrichedEnrollments);
          }

          // If admin, fetch all enrollments (for timetable generation)
          if (profileData.role === 'admin') {
            const allRes = await fetch(`${API_URL}/admin/enrollments`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (allRes.ok) {
              const allData = await allRes.json();
              const all = allData?.data || [];
              setAllEnrollments(all);

              // Build unique courses + course->users map
              const courseMap = {};
              const cUsers = {};
              all.forEach((en) => {
                if (en?.course?._id) {
                  courseMap[en.course._id] = en.course;
                  if (!cUsers[en.course._id]) cUsers[en.course._id] = new Set();
                  if (en?.user?._id) cUsers[en.course._id].add(en.user._id);
                }
              });
              setUniqueCourses(Object.values(courseMap));
              // Convert sets to arrays for state serialization safety
              const plainMap = {};
              Object.keys(cUsers).forEach(k => plainMap[k] = Array.from(cUsers[k]));
              setCourseUsersMap(plainMap);
            }
          }

        } else {
          setError('Failed to load user profile');
        }
      } catch (err) {
        setError(err?.message || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfileData();
  }, [token]);

  // Fetch materials for a course and day as original
const fetchCourseMaterials = async (courseId, day) => {
  try {
    // Fetch materials for the specific day
    const res = await fetch(`${API_URL}/courses/${courseId}/materials/${day}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      // Format the data to match the expected structure for the modal
      const materialsArray = [{ day: day, materials: data.data }];
      setMaterials(materialsArray);
    }
  } catch (err) {
    console.error('Failed to fetch course materials:', err);
  }
};
  // Handlers for edit form fields, profile submit, password submit - unchanged
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    if (editError) setEditError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess(false);

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setEditError('Name and email are required');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(editForm.email)) {
      setEditError('Please enter a valid email address');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editForm.name, email: editForm.email })
      });
      if (res.ok) {
        const updatedData = await res.json();
        setUserData(updatedData);
        setEditSuccess(true);
        setIsEditing(false);
        setTimeout(() => setEditSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setEditError(errData.message || 'Failed to update profile');
      }
    } catch {
      setEditError('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess(false);

    if (!editForm.currentPassword || !editForm.newPassword || !editForm.confirmPassword) {
      setEditError('All password fields are required');
      return;
    }
    if (editForm.newPassword !== editForm.confirmPassword) {
      setEditError('New passwords do not match');
      return;
    }
    if (editForm.newPassword.length < 6) {
      setEditError('New password must be at least 6 characters');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: editForm.currentPassword, newPassword: editForm.newPassword })
      });
      if (res.ok) {
        setEditSuccess(true);
        setEditForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setTimeout(() => setEditSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setEditError(errData.message || 'Failed to update password');
      }
    } catch {
      setEditError('Failed to update password');
    }
  };

  // ---------- Gemini helper (existing style) ----------
  const askGeminiWithUserContext = async (message) => {
    try {
      const userContext = `
        User Profile:
        - Name: ${user?.name}
        - Email: ${user?.email}
        - Enrolled Courses: ${(user?.courses || []).map(c => c.title).join(", ") || "None"}
      `;

      const prompt = `
        Context about the user:
        ${userContext}

        User's message:
        ${message}

        Answer based on the context when relevant.
      `;

      const response = await fetch(
        "https://pocketmentor-backend.onrender.com/api/gemini/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      return reply;
    } catch (err) {
      console.error("Error in askGeminiWithUserContext:", err);
      return "Something went wrong.";
    }
  };

  // Generate 14 daily topics per course via Gemini (returns array of strings)
  // ---------- Topic generation ----------
const generateTopicsForCourse = async (title, description) => {
  try {
    const prompt = `
      You are helping plan an online course timetable.
      Course Title: "${title}"
      Description: "${description || 'N/A'}"
      TASK: Return a strict JSON array of exactly 14 short topic strings (no numbering, no extra keys).
      These represent daily class topics for a 2-week schedule.
      EXAMPLE OUTPUT: ["Intro to X","Y Basics",... (total 14 items)]
      IMPORTANT: Output MUST be pure JSON array only.
    `;

    const response = await fetch(`${API_URL}/gemini/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length === 14) return parsed;
    } catch (_) {
      
    }

    return Array.from({ length: 14 }, (_, i) => `Day ${i + 1}: ${title} - Topic`);
  } catch (e) {
    console.error("generateTopicsForCourse error", e);
    return Array.from({ length: 14 }, (_, i) => `Day ${i + 1}: ${title} - Topic`);
  }
};

// ---------- Helpers ----------
const toMinutes = (hhmm) => {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + (m || 0);
};
const minutesToHHMM = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
};
const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

// ---------- Conflict detection ----------
const sessionsConflict = (a, b) => {
  if (a.date !== b.date) return false;

  const aStart = toMinutes(a.startHHMM);
  const aEnd = aStart + a.durationMin;
  const bStart = toMinutes(b.startHHMM);
  const bEnd = bStart + b.durationMin;

  const overlap = Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart)) > 0;
  if (!overlap) return false;

  // Shared users
  const usersA = new Set(courseUsersMap[a.courseId] || []);
  const usersB = new Set(courseUsersMap[b.courseId] || []);
  for (const u of usersA) {
    if (usersB.has(u)) return true;
  }
  return false;
};

// ---------- Auto-resolve by shifting sessions ----------
const autoResolveConflicts = (baseRows) => {
  const dayStartMin = 8 * 60;
  const dayEndMin = 21 * 60;
  const stepMin = 30; // finer granularity
  const rows = baseRows.map((r) => ({ ...r }));
  const byDate = {};
  rows.forEach((r, idx) => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(idx);
  });

  const remainingUnresolved = [];

  Object.keys(byDate).forEach((date) => {
    const idxs = byDate[date];
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < idxs.length; i++) {
        for (let j = i + 1; j < idxs.length; j++) {
          const a = rows[idxs[i]];
          const b = rows[idxs[j]];
          if (sessionsConflict(a, b)) {
            let moved = false;
            const tryShift = (rowIdx) => {
              const row = rows[rowIdx];
              let candidate = toMinutes(row.startHHMM) + stepMin;
              while (candidate + row.durationMin <= dayEndMin) {
                const test = { ...row, startHHMM: minutesToHHMM(candidate) };
                if (!rows.some((other, k) => k !== rowIdx && sessionsConflict(test, other))) {
                  row.startHHMM = minutesToHHMM(candidate);
                  moved = true;
                  break;
                }
                candidate += stepMin;
              }
            };
            const aStart = toMinutes(a.startHHMM);
            const bStart = toMinutes(b.startHHMM);
            if (aStart <= bStart) tryShift(idxs[j]);
            else tryShift(idxs[i]);
            if (!moved) {
              remainingUnresolved.push({ date, a, b });
            } else {
              changed = true;
            }
          }
        }
      }
    }
  });

  return { rows, remainingUnresolved };
};

// ---------- Main function ----------
const handleGenerateTimetable = async () => {
  try {
    setGenerating(true);
    setResolvedSchedules([]);
    setUnresolvedConflicts([]);
    setTopicsByCourse({});

    // Validate
    const missing = uniqueCourses.filter(
      (c) => !(scheduleInputs[c._id]?.date && scheduleInputs[c._id]?.time)
    );
    if (missing.length > 0) {
      alert(`Please set Start Date & Time for: ${missing.map((m) => m.title).join(", ")}`);
      setGenerating(false);
      return;
    }

    // Base schedules
    const baseRows = [];
    uniqueCourses.forEach((c) => {
      const cfg = scheduleInputs[c._id];
      const duration = Number(cfg.duration || 60);
      for (let i = 0; i < 14; i++) {
        const date = addDays(cfg.date, i);
        baseRows.push({
          courseId: c._id,
          courseTitle: c.title,
          date,
          startHHMM: cfg.time,
          durationMin: duration,
          topic: "",
        });
      }
    });

    // Resolve conflicts
    const { rows: resolved, remainingUnresolved } = autoResolveConflicts(baseRows);

    // Build groups (conflict-aware)
    const conflictMap = {};
    uniqueCourses.forEach((c) => (conflictMap[c._id] = new Set()));
    remainingUnresolved.forEach(({ a, b }) => {
      conflictMap[a.courseId].add(b.courseId);
      conflictMap[b.courseId].add(a.courseId);
    });

    const groups = [];
    for (const course of uniqueCourses) {
      let placed = false;
      for (const g of groups) {
        if (!g.some((c) => conflictMap[c._id]?.has(course._id))) {
          g.push(course);
          placed = true;
          break;
        }
      }
      if (!placed) groups.push([course]);
    }
    if (groups.length === 1) {
      const half = Math.ceil(uniqueCourses.length / 2);
      groups.length = 0;
      groups.push(uniqueCourses.slice(0, half));
      groups.push(uniqueCourses.slice(half));
    }

    // Topics
    const topicsMap = {};
    for (const course of uniqueCourses) {
      topicsMap[course._id] = await generateTopicsForCourse(course.title, course.description || "");
    }

    // Build 14-day schedule
    let allSchedules = [];
    const startDateStr = scheduleInputs[uniqueCourses[0]._id].date;
    let currentDate = new Date(startDateStr);

    for (let d = 0; d < 14; d++) {
      const dayDate = new Date(currentDate);
      const isSunday = dayDate.getDay() === 0;

      const todayCourses = isSunday ? uniqueCourses : groups[d % groups.length];
      const daySessions = todayCourses.map((course) => {
        const cfg = scheduleInputs[course._id];
        return {
          courseId: course._id,
          courseTitle: course.title,
          date: dayDate.toISOString().split("T")[0],
          startHHMM: cfg.time,
          durationMin: Number(cfg.duration || 60),
        };
      });

      // resolve conflicts within this day
      const { rows: resolvedDay } = autoResolveConflicts(daySessions);

      resolvedDay.forEach((s) => {
        const topics = topicsMap[s.courseId] || [];
        const topic = topics[d] || `Day ${d + 1}: ${s.courseTitle} - Topic`;
        allSchedules.push({
          ...s,
          topic,
        });
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setResolvedSchedules(allSchedules);
    setUnresolvedConflicts(remainingUnresolved);
    setTopicsByCourse(topicsMap);
  } catch (e) {
    console.error("handleGenerateTimetable error", e);
    alert("Failed to generate timetable.");
  } finally {
    setGenerating(false);
  }
};



  // Export to Excel (one sheet with all rows)
  const exportToExcel = () => {
    if (resolvedSchedules.length === 0) return;
    const rows = resolvedSchedules
      .sort((a, b) => (a.date + a.startHHMM).localeCompare(b.date + b.startHHMM))
      .map(r => {
        const startM = toMinutes(r.startHHMM);
        const endHHMM = minutesToHHMM(startM + r.durationMin);
        return {
          Course: r.courseTitle,
          Date: r.date,
          'Start Time': r.startHHMM,
          'End Time': endHHMM,
          Topic: r.topic
        };
      });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    XLSX.writeFile(wb, 'timetable.xlsx');
  };

  // ---------- Chat send handler (unchanged) ----------
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatHistory(h => [...h, { role: 'user', content: chatInput }]);
    setChatLoading(true);

    const historyString = [...chatHistory, { role: 'user', content: chatInput }]
      .map(m => `${m.role === 'user' ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const reply = await askGeminiWithUserContext(historyString);

    setChatHistory(h => [...h, { role: 'assistant', content: reply }]);
    setChatInput('');
    setChatLoading(false);
  };

  // ---------- Code insights (unchanged) ----------
  const handleCodeInsights = async (e) => {
    e.preventDefault();
    setCodeResponse('');
    setCodeLoading(true);

    const prompt = `
      You are an expert coding mentor. 
      The user will give you a coding question and their code.
      Please provide detailed feedback, point out mistakes, suggest improvements, 
      and explain the solution.

      Question: ${questionInput}
      Code:
      ${codeInput}
    `;

    const feedback = await askGeminiWithUserContext(prompt);
    setCodeResponse(feedback);
    setCodeLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin" />
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="w-full max-w-md p-8 text-center bg-white shadow-xl rounded-xl">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-deep-blue/10 to-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="overflow-hidden bg-white shadow-lg rounded-xl">
            <div className="p-8 text-white bg-gradient-to-r from-deep-blue to-purple-blue">
              <div className="flex flex-col items-center md:flex-row">
                <div className="mb-4 md:mb-0 md:mr-6">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/20">
                    <FaUser className="text-4xl" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h1 className="mb-2 text-3xl font-bold">{userData.name}</h1>
                  <p className="mb-4 text-xl text-purple-200">{userData.email}</p>
                  <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    <span className="px-3 py-1 text-sm rounded-full bg-white/20">{userData.role === 'admin' ? 'Admin' : 'Student'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-deep-blue text-deep-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'password' ? 'border-deep-blue text-deep-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Change Password
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'code' ? 'border-deep-blue text-deep-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Code Insights
                </button>

                {userData.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'timetable' ? 'border-deep-blue text-deep-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Timetable Generator
                  </button>
                )}
              </nav>
            </div>

            <div className="p-8">
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <div>
                  {isEditing ? (
                    <div className="mb-6">
                      {editSuccess && <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">Profile updated successfully!</div>}
                      {editError && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{editError}</div>}

                      <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-blue"
                            required
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-blue"
                            required
                          />
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setEditForm({ name: userData.name, email: userData.email, currentPassword: '', newPassword: '', confirmPassword: '' });
                              setEditError('');
                              setEditSuccess(false);
                            }}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button type="submit" className="px-4 py-2 text-white rounded-md bg-deep-blue hover:bg-purple-blue">
                            <FaSave className="inline mr-1" /> Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex justify-end mb-6">
                      <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 text-white rounded-md bg-deep-blue hover:bg-purple-blue">
                        <FaEdit className="mr-2" /> Edit Profile
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <h2 className="mb-4 text-xl font-bold text-deep-blue">Personal Information</h2>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <FaUser className="mr-3 text-gray-500" />
                          <span>{userData.name}</span>
                        </div>
                        <div className="flex items-center">
                          <FaLock className="mr-3 text-gray-500" />
                          <span>{userData.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h2 className="mb-4 text-xl font-bold text-deep-blue">My Enrollments</h2>

                      {enrollments.length > 0 ? (
                        <div className="space-y-4">
                          {enrollments.map((enrollment) => (
                            <div key={enrollment._id} className="p-4 transition-shadow border border-gray-200 rounded-lg hover:shadow-md">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start">
                                  <div className="flex items-center justify-center w-10 h-10 mr-4 text-white rounded-full bg-deep-blue">
                                    <FaBook />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-deep-blue">{enrollment.course.title}</h3>
                                    <p className="mb-2 text-sm text-gray-600">{enrollment.course.description.substring(0, 80)}...</p>

                                    <div className="flex items-center mt-2">
                                      {enrollment.paymentStatus === 'paid' ? (
                                        <span className="flex items-center text-sm text-green-600">
                                          <FaCheckCircle className="mr-1" /> Payment Completed
                                        </span>
                                      ) : (
                                        <span className="flex items-center text-sm text-yellow-600">
                                          <FaClock className="mr-1" /> Payment Pending
                                        </span>
                                      )}
                                    </div>

                                    {enrollment.paymentStatus === 'paid' && (
                                      <div className="mt-3">
                                        <div className="flex items-center mb-2">
                                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${enrollment.progress ?? 0}%` }}></div>
                                          </div>
                                          <span className="text-sm font-medium text-gray-700">{enrollment.progress ?? 0}%</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {(enrollment.completedDays ?? []).map((day, index) => (
                                            <span
                                              key={index}
                                              className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                                                day.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                                              }`}
                                            >
                                              {day.day}
                                            </span>
                                          ))}
                                        </div>
                                       <button
  onClick={() => {
    setSelectedEnrollment(enrollment);
    setSelectedDay(1); // Reset to day 1 when opening modal
    fetchCourseMaterials(enrollment.course._id, 1);
  }}
  className="mt-2 text-sm text-blue-600 hover:underline"
>
  View Materials
</button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {enrollment.paymentStatus === 'pending' && (
                                  <button
                                    onClick={() => window.open(enrollment.course.paymentLink, '_blank')}
                                    className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                                  >
                                    Complete Payment
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-gray-500">
                          <FaBook className="mx-auto mb-2 text-3xl" />
                          <p>You haven't enrolled in any courses yet.</p>
                          <Link to="/courses" className="inline-block px-4 py-2 mt-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue">
                            Browse Courses
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <div>
                  {editSuccess && <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">Password updated successfully!</div>}
                  {editError && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{editError}</div>}
                  <form onSubmit={handlePasswordSubmit} className="max-w-md">
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={editForm.currentPassword}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-blue"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={editForm.newPassword}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-blue"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block mb-1 text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={editForm.confirmPassword}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-blue"
                        required
                      />
                    </div>

                    <button type="submit" className="w-full px-4 py-2 text-white rounded-md bg-deep-blue hover:bg-purple-blue">
                      <FaSave className="inline mr-2" /> Update Password
                    </button>
                  </form>
                </div>
              )}

              {/* Code Insights Tab */}
              {activeTab === 'code' && (
                <div>
                  <h2 className="mb-4 text-xl font-bold text-deep-blue">Code Assessment Insights</h2>
                  <form onSubmit={handleCodeInsights} className="space-y-4">
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Coding Question</label>
                      <textarea
                        className="w-full p-2 border rounded"
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        rows={2}
                        required
                        placeholder="Paste your coding assessment question here..."
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium text-gray-700">Your Code Answer</label>
                      <textarea
                        className="w-full p-2 font-mono border rounded"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                        rows={8}
                        required
                        placeholder="Paste your code answer here..."
                      />
                    </div>
                    <button type="submit" className="px-4 py-2 text-white rounded bg-deep-blue hover:bg-purple-blue">
                      Get Insights
                    </button>
                  </form>
                  {codeLoading && <div className="my-4 text-gray-600">Analyzing your code...</div>}
                  {codeResponse && (
                    <div className="p-4 my-4 whitespace-pre-line rounded-lg bg-blue-50 text-deep-blue">{codeResponse}</div>
                  )}
                </div>
              )}

              {/* Admin: Timetable Generator */}
              {activeTab === 'timetable' && userData.role === 'admin' && (
                <div>
                  <h2 className="mb-4 text-xl font-bold text-deep-blue">Timetable Generator (2 Weeks)</h2>

                  {uniqueCourses.length === 0 ? (
                    <div className="p-4 text-gray-600 rounded bg-gray-50">
                      No enrollments available. Once students enroll, courses will appear here.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {uniqueCourses.map(course => (
                          <div key={course._id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-deep-blue">{course.title}</h3>
                                <p className="text-sm text-gray-600">{course.description}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                  <label className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-gray-500" />
                                    <input
                                      type="date"
                                      value={scheduleInputs[course._id]?.date || ''}
                                      onChange={(e) =>
                                        setScheduleInputs(p => ({ ...p, [course._id]: { ...p[course._id], date: e.target.value } }))
                                      }
                                      className="p-2 border rounded"
                                    />
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <FaClock className="text-gray-500" />
                                    <input
                                      type="time"
                                      value={scheduleInputs[course._id]?.time || ''}
                                      onChange={(e) =>
                                        setScheduleInputs(p => ({ ...p, [course._id]: { ...p[course._id], time: e.target.value } }))
                                      }
                                      className="p-2 border rounded"
                                    />
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Duration (min)</span>
                                    <input
                                      type="number"
                                      min={30}
                                      step={15}
                                      value={scheduleInputs[course._id]?.duration || 60}
                                      onChange={(e) =>
                                        setScheduleInputs(p => ({ ...p, [course._id]: { ...p[course._id], duration: Number(e.target.value || 60) } }))
                                      }
                                      className="w-24 p-2 border rounded"
                                    />
                                  </label>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                  Enrolled Users: {(courseUsersMap[course._id] || []).length}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4 mt-6">
                        <button
                          onClick={handleGenerateTimetable}
                          disabled={generating}
                          className="px-4 py-2 text-white rounded bg-deep-blue hover:bg-purple-blue"
                        >
                          {generating ? 'Generating...' : 'Auto-Resolve & Generate'}
                        </button>

                        {resolvedSchedules.length > 0 && (
                          <button
                            onClick={exportToExcel}
                            className="flex items-center px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                          >
                            <FaDownload className="mr-2" /> Export Excel
                          </button>
                        )}
                      </div>

                      {unresolvedConflicts.length > 0 && (
                        <div className="p-4 mt-6 text-yellow-800 border border-yellow-200 rounded bg-yellow-50">
                          <div className="flex items-center gap-2 font-semibold">
                            <FaExclamationTriangle /> Some conflicts could not be fully resolved:
                          </div>
                          <ul className="mt-2 ml-6 text-sm list-disc">
                            {unresolvedConflicts.slice(0, 10).map((c, i) => (
                              <li key={i}>
                                {c.date}: {c.a.courseTitle} ({c.a.startHHMM}) ↔ {c.b.courseTitle} ({c.b.startHHMM})
                              </li>
                            ))}
                            {unresolvedConflicts.length > 10 && <li>+ {unresolvedConflicts.length - 10} more…</li>}
                          </ul>
                          <div className="mt-2 text-xs">
                            Tip: adjust one of the course base times above and generate again.
                          </div>
                        </div>
                      )}

                      {resolvedSchedules.length > 0 && (
                        <div className="mt-8">
                          <h3 className="mb-3 font-semibold text-deep-blue">Generated Timetable</h3>
                          <div className="overflow-x-auto border rounded">
                            <table className="min-w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left">Date</th>
                                  <th className="px-3 py-2 text-left">Course</th>
                                  <th className="px-3 py-2 text-left">Start</th>
                                  <th className="px-3 py-2 text-left">End</th>
                                  <th className="px-3 py-2 text-left">Topic</th>
                                </tr>
                              </thead>
                              <tbody>
                                {resolvedSchedules
                                  .slice()
                                  .sort((a, b) => (a.date + a.startHHMM + a.courseTitle).localeCompare(b.date + b.startHHMM + b.courseTitle))
                                  .map((row, idx) => {
                                    const startM = toMinutes(row.startHHMM);
                                    const endHHMM = minutesToHHMM(startM + row.durationMin);
                                    return (
                                      <tr key={idx} className="border-t">
                                        <td className="px-3 py-2">{row.date}</td>
                                        <td className="px-3 py-2">{row.courseTitle}</td>
                                        <td className="px-3 py-2">{row.startHHMM}</td>
                                        <td className="px-3 py-2">{endHHMM}</td>
                                        <td className="px-3 py-2">{row.topic}</td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  onClick={logout}
                  className="px-6 py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

 {selectedEnrollment && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-deep-blue">Course Materials for {selectedEnrollment.course.title}</h2>
          <button onClick={() => setSelectedEnrollment(null)} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-deep-blue">Course Progress</h3>
          <div className="flex items-center mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${selectedEnrollment.progress ?? 0}%` }}></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{selectedEnrollment.progress ?? 0}%</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(selectedEnrollment.completedDays ?? []).map((day, idx) => (
              <span
                key={idx}
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                  day.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {day.day}
              </span>
            ))}
          </div>
        </div>
        
        {/* Day Selector */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Select Day</label>
          <div className="flex items-center gap-4">
            <select
              value={selectedDay}
              onChange={(e) => {
                const day = parseInt(e.target.value);
                setSelectedDay(day);
                fetchCourseMaterials(selectedEnrollment.course._id, day);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-deep-blue"
            >
              {Array.from({ length: 14 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>Day {day}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {selectedEnrollment.completedDays?.find(d => d.day === selectedDay)?.completed 
                ? "Completed" 
                : "Not completed"}
            </span>
          </div>
        </div>
        
        {materials.length > 0 ? (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-deep-blue">Materials for Day {selectedDay}</h3>
            <div className="space-y-4">
              {materials[0]?.materials.map((material, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-blue-50">
                  <h4 className="font-semibold text-deep-blue">{material.title}</h4>
                  <p className="mb-3 text-sm text-gray-600">{material.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {material.materials.map((mat, matIdx) => (
                      <a
                        key={matIdx}
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                      >
                        {mat.type === 'pdf' ? <FaFilePdf className="mr-2" /> : <FaLink className="mr-2" />}
                        {mat.name}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No materials available for Day {selectedDay}.</div>
        )}
        <div className="mt-6 text-right">
          <button
            onClick={() => setSelectedEnrollment(null)}
            className="px-6 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Chat Assistant Floating Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed p-4 text-white rounded-full shadow-lg bottom-8 right-8 bg-gradient-to-r from-deep-blue to-purple-blue"
        style={{ zIndex: 60 }}
      >
        <FaChalkboardTeacher className="text-2xl" />
      </button>

      {/* Chat Assistant Modal */}
      {chatOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-60">
          <div className="relative w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
            <button onClick={() => setChatOpen(false)} className="absolute text-gray-400 top-4 right-4 hover:text-gray-700">
              <FaTimes className="text-xl" />
            </button>
            <h3 className="mb-2 text-xl font-bold text-deep-blue">Chat Assistant</h3>
            <div className="p-2 mb-4 overflow-y-auto border rounded chat-history h-60 bg-gray-50">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-3 py-2 rounded-xl ${msg.role === 'user' ? 'bg-purple-200 text-deep-blue' : 'bg-blue-100 text-blue-900'}`}>
                    {msg.content}
                  </span>
                </div>
              ))}
              {chatLoading && <div className="text-gray-400">Thinking...</div>}
            </div>
            <form onSubmit={handleSendChat}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none"
                  placeholder="Ask me anything about your courses or profile..."
                />
                <button type="submit" className="px-4 py-2 text-white rounded bg-deep-blue hover:bg-purple-blue">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
