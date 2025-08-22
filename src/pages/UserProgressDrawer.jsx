import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const UserProgressDrawer = ({ enrollment, selectedDay, onClose, onChangeDay }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMaterials = async (courseId, day) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL;

      const res = await fetch(`${API_URL}/courses/${courseId}/materials/${day}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMaterials(data.data || []);
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.error("Error fetching materials:", err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch whenever enrollment or day changes
  useEffect(() => {
    if (enrollment && selectedDay) {
      fetchMaterials(enrollment.course._id, selectedDay);
    }
  }, [enrollment, selectedDay]);

  if (!enrollment) return null;

  return (
    <div className="fixed top-0 right-0 z-50 h-full p-4 overflow-y-auto bg-white border-l border-gray-300 shadow-lg w-96">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">
          {enrollment.course.name} – Day {selectedDay}
        </h2>
        <button onClick={onClose} className="px-3 py-1 text-white bg-gray-500 rounded">
          Close
        </button>
      </div>

      {/* Material List */}
      {loading ? (
        <p>Loading materials...</p>
      ) : materials.length === 0 ? (
        <p>No materials found for this day.</p>
      ) : (
        <ul className="pl-5 space-y-1 list-disc">
          {materials.map((m) => (
            <li key={m._id}>{m.title}</li>
          ))}
        </ul>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          disabled={selectedDay <= 1}
          onClick={() => onChangeDay(selectedDay - 1)}
          className="flex items-center px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          <FaArrowLeft className="mr-1" /> Prev Day
        </button>

        <button
          onClick={() => onChangeDay(selectedDay + 1)}
          className="flex items-center px-3 py-1 bg-gray-200 rounded"
        >
          Next Day <FaArrowRight className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default UserProgressDrawer;
