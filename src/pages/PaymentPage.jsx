import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getCourses } from '../services/courseService';
import { createOrder, verifyPayment } from '../services/paymentService';
import { FaArrowLeft, FaCreditCard, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const PaymentPage = () => {
  const { token, user } = useUser();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          setRazorpayLoaded(true);
          resolve();
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          setError('Failed to load payment gateway. Please try again later.');
          resolve();
        };
        document.body.appendChild(script);
      });
    };

    if (token) {
      loadRazorpayScript();
    }
  }, [token]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        console.log('Courses response:', response);
        setCourses(response.data);
        
        // Set first available course as default
        const availableCourses = response.data.filter(course => course.status === 'available');
        if (availableCourses.length > 0) {
          setSelectedCourse(availableCourses[0]._id);
          console.log('Default course selected:', availableCourses[0]._id);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token]);

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setError('');
  };

  const handlePayment = async () => {
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    if (!razorpayLoaded) {
      setError('Payment gateway is still loading. Please wait.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      console.log('Creating order for course:', selectedCourse);
      
      // Create payment order
      const orderData = await createOrder(selectedCourse, token);
      console.log('Order creation response:', orderData);
      
      if (!orderData.data || !orderData.data.success) {
        throw new Error(orderData.data?.message || 'Failed to create order');
      }
      
      setOrderId(orderData.data.orderId);
      
      // Configure Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Pocket Mentor",
        description: `Payment for ${orderData.data.courseName}`,
        image: "https://your-logo.com/logo.png",
        order_id: orderData.data.orderId,
        handler: async (response) => {
          console.log('Payment response:', response);
          try {
            // Verify payment
            const verification = await verifyPayment(selectedCourse, {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            }, token);
            
            console.log('Payment verification response:', verification);
            
            if (verification.data.success) {
              setSuccess(true);
              setTimeout(() => {
                navigate('/profile');
              }, 3000);
            } else {
              setError('Payment verification failed');
              setProcessing(false);
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError('Payment verification failed');
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: ''
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            console.log('Payment modal dismissed');
          }
        },
        // Add timeout handling
        timeout: 300000, // 5 minutes
        retry: {
          enabled: true,
          max_count: 1
        }
      };
      
      console.log('Razorpay options:', options);
      
      // Create Razorpay instance
      const rzp = new window.Razorpay(options);
      
      // Add event listeners
      rzp.on('payment.success', function (payment) {
        console.log('Payment success event:', payment);
        // This will be handled by the handler function
      });
      
      rzp.on('payment.error', function (error) {
        console.error('Payment error event:', error);
        setError('Payment failed: ' + error.error.description);
        setProcessing(false);
      });
      
      rzp.on('payment.dismiss', function () {
        console.log('Payment dismissed event');
        setProcessing(false);
      });
      
      // Open Razorpay modal
      rzp.open();
      
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to initialize payment');
      setProcessing(false);
    }
  };

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

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="w-full max-w-md p-8 text-center bg-white shadow-xl rounded-xl">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mb-6 text-gray-600">Please login to make a payment</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-white rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="w-full max-w-md p-8 text-center bg-white shadow-xl rounded-xl">
          <div className="flex justify-center mb-4">
            <div className="p-4 text-green-500 bg-green-100 rounded-full">
              <FaCheckCircle className="text-4xl" />
            </div>
          </div>
          <h2 className="mb-4 text-2xl font-bold text-green-600">Payment Successful!</h2>
          <p className="mb-6 text-gray-600">
            You have been successfully enrolled in the course. You will be redirected to your profile shortly.
          </p>
          <div className="text-sm text-gray-500">
            Order ID: {orderId}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-deep-blue/10 to-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center mb-8 text-purple-blue hover:text-deep-blue"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          
          {/* Payment Card */}
          <div className="p-8 bg-white shadow-lg rounded-xl">
            <div className="flex items-center mb-8">
              <div className="p-3 mr-4 text-blue-600 bg-blue-100 rounded-full">
                <FaCreditCard className="text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-deep-blue">Course Payment</h1>
            </div>
            
            {error && (
              <div className="flex items-center p-4 mb-6 text-red-700 bg-red-100 rounded-lg">
                <FaExclamationCircle className="mr-2" />
                {error}
              </div>
            )}
            
            {/* Course Selection */}
            <div className="mb-8">
              <label className="block mb-2 font-medium text-gray-700">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={handleCourseChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue"
                disabled={processing}
              >
                <option value="">Choose a course</option>
                {courses
                  .filter(course => course.status === 'available')
                  .map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title} - ₹{course.price}
                    </option>
                  ))}
              </select>
            </div>
            
            {/* Selected Course Details */}
            {selectedCourse && (
              <div className="p-6 mb-8 border border-gray-200 rounded-lg">
                {(() => {
                  const course = courses.find(c => c._id === selectedCourse);
                  return course ? (
                    <>
                      <h3 className="mb-2 text-xl font-bold text-deep-blue">{course.title}</h3>
                      <p className="mb-4 text-gray-600">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-700">Course Price:</span>
                        <span className="text-2xl font-bold text-deep-blue">₹{course.price}</span>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
            )}
            
            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={processing || !selectedCourse || !razorpayLoaded}
              className="w-full py-3 font-bold text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-deep-blue to-purple-blue hover:from-purple-blue hover:to-light-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : !razorpayLoaded ? (
                'Loading Payment Gateway...'
              ) : (
                'Pay Now'
              )}
            </button>
            
            {/* Payment Gateway Status */}
            {!razorpayLoaded && (
              <div className="mt-4 text-sm text-center text-gray-500">
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 mr-2 border-b-2 border-gray-400 rounded-full animate-spin"></div>
                  Loading payment gateway...
                </div>
              </div>
            )}
            
            {/* Security Note */}
            <div className="mt-6 text-sm text-center text-gray-500">
              <p>Secure payment powered by Razorpay</p>
              <p className="mt-1">Your payment information is encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;