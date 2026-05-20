import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/OurTeam.css';

export default function OurTeam({ darkMode, toggleDarkMode }) {
    // Team members data
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

    // Utility to parse, encode, and enforce absolute URLs securely
    const buildSecureUrl = (rawUrl) => {
        if (!rawUrl || typeof rawUrl !== 'string') return '#';
        try {
            let urlString = rawUrl.trim();
            if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
                urlString = `https://${urlString}`;
            }
            urlString = urlString.replace(/\/{2,}$/, '/');
            if (urlString.endsWith('/')) {
                urlString = urlString.slice(0, -1);
            }
            const url = new URL(urlString);
            return url.toString();
        } catch (error) {
            console.error('Invalid URL format:', error);
            return '#';
        }
    };

    const handleLinkedInClick = (linkedinUrl) => {
        const safeUrl = buildSecureUrl(linkedinUrl);
        if (safeUrl !== '#') window.open(safeUrl, '_blank', 'noopener,noreferrer');
    };

    const handleEmailClick = (email) => {
        if (email) window.location.href = `mailto:${email.trim()}`;
    };

    return (
        <div className={`team-page-wrapper ${darkMode ? 'dark-mode' : ''}`}>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

            <main className="team-container">
                <div className="team-content">
                    {/* Header Section */}
                    <header className="team-header">
                        <h1 className="team-page-title">Our Team</h1>
                        <p className="team-page-subtitle">
                            Meet our dedicated team working to make technology accessible for everyone
                        </p>
                    </header>

                    {/* Team Grid */}
                    <div className="team-grid">
                        {teamMembers.map((member) => (
                            <article key={member.id} className="team-card">
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
                                                aria-label={`View ${member.name}'s LinkedIn profile`}
                                            >
                                                <span className="button-icon">🔗</span>
                                                View LinkedIn
                                            </button>
                                            <button
                                                className="action-button email-button"
                                                onClick={() => handleEmailClick(member.email)}
                                                aria-label={`Send an email to ${member.name}`}
                                            >
                                                <span className="button-icon">📧</span>
                                                Send Email
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            <Footer darkMode={darkMode} />
        </div>
    );
}
