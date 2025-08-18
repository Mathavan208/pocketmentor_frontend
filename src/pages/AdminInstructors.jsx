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
          ) : (
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

// AdminInstructorForm component remains the same

export default AdminInstructors;