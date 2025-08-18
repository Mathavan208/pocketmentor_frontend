import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { FaUser, FaBook, FaCreditCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getPaymentHistory } from '../services/paymentService';

const AdminPayments = () => {
  const { token } = useContext(UserContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getPaymentHistory(token);
        setPayments(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [token]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading payments...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-red-500">Error: {error}</div>;
  }

  const totalRevenue = payments.reduce((sum, payment) => 
    payment.paymentStatus === 'paid' ? sum + payment.amount : sum, 0
  );

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-deep-blue/10 to-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="mb-8 text-3xl font-bold text-deep-blue">Payment Management</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-blue-600 bg-blue-100 rounded-full">
                  <FaCreditCard className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-green-600 bg-green-100 rounded-full">
                  <FaCheckCircle className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Successful Payments</p>
                  <p className="text-2xl font-bold">{payments.filter(p => p.paymentStatus === 'paid').length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-yellow-600 bg-yellow-100 rounded-full">
                  <FaUser className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Total Payments</p>
                  <p className="text-2xl font-bold">{payments.length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <div className="flex items-center">
                <div className="p-3 mr-4 text-red-600 bg-red-100 rounded-full">
                  <FaTimesCircle className="text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Failed Payments</p>
                  <p className="text-2xl font-bold">{payments.filter(p => p.paymentStatus === 'failed').length}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment History Table */}
          <div className="p-6 bg-white shadow-lg rounded-xl">
            <h2 className="mb-6 text-xl font-bold text-deep-blue">Payment History</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-deep-blue">
                              {payment.user.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{payment.user.name}</div>
                            <div className="text-sm text-gray-500">{payment.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.course.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        ₹{payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.paymentStatus === 'failed' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;