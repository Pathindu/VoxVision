import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/Contact.css';

export default function ContactUs({ darkMode, toggleDarkMode }) {
  // Team members data - Replace with actual LinkedIn profile URLs and details
  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Project Lead & Full Stack Developer',
      photo: 'https://via.placeholder.com/200/3b82f6/ffffff?text=JD',
      linkedin: 'https://www.linkedin.com/in/johndoe',
      email: 'john.doe@smartreader.com',
      bio: 'Passionate about creating accessible technology solutions.'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'AI/ML Engineer',
      photo: 'https://via.placeholder.com/200/10b981/ffffff?text=JS',
      linkedin: 'https://www.linkedin.com/in/janesmith',
      email: 'jane.smith@smartreader.com',
      bio: 'Specializing in computer vision and OCR technologies.'
    },
    {
      id: 3,
      name: 'Thilini Gamage',
      role: 'UI/UX Designer',
      photo: 'https://media.licdn.com/dms/image/v2/D4E03AQGWkm_M14S_Ew/profile-displayphoto-crop_800_800/B4EZf.P7r5GwAI-/0/1752317291324?e=1767225600&v=beta&t=f31PACQ0AXYXK18e0G71XG_y9jxVLjq1BrO7_95taXk',
      linkedin: 'https://www.linkedin.com/in/thilini-gamage-532365335/',
      email: 'thilinipgm@gmail.com',
      bio: 'Designing intuitive interfaces for accessibility.'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      role: 'Backend Developer',
      photo: 'https://via.placeholder.com/200/ec4899/ffffff?text=SW',
      linkedin: 'https://www.linkedin.com/in/sarahwilliams',
      email: 'sarah.williams@smartreader.com',
      bio: 'Building robust and scalable backend systems.'
    },
    {
      id: 5,
      name: 'Sarah Williams',
      role: 'Backend Developer',
      photo: 'https://via.placeholder.com/200/ec4899/ffffff?text=SW',
      linkedin: 'https://www.linkedin.com/in/sarahwilliams',
      email: 'sarah.williams@smartreader.com',
      bio: 'Building robust and scalable backend systems.'
    },
    {
      id: 6,
      name: 'Sarah Williams',
      role: 'Backend Developer',
      photo: 'https://via.placeholder.com/200/ec4899/ffffff?text=SW',
      linkedin: 'https://www.linkedin.com/in/sarahwilliams',
      email: 'sarah.williams@smartreader.com',
      bio: 'Building robust and scalable backend systems.'
    }
  ];

  const handleLinkedInClick = (linkedinUrl) => {
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className={`contact-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="contact-container">
        <div className="contact-content">
          {/* Header Section */}
          <div className="contact-header">
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">
              Meet our dedicated team working to make technology accessible for everyone
            </p>
          </div>

          {/* Contact Information Section */}
          <div className="contact-info-section">
            <div className="contact-info-grid">
              <div className="info-card">
                <div className="info-icon">📧</div>
                <h3>Email Us</h3>
                <p>contact@smartreader.com</p>
              </div>
              <div className="info-card">
                <div className="info-icon">📞</div>
                <h3>Call Us</h3>
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="info-card">
                <div className="info-icon">📍</div>
                <h3>Visit Us</h3>
                <p>University of Kelaniya, Sri Lanka</p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="team-section">
            <h2 className="team-title">Our Team</h2>
            <p className="team-description">
              Connect with our talented team members
            </p>

            <div className="team-grid">
              {teamMembers.map((member) => (
                <div key={member.id} className="team-card">
                  <div className="team-card-inner">
                    {/* Front of card */}
                    <div className="team-card-front">
                      <div className="member-photo-wrapper">
                        <img 
                          src={member.photo} 
                          alt={member.name}
                          className="member-photo"
                        />
                      </div>
                      <div className="member-info">
                        <h3 className="member-name">{member.name}</h3>
                        <p className="member-role">{member.role}</p>
                      </div>
                    </div>

                    {/* Back of card */}
                    <div className="team-card-back">
                      <p className="member-bio">{member.bio}</p>
                      <div className="member-actions">
                        <button 
                          className="action-button linkedin-button"
                          onClick={() => handleLinkedInClick(member.linkedin)}
                        >
                          <span className="button-icon">🔗</span>
                          View LinkedIn
                        </button>
                        <button 
                          className="action-button email-button"
                          onClick={() => handleEmailClick(member.email)}
                        >
                          <span className="button-icon">📧</span>
                          Send Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}