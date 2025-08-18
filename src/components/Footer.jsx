import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Footer = () => {
  const { user, logout } = useUser();
  
  const animateFooter = () => {
    gsap.fromTo(
      '.footer-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  };

  return (
    <footer id="footer" className="relative py-12 mt-12 overflow-hidden text-white bg-gradient-to-r from-deep-blue to-purple-blue">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute rounded-full -top-40 -right-32 w-80 h-80 bg-purple-blue mix-blend-overlay filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute rounded-full -bottom-8 -left-32 w-80 h-80 bg-light-blue mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-80 h-80 bg-light-purple mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <div className="container relative z-10 px-4 mx-auto">
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-3">
          {/* Company Info */}
          <div className="footer-item">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-10 h-10 mr-3 bg-white rounded-lg">
                <img 
                  src="https://i.postimg.cc/LsSXKJjf/logo.jpg" 
                  alt="Pocket Mentor Logo"
                  className="object-contain w-auto h-16 transition-all shadow-lg duration-400 rounded-2xl group-hover:shadow-xl"
                />
              </div>
              <h3 className="text-2xl font-bold">Pocket Mentor</h3>
            </div>
            <p className="mb-4 text-light-blue">
              Your affordable gateway to technical excellence. We make quality education accessible to everyone.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white transition-colors hover:text-light-purple">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          {/* Contact Info */}
          <div className="footer-item">
            <h3 className="mb-6 text-xl font-bold">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 mr-3 rounded-lg bg-white/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-light-blue">Email</p>
                  <p>batchpilot@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 mr-3 rounded-lg bg-white/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-light-blue">Phone</p>
                  <p>8072280369</p>
                </div>
              </div>
            </div>
          </div>
          {/* Quick Links */}
          <div className="footer-item">
            <h3 className="mb-6 text-xl font-bold">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="flex items-center transition-colors hover:text-light-purple">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="flex items-center transition-colors hover:text-light-purple">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/instructors" className="flex items-center transition-colors hover:text-light-purple">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Instructors
                </Link>
              </li>
              <li>
                <Link to="/workshops" className="flex items-center transition-colors hover:text-light-purple">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Workshops
                </Link>
              </li>
              <li>
                <Link to="/contact" className="flex items-center transition-colors hover:text-light-purple">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="pt-8 mt-8 text-center border-t border-white/20">
          <p className="text-light-blue">
            &copy; {new Date().getFullYear()} Pocket Mentor. All rights reserved.
          </p>
          <p className="mt-2 text-sm text-light-blue">
            Making quality education affordable and accessible to everyone.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;