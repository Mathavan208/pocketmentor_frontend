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
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    const fetchDashboardData = async () => {
      try {
        const statsResponse = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data || {});
        }
        
        const usersResponse = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.data || []);
        }
        
        const paymentsResponse = await fetch('/api/admin/payments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData.data || []);
        }
        
        const enrollmentsResponse = await fetch('/api/admin/enrollments', {
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
      const response = await fetch(`/api/admin/users/${userId}/role`, {
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
        const coursePrice = enrollment.course?.price || 0;
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
    <div className="min-h-screen py-4 bg-gradient-to-b from-deep-blue/10 to-white md:py-12">
      <div className="container px-4 mx-auto">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl font-bold md:text-3xl text-deep-blue">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600 md:text-base">Manage your educational platform</p>
          </div>
          
          {/* Mobile Navigation */}
          <div className="mb-6 md:hidden">
            <div className="flex pb-2 space-x-2 overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
                { id: 'users', label: 'Users', icon: <FaUsers /> },
                { id: 'courses', label: 'Courses', icon: <FaBook /> },
                { id: 'enrollments', label: 'Enrollments', icon: <FaList /> },
                { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-deep-blue text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden mb-6 space-x-4 md:flex">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
              { id: 'users', label: 'Users', icon: <FaUsers /> },
              { id: 'courses', label: 'Courses', icon: <FaBook /> },
              { id: 'enrollments', label: 'Enrollments', icon: <FaList /> },
              { id: 'payments', label: 'Payments', icon: <FaMoneyBillWave /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-deep-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards - Responsive Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4 md:gap-6">
                <div className="p-4 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
                  <div className="flex items-center">
                    <div className="p-3 mr-4 text-blue-600 bg-blue-100 rounded-full md:p-4">
                      <FaUsers className="text-xl md:text-2xl" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 md:text-sm">Total Users</p>
                      <p className="text-xl font-bold md:text-2xl">{totalUsers}</p>
                      <div className="hidden mt-1 text-xs text-green-500 md:block">
                        <span>↑ 12%</span> from last month
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
                  <div className="flex items-center">
                    <div className="p-3 mr-4 text-purple-600 bg-purple-100 rounded-full md:p-4">
                      <FaBook className="text-xl md:text-2xl" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 md:text-sm">Total Courses</p>
                      <p className="text-xl font-bold md:text-2xl">{totalCourses}</p>
                      <div className="hidden mt-1 text-xs text-green-500 md:block">
                        <span>↑ 3</span> new this month
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
                  <div className="flex items-center">
                    <div className="p-3 mr-4 text-green-600 bg-green-100 rounded-full md:p-4">
                      <FaChalkboardTeacher className="text-xl md:text-2xl" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 md:text-sm">Total Workshops</p>
                      <p className="text-xl font-bold md:text-2xl">{totalWorkshops}</p>
                      <div className="hidden mt-1 text-xs text-green-500 md:block">
                        <span>↑ 2</span> new this month
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
                  <div className="flex items-center">
                    <div className="p-3 mr-4 text-yellow-600 bg-yellow-100 rounded-full md:p-4">
                      <FaMoneyBillWave className="text-xl md:text-2xl" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 md:text-sm">Total Revenue</p>
                      <p className="text-xl font-bold md:text-2xl">₹{totalRevenue}</p>
                      <div className="hidden mt-1 text-xs text-green-500 md:block">
                        <span>↑ 24%</span> from last month
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Revenue Overview */}
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                <div className="p-4 bg-white shadow-lg rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 md:text-lg">Revenue Overview</h3>
                    <FaMoneyBillWave className="hidden text-green-500 md:block" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 md:text-sm">Total Revenue</span>
                      <span className="text-sm font-bold text-green-600 md:text-base">₹{totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 md:text-sm">Pending Revenue</span>
                      <span className="text-sm font-bold text-yellow-600 md:text-base">₹{pendingRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 md:text-sm">Total Enrollments</span>
                      <span className="text-sm font-bold text-blue-600 md:text-base">{totalEnrollments}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white shadow-lg rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 md:text-lg">Payment Status</h3>
                    <FaCheckCircle className="hidden text-green-500 md:block" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 md:text-sm">Paid</span>
                      <span className="text-sm font-bold text-green-600 md:text-base">{paidEnrollments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 md:text-sm">Pending</span>
                      <span className="text-sm font-bold text-yellow-600 md:text-base">{pendingEnrollments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 md:text-sm">Failed</span>
                      <span className="text-sm font-bold text-red-600 md:text-base">{failedEnrollments}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white shadow-lg rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 md:text-lg">Quick Actions</h3>
                    <FaUserCog className="hidden text-purple-500 md:block" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <Link to="/admin/enrollments" className="block w-full px-3 py-2 text-xs text-center text-white transition-colors bg-blue-500 rounded-lg md:text-sm hover:bg-blue-600 md:w-auto">
                      Manage Enrollments
                    </Link>
                    <Link to="/admin/courses" className="block w-full px-3 py-2 text-xs text-center text-white transition-colors bg-purple-500 rounded-lg md:text-sm hover:bg-purple-600 md:w-auto">
                      Manage Courses
                    </Link>
                    <Link to="/admin/users" className="block w-full px-3 py-2 text-xs text-center text-white transition-colors bg-green-500 rounded-lg md:text-sm hover:bg-green-600 md:w-auto">
                      Manage Users
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Recent Users */}
              <div className="p-4 bg-white shadow-lg rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center text-lg font-bold md:text-xl text-deep-blue">
                    <FaUsers className="mr-2" /> Recent Users
                  </h2>
                  <Link to="/admin/users" className="text-xs font-medium md:text-sm text-purple-blue hover:text-deep-blue">
                    View All Users →
                  </Link>
                </div>
                
                {/* Mobile Users List */}
                <div className="space-y-3 md:hidden">
                  {users.slice(0, 3).map((user) => (
                    <div key={user._id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8">
                          <div className="flex items-center justify-center w-8 h-8 text-white rounded-full bg-deep-blue">
                            {user.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          <div className="mt-1">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop Users Table */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">User</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Role</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Joined</th>
                          <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.slice(0, 5).map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
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
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
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
              </div>
            </>
          )}
          
          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <div className="p-4 bg-white shadow-lg rounded-xl">
              <h2 className="mb-4 text-lg font-bold md:text-xl text-deep-blue">User Management</h2>
              {/* Mobile users list would go here */}
              <div className="space-y-3 md:hidden">
                {users.map((user) => (
                  <div key={user._id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8">
                          <div className="flex items-center justify-center w-8 h-8 text-white rounded-full bg-deep-blue">
                            {user.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                        className="text-xs border border-gray-300 rounded"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
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
          )}
          
          {/* Other tab content would be added similarly */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;