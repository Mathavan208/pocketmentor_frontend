import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { FaUser, FaLock } from 'react-icons/fa';
import { useRef } from 'react';
import gsap from 'gsap';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useUser();
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);
  const logoRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Animate header on load
  useEffect(() => {
    gsap.fromTo(
      '.nav-link',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  // Enhanced hover animations
  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;
    const handleMouseEnter = () => {
      gsap.to(logo, {
        scale: 1.15,
        duration: 0.4,
        ease: 'power2.out'
      });
    };
    const handleMouseLeave = () => {
      gsap.to(logo, {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    };
    logo.addEventListener('mouseenter', handleMouseEnter);
    logo.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      logo.removeEventListener('mouseenter', handleMouseEnter);
      logo.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    
    if (!isMenuOpen) {
      gsap.fromTo(
        navRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  };

  const handleInstructorClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('instructors');
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('footer');
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/courses', label: 'Courses' },
    { path: '/instructors', label: 'Instructors' },
    {path:'/workshops',label:'Workshops'},
    { path: '/contact', label: 'Contact' },
    ...(user && user.role === 'admin' ? [{ path: '/admin', label: 'Admin' }] : []),
    ...(user ? [{ path: '/profile', label: 'Profile' }] : [])
  ];

  return (
    <header 
      ref={headerRef}
      className={`bg-gradient-to-r from-deep-blue to-purple-blue text-white shadow-lg sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2 shadow-xl' : 'py-4'
      }`}
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 transition-opacity hover:opacity-90 group">
              <div className="relative">
                <img 
                  ref={logoRef}
                  src="https://i.postimg.cc/x84Hfvhn/logo.jpg" 
                  alt="Pocket Mentor Logo"
                  className="object-contain w-auto h-16 transition-all shadow-lg duration-400 rounded-2xl group-hover:shadow-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                {/* Fallback text if image fails to load */}
                <span className="hidden text-2xl font-bold text-white">Pocket Mentor</span>
              </div>
              
              {/* Title with enhanced styling */}
              <div className="transition-all duration-400">
                <h1 className="text-3xl font-bold leading-tight text-white">
                  <span className="block">Pocket</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-light-purple to-light-blue">
                    Mentor
                  </span>
                </h1>
                <p className="mt-2 text-sm font-medium tracking-wide text-light-blue">
                  Your Tech Learning Partner
                </p>
              </div>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-8 md:flex">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  if (item.label === 'Instructors' && location.pathname === '/') {
                    handleInstructorClick(e);
                  } else if (item.label === 'Contact' && location.pathname === '/') {
                    handleContactClick(e);
                  }
                }}
                className={`nav-link transition-colors duration-300 text-lg font-medium ${
                  location.pathname === item.path && item.label !== 'Contact'
                    ? 'text-light-purple'
                    : 'hover:text-light-purple'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={toggleMenu}
            className="md:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <nav
            ref={navRef}
            className="p-4 mt-2 border rounded-md md:hidden bg-white/10 backdrop-blur-sm border-white/20"
          >
            <ul className="flex flex-col space-y-3">
              {navItems.map((item, index) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      if (item.label === 'Instructors' && location.pathname === '/') {
                        handleInstructorClick(e);
                        setIsMenuOpen(false);
                      } else if (item.label === 'Contact' && location.pathname === '/') {
                        handleContactClick(e);
                        setIsMenuOpen(false);
                      } else {
                        setIsMenuOpen(false);
                      }
                    }}
                    className={`block px-4 py-2 rounded-lg transition-colors duration-300 text-lg font-medium ${
                      location.pathname === item.path && item.label !== 'Contact'
                        ? 'bg-white/20 text-light-purple'
                        : 'hover:bg-white/10 hover:text-light-purple'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

// Add the missing import at the top

export default Header;