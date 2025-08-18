import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { getWorkshopById } from '../services/workshopService';
import PageTitle from '../components/PageTitle';

const WorkshopDetail = () => {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [activeTopic, setActiveTopic] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const topicsRef = useRef(null);
  const scheduleRef = useRef(null);
  const infoRef = useRef(null);

  // Add page title
  useEffect(() => {
    if (workshop) {
      document.title = `${workshop.title} - Pocket Mentor`;
    }
  }, [workshop]);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const response = await getWorkshopById(id);
        setWorkshop(response.data);
        setActiveTopic(0);
      } catch (err) {
        setError(err.response?.data?.message || 'Workshop not found');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [id]);

  useEffect(() => {
    if (workshop && !loading) {
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
        topicsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.6, ease: 'power2.out' }
      );
      gsap.fromTo(
        scheduleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: 'power2.out' }
      );
      gsap.fromTo(
        infoRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 1, ease: 'power2.out' }
      );
    }
  }, [workshop, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="text-white">Loading workshop details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="w-full max-w-md p-8 text-center bg-white shadow-xl rounded-xl">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Workshop Not Found</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <Link to="/workshops" className="inline-block px-6 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue">
            Back to Workshops
          </Link>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return null;
  }

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-b from-deep-blue/10 to-white">
      <PageTitle title={workshop.title} />
      <div className="container px-4 mx-auto">
        <Link 
          to="/workshops" 
          className="inline-flex items-center mb-8 transition-colors text-purple-blue hover:text-deep-blue"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Workshops
        </Link>
        
        <div className="grid grid-cols-1 gap-12 mb-16 lg:grid-cols-2">
          <div ref={imageRef}>
            <div className="overflow-hidden shadow-2xl rounded-xl">
              <img 
                src={workshop.image} 
                alt={workshop.title}
                className="object-cover w-full h-80"
              />
            </div>
          </div>
          
          <div ref={contentRef}>
            {/* Status Badge */}
            <div className="flex items-center mb-4">
              {workshop.status === 'available' ? (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                  Upcoming
                </span>
              )}
            </div>
            
            <h1 className="mb-4 text-4xl font-bold text-deep-blue">{workshop.title}</h1>
            <p className="mb-8 text-xl text-gray-600">{workshop.description}</p>
            
            {/* Key Information */}
            <div className="mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-50">
                  <h3 className="font-semibold text-deep-blue">Level</h3>
                  <p className="text-gray-700">{workshop.level}</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50">
                  <h3 className="font-semibold text-deep-blue">Prerequisites</h3>
                  <p className="text-gray-700">{workshop.prerequisites}</p>
                </div>
              </div>
            </div>
            
            {/* Important Information for Learners */}
            <div ref={infoRef} className="p-6 mb-8 border border-blue-100 bg-blue-50 rounded-xl">
              <h3 className="mb-4 text-lg font-bold text-deep-blue">Important Information for Learners:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 mr-3 text-sm font-bold text-white bg-blue-500 rounded-full">
                    1
                  </span>
                  <span className="text-gray-700">Live sessions will be recorded and available for 30 days.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 mr-3 text-sm font-bold text-white bg-blue-500 rounded-full">
                    2
                  </span>
                  <span className="text-gray-700">All participants will receive a certificate of completion.</span>
                </li>
              </ul>
            </div>
            
            {workshop.status === 'available' ? (
              <a 
                href={workshop.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-8 py-3 font-bold text-center text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue md:w-auto"
              >
                Register Now
              </a>
            ) : (
              <div className="inline-block p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="font-medium text-yellow-800">
                  Registration opens on {workshop.launchDate}!
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div ref={topicsRef} className="p-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-6 text-2xl font-bold text-deep-blue">Workshop Topics</h2>
            <div className="space-y-4">
              {workshop.topics.map((topic, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    activeTopic === index 
                      ? 'bg-deep-blue text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTopic(index)}
                >
                  <h3 className="font-semibold">Topic {index + 1}: {topic}</h3>
                </div>
              ))}
            </div>
          </div>
          
          <div ref={scheduleRef} className="p-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-6 text-2xl font-bold text-deep-blue">Workshop Schedule</h2>
            
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Session Details:</h3>
              <div className="space-y-4">
                {workshop.schedule.map((session, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-deep-blue">Session {index + 1}</span>
                      <span className="text-sm text-gray-500">{session.duration}</span>
                    </div>
                    <p className="mb-2 text-gray-700">{session.title}</p>
                    <p className="text-sm text-gray-600">{session.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 mt-6 rounded-lg bg-blue-50">
              <h4 className="mb-2 font-semibold text-deep-blue">What You'll Learn</h4>
              <p className="text-sm text-gray-600">
                By the end of this workshop, you'll have a comprehensive understanding of {workshop.title} 
                and be able to create stunning animations for your projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkshopDetail;