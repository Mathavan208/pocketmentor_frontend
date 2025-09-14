import React, { useMemo } from 'react';

const CoursesOverview = ({ enrollments, onSelectCourse }) => {
  const courses = useMemo(() => {
    const map = new Map();
    enrollments.forEach(e => {
      const c = e.course;
      if (!c || !c._id) return;
      if (!map.has(c._id)) map.set(c._id, { ...c, enrollments: [] });
      map.get(c._id).enrollments.push(e);
    });
    return Array.from(map.values());
  }, [enrollments]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {courses.map((course) => {
        const totalDays = course.enrollments?.[0]?.totalDays || 14;
        const weeks = course.curriculum?.length || 2;
        const paidCount = course.enrollments.filter(e => e.paymentStatus === 'paid').length;
        const pendCount = course.enrollments.filter(e => e.paymentStatus === 'pending').length;

        const avgProgress = Math.round(
          (course.enrollments.reduce((s, e) => s + (e.progress || 0), 0) / (course.enrollments.length || 1))
        );

        return (
          <div
            key={course._id}
            onClick={() => onSelectCourse(course)}
            className="p-6 transition bg-white shadow-lg cursor-pointer rounded-xl hover:shadow-xl"
          >
            <h2 className="mb-1 text-xl font-bold text-deep-blue">{course.title}</h2>
            <p className="mb-4 text-sm text-gray-600">{weeks} weeks ({totalDays} days)</p>

            <div className="mb-3">
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-600 rounded-full" style={{ width: `${avgProgress}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-500">Avg progress: {avgProgress}%</p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">Paid: {paidCount}</span>
              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Pending: {pendCount}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Total: {course.enrollments.length}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CoursesOverview;
