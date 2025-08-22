import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { FaCertificate } from "react-icons/fa";
import jsPDF from "jspdf";

const AdminCertificationCreator = () => {
  const { token } = useContext(UserContext);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Instructor mapping
  const instructorMapping = {
    java: ["Mukhil", "Jayasuriya"],
    python: ["Mukhil", "Siva Sankar"],
    sql: ["Mathavan", "Mohan", "Siva Sankar"],
    react: ["Mathavan", "Jayasuriya", "Mohan"],
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/admin/enrollments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching enrollments", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchEnrollments();
  }, [token]);

  // 🔹 Fetch Gemini theme
  const fetchGeminiTheme = async (courseTitle) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const prompt=  `Suggest a colorful professional certificate theme for the course "${courseTitle}". 
                        Return JSON strictly in format: { bgColor: [r,g,b], borderColor: [r,g,b], titleColor: [r,g,b] } dont include some other quotes return only in json object format or normal js object `;
      const res = await fetch(`${API_URL}/gemini/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt
            }
        ),
      });

      const data = await res.json();
    //   console.log("Gemini response:", data);

      let theme = {};
      
        theme = data.candidates[0].content.parts[0].text;
        theme= theme.replace(/```json|```/g, "").trim();
  const ob=JSON.parse(theme)
        //console.log();

      return {
        bgColor: ob?.bgColor || [245, 243, 255],
        borderColor: ob?.borderColor || [99, 102, 241],
        titleColor: ob?.titleColor || [55, 48, 163],
      };
    } catch (err) {
      console.error("Gemini theme fetch failed:", err);
      return {
        bgColor: [245, 243, 255],
        borderColor: [99, 102, 241],
        titleColor: [55, 48, 163],
      };
    }
  };

  // 🔹 Match instructors correctly
  const getInstructors = (courseTitle) => {
    if (!courseTitle) return ["Instructor"];
    const key = Object.keys(instructorMapping).find((k) =>
      courseTitle.toLowerCase().includes(k)
    );
    return key ? instructorMapping[key] : ["Instructor"];
  };

  const generateCertificate = async (enrollment) => {
    const { user, course } = enrollment;
    const theme = await fetchGeminiTheme(course?.title || "Course");

    const doc = new jsPDF("landscape", "pt", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 🔹 Gemini background
    doc.setFillColor(...theme.bgColor);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // 🔹 Gemini border
    doc.setDrawColor(...theme.borderColor);
    doc.setLineWidth(8);
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40);

    // Logo
    const logoUrl = "https://i.postimg.cc/LsSXKJjf/logo.jpg";
    const img = await fetch(logoUrl).then((res) => res.blob());
    const reader = new FileReader();
    reader.readAsDataURL(img);

    reader.onloadend = function () {
      const base64data = reader.result;
      doc.addImage(base64data, "JPEG", 50, 40, 100, 100);

      // Title
      doc.setFont("times", "bold");
      doc.setFontSize(40);
      doc.setTextColor(...theme.titleColor);
      doc.text("Certificate of Completion", pageWidth / 2, 120, { align: "center" });

      // Recipient
      doc.setFont("helvetica", "italic");
      doc.setFontSize(20);
      doc.setTextColor(80, 80, 80);
      doc.text("This certificate is proudly presented to", pageWidth / 2, 170, { align: "center" });

      doc.setFont("courier", "bold");
      doc.setFontSize(30);
      doc.setTextColor(30, 41, 59);
      doc.text(user?.name || "Student Name", pageWidth / 2, 220, { align: "center" });

      // Course name
      doc.setFont("helvetica", "normal");
      doc.setFontSize(18);
      doc.setTextColor(60, 60, 60);
      doc.text("for successfully completing the course", pageWidth / 2, 270, { align: "center" });

      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.setTextColor(...theme.borderColor);
      doc.text(course?.title || "Course Title", pageWidth / 2, 320, { align: "center" });

      // Issue Date
      doc.setFont("helvetica", "italic");
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text(`Issued on ${new Date().toLocaleDateString()}`, pageWidth / 2, 360, { align: "center" });

      // 🔹 Instructor signatures (now mapped properly)
      const instructors = getInstructors(course?.title);
      let startX = 150;
      const gap = (pageWidth - 300) / (instructors.length - 1 || 1);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);

      instructors.forEach((inst, i) => {
        const x = startX + i * gap;
        doc.line(x - 80, 400, x + 80, 400); // signature line
        doc.text(inst, x, 430, { align: "center" });
        doc.setFontSize(12);
        doc.text("Course Instructor", x, 450, { align: "center" });
      });

      // Download
      doc.save(`Certificate_${user?.name || "student"}_${course?.title || "course"}.pdf`);
    };
  };

  if (loading) {
    return <p className="py-8 text-center text-gray-600">Loading enrollments...</p>;
  }

  return (
    <div className="min-h-screen py-10 bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-6xl p-6 px-4 mx-auto bg-white shadow-lg rounded-xl">
        <h1 className="flex items-center mb-6 text-2xl font-bold text-deep-blue">
          <FaCertificate className="mr-2 text-indigo-600" /> Certification Creator
        </h1>
        <p className="mb-4 text-gray-600">Generate and download certificates for enrolled users</p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment._id}>
                  <td className="px-6 py-4">{enrollment.user?.name}</td>
                  <td className="px-6 py-4">{enrollment.course?.title}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        enrollment.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {enrollment.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => generateCertificate(enrollment)}
                      className="flex items-center px-4 py-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600"
                    >
                      <FaCertificate className="mr-2" /> Generate Certificate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCertificationCreator;
