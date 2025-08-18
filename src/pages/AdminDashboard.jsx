import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { FaUsers, FaBook, FaChalkboardTeacher, FaMoneyBillWave, FaChartLine, FaUserCog, FaList, FaEnvelope, FaCheckCircle, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, token } = useContext(UserContext);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    const fetchDashboardData = async () => {
      try {
         const API_URL = import.meta.env.VITE_API_URL;
        const statsResponse = await fetch(`${API_URL}/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data || {});
        }
        
        const usersResponse = await fetch(`${API_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.data || []);
        }
        
        const paymentsResponse = await fetch(`${API_URL}/admin/payments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData.data || []);
        }
        
        const enrollmentsResponse = await fetch(`${API_URL}/admin/enrollments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();
          setEnrollments(enrollmentsData.data || []);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchDashboardData();
    }
  }, [token, user]);

  const updateUserRole = async (userId, newRole) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update user role');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate revenue from enrollments with paid status
  const calculateRevenue = () => {
    return enrollments
      .filter(enrollment => enrollment.paymentStatus === 'paid')
      .reduce((total, enrollment) => {
        // Get course price from the enrollment's course data
        const coursePrice = enrollment.course?.price || 199;
        return total + coursePrice;
      }, 0);
  };

  // Calculate pending revenue from enrollments with pending status
  const calculatePendingRevenue = () => {
    return enrollments
      .filter(enrollment => enrollment.paymentStatus === 'pending')
      .reduce((total, enrollment) => {
        const coursePrice = enrollment.course?.price || 0;
        return total + coursePrice;
      }, 0);
  };

  // Calculate total revenue
  const totalRevenue = calculateRevenue();
  const pendingRevenue = calculatePendingRevenue();
  const totalUsers = stats.totalUsers || users.length;
  const totalCourses = stats.totalCourses || 0;
  const totalWorkshops = stats.totalWorkshops || 0;

  // Calculate enrollment statistics
  const totalEnrollments = enrollments.length;
  const paidEnrollments = enrollments.filter(e => e.paymentStatus === 'paid').length;
  const pendingEnrollments = enrollments.filter(e => e.paymentStatus === 'pending').length;
  const failedEnrollments = enrollments.filter(e => e.paymentStatus === 'failed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-deep-blue to-purple-blue">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="text-white">Loading dashboard...</p>
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
    <div className="min-h-screen py-12 bg-gradient-to-b from-deep-blue/10 to-white">
      <div className="container px-4 mx-auto">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-deep-blue">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your educational platform</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-blue-600 bg-blue-100 rounded-full">
                  <FaUsers className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <div className="mt-1 text-sm text-green-500">
                    <span>↑ 12%</span> from last month
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-purple-600 bg-purple-100 rounded-full">
                  <FaBook className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Total Courses</p>
                  <p className="text-2xl font-bold">{totalCourses}</p>
                  <div className="mt-1 text-sm text-green-500">
                    <span>↑ 3</span> new this month
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-green-600 bg-green-100 rounded-full">
                  <FaChalkboardTeacher className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Total Workshops</p>
                  <p className="text-2xl font-bold">{totalWorkshops}</p>
                  <div className="mt-1 text-sm text-green-500">
                    <span>↑ 2</span> new this month
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-yellow-600 bg-yellow-100 rounded-full">
                  <FaMoneyBillWave className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{totalRevenue}</p>
                  <div className="mt-1 text-sm text-green-500">
                    <span>↑ 24%</span> from last month
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Revenue Overview</h3>
                <FaMoneyBillWave className="text-2xl text-green-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-bold text-green-600">₹{totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending Revenue</span>
                  <span className="font-bold text-yellow-600">₹{pendingRevenue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Enrollments</span>
                  <span className="font-bold text-blue-600">{totalEnrollments}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Payment Status</h3>
                <FaCheckCircle className="text-2xl text-green-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Paid</span>
                  <span className="font-bold text-green-600">{paidEnrollments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-bold text-yellow-600">{pendingEnrollments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Failed</span>
                  <span className="font-bold text-red-600">{failedEnrollments}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Quick Actions</h3>
                <FaUserCog className="text-2xl text-purple-500" />
              </div>
              <div className="space-y-3">
                <Link to="/admin/enrollments" className="block w-full px-4 py-2 text-center text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
                  Manage Enrollments
                </Link>
                <Link to="/admin/courses" className="block w-full px-4 py-2 text-center text-white transition-colors bg-purple-500 rounded-lg hover:bg-purple-600">
                  Manage Courses
                </Link>
                <Link to="/admin/users" className="block w-full px-4 py-2 text-center text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600">
                  Manage Users
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Users */}
          <div className="p-6 mb-8 bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center text-xl font-bold text-deep-blue">
                <FaUsers className="mr-2" /> Recent Users
              </h2>
              <Link to="/admin/users" className="font-medium text-purple-blue hover:text-deep-blue">
                View All Users →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.slice(0, 5).map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-deep-blue">
                              {user.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Recent Enrollments */}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;