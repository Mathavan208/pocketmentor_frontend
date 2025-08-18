import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminWorkshops = () => {
  const { token } = useContext(UserContext);
  const [workshops, setWorkshops] = useState([]);
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
          setWorkshops(workshopsData.data);
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
          setWorkshops(workshops.filter(workshop => workshop._id !== id));
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
                  setWorkshops(workshops.map(w => w._id === workshopData._id ? workshopData : w));
                } else {
                  setWorkshops([...workshops, workshopData]);
                }
                setShowForm(false);
              }}
            />
          )}
          
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
        </div>
      </div>
    </div>
  );
};

// AdminWorkshopForm component
const AdminWorkshopForm = ({ workshop, onClose, onSave }) => {
  const [title, setTitle] = useState(workshop ? workshop.title : '');
  const [description, setDescription] = useState(workshop ? workshop.description : '');
  const [image, setImage] = useState(workshop ? workshop.image : '');
  const [level, setLevel] = useState(workshop ? workshop.level : '');
  const [prerequisites, setPrerequisites] = useState(workshop ? workshop.prerequisites : '');
  const [topics, setTopics] = useState(workshop ? workshop.topics.join(', ') : '');
  const [schedule, setSchedule] = useState(workshop ? workshop.schedule : [{ title: '', duration: '', description: '' }]);
  const [status, setStatus] = useState(workshop ? workshop.status : 'available');
  const [registrationLink, setRegistrationLink] = useState(workshop ? workshop.registrationLink : '');
  const [price, setPrice] = useState(workshop ? workshop.price : 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const workshopData = {
        title,
        description,
        image,
        level,
        prerequisites,
        topics: topics.split(',').map(topic => topic.trim()),
        schedule,
        status,
        registrationLink,
        price: parseFloat(price) || 0
      };
      
      const url = workshop ? `${API_URL}/admin/workshops/${workshop._id}` : `${API_URL}/admin/workshops`;
      const method = workshop ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(workshopData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save workshop');
      }
      
      const savedWorkshop = await response.json();
      onSave(savedWorkshop);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const addScheduleItem = () => {
    setSchedule([...schedule, { title: '', duration: '', description: '' }]);
  };
  
  const updateScheduleItem = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white shadow-xl rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-deep-blue">
              {workshop ? 'Edit Workshop' : 'Create New Workshop'}
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
                  Workshop Title
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
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="price">
                  Workshop Price ($)
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
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="image">
                  Workshop Image URL
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
                <label className="block mb-2 text-gray-700" htmlFor="level">
                  Level
                </label>
                <input
                  id="level"
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  required
                />
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
                <label className="block mb-2 text-gray-700" htmlFor="prerequisites">
                  Prerequisites
                </label>
                <textarea
                  id="prerequisites"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="topics">
                  Topics (comma separated)
                </label>
                <input
                  id="topics"
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
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
              
              <div>
                <label className="block mb-2 text-gray-700" htmlFor="registrationLink">
                  Registration Link
                </label>
                <input
                  id="registrationLink"
                  type="text"
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                />
              </div>
            </div>
            
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-deep-blue">Schedule</h3>
                <button
                  type="button"
                  onClick={addScheduleItem}
                  className="px-4 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
                >
                  Add Session
                </button>
              </div>
              
              {schedule.map((session, index) => (
                <div key={index} className="p-4 mb-6 border border-gray-200 rounded-lg">
                  <h4 className="mb-3 font-semibold text-deep-blue">Session {index + 1}</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="block mb-1 text-gray-700" htmlFor={`session-title-${index}`}>
                        Title
                      </label>
                      <input
                        id={`session-title-${index}`}
                        type="text"
                        value={session.title}
                        onChange={(e) => updateScheduleItem(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-700" htmlFor={`session-duration-${index}`}>
                        Duration
                      </label>
                      <input
                        id={`session-duration-${index}`}
                        type="text"
                        value={session.duration}
                        onChange={(e) => updateScheduleItem(index, 'duration', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-700" htmlFor={`session-description-${index}`}>
                        Description
                      </label>
                      <input
                        id={`session-description-${index}`}
                        type="text"
                        value={session.description}
                        onChange={(e) => updateScheduleItem(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                      />
                    </div>
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
                {loading ? 'Saving...' : 'Save Workshop'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkshops;