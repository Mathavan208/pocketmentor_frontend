import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
const AdminCourses = () => {
  const { token } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const API_URL=import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const coursesData = await response.json();
          setCourses(coursesData);
        }
      } catch (err) {
        setError('Failed to fetch courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchCourses();
    }
  }, [token]);
  
  const deleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
         const API_URL=import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/courses/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setCourses(courses.filter(course => course._id !== id));
        }
      } catch (err) {
        setError('Failed to delete course');
        console.error(err);
      }
    }
  };
  
  const editCourse = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (error) {
    return <div className="py-10 text-center">Error: {error}</div>;
  }
  
  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-deep-blue/10 to-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-deep-blue">Course Management</h1>
            <button
              onClick={() => {
                setEditingCourse(null);
                setShowForm(true);
              }}
              className="flex items-center px-4 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
            >
              <FaPlus className="mr-2" /> Add Course
            </button>
          </div>
          
          {showForm && (
            <AdminCourseForm 
              course={editingCourse} 
              onClose={() => setShowForm(false)}
              onSave={(courseData) => {
                if (editingCourse) {
                  setCourses(courses.map(c => c._id === courseData._id ? courseData : c));
                } else {
                  setCourses([...courses, courseData]);
                }
                setShowForm(false);
              }}
            />
          )}
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course._id} className="overflow-hidden bg-white shadow-lg rounded-xl">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-deep-blue">{course.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      course.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  
                  <p className="mb-4 text-gray-600">{course.description.substring(0, 100)}...</p>
                  
                  {/* Price Display */}
                  <div className="p-3 mb-4 rounded-lg bg-gray-50">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">
                        {course.price === 0 ? 'Free' : `$${course.price?.toFixed(2) || '0.00'}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => editCourse(course)}
                      className="flex items-center px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => deleteCourse(course._id)}
                      className="flex items-center px-3 py-1 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated AdminCourseForm with price field
const AdminCourseForm = ({ course, onClose, onSave }) => {
  const [title, setTitle] = useState(course ? course.title : '');
  const [description, setDescription] = useState(course ? course.description : '');
  const [image, setImage] = useState(course ? course.image : '');
  const [syllabus, setSyllabus] = useState(course ? course.syllabus : '');
  const [status, setStatus] = useState(course ? course.status : 'available');
  const [launchDate, setLaunchDate] = useState(course ? course.launchDate : '');
  const [paymentLink, setPaymentLink] = useState(course ? course.paymentLink : '');
  // Initialize price as 0 for new courses, or existing price for editing
  const [price, setPrice] = useState(course ? course.price : 0);
  const [curriculum, setCurriculum] = useState(course ? course.curriculum : [{ week: 1, topics: [] }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const courseData = {
        title,
        description,
        image,
        syllabus,
        status,
        launchDate,
        paymentLink,
        curriculum,
        price: parseFloat(price) || 0
      };
      
      const url = course ? `/api/courses/${course._id}` : '/api/courses';
      const method = course ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(courseData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save course');
      }
      
      const savedCourse = await response.json();
      onSave(savedCourse);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const addWeek = () => {
    setCurriculum([...curriculum, { week: curriculum.length + 1, topics: [] }]);
  };
  
  const updateWeekTopics = (index, topics) => {
    const newCurriculum = [...curriculum];
    newCurriculum[index].topics = topics;
    setCurriculum(newCurriculum);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white shadow-xl rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-deep-blue">
              {course ? 'Edit Course' : 'Create New Course'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="title">
                  Course Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  required
                />
              </div>
              
              {/* Price Field */}
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="price">
                  Course Price ($)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter 0 for free courses
                </p>
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="image">
                  Course Image URL
                </label>
                <input
                  id="image"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                >
                  <option value="available">Available</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="launchDate">
                  Launch Date (for upcoming courses)
                </label>
                <input
                  id="launchDate"
                  type="text"
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="paymentLink">
                  Payment Link
                </label>
                <input
                  id="paymentLink"
                  type="text"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700" htmlFor="syllabus">
                  Syllabus
                </label>
                <textarea
                  id="syllabus"
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  required
                />
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-deep-blue">Course Curriculum</h3>
                <button
                  type="button"
                  onClick={addWeek}
                  className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
                >
                  Add Week
                </button>
              </div>
              
              {curriculum.map((week, index) => (
                <div key={index} className="p-4 mb-6 border border-gray-200 rounded-lg">
                  <h4 className="mb-3 font-semibold text-deep-blue">Week {week.week}</h4>
                  <div className="mb-3">
                    <label className="block mb-1 text-gray-700" htmlFor={`topics-${index}`}>
                      Topics (comma separated)
                    </label>
                    <input
                      id={`topics-${index}`}
                      type="text"
                      value={week.topics.join(', ')}
                      onChange={(e) => updateWeekTopics(index, e.target.value.split(',').map(topic => topic.trim()))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-8 space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;