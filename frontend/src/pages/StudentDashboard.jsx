import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/student/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(response.data.student);
        // If student has subjects, fetch their details
        if (response.data.student.subjects) {
          const subjectResponse = await axios.get(
            `http://localhost:5000/api/subjects/${response.data.student.subjects}`
          );
          setSubject(subjectResponse.data);
        }
      } catch (err) {
        setError("Failed to load student details.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-500 text-white py-4 shadow-md flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <img
            src="https://upload.wikimedia.org/wikipedia/en/7/75/National_Institute_of_Technology%2C_Kurukshetra_Logo.png"
            alt="NIT Kurukshetra Logo"
            className="h-12 w-12"
          />
          <h1 className="text-xl font-semibold">NIT Kurukshetra - Student Dashboard</h1>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        {loading && (
          <div className="text-center">
            <div className="loader inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 mt-4">Loading student details...</p>
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && student && (
          <div className="space-y-6 w-[40vw] mx-auto">
            {/* Student Details */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Student Information</h2>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="font-medium">Roll Number:</span>
                  <span>{student.rollNumber}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{student.name}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{student.email}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Branch:</span>
                  <span>{student.branch}</span>
                </li>
              </ul>
            </div>

            {/* Subjects */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Subjects Allotted</h2>
              {subject ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md shadow">
                    <span className="font-medium text-gray-700">{subject.name}</span>
                    <span className="text-sm text-gray-500">(Code: {subject.code})</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600">No subjects allotted.</p>
                </div>
              )}
            </div>

            {/* Button for Electives */}
            <div className="text-center">
              {student.subjects== null && student.choices && student.choices.length === 0 && (
                <button
                  onClick={() => navigate("/openelective")}
                  className="mt-6 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                >
                  Select Open Electives
                </button>
              )}

              {student.subjects== null && student.choices && student.choices.length > 0 && (
                <button
                  onClick={() => navigate("/Updateelective")}
                  className="mt-6 px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
                >
                  Update Chosen Electives
                </button>
              )}
              <button
                onClick={() => navigate("/syllabus")}
                className="mt-6 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
              >
                Check Syllabus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
