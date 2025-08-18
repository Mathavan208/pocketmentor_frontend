import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminWorkshops = () => {
  const { token } = useContext(UserContext);
  const [workshops, setWorkshops] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/admin/workshops`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const workshopsData = await response.json();
          setWorkshops(workshopsData.data || []);
        } else {
          setError('Failed to fetch workshops');
        }
      } catch (err) {
        setError('Failed to fetch workshops');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchWorkshops();
    }
  }, [token]);
  
  const deleteWorkshop = async (id) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/admin/workshops/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setWorkshops(prevWorkshops => prevWorkshops.filter(workshop => workshop._id !== id));
        }
      } catch (err) {
        setError('Failed to delete workshop');
        console.error(err);
      }
    }
  };
  
  const editWorkshop = (workshop) => {
    setEditingWorkshop(workshop);
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
            <h1 className="text-3xl font-bold text-deep-blue">Workshop Management</h1>
            <button
              onClick={() => {
                setEditingWorkshop(null);
                setShowForm(true);
              }}
              className="flex items-center px-4 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
            >
              <FaPlus className="mr-2" /> Add Workshop
            </button>
          </div>
          
          {showForm && (
            <AdminWorkshopForm 
              workshop={editingWorkshop} 
              onClose={() => setShowForm(false)}
              onSave={(workshopData) => {
                if (editingWorkshop) {
                  setWorkshops(prevWorkshops => 
                    prevWorkshops.map(w => w._id === workshopData._id ? workshopData : w)
                  );
                } else {
                  setWorkshops(prevWorkshops => [...prevWorkshops, workshopData]);
                }
                setShowForm(false);
              }}
            />
          )}
          
          {/* Check if workshops array exists and has items */}
          {Array.isArray(workshops) && workshops.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workshops.map((workshop) => (
                <div key={workshop._id} className="overflow-hidden bg-white shadow-lg rounded-xl">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={workshop.image} 
                      alt={workshop.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-deep-blue">{workshop.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        workshop.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {workshop.status}
                      </span>
                    </div>
                    
                    <p className="mb-4 text-gray-600">{workshop.description.substring(0, 100)}...</p>
                    
                    {/* Price Display */}
                    <div className="p-3 mb-4 rounded-lg bg-gray-50">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">
                          {workshop.price === 0 ? 'Free' : `$${workshop.price.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <button
                        onClick={() => editWorkshop(workshop)}
                        className="flex items-center px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => deleteWorkshop(workshop._id)}
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
                <p className="text-lg font-medium">No workshops found</p>
                <p className="text-gray-500">Add your first workshop to get started</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-2 mt-4 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
                >
                  Add Workshop
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// AdminWorkshopForm component remains the same

export default AdminWorkshops;