import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useUser } from '../context/UserContext';
import { enrollWorkshop } from '../services/workshopService';
import { useState } from 'react';

const WorkshopCard = ({ workshop }) => {
  const { token } = useUser();
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  
  const handleMouseEnter = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  const handleMouseLeave = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  
  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    setEnrolling(true);
    setError('');
    
    try {
      await enrollWorkshop(workshop._id);
      alert('Enrolled successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };
  
  const getStatusColor = () => {
    return workshop.status === 'available' ? 'bg-green-500' : 'bg-yellow-500';
  };
  const getStatusText = () => {
    return workshop.status === 'available' ? 'Available' : 'Upcoming';
  };
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl ${
        workshop.status === 'upcoming' ? 'opacity-80' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={workshop.image} 
          alt={workshop.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()} text-white`}>
            {getStatusText()}
          </span>
          {workshop.status === 'upcoming' && (
            <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
              {workshop.launchDate}
            </span>
          )}
        </div>
        
        <h3 className="mb-2 text-xl font-bold text-deep-blue">{workshop.title}</h3>
        <p className="mb-4 text-gray-600">{workshop.description}</p>
        
        {/* Price Display */}
        <div className="p-3 mb-4 rounded-lg bg-gray-50">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price:</span>
            <span className="font-medium">
              {workshop.price === 0 ? 'Free' : `$${workshop.price.toFixed(2)}`}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="mb-2 font-semibold text-deep-blue">Workshop Topics:</h4>
          <div className="flex flex-wrap gap-2">
            {workshop.topics.slice(0, 3).map((topic, index) => (
              <span key={index} className="bg-deep-blue text-white text-xs font-medium px-2.5 py-0.5 rounded">
                {topic}
              </span>
            ))}
            {workshop.topics.length > 3 && (
              <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded">
                +{workshop.topics.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          {workshop.status === 'available' ? (
            <>
              <Link 
                to={`/workshops/${workshop._id}`}
                className="flex-1 px-4 py-2 text-center text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
              >
                View Details
              </Link>
              {token ? (
                <button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="flex-1 px-4 py-2 text-center text-white transition-all duration-300 bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Register Now'}
                </button>
              ) : (
                <a 
                  href="/login"
                  className="flex-1 px-4 py-2 text-center text-white transition-all duration-300 bg-green-500 rounded-lg hover:bg-green-600"
                >
                  Login to Register
                </a>
              )}
            </>
          ) : (
            <>
              <Link 
                to={`/workshops/${workshop._id}`}
                className="flex-1 px-4 py-2 text-center text-gray-700 bg-gray-300 rounded-lg"
              >
                View Details
              </Link>
              <button 
                className="flex-1 px-4 py-2 text-gray-500 bg-gray-300 rounded-lg cursor-not-allowed"
                disabled
              >
                Coming Soon
              </button>
            </>
          )}
        </div>
        
        {error && (
          <div className="p-2 mt-3 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopCard;