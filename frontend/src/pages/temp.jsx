import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    password: '',
    sem: '',
    branch: '',
  });
  const [isStudentFound, setIsStudentFound] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'password') {
      setPasswordStrength(calculateStrength(e.target.value));
    }
  };

  // Function to calculate password strength
  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length > 8) strength += 1; // Length
    if (/[A-Z]/.test(password)) strength += 1; // Uppercase
    if (/[a-z]/.test(password)) strength += 1; // Lowercase
    if (/[0-9]/.test(password)) strength += 1; // Numbers
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1; // Special chars

    return strength;
  };

  const handleFindStudent = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/student/register', {
        rollNumber: formData.rollNumber,
      });
      setFormData({
        ...formData,
        ...response.data, // Pre-fill name, email, sem, branch
        password: '', // Keep password empty for security
      });

      setIsStudentFound(true);
    } catch (error) {
      setError('Student not found. Please check the roll number.');
      setIsStudentFound(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/student/register', {
        rollNumber: formData.rollNumber,
        email: formData.email,
        password: formData.password,
      });
      alert('Email and password updated successfully!');
      navigate('/login');
    } catch (error) {
      setError('Failed to update email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get strength label based on password strength
  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Medium';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return '';
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Student Email & Password Update
      </h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="rollNumber"
          placeholder="Enter your roll number"
          value={formData.rollNumber}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          type="button"
          onClick={handleFindStudent}
          disabled={isLoading || !formData.rollNumber}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          {isLoading ? 'Finding Student...' : 'Find Student'}
        </button>

        {isStudentFound && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              disabled
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f0f0f0',
              }}
            />
            <input
              type="text"
              name="sem"
              placeholder="Semester"
              value={formData.sem}
              disabled
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f0f0f0',
              }}
            />
            <input
              type="text"
              name="branch"
              placeholder="Branch"
              value={formData.branch}
              disabled
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f0f0f0',
              }}
            />
            <input
              type="email"
              name="email"
              placeholder="Enter new email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            {/* Password Strength Bar */}
            <div style={{ marginBottom: '10px' }}>
              <div
                style={{
                  height: '10px',
                  width: '100%',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '5px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(passwordStrength / 4) * 100}%`,
                    backgroundColor:
                      passwordStrength === 4
                        ? '#4CAF50'
                        : passwordStrength === 3
                        ? '#8BC34A'
                        : passwordStrength === 2
                        ? '#FFEB3B'
                        : passwordStrength === 1
                        ? '#FF9800'
                        : '#F44336',
                    borderRadius: '5px',
                  }}
                />
              </div>
              <div
                style={{
                  textAlign: 'right',
                  fontSize: '12px',
                  color:
                    passwordStrength === 4
                      ? '#4CAF50'
                      : passwordStrength === 3
                      ? '#8BC34A'
                      : passwordStrength === 2
                      ? '#FFEB3B'
                      : passwordStrength === 1
                      ? '#FF9800'
                      : '#F44336',
                }}
              >
                {getStrengthLabel()}
              </div>
            </div>
          </>
        )}

        {error && (
          <div
            style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            {error}
          </div>
        )}

        {isStudentFound && (
          <button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px',
            }}
          >
            {isLoading ? 'Updating...' : 'Update Email & Password'}
          </button>
        )}
      </form>

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <p style={{ fontSize: '14px' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#007bff' }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
