import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import '../Components/OurTeam.css';
import '../Components/Home.css'; /* Reuse home topography and glass styles natively */

export default function OurTeam({ darkMode, toggleDarkMode }) {
    const teamMembers = [
        {
            id: 1,
            name: 'Achintha Sewmina',
            role: 'Project Manager & Backend Developer',
            photo: 'https://github.com/Sewmina-as.png',
            linkedin: 'https://www.linkedin.com/in/achintha-sewmina-06a5b62b1/',
            github: 'https://github.com/Sewmina-as'
        },
        {
            id: 2,
            name: 'Pathindu De Silva',
            role: 'Backend Developer',
            photo: 'https://github.com/Pathindu.png',
            linkedin: 'https://www.linkedin.com/in/pathindu-de-silva-4318722b5/',
            github: 'https://github.com/Pathindu'
        },
        {
            id: 3,
            name: 'Sandun Deshan',
            role: 'Full Stack Developer',
            photo: 'https://github.com/KSDeshan.png',
            linkedin: 'https://linkedin.com/in/sandun-deshan',
            github: 'https://github.com/KSDeshan'
        },
        {
            id: 4,
            name: 'Thilini Gamage',
            role: 'UI/UX Developer',
            photo: 'https://github.com/TGamage123.png',
            linkedin: 'https://www.linkedin.com/in/thilini-gamage-532365335/',
            github: 'https://github.com/TGamage123'
        },
        {
            id: 5,
            name: 'Thulani Imansa',
            role: 'UI/UX Developer',
            photo: 'https://github.com/ThulaniImansa.png',
            linkedin: 'https://www.linkedin.com/in/thulani-imansa-8a6096288/',
            github: 'https://github.com/ThulaniImansa'
        },
        {
            id: 6,
            name: 'Kasuni Walawenayake',
            role: 'Quality Assurance',
            photo: 'https://github.com/kasuni-2003.png',
            linkedin: 'https://www.linkedin.com/in/kasuni-walawenayake-087093320/',
            github: 'https://github.com/kasuni-2003'
        }
    ];

    const buildSecureUrl = (rawUrl) => {
        if (!rawUrl || typeof rawUrl !== 'string') return '#';
        try {
            let urlString = rawUrl.trim();
            if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
                urlString = `https://${urlString}`;
            }
            const url = new URL(urlString);
            return url.toString();
        } catch (error) {
            return '#';
        }
    };

    const handleLinkClick = (url) => {
        const safeUrl = buildSecureUrl(url);
        if (safeUrl !== '#') window.open(safeUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={`opt-page-wrapper App ${darkMode ? 'dark-mode' : 'light-theme'}`}>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

            {/* Re-use home-container to get the topographic pattern background */}
            <main className="home-container" style={{ minHeight: '100vh', padding: '0 1rem 4rem' }}>
                <section className="hero-section team-hero-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* Hero Title Replacement */}
                    <div className="team-hero-header" style={{ textAlign: 'center', marginBottom: '2rem', zIndex: 10 }}>
                        <h1 className="hero-title team-solid-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: '#00E5FF', textShadow: '0 0 25px rgba(0, 229, 255, 0.5)' }}>
                            Meet the Visionaries Behind VoxVision
                        </h1>
                    </div>

                    {/* Central Dashboard Card */}
                    <article
                        className="hero-app-card team-dashboard-card"
                        style={{ maxWidth: '1000px', width: '100%', padding: '3rem 2rem' }}
                    >
                        {/* 2x3 Grid */}
                        <div className="team-grid-2x3">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="team-member-glass-card">
                                    <div className="member-avatar-ring">
                                        <img
                                            src={member.photo}
                                            alt={member.name}
                                            className="member-avatar"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150/111827/67e8f9?text=' + member.name.charAt(0); }}
                                        />
                                    </div>
                                    <h3 className="team-member-name">{member.name}</h3>
                                    <p className="team-member-role">{member.role}</p>

                                    <div className="team-member-actions">
                                        <button
                                            onClick={() => handleLinkClick(member.linkedin)}
                                            className="btn mini-action-btn linkedin-btn"
                                            aria-label={`${member.name} LinkedIn`}
                                            title="LinkedIn"
                                        >
                                            <span className="btn-icon">🔗</span>
                                        </button>
                                        <button
                                            onClick={() => handleLinkClick(member.github)}
                                            className="btn mini-action-btn github-btn"
                                            aria-label={`${member.name} GitHub`}
                                            title="GitHub"
                                        >
                                            <span className="btn-icon">💻</span>
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `mailto:contact@smartreader.com?subject=Contact%20${member.name}`}
                                            className="btn mini-action-btn email-btn"
                                            aria-label={`Email ${member.name}`}
                                            title="Gmail"
                                        >
                                            <span className="btn-icon">💬</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>
            </main>

            <Footer darkMode={darkMode} />
        </div>
    );
}
