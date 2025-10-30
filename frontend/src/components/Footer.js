import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p>&copy; {currentYear} Employee Attendance Tracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;