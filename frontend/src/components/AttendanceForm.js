import React, { useState } from 'react';
import axios from 'axios';
import './AttendanceForm.css';

const AttendanceForm = () => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeID: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [nameError, setNameError] = useState('');
  const [idError, setIdError] = useState('');

  // Get API URL from environment variable or use default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Enhanced validation functions
  const validateEmployeeName = (name) => {
    const lettersOnlyRegex = /^[a-zA-Z\s]*$/;
    return lettersOnlyRegex.test(name);
  };

  const validateEmployeeID = (id) => {
    const numbersOnlyRegex = /^[0-9]*$/;
    return numbersOnlyRegex.test(id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'employeeName') {
      if (validateEmployeeName(value) || value === '') {
        setFormData({ ...formData, [name]: value });
        setNameError('');
      } else {
        setNameError('Employee Name can only contain letters and spaces');
      }
    }
    else if (name === 'employeeID') {
      if (validateEmployeeID(value) || value === '') {
        setFormData({ ...formData, [name]: value });
        setIdError('');
      } else {
        setIdError('Employee ID can only contain numbers (0-9)');
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage('');
    setNameError('');
    setIdError('');

    // Validation
    if (!formData.employeeName.trim() || !formData.employeeID.trim()) {
      setMessage('Employee Name and ID are required');
      setIsError(true);
      return;
    }

    // Final validation before submission
    if (!validateEmployeeName(formData.employeeName)) {
      setNameError('Employee Name can only contain letters and spaces');
      setIsError(true);
      return;
    }

    if (!validateEmployeeID(formData.employeeID)) {
      setIdError('Employee ID can only contain numbers (0-9)');
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/attendance`, formData);
      setMessage(response.data.message);
      setIsError(false);
      
      // Reset form
      setFormData({
        employeeName: '',
        employeeID: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present'
      });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to submit attendance');
      setIsError(true);
    }
  };

  return (
    <div className="attendance-form">
      <h2>Mark Attendance</h2>
      
      {message && (
        <div className={`message ${isError ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="employeeName">Employee Name:</label>
            <input
              type="text"
              id="employeeName"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              required
              placeholder="Enter employee name (letters only)"
              className={nameError ? 'input-error' : ''}
            />
            {nameError && <div className="field-error">{nameError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="employeeID">Employee ID:</label>
            <input
              type="text"
              id="employeeID"
              name="employeeID"
              value={formData.employeeID}
              onChange={handleChange}
              required
              placeholder="Enter employee ID (numbers only)"
              className={idError ? 'input-error' : ''}
            />
            {idError && <div className="field-error">{idError}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Present">Present (100%)</option>
              <option value="Absent">Absent (0%)</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={!!nameError || !!idError}
        >
          Submit Attendance
        </button>
      </form>
    </div>
  );
};

export default AttendanceForm;