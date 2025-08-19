import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminInstructors = () => {
  const { token } = useContext(UserContext);
  const [instructors, setInstructors] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/admin/instructors`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const instructorsData = await response.json();
          setInstructors(instructorsData.data || []);
        }
      } catch (err) {
        setError('Failed to fetch instructors');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchInstructors();
    }
  }, [token]);
  
  const deleteInstructor = async (id) => {
    if (window.confirm('Are you sure you want to delete this instructor?')) {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/admin/instructors/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setInstructors(prevInstructors => prevInstructors.filter(instructor => instructor._id !== id));
        }
      } catch (err) {
        setError('Failed to delete instructor');
        console.error(err);
      }
    }
  };
  
  const editInstructor = (instructor) => {
    setEditingInstructor(instructor);
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
            <h1 className="text-3xl font-bold text-deep-blue">Instructor Management</h1>
            <button
              onClick={() => {
                setEditingInstructor(null);
                setShowForm(true);
              }}
              className="flex items-center px-4 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
            >
              <FaPlus className="mr-2" /> Add Instructor
            </button>
          </div>
          
          {showForm && (
            <AdminInstructorForm 
              instructor={editingInstructor} 
              onClose={() => setShowForm(false)}
              onSave={(instructorData) => {
                if (editingInstructor) {
                  setInstructors(prevInstructors => 
                    prevInstructors.map(i => i._id === instructorData._id ? instructorData : i)
                  );
                } else {
                  setInstructors(prevInstructors => [...prevInstructors, instructorData]);
                }
                setShowForm(false);
              }}
            />
          )}
          
          {/* Check if instructors array exists and has items */}
          {Array.isArray(instructors) && instructors.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {instructors.map((instructor) => (
                <div key={instructor._id} className="overflow-hidden bg-white shadow-lg rounded-xl">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={instructor.image} 
                      alt={instructor.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-deep-blue">{instructor.name}</h3>
                    </div>
                    
                    <p className="mb-2 font-medium text-gray-600">{instructor.profession}</p>
                    <p className="mb-4 text-gray-600">{instructor.bio.substring(0, 100)}...</p>
                    
                    <div className="flex justify-between">
                      <button
                        onClick={() => editInstructor(instructor)}
                        className="flex items-center px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => deleteInstructor(instructor._id)}
                        className="flex items-center px-3 py-1 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ): (
            <div className="py-12 text-center">
              <div className="text-gray-400">
                <FaPlus className="mx-auto mb-4 text-5xl" />
                <p className="text-lg font-medium">No instructors found</p>
                <p className="text-gray-500">Add your first instructor to get started</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-2 mt-4 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
                >
                  Add Instructor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const AdminInstructorForm = ({ instructor, onClose, onSave }) => {
  const [name, setName] = useState(instructor ? instructor.name : '');
  const [profession, setProfession] = useState(instructor ? instructor.profession : '');
  const [image, setImage] = useState(instructor ? instructor.image : '');
  const [bio, setBio] = useState(instructor ? instructor.bio : '');
  const [social, setSocial] = useState(instructor ? instructor.social : { linkedin: '', github: '', twitter: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const instructorData = {
        name,
        profession,
        image,
        bio,
        social
      };
      
      const url = instructor ? `${API_URL}/admin/instructors/${instructor._id}` : `${API_URL}/admin/instructors`;
      const method = instructor ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(instructorData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save instructor');
      }
      
      const savedInstructor = await response.json();
      onSave(savedInstructor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialChange = (platform, value) => {
    setSocial({
      ...social,
      [platform]: value
    });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white shadow-xl rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-deep-blue">
              {instructor ? 'Edit Instructor' : 'Create New Instructor'}
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
                <label className="block mb-2 text-gray-700" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="profession">
                  Profession
                </label>
                <input
                  id="profession"
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="image">
                  Image URL
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
              
              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="linkedin">
                  LinkedIn Profile
                </label>
                <input
                  id="linkedin"
                  type="url"
                  value={social.linkedin}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="github">
                  GitHub Profile
                </label>
                <input
                  id="github"
                  type="url"
                  value={social.github}
                  onChange={(e) => handleSocialChange('github', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  placeholder="https://github.com/username"
                />
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="twitter">
                  Twitter Profile
                </label>
                <input
                  id="twitter"
                  type="url"
                  value={social.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  placeholder="https://twitter.com/username"
                />
              </div>
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
                {loading ? 'Saving...' : 'Save Instructor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminInstructors;