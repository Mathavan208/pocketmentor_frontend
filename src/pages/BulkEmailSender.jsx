// BulkEmailSender.jsx
import React, { useState, useEffect } from "react";

const BulkEmailSender = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]); // ✅ from API
  const [loading, setLoading] = useState(true);

  // 📌 Fetch enrollments from backend API (same as AdminEnrollments)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${API_URL}/admin/enrollments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setEnrollments(data.data || []);
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  // 📌 Gemini Email Generator
  const handleGenerateEmail = async () => {
    if (!selectedCourse) return alert("Select a course first!");

    try {
      const courseTitle =
        enrollments.find((e) => e.course._id === selectedCourse)?.course
          .title || "the course";

      const prompt = `Generate a professional email body content alone not other things just email body enough for students enrolled in ${courseTitle}.
      Use placeholders {{name}} and {{course}}.`;
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/gemini/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      console.log(data);
      setEmailBody(data?.candidates?.[0]?.content?.parts?.[0]?.text || "");
    } catch (error) {
      console.error("Gemini error:", error);
      alert("Failed to generate email content.");
    }
  };

  // 📌 Handle File Uploads
  const handleFileChange = (e) => {
    setAttachments([...e.target.files]);
  };

  // 📌 Toggle Student Selection
  const toggleStudent = (email) => {
    setSelectedStudents((prev) =>
      prev.includes(email)
        ? prev.filter((s) => s !== email)
        : [...prev, email]
    );
  };

  // 📌 Select/Deselect All
  const toggleSelectAll = (allSelected) => {
    if (allSelected) {
      setSelectedStudents(
        enrollments
          .filter((e) => e.course._id === selectedCourse)
          .map((s) => s.email)
      );
    } else {
      setSelectedStudents([]);
    }
  };

  // 📌 Bulk Send Emails
  const handleSendBulk = async () => {
    if (!selectedCourse || !emailBody) {
      return alert("Select course and generate email first!");
    }

    setSending(true);
    setStatus([]);
    const students = enrollments.filter(
      (e) =>
        e.course._id === selectedCourse && selectedStudents.includes(e.email)
    );
    const newStatus = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const personalizedBody = emailBody
        .replace(/{{name}}/g, student.name)
        .replace(/{{course}}/g, student.course.title);

  try {
    const formData = new FormData();
    formData.append("to", student.email);
    formData.append("subject", `Update for ${student.course.title}`);
    formData.append("body", personalizedBody);

    // add all attachments
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const API_URL = import.meta.env.VITE_API_URL || "";
    await fetch(`${API_URL}/send-email`, {
      method: "POST",
      body: formData, // ✅ NO headers needed, browser sets them
    });
  } catch (error) {
    console.error(`Failed to send email to ${student.email}`, error);
  }

      setStatus([...newStatus]); // update progressively
    }

    setSending(false);
  };

  // 📌 Students for selected course
  const studentsForCourse = enrollments.filter(
    (e) => e.course._id === selectedCourse
  );

  // Auto-select when course changes
  useEffect(() => {
    if (selectedCourse) {
      setSelectedStudents(studentsForCourse.map((s) => s.email));
    } else {
      setSelectedStudents([]);
    }
  }, [selectedCourse, enrollments]);

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white rounded shadow">
      <h2 className="mb-4 text-2xl font-bold">📧 Bulk Email Sender</h2>

      {loading ? (
        <p>Loading enrollments...</p>
      ) : (
        <>
          {/* Course Selector */}
          <label className="block mb-1 font-semibold">Select Course:</label>
          <select
            className="w-full p-2 mb-4 border"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Select --</option>
            {[
              ...new Map(
                enrollments.map((e) => [e.course._id, e.course]) // key by course._id
              ).values(),
            ].map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>

          {/* Show Enrolled Students with Checkboxes */}
          {selectedCourse && (
            <div className="mb-4">
              <h3 className="mb-2 font-semibold">
                Enrolled Students in{" "}
                {
                  enrollments.find((e) => e.course._id === selectedCourse)
                    ?.course.title
                }
                :
              </h3>

              <div className="flex items-center mb-2 space-x-2">
                <button
                  className="px-2 py-1 bg-gray-200 rounded"
                  onClick={() => toggleSelectAll(true)}
                >
                  ✅ Select All
                </button>
                <button
                  className="px-2 py-1 bg-gray-200 rounded"
                  onClick={() => toggleSelectAll(false)}
                >
                  ❌ Deselect All
                </button>
              </div>
             <ul className="p-2 space-y-1 overflow-y-auto list-none border rounded max-h-40">
  {studentsForCourse.map((s) => {
    const studentName = s.name || s.user?.name || "Unknown";
    const studentEmail = s.email || s.user?.email || "no-email@example.com";

    return (
      <li key={studentEmail} className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={selectedStudents.includes(studentEmail)}
          onChange={() => toggleStudent(studentEmail)}
        />
        <span className="font-medium">{studentName}</span> —{" "}
        <span className="text-gray-600">{studentEmail}</span>
      </li>
    );
  })}
</ul>

            </div>
          )}

          {/* Generate Email */}
          <button
            className="px-4 py-2 mb-4 text-white bg-blue-600 rounded"
            onClick={handleGenerateEmail}
          >
            ✨ Generate Email with Gemini
          </button>

          {/* Editable Email Body */}
          <textarea
            className="w-full p-2 mb-4 border"
            rows="10"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Generated email will appear here..."
          />

          {/* File Attachments */}
          <label className="block mb-1 font-semibold">Attach Files:</label>
          <input
            type="file"
            multiple
            className="mb-4"
            onChange={handleFileChange}
          />

          {/* Send Button */}
          <button
            disabled={
              !selectedCourse || sending || selectedStudents.length === 0
            }
            className="px-4 py-2 text-white bg-green-600 rounded"
            onClick={handleSendBulk}
          >
            {sending ? "📤 Sending..." : "🚀 Send Bulk Emails"}
          </button>

          {/* Status */}
          <div className="mt-6">
            <h3 className="mb-2 font-semibold">Status:</h3>
            {status.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BulkEmailSender;
