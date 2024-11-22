import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx'; // Import xlsx library
import '../App.css'; // Import the CSS file

const Studenttable = ({ subject }) => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!subject || !subject.students) return; // Guard clause for undefined props

    const studentIdsArray = subject.students; // Extract the `students` array
    fetch('http://localhost:5000/api/admin/substudents', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Add Content-Type header
      },
      body: JSON.stringify({ studentIds: studentIdsArray }), // Send the array to the backend
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setStudents(data)) // Set the fetched students in state
      .catch((error) => console.error('Error fetching students:', error));
  }, [subject]); // Re-run whenever the `subject` prop changes

  const exportToExcel = () => {
    // Create a new worksheet from the students array
    const worksheet = XLSX.utils.json_to_sheet(students);
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${subject?.name || 'Subject'}_Students.xlsx`);
  };

  return (
    <div>
      <h1>Students for {subject?.name || 'Unknown Subject'}  {subject.code}</h1>
      {students.length > 0 ? (
        <>
          <button 
            onClick={exportToExcel} 
            style={{
              backgroundColor: '#4CAF50', // Green color
              color: 'white', // White text
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '10px',
              fontSize: '16px',
            }}
          >
            Export to Excel
          </button>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Branch</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.branch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No students found for this subject.</p>
      )}
    </div>
  );
};

export default Studenttable;
