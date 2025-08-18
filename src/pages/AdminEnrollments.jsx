import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaCalendarCheck, FaRupeeSign, FaBook, FaVideo, FaClipboardCheck, FaFilePdf, FaLink, FaPlus, FaTrash } from 'react-icons/fa';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    type: 'link',
    url: '',
    name: ''
  });

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/enrollments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Process enrollments to calculate total days based on course curriculum
          const processedEnrollments = data.data.map(enrollment => {
            if (enrollment.course && enrollment.course._id) {
              // Fetch course details to get curriculum
              fetchCourseDetails(enrollment.course._id, enrollment);
            }
            return enrollment;
          });
          
          setEnrollments(processedEnrollments);
        } else {
          setError('Failed to fetch enrollments');
        }
      } catch (err) {
        setError('Failed to fetch enrollments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrollments();
  }, []);

  const fetchCourseDetails = async (courseId, enrollment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const courseData = await response.json();
        
        // Calculate total days from curriculum
        let totalDays = 0;
        if (courseData.curriculum) {
          totalDays = courseData.curriculum.reduce((sum, week) => sum + week.topics.length, 0);
        }
        
        // Initialize completedDays if not present or incorrect length
        if (!enrollment.completedDays || enrollment.completedDays.length !== totalDays) {
          enrollment.completedDays = Array.from({ length: totalDays }, (_, i) => ({
            day: i + 1,
            completed: false,
            completedAt: null
          }));
        }
        
        // Calculate progress
        const completedCount = enrollment.completedDays.filter(d => d.completed).length;
        const progress = Math.round((completedCount / totalDays) * 100);
        
        // Update enrollment with course details
        const enrollmentIndex = enrollments.findIndex(e => e._id === enrollment._id);
        if (enrollmentIndex !== -1) {
          const updatedEnrollments = [...enrollments];
          updatedEnrollments[enrollmentIndex] = {
            ...enrollment,
            course: courseData,
            totalDays,
            progress
          };
          setEnrollments(updatedEnrollments);
        }
      }
    } catch (err) {
      console.error('Failed to fetch course details:', err);
    }
  };

  const updatePaymentStatus = async (enrollmentId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus: status })
      });
      
      if (response.ok) {
        setEnrollments(enrollments.map(e => 
          e._id === enrollmentId ? { ...e, paymentStatus: status } : e
        ));
      } else {
        setError('Failed to update payment status');
      }
    } catch (err) {
      setError('Failed to update payment status');
    }
  };

  const updateDayProgress = async (enrollmentId, dayNumber, completed) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dayNumber, completed: Boolean(completed) })
      });
      
      if (response.ok) {
        setEnrollments(enrollments.map(e => {
          if (e._id === enrollmentId) {
            const updatedDays = e.completedDays.map(day => 
              day.day === dayNumber ? { ...day, completed: Boolean(completed), completedAt: completed ? new Date() : null } : day
            );
            
            // Recalculate progress
            const completedCount = updatedDays.filter(d => d.completed).length;
            const progress = Math.round((completedCount / e.totalDays) * 100);
            
            return { 
              ...e, 
              completedDays: updatedDays,
              progress
            };
          }
          return e;
        }));
      } else {
        setError('Failed to update progress');
      }
    } catch (err) {
      setError('Failed to update progress');
    }
  };

  const deleteEnrollment = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setEnrollments(enrollments.filter(e => e._id !== enrollmentId));
        } else {
          setError('Failed to delete enrollment');
        }
      } catch (err) {
        setError('Failed to delete enrollment');
      }
    }
  };

  const openDayProgressModal = (enrollment, day) => {
    setSelectedEnrollment(enrollment);
    setSelectedDay(day);
    setNewMaterial({
      title: '',
      description: '',
      type: 'link',
      url: '',
      name: ''
    });
    fetchCourseMaterials(enrollment.course._id, day);
  };

  const fetchCourseMaterials = async (courseId, day) => {
    try {
      const token = localStorage.getItem('token');
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

  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    
    if (!selectedEnrollment || !selectedDay) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/courses/${selectedEnrollment.course._id}/materials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: selectedEnrollment.course._id,
          day: selectedDay,
          title: newMaterial.title,
          description: newMaterial.description,
          materials: [{
            type: newMaterial.type,
            url: newMaterial.url,
            name: newMaterial.name
          }]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaterials(prev => [...prev, data.data]);
        // Reset form
        setNewMaterial({
          title: '',
          description: '',
          type: 'link',
          url: '',
          name: ''
        });
      } else {
        setError('Failed to add material');
      }
    } catch (err) {
      setError('Failed to add material');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading enrollments...</div>;
  }
  
  if (error) {
    return <div className="py-10 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-deep-blue/10 to-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="mb-8 text-3xl font-bold text-deep-blue">Enrollment Management</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-blue-600 bg-blue-100 rounded-full">
                  <FaClock className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-bold">{enrollments.filter(e => e.paymentStatus === 'pending').length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-green-600 bg-green-100 rounded-full">
                  <FaCheckCircle className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Completed Payments</p>
                  <p className="text-2xl font-bold">{enrollments.filter(e => e.paymentStatus === 'paid').length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-purple-600 bg-purple-100 rounded-full">
                  <FaCalendarCheck className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Total Enrollments</p>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-red-600 bg-red-100 rounded-full">
                  <FaTimesCircle className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Failed Payments</p>
                  <p className="text-2xl font-bold">{enrollments.filter(e => e.paymentStatus === 'failed').length}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Revenue Summary */}
          <div className="p-6 mb-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-4 text-xl font-bold text-deep-blue">Revenue Summary</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-green-50">
                <p className="text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{enrollments
                    .filter(e => e.paymentStatus === 'paid')
                    .reduce((sum, e) => sum + (e.amount || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50">
                <p className="text-gray-600">Pending Revenue</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ₹{enrollments
                    .filter(e => e.paymentStatus === 'pending')
                    .reduce((sum, e) => sum + (e.amount || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50">
                <p className="text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-blue-600">{enrollments.length}</p>
              </div>
            </div>
          </div>
          
          {/* Enrollments Table */}
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <h2 className="mb-6 text-xl font-bold text-deep-blue">All Enrollments</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Payment Status</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-deep-blue">
                              {enrollment.user.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{enrollment.user.name}</div>
                            <div className="text-sm text-gray-500">{enrollment.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{enrollment.course?.title || 'Loading...'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {enrollment.course?.curriculum 
                            ? `${enrollment.course.curriculum.length} weeks (${enrollment.totalDays || 0} days)`
                            : 'Loading...'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaRupeeSign className="mr-1 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {enrollment.amount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          enrollment.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : enrollment.paymentStatus === 'failed' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {enrollment.paymentStatus === 'paid' ? (
                            <FaCheckCircle className="inline mr-1" />
                          ) : enrollment.paymentStatus === 'failed' ? (
                            <FaTimesCircle className="inline mr-1" />
                          ) : (
                            <FaClock className="inline mr-1" />
                          )}
                          {enrollment.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {enrollment.paymentStatus === 'paid' ? (
                          <div>
                            <div className="flex items-center mb-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-green-600 h-2.5 rounded-full" 
                                  style={{ width: `${enrollment.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{enrollment.progress || 0}%</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {enrollment.completedDays?.slice(0, 14).map((day, index) => (
                                <button
                                  key={index}
                                  onClick={() => openDayProgressModal(enrollment, day.day)}
                                  className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                                    day.completed 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                  title={`Day ${day.day}`}
                                >
                                  {day.day}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Payment pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex space-x-2">
                          {enrollment.paymentStatus !== 'paid' && (
                            <>
                              <button
                                onClick={() => updatePaymentStatus(enrollment._id, 'paid')}
                                className="px-3 py-1 text-xs text-green-700 bg-green-100 rounded hover:bg-green-200"
                              >
                                Mark Paid
                              </button>
                              <button
                                onClick={() => updatePaymentStatus(enrollment._id, 'failed')}
                                className="px-3 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200"
                              >
                                Mark Failed
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteEnrollment(enrollment._id)}
                            className="px-3 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200"
                            title="Delete enrollment"
                          >
                            <FaTrash className="inline" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Day Progress Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-deep-blue">
                  Manage Progress for {selectedEnrollment.course?.title || 'Course'}
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
                <h3 className="mb-4 text-lg font-semibold text-deep-blue">Select Day</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEnrollment.completedDays?.slice(0, 14).map((day, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedDay(day.day);
                        fetchCourseMaterials(selectedEnrollment.course._id, day.day);
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        day.day === selectedDay
                          ? 'bg-green-500 text-white'
                          : day.completed
                            ? 'bg-green-300 text-green-800'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Day {day.day}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold text-deep-blue">Progress for Day {selectedDay}</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="meetAttended"
                      checked={selectedEnrollment.completedDays?.find(d => d.day === selectedDay)?.completed || false}
                      onChange={(e) => updateDayProgress(selectedEnrollment._id, selectedDay, e.target.checked)}
                      className="mr-3"
                    />
                    <label htmlFor="meetAttended" className="flex items-center">
                      <FaVideo className="mr-2 text-blue-500" />
                      Meet Attended
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="assessmentCompleted"
                      checked={selectedEnrollment.completedDays?.find(d => d.day === selectedDay)?.completed || false}
                      onChange={(e) => updateDayProgress(selectedEnrollment._id, selectedDay, e.target.checked)}
                      className="mr-3"
                    />
                    <label htmlFor="assessmentCompleted" className="flex items-center">
                      <FaClipboardCheck className="mr-2 text-green-500" />
                      Assessment Completed
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Course Materials Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-deep-blue">Course Materials for Day {selectedDay}</h3>
                  <button
                    type="button"
                    onClick={() => document.getElementById('material-form').classList.toggle('hidden')}
                    className="flex items-center px-3 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    <FaPlus className="mr-1" /> Add Material
                  </button>
                </div>
                
                {/* Add Material Form */}
                <div id="material-form" className="hidden p-4 mb-6 rounded-lg bg-gray-50">
                  <h4 className="mb-3 font-medium text-deep-blue">Add New Material</h4>
                  <form onSubmit={handleAddMaterial} className="space-y-3">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={newMaterial.title}
                        onChange={handleMaterialChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        value={newMaterial.description}
                        onChange={handleMaterialChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Material Type</label>
                      <select
                        name="type"
                        value={newMaterial.type}
                        onChange={handleMaterialChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="link">Link</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        {newMaterial.type === 'pdf' ? 'PDF URL' : 'Link URL'}
                      </label>
                      <input
                        type="url"
                        name="url"
                        value={newMaterial.url}
                        onChange={handleMaterialChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Display Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newMaterial.name}
                        onChange={handleMaterialChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('material-form').classList.add('hidden')}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
                      >
                        Add Material
                      </button>
                    </div>
                  </form>
                </div>
                
                {/* Materials List */}
                {materials.length > 0 ? (
                  <div className="space-y-3">
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
                              className="inline-flex items-center px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                            >
                              {mat.type === 'pdf' ? <FaFilePdf className="mr-1" /> : <FaLink className="mr-1" />}
                              {mat.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <FaBook className="mx-auto mb-2 text-3xl" />
                    <p>No materials available for Day {selectedDay}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
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

export default AdminEnrollments;