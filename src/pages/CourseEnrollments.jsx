import React from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle, FaRupeeSign } from 'react-icons/fa';

const CourseEnrollments = ({
  course,
  onBack,
  onOpenUser,
  onUpdatePayment,
  onDeleteEnrollment
}) => {
  const enrollments = course.enrollments || [];

  const totalPaid = enrollments.filter(e => e.paymentStatus === 'paid').length;
  const totalPending = enrollments.filter(e => e.paymentStatus === 'pending').length;
  const totalFailed = enrollments.filter(e => e.paymentStatus === 'failed').length;
  const totalRevenue = enrollments
    .filter(e => e.paymentStatus === 'paid')
    .reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header + mini stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-deep-blue">{course.title}</h2>
          <p className="text-sm text-gray-600">
            {course.curriculum?.length || 2} weeks ({enrollments?.[0]?.totalDays || 14} days) • {enrollments.length} enrollments
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="p-4 bg-white shadow-lg rounded-xl">
          <p className="text-gray-500">Total Revenue</p>
          <div className="flex items-center mt-1 text-green-600">
            <FaRupeeSign className="mr-1" />
            <span className="text-2xl font-bold">{totalRevenue.toFixed(2)}</span>
          </div>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-xl">
          <p className="text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-600">{totalPaid}</p>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-xl">
          <p className="text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{totalPending}</p>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-xl">
          <p className="text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-600">{totalFailed}</p>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Progress</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enrollments.map((e) => (
              <tr key={e._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{e.user?.name}</p>
                    <p className="text-sm text-gray-500">{e.user?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FaRupeeSign className="mr-1 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {e.amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                      e.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : e.paymentStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {e.paymentStatus === 'paid' ? <FaCheckCircle className="mr-1" /> :
                      e.paymentStatus === 'failed' ? <FaTimesCircle className="mr-1" /> :
                      <FaClock className="mr-1" />}
                    {e.paymentStatus}
                  </span>
                </td>
                <td className="w-64 px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${e.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{e.progress || 0}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {e.paymentStatus !== 'paid' && (
                      <>
                        <button
                          onClick={() => onUpdatePayment(e._id, 'paid')}
                          className="px-3 py-1 text-xs text-green-700 bg-green-100 rounded hover:bg-green-200"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => onUpdatePayment(e._id, 'failed')}
                          className="px-3 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200"
                        >
                          Mark Failed
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onOpenUser(e)}
                      className="px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => onDeleteEnrollment(e._id)}
                      className="px-3 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                  No enrollments for this course yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseEnrollments;
