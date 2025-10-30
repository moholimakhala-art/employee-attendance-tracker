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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employeeName.trim() || !formData.employeeID.trim()) {
      setMessage('Employee Name and ID are required');
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/attendance', formData);
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
            />
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
            />
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
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Submit Attendance
        </button>
      </form>
    </div>
  );
};

export default AttendanceForm;