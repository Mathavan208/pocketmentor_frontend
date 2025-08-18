import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const InstructorCard = ({ instructor }) => {
  const cardRef = useRef(null);
  const contentRef = useRef(null);
  const nameRef = useRef(null);
  const professionRef = useRef(null);
  const bioRef = useRef(null);
  const linkedinRef = useRef(null);
  const linkedinIconRef = useRef(null);
  
  // Entrance animation
  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out' }
    );
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
    );
    gsap.fromTo(
      nameRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, delay: 0.3, ease: 'power2.out' }
    );
    gsap.fromTo(
      professionRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, delay: 0.4, ease: 'power2.out' }
    );
    gsap.fromTo(
      bioRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, delay: 0.5, ease: 'power2.out' }
    );
    gsap.fromTo(
      linkedinRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.5, delay: 0.6, ease: 'back.out(1.7)' }
    );
    // LinkedIn icon entrance animation
    gsap.fromTo(
      linkedinIconRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.7, ease: 'power2.out' }
    );
  }, []);
  
  // Hover animations
  const handleMouseEnter = (e) => {
    gsap.to(cardRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
      boxShadow: '0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.1)'
    });
    gsap.to(contentRef.current, {
      y: -5,
      duration: 0.3,
      ease: 'power2.out'
    });
    gsap.to(nameRef.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: 'power2.out'
    });
    gsap.to(professionRef.current, {
      color: '#e0e7ff',
      duration: 0.2,
      ease: 'power2.out'
    });
    gsap.to(bioRef.current, {
      color: '#f3f4f6',
      duration: 0.2,
      ease: 'power2.out'
    });
    gsap.to(linkedinRef.current, {
      scale: 1.2,
      duration: 0.2,
      ease: 'power2.out'
    });
    // LinkedIn icon hover animation
    gsap.to(linkedinIconRef.current, {
      scale: 1.1,
      rotate: 5,
      duration: 0.3,
      ease: 'power2.out'
    });
  };
  
  const handleMouseLeave = (e) => {
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    });
    gsap.to(contentRef.current, {
      y: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
    gsap.to(nameRef.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: 'power2.out'
    });
    gsap.to(professionRef.current, {
      color: '#e0e7ff',
      duration: 0.2,
      ease: 'power2.out'
    });
    gsap.to(bioRef.current, {
      color: '#f3f4f6',
      duration: 0.2,
      ease: 'power2.out'
    });
    gsap.to(linkedinRef.current, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out'
    });
    // LinkedIn icon reset animation
    gsap.to(linkedinIconRef.current, {
      scale: 1,
      rotate: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  return (
    <div 
      ref={cardRef}
      className="relative overflow-hidden transition-all duration-300 transform cursor-pointer h-96 rounded-2xl group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundImage: `linear-gradient(rgba(26, 42, 128, 0.7), rgba(59, 56, 160, 0.8)), url(${instructor.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      
      {/* Content */}
      <div ref={contentRef} className="relative z-10 flex flex-col justify-between h-full p-8">
        {/* Top section */}
        <div>
          <h3 
            ref={nameRef}
            className="mb-2 text-2xl font-bold text-white transition-colors duration-300"
          >
            {instructor.name}
          </h3>
          <p 
            ref={professionRef}
            className="mb-4 text-lg text-purple-200 transition-colors duration-300"
          >
            {instructor.profession}
          </p>
        </div>
        
        {/* Bio section */}
        <div className="mb-6">
          <p 
            ref={bioRef}
            className="text-sm leading-relaxed text-gray-100 transition-colors duration-300"
          >
            {instructor.bio}
          </p>
        </div>
        
        {/* LinkedIn Link at bottom */}
        <div className="flex justify-end">
          <a 
            ref={linkedinRef}
            href={instructor.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-300 transform text-white/80 hover:text-white"
            title="View LinkedIn Profile"
          >
            <div ref={linkedinIconRef} className="relative">
              {/* LinkedIn Logo Background */}
              <div className="absolute inset-0 transition-opacity duration-300 rounded-full opacity-0 bg-white/20 group-hover:opacity-30"></div>
              
              {/* Official LinkedIn Logo SVG */}
              <svg 
                className="relative z-10 w-12 h-12" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default InstructorCard;