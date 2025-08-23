import React, { useState, useContext, useRef } from "react";
import { UserContext } from "../context/UserContext";
import jsPDF from "jspdf";

const QuestionMaker = () => {
  const { token } = useContext(UserContext);
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState(""); 
  const [numQuestions, setNumQuestions] = useState(1);
  const [numTestCases, setNumTestCases] = useState(3);
  const [dayNumber, setDayNumber] = useState(""); 
  const [result, setResult] = useState(null);
  const [taskImage, setTaskImage] = useState(null); 
  const [loading, setLoading] = useState(false);

  const resultRef = useRef(null);

  const codingCourses = ["Java", "Python", "SQL"];
  const taskCourses = ["React"];

  const handleGenerate = async () => {
    if (!course || !topic) {
      alert("Please select a course and enter a topic");
      return;
    }

    setLoading(true);
    setResult(null);
    setTaskImage(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      let prompt;
      if (codingCourses.includes(course)) {
        prompt = `
          Generate ${numQuestions} coding questions for the course "${course}" on the topic "${topic}".
          For each question, generate ${numTestCases} test cases.
          Include references or links to problems from ${platform} if available.
          Format as:
          Q1: <question>
          TestCases:
          - input: ...
            output: ...
        `;
      } else if (taskCourses.includes(course)) {
        prompt = `
          Generate ${numQuestions} practical tasks for the course "${course}" on the topic "${topic}".
          Suggest templates/examples from websites for the task.
          Provide a short task description suitable for Day ${dayNumber}.
         
        `;
      } else {
        prompt = `
          Generate ${numQuestions} general coding questions with ${numTestCases} test cases each on "${topic}" for the course "${course}".
          Also suggest related problems from ${platform}.
        `;
      }

      const response = await fetch(`${API_URL}/gemini/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      const text = data?.candidates[0]?.content?.parts[0]?.text || "no response";
      setResult(text);

      // Extract task image URL
      if (taskCourses.includes(course)) {
        const imgMatch = text.match(/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i);
        if (imgMatch) setTaskImage(imgMatch[0]);
      }
    } catch (err) {
      console.error(err);
      setResult("Error generating questions");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 20;

    // Logo
    const logoUrl = "https://i.postimg.cc/LsSXKJjf/logo.jpg";
    const logoImg = await fetch(logoUrl)
      .then((res) => res.blob())
      .then((blob) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      }));

    pdf.addImage(logoImg, "JPEG", pageWidth / 2 - 15, 10, 30, 30);
    y = 50;

    // Header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(40, 50, 150);
    pdf.text("Assesment", pageWidth / 2, y, { align: "center" });

    y += 15;
    pdf.setDrawColor(100, 149, 237);
    pdf.setLineWidth(0.8);
    pdf.line(20, y, pageWidth - 20, y);

    y += 10;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Course: ${course}`, 20, y);
    pdf.text(`Topic: ${topic}`, pageWidth - 20, y, { align: "right" });

    if (platform) {
      y += 8;
      pdf.text(`Suggested Platform: ${platform}`, 20, y);
    }

    if (dayNumber) {
      y += 8;
      pdf.text(`Day Number: ${dayNumber}`, 20, y);
    }

    y += 12;

    // Process result text with spacing
    let cleanResult = result.replace(/\*/g, "");
    const lines = cleanResult.split("\n");

    for (let line of lines) {
      if (!line.trim()) continue;

      if (line.match(/^Q\d*[:.]/i)) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(25, 25, 112);
        const splitLine = pdf.splitTextToSize(line.trim(), pageWidth - 40);
        const boxHeight = splitLine.length * 8 + 6;
        pdf.setFillColor(245, 250, 255); // lighter background for contrast
        pdf.roundedRect(15, y - 6, pageWidth - 30, boxHeight, 3, 3, "F");
        pdf.text(splitLine, 20, y);
        y += boxHeight + 8; // ✅ more spacing
      }
      else if (line.toLowerCase().includes("testcases")) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(220, 20, 60);
        pdf.text(line.trim(), 20, y);
        y += 8;
      }
      else if (line.toLowerCase().includes("input") || line.toLowerCase().includes("output")) {
        pdf.setFont("courier", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(34, 139, 34);
        const wrapped = pdf.splitTextToSize(line.trim(), pageWidth - 40);
        pdf.text(wrapped, 25, y);
        y += wrapped.length * 6 + 4;
      }
      else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        const wrapped = pdf.splitTextToSize(line.trim(), pageWidth - 40);
        pdf.text(wrapped, 20, y);
        y += wrapped.length * 8; // ✅ professional spacing
      }

      if (y > pageHeight - 50) {
        pdf.addPage();
        y = 20;
      }
    }

    // ✅ Embed task image for React tasks
    if (taskCourses.includes(course) && taskImage) {
      try {
        const imgData = await fetch(taskImage)
          .then((res) => res.blob())
          .then((blob) => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          }));

        if (y > pageHeight - 100) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Task Image:", 20, y);
        y += 6;
        pdf.addImage(imgData, "JPEG", 20, y, pageWidth - 40, 80);
        y += 90;
      } catch (err) {
        console.error("Failed to load task image", err);
      }
    }

    // Reference Links
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const matches = cleanResult.match(linkRegex);
    if (matches) {
      if (y > pageHeight - 50) {
        pdf.addPage();
        y = 20;
      }
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(0, 0, 180);
      pdf.text("Reference Links:", 20, y);
      y += 8;

      matches.forEach((url) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 255);
        pdf.textWithLink(url, 25, y, { url });
        y += 8;
        if (y > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
      });
    }

    // Footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    pdf.save(`Questions_${course}_${topic}_Day${dayNumber}.pdf`);
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-indigo-50 to-white">
      <div className="container max-w-4xl p-6 px-4 mx-auto bg-white shadow-lg rounded-xl">
        <h1 className="mb-4 text-2xl font-bold text-indigo-700">Question Maker</h1>
        <p className="mb-6 text-gray-600">Generate coding questions, tasks, and test cases using AI</p>

        <div className="grid gap-4 mb-6 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium">Select Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">-- Choose Course --</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="sql">sql</option>
              
              <option value="React">React</option>
      
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Topic (Enter Manually)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g. Arrays, Components, Flexbox"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Number of Questions</label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {codingCourses.includes(course) && (
            <div>
              <label className="block mb-1 text-sm font-medium">Number of Test Cases per Question</label>
              <input
                type="number"
                value={numTestCases}
                onChange={(e) => setNumTestCases(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium">Select Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">-- Choose Platform --</option>
              <option value="LeetCode">LeetCode</option>
              <option value="HackerRank">HackerRank</option>
              <option value="Codeforces">Codeforces</option>
              <option value="GeeksforGeeks">GeeksforGeeks</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Day Number</label>
            <input
              type="number"
              value={dayNumber}
              onChange={(e) => setDayNumber(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g. 1"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Questions"}
          </button>

          {result && (
            <button
              onClick={handleExportPDF}
              className="px-6 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              Export to PDF
            </button>
          )}
        </div>

        {result && (
          <div ref={resultRef} className="p-4 mt-6 border rounded-lg bg-gray-50">
            <h2 className="mb-3 text-lg font-semibold text-indigo-700">Generated Output:</h2>
            <div className="p-4 overflow-y-auto text-sm leading-relaxed text-gray-800 whitespace-pre-wrap bg-white border rounded-lg shadow-inner max-h-96">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionMaker;
