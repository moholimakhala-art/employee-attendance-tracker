import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AttendanceDashboard.css';

const AttendanceDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [stats, setStats] = useState({ 
    present: 0, 
    absent: 0, 
    total: 0,
    presentPercentage: 0 
  });

  // Get API URL from environment variable or use default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [attendance]);

  const calculateStats = () => {
    const present = attendance.filter(record => record.status === 'Present').length;
    const absent = attendance.filter(record => record.status === 'Absent').length;
    const total = attendance.length;
    const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    setStats({ present, absent, total, presentPercentage });
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/attendance`);
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
      const response = await axios.get(`${API_URL}/api/attendance/search?query=${searchQuery}`);
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
      const response = await axios.get(`${API_URL}/api/attendance/filter?date=${filterDate}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error filtering:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${API_URL}/api/attendance/${id}`);
        fetchAttendance();
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

  const exportToCSV = () => {
    const headers = ['Employee Name', 'Employee ID', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...attendance.map(record => 
        [`"${record.employeeName}"`, record.employeeID, record.date, record.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Attendance Dashboard</h2>
        <div className="loading">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '70%' }}></div>
          </div>
          <p>Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Attendance Dashboard</h2>
        <button className="export-btn" onClick={exportToCSV}>
          Export CSV
        </button>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <div className="stat-card">
          <h3>Total Records</h3>
          <div className="stat-number">{stats.total}</div>
        </div>
        <div className="stat-card present-stat">
          <h3>Present</h3>
          <div className="stat-number">{stats.present}</div>
          <div className="progress-bar">
            <div 
              className="progress-fill present-fill" 
              style={{ width: `${stats.presentPercentage}%` }}
            ></div>
          </div>
          <span>{stats.presentPercentage}%</span>
        </div>
        <div className="stat-card absent-stat">
          <h3>Absent</h3>
          <div className="stat-number">{stats.absent}</div>
          <div className="progress-bar">
            <div 
              className="progress-fill absent-fill" 
              style={{ width: `${100 - stats.presentPercentage}%` }}
            ></div>
          </div>
          <span>{100 - stats.presentPercentage}%</span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
          <div className="no-records">
            No attendance records found.
          </div>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Employee ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id}>
                  <td>{record.employeeName}</td>
                  <td className="employee-id">{record.employeeID}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <div className="progress-bar small">
                      <div 
                        className={`progress-fill ${record.status === 'Present' ? 'present-fill' : 'absent-fill'}`}
                        style={{ width: record.status === 'Present' ? '100%' : '0%' }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {record.status === 'Present' ? '100%' : '0%'}
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