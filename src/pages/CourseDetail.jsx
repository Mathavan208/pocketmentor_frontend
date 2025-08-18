import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { getCourseById } from '../services/courseService';
import PageTitle from '../components/PageTitle';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const syllabusRef = useRef(null);
  const curriculumRef = useRef(null);
  const infoRef = useRef(null);

  // Add page title
  useEffect(() => {
    if (course) {
      document.title = `${course.title} - Pocket Mentor`;
    }
  }, [course]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCourseById(id);
        setCourse(response.data);
        setActiveWeek(1);
      } catch (err) {
        setError(err.response?.data?.message || 'Course not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (course && !loading) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out' }
      );
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1, delay: 0.2, ease: 'power2.out' }
      );
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 1, delay: 0.4, ease: 'power2.out' }
      );
      gsap.fromTo(
        syllabusRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.6, ease: 'power2.out' }
      );
      gsap.fromTo(
        curriculumRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: 'power2.out' }
      );
      gsap.fromTo(
        infoRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 1, ease: 'power2.out' }
      );
    }
  }, [course, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="text-white">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="w-full max-w-md p-8 text-center bg-white shadow-xl rounded-xl">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Course Not Found</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <Link to="/courses" className="inline-block px-6 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  // Convert syllabus to bullet points with shorter sentences
  const syllabusPoints = course.syllabus.split('. ').filter(point => point.trim() !== '');

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-b from-deep-blue/10 to-white">
      <PageTitle title={course.title} />
      <div className="container px-4 mx-auto">
        <Link 
          to="/courses" 
          className="inline-flex items-center mb-8 transition-colors text-purple-blue hover:text-deep-blue"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Courses
        </Link>
        <div className="grid grid-cols-1 gap-12 mb-16 lg:grid-cols-2">
          <div ref={imageRef}>
            <div className="overflow-hidden shadow-2xl rounded-xl">
              <img 
                src={course.image} 
                alt={course.title}
                className="object-cover w-full h-80"
              />
            </div>
          </div>
          
          <div ref={contentRef}>
            {/* Status Badge */}
            <div className="flex items-center mb-4">
              {course.status === 'available' ? (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  Upcoming
                </span>
              )}
            </div>
            
            <h1 className="mb-4 text-4xl font-bold text-deep-blue">{course.title}</h1>
            <p className="mb-8 text-xl text-gray-600">{course.description}</p>
            
            {/* Important Information for Learners */}
            <div ref={infoRef} className="p-6 mb-8 border border-blue-100 bg-blue-50 rounded-xl">
              <h3 className="mb-4 text-lg font-bold text-deep-blue">Important Information for Learners:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 mr-3 text-sm font-bold text-white bg-blue-500 rounded-full">
                    1
                  </span>
                  <span className="text-gray-700">Class Timings: All sessions after 6:00 PM and before 10:00 PM.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 mr-3 text-sm font-bold text-white bg-blue-500 rounded-full">
                    2
                  </span>
                  <span className="text-gray-700">After Payment: Complete course details via email.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 mr-3 text-sm font-bold text-white bg-blue-500 rounded-full">
                    3
                  </span>
                  <span className="text-gray-700">WhatsApp Group: Added to course group for updates.</span>
                </li>
              </ul>
            </div>
            
            {course.status === 'available' ? (
              <a 
                href={course.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-8 py-3 font-bold text-center text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue md:w-auto"
              >
                Buy Now
              </a>
            ) : (
              <div className="inline-block p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="font-medium text-yellow-800">
                  This course is coming soon! Stay tuned for updates.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div ref={syllabusRef} className="p-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-6 text-2xl font-bold text-deep-blue">Syllabus & Overview</h2>
            <ul className="space-y-3">
              {syllabusPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 mr-3 text-sm font-bold text-white rounded-full bg-deep-blue">
                    {index + 1}
                  </span>
                  <span className={index === 3 ? "font-bold text-gray-800" : "text-gray-700"}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div ref={curriculumRef} className="p-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-6 text-2xl font-bold text-deep-blue">Course Curriculum</h2>
            
            {/* Week Navigation */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Select Week:</h3>
              <div className="flex flex-wrap gap-2">
                {course.curriculum.map((week, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveWeek(index + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeWeek === index + 1
                        ? 'bg-deep-blue text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Week {index + 1}
                  </button>
                ))}
              </div>
            </div>
            {/* Week Content */}
            <div className="pt-6 border-t">
              <h3 className="mb-4 text-xl font-semibold text-deep-blue">
                Week {activeWeek} - Topics
              </h3>
              <div className="space-y-3">
                {course.curriculum[activeWeek - 1]?.topics.map((topic, topicIndex) => (
                  <div key={topicIndex} className="flex items-start">
                    <span className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 mr-4 text-sm font-bold text-white rounded-full bg-deep-blue">
                      {topicIndex + 1}
                    </span>
                    <span className="text-gray-700">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Week Overview */}
            <div className="p-4 mt-8 rounded-lg bg-blue-50">
              <h4 className="mb-2 font-semibold text-deep-blue">Week {activeWeek} Overview</h4>
              <p className="text-sm text-gray-600">
                This week focuses on the fundamental concepts and practical applications 
                needed to build a strong foundation in {course.title}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseDetail;