import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AttendanceDashboard.css';

const AttendanceDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attendance');
      setAttendance(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAttendance();
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/attendance/search?query=${searchQuery}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleFilterByDate = async () => {
    if (!filterDate) {
      fetchAttendance();
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/attendance/filter?date=${filterDate}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error filtering:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`http://localhost:5000/api/attendance/${id}`);
        fetchAttendance(); // Refresh the list
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record');
      }
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterDate('');
    fetchAttendance();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Attendance Dashboard</h2>
        <div className="loading">Loading attendance records...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Attendance Dashboard</h2>
      
      {/* Search and Filter Section */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        
        <div className="filter-group">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <button onClick={handleFilterByDate}>Filter by Date</button>
        </div>
        
        <button onClick={resetFilters} className="reset-btn">
          Reset Filters
        </button>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        {attendance.length === 0 ? (
          <div className="no-records">No attendance records found.</div>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Employee ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id}>
                  <td>{record.employeeName}</td>
                  <td>{record.employeeID}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard;