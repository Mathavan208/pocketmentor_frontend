import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";

const QuestionMaker = () => {
  const { token } = useContext(UserContext);
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(1);
  const [numTestCases, setNumTestCases] = useState(3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const codingCourses = ["Java", "Python", "C", "C++"]; // ✅ courses requiring coding + test cases
  const taskCourses = ["React", "HTML", "CSS"]; // ✅ courses requiring only tasks

  const handleGenerate = async () => {
    if (!course || !topic) {
      alert("Please select a course and enter a topic");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      let prompt;
      if (codingCourses.includes(course)) {
        prompt = `
          Generate ${numQuestions} coding questions for the course "${course}" on the topic "${topic}".
          For each question, generate ${numTestCases} test cases.
          Format as:
          Q1: <question>
          TestCases:
          - input: ...
            output: ...
          - input: ...
            output: ...
        `;
      } else if (taskCourses.includes(course)) {
        prompt = `
          Generate ${numQuestions} practical tasks for the course "${course}" on the topic "${topic}".
          No test cases needed, just clear tasks for students.
        `;
      } else {
        prompt = `
          Generate ${numQuestions} general coding questions with ${numTestCases} test cases each on "${topic}" for the course "${course}".
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
      setResult(data?.candidates[0]?.content?.parts[0]?.text || "no response");
    } catch (err) {
      console.error(err);
      setResult("Error generating questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-indigo-50 to-white">
      <div className="container max-w-4xl p-6 px-4 mx-auto bg-white shadow-lg rounded-xl">
        <h1 className="mb-4 text-2xl font-bold text-indigo-700">Question Maker</h1>
        <p className="mb-6 text-gray-600">Generate coding questions, tasks, and test cases using AI</p>

        {/* Inputs */}
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
              <option value="C">C</option>
              <option value="C++">C++</option>
              <option value="React">React</option>
              <option value="HTML">HTML</option>
              <option value="CSS">CSS</option>
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
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>

        {/* Result */}
       {/* Result */}
{result && (
  <div className="p-4 mt-6 border rounded-lg bg-gray-50">
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
