import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useUser } from '../context/UserContext';
import { useState } from 'react';

const CourseCard = ({ course }) => {
  const { token } = useUser();
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [enrolled, setEnrolled] = useState(false);
  
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
      // Create enrollment with pending status
      const response1 = await fetch('/api/admin/enrollments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        for(let i=0;i<response1.length;i++){
          if(response1[i].course==course._id){
            setError( 'Already enrolled in course');
          }
        }
      const response = await fetch(`/api/courses/${course._id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus: 'pending' })
      });
      
      if (response.ok) {
        setEnrolled(true);
        // Redirect to external payment link if it's a paid course
        if (course.price > 0) {
          window.open(course.paymentLink, '_blank');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Enrollment failed');
      }
    } catch (err) {
      setError('Failed to process enrollment');
    } finally {
      setEnrolling(false);
    }
  };
  
  const getStatusColor = () => {
    return course.status === 'available' ? 'bg-green-500' : 'bg-yellow-500';
  };
  
  const getStatusText = () => {
    return course.status === 'available' ? 'Available' : 'Upcoming';
  };
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl ${
        course.status === 'upcoming' ? 'opacity-80' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()} text-white`}>
            {getStatusText()}
          </span>
          {course.status === 'upcoming' && (
            <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
              {course.launchDate}
            </span>
          )}
        </div>
        
        <h3 className="mb-2 text-xl font-bold text-deep-blue">{course.title}</h3>
        <p className="mb-4 text-gray-600">{course.description}</p>
        
        {/* Price Display */}
        <div className="p-3 mb-4 rounded-lg bg-gray-50">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Price:</span>
            <span className="font-medium">
              {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="mb-2 font-semibold text-deep-blue">Course Structure:</h4>
          <div className="flex space-x-2">
            {course.curriculum.map((week, index) => (
              <span key={index} className="bg-deep-blue text-white text-xs font-medium px-2.5 py-0.5 rounded">
                Week {index + 1}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          {course.status === 'available' ? (
            <>
              <Link 
                to={`/courses/${course._id}`}
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
                  {enrolling ? 'Enrolling...' : enrolled ? 'Payment Pending' : 'Enroll Now'}
                </button>
              ) : (
                <a 
                  href="/login"
                  className="flex-1 px-4 py-2 text-center text-white transition-all duration-300 bg-green-500 rounded-lg hover:bg-green-600"
                >
                  Login to Enroll
                </a>
              )}
            </>
          ) : (
            <>
              <Link 
                to={`/courses/${course.id}`}
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
        
        {enrolled && (
          <div className="p-2 mt-3 text-sm text-yellow-700 bg-yellow-100 rounded">
            Enrollment created! Please complete payment if applicable.
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;