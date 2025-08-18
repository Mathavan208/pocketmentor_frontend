import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaBook, FaChalkboardTeacher, FaCalendarAlt, FaCheckCircle, FaVideo, FaClipboardCheck, FaClock, FaFilePdf, FaLink, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Profile = () => {
  const { user, token, logout } = useUser();
  const [userData, setUserData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [materials, setMaterials] = useState([]);
  
  // User editing state
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
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileResponse = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserData(profileData);
          
          // Initialize edit form with current data
          setEditForm({
            name: profileData.name,
            email: profileData.email,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          
          // Fetch user's enrollments
          const enrollmentResponse = await fetch('/api/users/enrollments', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json();
            setEnrollments(enrollmentData.data || []);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchProfileData();
    }
  }, [token]);

  const fetchCourseMaterials = async (courseId, day) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/materials/${day}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (editError) setEditError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess(false);
    
    // Basic validation
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setEditError('Name and email are required');
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(editForm.email)) {
      setEditError('Please enter a valid email address');
      return;
    }
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email
        })
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData);
        setEditSuccess(true);
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setEditSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setEditError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      setEditError('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess(false);
    
    // Validation
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
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: editForm.currentPassword,
          newPassword: editForm.newPassword
        })
      });
      
      if (response.ok) {
        setEditSuccess(true);
        // Reset password fields
        setEditForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        // Clear success message after 3 seconds
        setTimeout(() => setEditSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setEditError(errorData.message || 'Failed to update password');
      }
    } catch (err) {
      setEditError('Failed to update password');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
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
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
          >
            Retry
          </button>
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
                    <span className="px-3 py-1 text-sm rounded-full bg-white/20">
                      {userData.role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                   
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-deep-blue text-deep-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'password'
                      ? 'border-deep-blue text-deep-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Change Password
                </button>
              </nav>
            </div>
            
            <div className="p-8">
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <div>
                  {isEditing ? (
                    <div className="mb-6">
                      {editSuccess && (
                        <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">
                          Profile updated successfully!
                        </div>
                      )}
                      
                      {editError && (
                        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                          {editError}
                        </div>
                      )}
                      
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
                              setEditForm({
                                name: userData.name,
                                email: userData.email,
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              });
                              setEditError('');
                              setEditSuccess(false);
                            }}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-white rounded-md bg-deep-blue hover:bg-purple-blue"
                          >
                            <FaSave className="inline mr-1" /> Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex justify-end mb-6">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 text-white rounded-md bg-deep-blue hover:bg-purple-blue"
                      >
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
                                            <div 
                                              className="bg-green-600 h-2.5 rounded-full" 
                                              style={{ width: `${enrollment.progress}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-sm font-medium text-gray-700">{enrollment.progress}%</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {enrollment.completedDays.map((day, index) => (
                                            <span 
                                              key={index}
                                              className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                                                day.completed 
                                                  ? 'bg-green-500 text-white' 
                                                  : 'bg-gray-200 text-gray-700'
                                              }`}
                                            >
                                              {day.day}
                                            </span>
                                          ))}
                                        </div>
                                        <button 
                                          onClick={() => {
                                            setSelectedEnrollment(enrollment);
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
                          <Link 
                            to="/courses" 
                            className="inline-block px-4 py-2 mt-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
                          >
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
                  {editSuccess && (
                    <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">
                      Password updated successfully!
                    </div>
                  )}
                  
                  {editError && (
                    <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                      {editError}
                    </div>
                  )}
                  
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
                    
                    <button
                      type="submit"
                      className="w-full px-4 py-2 text-white rounded-md bg-deep-blue hover:bg-purple-blue"
                    >
                      <FaSave className="inline mr-2" /> Update Password
                    </button>
                  </form>
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
      
      {/* Materials Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-deep-blue">
                  Course Materials for {selectedEnrollment.course.title}
                </h2>
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold text-deep-blue">Course Progress</h3>
                <div className="flex items-center mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${selectedEnrollment.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{selectedEnrollment.progress}%</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedEnrollment.completedDays.map((day, index) => (
                    <span 
                      key={index}
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                        day.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {day.day}
                    </span>
                  ))}
                </div>
              </div>
              
              {materials.length > 0 ? (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-deep-blue">Day 1 Materials</h3>
                  <div className="space-y-4">
                    {materials.map((material, index) => (
                      <div key={index} className="p-4 rounded-lg bg-blue-50">
                        <h4 className="font-semibold text-deep-blue">{material.title}</h4>
                        <p className="mb-3 text-sm text-gray-600">{material.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {material.materials.map((mat, matIndex) => (
                            <a
                              key={matIndex}
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
                <div className="p-6 text-center text-gray-500">
                  <p>No materials available for this course yet.</p>
                </div>
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
    </div>
  );
};

export default Profile;