import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/courseService';
import CourseCard from '../components/CourseCard';
import PageTitle from '../components/PageTitle';
import { useState } from 'react';
const Courses = () => {
  // Add page title
  useEffect(() => {
    document.title = 'Courses - Pocket Mentor';
  }, []);

  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const availableGridRef = useRef(null);
  const upcomingGridRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        setCourses(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
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

    // Animate Available Courses grid only if it exists and has courses
    if (availableCourses.length > 0 && availableGridRef.current) {
      gsap.fromTo(
        availableGridRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 0.4, ease: 'power2.out' }
      );
    }

    // Animate Upcoming Courses grid only if it exists and has courses
    if (upcomingCourses.length > 0 && upcomingGridRef.current) {
      gsap.fromTo(
        upcomingGridRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 0.6, ease: 'power2.out' }
      );
    }
  }
}, [loading, error, courses]);


  const availableCourses = courses.filter(course => course.status === 'available');
  const upcomingCourses = courses.filter(course => course.status === 'upcoming');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="text-white">Loading courses...</p>
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
    <section ref={sectionRef} className="py-16 bg-gradient-to-b from-deep-blue/10 to-white">
      <PageTitle title="Courses" />
      <div className="container px-4 mx-auto">
        {/* Header Section */}
        <div className="mb-16 text-center" ref={titleRef}>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl text-deep-blue">Our Courses</h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Explore our comprehensive range of technical courses designed to boost your career.
          </p>
        </div>

        {/* Available Courses Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="flex items-center text-2xl font-bold md:text-3xl text-deep-blue">
              <span className="w-3 h-3 mr-3 bg-green-500 rounded-full"></span>
              Available Courses
            </h2>
            <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
              {availableCourses.length} Courses
            </span>
          </div>
          
          {availableCourses?.length > 0 ? (
            <div ref={availableGridRef} className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {availableCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-600">No available courses at the moment.</p>
            </div>
          )}
        </div>

        {/* Upcoming Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="flex text-2xl font-bold md:text-3xl text-deep-blue indicators">
              <span className="w-3 h-3 mr-3 bg-yellow-500 rounded-full"></span>
              Upcoming Courses
            </h2>
            <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
              {upcomingCourses.length} Courses
            </span>
          </div>
          
          {upcomingCourses.length > 0 ? (
            <div ref={upcomingGridRef} className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-600">No upcoming courses scheduled.</p>
            </div>
          )}
        </div>

        {/* Course Statistics */}
        <div className="p-8 mt-16 text-white bg-gradient-to-r from-deep-blue to-purple-blue rounded-xl">
          <h3 className="mb-6 text-2xl font-bold text-center">Course Availability</h3>
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold">{courses.length}</div>
              <p>Total Courses</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">{availableCourses.length}</div>
              <p>Available</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">{upcomingCourses.length}</div>
              <p>Upcoming</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Courses;