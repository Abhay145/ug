import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UpdateElective = () => {
  const [options, setOptions] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch eligible electives and previously selected choices
  useEffect(() => {
    const fetchElectives = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch eligible electives
        const electivesResponse = await axios.get('http://localhost:5000/api/eligible-subjects', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch previously selected electives
        const selectedResponse = await axios.get('http://localhost:5000/api/student/selected-electives', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOptions(electivesResponse.data.electives);

        // Prefill the dropdown with selected electives
        const initialValues = {};
        selectedResponse.data.selectedElectives.forEach((elective, index) => {
          initialValues[`field${index}`] = elective._id;
        });
        setSelectedValues(initialValues);
      } catch (error) {
        setError('Failed to load electives or selected choices');
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

    const selectedElectives = Object.values(selectedValues).filter((value) => value !== null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/student/update-electives',
        { selectedElectives },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setError('');
      setSuccess('Electives updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating electives');
      setSuccess('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-500 text-white py-4 shadow-md flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <a href="/student/dashboard">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/7/75/National_Institute_of_Technology%2C_Kurukshetra_Logo.png"
              alt="NIT Kurukshetra Logo"
              className="h-12 w-12 cursor-pointer"
            />
          </a>
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
                    <option value="">Clear</option>
                    {getFilteredOptions(`field${index}`).map((filteredOption) => (
                      <option
                        key={filteredOption._id}
                        value={filteredOption._id}
                        style={{
                          color: filteredOption.isSelected ? 'gray' : 'black',
                          fontWeight: filteredOption.isSelected ? 'normal' : 'bold',
                        }}
                        disabled={filteredOption.isSelected}
                      >
                        {filteredOption.name} ({filteredOption.code}) - {filteredOption.branch}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {error && <p className="text-red-500 text-center">{error}</p>}
              {success && <p className="text-green-500 text-center">{success}</p>}

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Submit
              </button>
            </form>
            {/* Back to dashboard button */}
            <div className="text-center mt-6">
              <a
                href="/student/dashboard"
                className="inline-block py-3 px-6 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateElective;
