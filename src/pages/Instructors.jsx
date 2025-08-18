import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { getInstructors } from '../services/instructorService';
import InstructorCard from '../components/InstructorCard';
import { useState } from 'react';
const Instructors = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const gridRef = useRef(null);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await getInstructors();
        setInstructors(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch instructors');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstructors();
  }, []);
  
  useEffect(() => {
    if (!loading && !error) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      );
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power2.out' }
      );
      gsap.fromTo(
        gridRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 0.4, ease: 'power2.out' }
      );
    }
  }, [loading, error]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="text-white">Loading instructors...</p>
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
    <section ref={sectionRef} className="py-16 bg-gradient-to-b from-white to-deep-blue/10">
      <div className="container px-4 mx-auto">
        <div className="mb-16 text-center" ref={titleRef}>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl text-deep-blue">Our Instructors</h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Learn from industry experts with real-world experience and a passion for teaching.
          </p>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {instructors.map((instructor) => (
            <InstructorCard key={instructor._id} instructor={instructor} />
          ))}
        </div>
        
        {instructors.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <p>No instructors available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Instructors;