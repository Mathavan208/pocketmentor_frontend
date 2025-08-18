import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { getInstructors } from '../services/instructorService';
import InstructorCard from '../components/InstructorCard';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';

const Home = () => {
  // Add page title
  useEffect(() => {
    document.title = 'Home - Pocket Mentor';
  }, []);
  
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const infoRef = useRef(null);
  const motiveRef = useRef(null);
  const instructorsRef = useRef(null);
  
  
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [instructorsResponse] = await Promise.all([
         
          getInstructors()
        ]);
        
        
        setInstructors(instructorsResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out' }
      );
      gsap.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.6, ease: 'power2.out' }
      );
      gsap.fromTo(
        buttonRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.9, ease: 'power2.out' }
      );
      gsap.fromTo(
        infoRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 1.2, ease: 'power2.out' }
      );
      gsap.fromTo(
        motiveRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 1.5, ease: 'power2.out' }
      );
      gsap.fromTo(
        instructorsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 1.8, ease: 'power2.out' }
      );
    }
  }, [loading, error]);

  const technologies = [
    "Java",
    "SQL",
    "Python",
    "React.js",
    "Node js",
    "tailwind css",
    "javascript",
    "last min interview prep"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="text-white">Loading...</p>
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
    <div>
      <PageTitle title="Home" />
      
      {/* Hero Section */}
      <div ref={heroRef} className="relative flex items-center justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-deep-blue via-purple-blue to-light-blue to-light-purple opacity-90"></div>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Animated background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute rounded-full -top-40 -right-32 w-80 h-80 bg-purple-blue mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute rounded-full -bottom-8 -left-32 w-80 h-80 bg-light-blue mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-80 h-80 bg-light-purple mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10 max-w-4xl px-4 py-20 mx-auto text-center">
          <h1 
            ref={titleRef}
            className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl"
          >
            <span className="block">Empowering Your Future</span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-light-purple to-light-blue">
              Through Technical Excellence
            </span>
          </h1>
          
          <p ref={subtitleRef} className="mb-10 text-xl text-white">
            Fast-track training programs for freshers to tech leaders
          </p>
          
          <div 
            ref={buttonRef}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Link 
              to="/courses"
              className="inline-block px-8 py-3 font-bold text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue hover:scale-105"
            >
              Explore Courses
            </Link>
            <Link 
              to="/instructors"
              className="inline-block px-8 py-3 font-bold text-white transition-all duration-300 transform border-2 border-white rounded-lg hover:bg-white hover:text-deep-blue hover:scale-105"
            >
              Meet Instructors
            </Link>
          </div>
        </div>
      </div>
      
      {/* Important Information Section */}
      <section ref={infoRef} className="py-12 bg-gradient-to-b from-white to-deep-blue/5">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl p-8 mx-auto border border-blue-100 shadow-lg bg-blue-50 rounded-xl">
            <h2 className="mb-6 text-2xl font-bold text-center text-deep-blue">Important Information for Learners</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-blue-500 rounded-full">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mb-2 font-bold text-deep-blue">Class Timings</h3>
                <p className="text-gray-700">All sessions after 6:00 PM and before 10:00 PM.</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-blue-500 rounded-full">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mb-2 font-bold text-deep-blue">After Payment</h3>
                <p className="text-gray-700">Complete course details via email.</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-blue-500 rounded-full">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="mb-2 font-bold text-deep-blue">WhatsApp Group</h3>
                <p className="text-gray-700">Added to course group for updates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Motive Section */}
      <section ref={motiveRef} className="py-16 bg-gradient-to-b from-white to-deep-blue/10">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl text-deep-blue">
                From Freshers to Future Tech Leaders
              </h2>
              <p className="mb-6 text-xl font-medium text-purple-blue">
                Our Fast-Track Training Program
              </p>
            </div>
            
            <div className="p-8 mb-12 bg-white shadow-lg rounded-xl">
              <div className="mb-8">
                <h3 className="mb-4 text-2xl font-bold text-deep-blue">Fresh to college or still figuring this out on technical topics?</h3>
                <p className="mb-6 text-lg text-gray-700">
                  We're launching a 2-Week fast-track training program where you can master any of the following technologies and courses:
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {technologies.map((tech, index) => (
                    <span 
                      key={index}
                      className="px-6 py-3 font-medium text-white rounded-full shadow-lg bg-gradient-to-r from-deep-blue to-purple-blue"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                
                <p className="text-lg text-gray-700">
                  Let us lay the foundations strong! Short courses, daily tests and home work tasks. Gain the knowledge that will help you prepare for what's ahead!
                </p>
              </div>
              
              <Link 
                to="/courses"
                className="inline-block px-8 py-3 font-bold text-white transition-all duration-300 transform rounded-lg shadow-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue hover:scale-105"
              >
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Instructors Section */}
      <section id="instructors" ref={instructorsRef} className="py-16 bg-gradient-to-b from-deep-blue/10 to-white">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl text-deep-blue">Meet Our Instructors</h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Learn from experienced educators with real-world experience and a passion for teaching.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {instructors.map((instructor) => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/instructors"
              className="inline-block px-8 py-3 font-bold text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
            >
              View All Instructors
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;