import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UniqueDropdownForm = () => {
  const [options, setOptions] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  // Fetch eligible electives from the backend
  useEffect(() => {
    const fetchElectives = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/eligible-subjects', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Set eligible electives
        setOptions(response.data.electives);
      } catch (error) {
        setError('Failed to load electives');
      }
    };

    fetchElectives();
  }, []);

  const handleSelectChange = (field, value) => {
    setSelectedValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  const getFilteredOptions = (field) => {
    const selectedOptions = Object.values(selectedValues);
    return options.map((option) => ({
      ...option,
      isSelected: selectedOptions.includes(option._id) && selectedValues[field] !== option._id,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Extract selected electives
    const selectedElectives = Object.values(selectedValues).filter((value) => value !== null);

    // Validate that all electives are selected
    if (selectedElectives.length !== options.length) {
      setError('Please select all available electives.');
      setSuccess('');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/student/OpenElective',
        { selectedElectives },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setError('');
      setSuccess('Electives chosen successfully!');
      setSelectedValues({});
      console.log(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || 'Error choosing electives');
      setSuccess('');
      console.error('Error choosing electives:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-500 text-white py-4 shadow-md flex items-center justify-between px-6">
        <div
          className="flex items-center space-x-4 cursor-pointer"
          onClick={() => navigate('/student/dashboard')}
        >
          {/* Logo */}
          <img
            src="https://upload.wikimedia.org/wikipedia/en/7/75/National_Institute_of_Technology%2C_Kurukshetra_Logo.png"
            alt="NIT Kurukshetra Logo"
            className="h-12 w-12"
          />
          <h1 className="text-xl font-semibold">NIT Kurukshetra - Elective Selection</h1>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <div className="w-[40vw] mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Select Your Electives</h2>
            <form onSubmit={handleSubmit}>
              {options.map((option, index) => (
                <div key={`field${index}`} className="form-group mb-4">
                  <label htmlFor={`field${index}`} className="block font-medium text-gray-700">
                    Elective {index + 1}:
                  </label>
                  <select
                    id={`field${index}`}
                    value={selectedValues[`field${index}`] || ''}
                    onChange={(e) => handleSelectChange(`field${index}`, e.target.value)}
                    className="select-dropdown mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select an option</option>
                    {getFilteredOptions(`field${index}`).map((filteredOption) => (
                      <option
                        key={filteredOption._id}
                        value={filteredOption._id}
                        style={{
                          color: filteredOption.isSelected ? 'gray' : 'black',
                          fontWeight: filteredOption.isSelected ? 'normal' : 'bold',
                        }}
                        disabled={filteredOption.isSelected} // Optional: Disable already selected options
                      >
                        {filteredOption.name} ({filteredOption.code}) - {filteredOption.branch}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {error && <p className="text-red-500 text-center">{error}</p>}
              {success && <p className="text-green-500 text-center">{success}</p>}

              <button type="submit" className="w-full py-3 mt-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                Submit
              </button>
            </form>
            {/* Back to Dashboard Button */}
            <button
              className="w-full py-3 mt-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              onClick={() => navigate('/student/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniqueDropdownForm;
