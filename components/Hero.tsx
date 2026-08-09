"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function SkillsEducation() {
  const [showAiBanner, setShowAiBanner] = useState(true);
  const [showExtensionBanner, setShowExtensionBanner] = useState(true);

  return (
    <>
      <section className="skills-education-section">
        <div className="skills-education-container">
          
          {/* Announcement Banners Wrapper */}
          <div className="announcement-banners-wrapper" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            
            {showAiBanner && (
              <div className="skills-top-banner">
                <div className="banner-content">
                  <span className="banner-badge" style={{ background: 'linear-gradient(90deg, #db2777, #7c3aed)', border: 'none' }}>
                    <i className="fas fa-robot"></i> New AI Agent
                  </span>
                  <strong>Moltbook</strong> — My AI agent posted on its social media just 2 hours ago!
                  <div className="banner-cta-group">
                    <a href="#" className="banner-store-btn">
                      <i className="fas fa-eye" style={{ color: '#38bdf8' }}></i> View it here!
                    </a>
                    <a href="https://github.com/faruklmu17/moltbook_ai_agent" target="_blank" rel="noopener noreferrer" className="banner-details-btn">
                      Build your own <i className="fab fa-github"></i>
                    </a>
                  </div>
                </div>
                <button onClick={() => setShowAiBanner(false)} aria-label="Close announcement" className="banner-close-x">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            {showExtensionBanner && (
              <div className="skills-top-banner">
                <div className="banner-content">
                  <span className="banner-badge">
                    <i className="fas fa-hammer"></i> My Latest Creation
                  </span>
                  <strong>Playwright Browser Extension (v1.12)</strong> — I built this tool to help QA engineers monitor tests directly in the browser!
                  <div className="banner-cta-group">
                    <a href="https://chromewebstore.google.com/detail/cnbifhpjofgeaobfppnfnngfkkjniodh?utm_source=item-share-cb" target="_blank" rel="noopener noreferrer" className="banner-store-btn">
                      <i className="fab fa-chrome" style={{ color: '#4ade80' }}></i> Get it from Chrome Store
                    </a>
                    <a href="#featured-product" className="banner-details-btn">
                      View Details <i className="fas fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
                <button onClick={() => setShowExtensionBanner(false)} aria-label="Close announcement" className="banner-close-x">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          {/* Left Column: Skills Grid */}
          <div className="skills-column">
            <div className="skills-header">
              <h2>Technical Skills</h2>
            </div>
            
            <div className="skills-categories">
              {/* QE & DevOps Tools */}
              <div className="skill-category">
                <div className="category-header">
                  <div className="category-icon">
                    <i className="fas fa-tools"></i>
                  </div>
                  <h3>QE & DevOps Tools</h3>
                </div>
                <p className="category-description">
                  Browser extension for Playwright test results with enhanced visualization
                  <a href="https://chromewebstore.google.com/detail/playwright-test-results/cnbifhpjofgeaobfppnfnngfkkjniodh?authuser=0&hl=en" target="_blank" rel="noopener noreferrer" className="category-link-inline">
                    <i className="fab fa-chrome"></i>
                  </a>
                </p>
              </div>

              {/* AI and ML Experience */}
              <div className="skill-category">
                <div className="category-header">
                  <div className="category-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <h3>AI & ML</h3>
                </div>
                <p className="category-description">
                  Deployed my own personalized chatbot using Ollama and Hugging Face Spaces.
                  <a href="https://hasanfaruk25-faruk-assistant.hf.space/gradio/" target="_blank" rel="noopener noreferrer" className="category-link-inline">
                    <i className="fas fa-brain"></i>
                  </a>
                </p>
              </div>

              {/* AI-Driven Grading System */}
              <div className="skill-category">
                <div className="category-header">
                  <div className="category-icon">
                    <i className="fas fa-magic"></i>
                  </div>
                  <h3>AI-Driven Grading</h3>
                </div>
                <p className="category-description">
                  Automated student grading system with RAG-based personalized feedback.
                  <a href="https://github.com/faruklmu17/student_grader" target="_blank" rel="noopener noreferrer" className="category-link-inline">
                    <i className="fab fa-github"></i>
                  </a>
                </p>
              </div>

              {/* Open Source Contributions Entry */}
              <div className="skill-category os-contrib-category">
                <div className="category-header">
                  <div className="category-icon">
                    <i className="fab fa-github-alt"></i>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '35px' }}>
                    <h3>Open Source Contributions</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span className="os-badge-header">200+ Contributions</span>
                      <a href="https://github.com/faruklmu17" target="_blank" rel="noopener noreferrer" className="category-link-inline">
                        <i className="fab fa-github"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="os-contrib-content">
                  <div className="os-lang-stats">
                    <div className="os-lang-item">
                      <div className="os-lang-info">
                        <span>Python</span>
                        <span>45%</span>
                      </div>
                      <div className="os-progress">
                        <div className="os-bar python" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div className="os-lang-item">
                      <div className="os-lang-info">
                        <span>TypeScript</span>
                        <span>25%</span>
                      </div>
                      <div className="os-progress">
                        <div className="os-bar typescript" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div className="os-lang-item">
                      <div className="os-lang-info">
                        <span>HTML/CSS</span>
                        <span>20%</span>
                      </div>
                      <div className="os-progress">
                        <div className="os-bar html" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    <div className="os-lang-item">
                      <div className="os-lang-info">
                        <span>JavaScript</span>
                        <span>10%</span>
                      </div>
                      <div className="os-progress">
                        <div className="os-bar javascript" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automation Frameworks */}
              <div className="skill-category">
                <div className="category-header">
                  <div className="category-icon">
                    <i className="fas fa-microchip"></i>
                  </div>
                  <h3>Automation Frameworks</h3>
                </div>
                <p className="category-description">
                  Expertise in <strong>Playwright</strong>, <strong>Selenium</strong>, and <strong>Cypress</strong> for robust cross-browser testing.
                </p>
              </div>

              {/* Core Technologies */}
              <div className="skill-category">
                <div className="category-header">
                  <div className="category-icon">
                    <i className="fas fa-code-branch"></i>
                  </div>
                  <h3>Core Technologies</h3>
                </div>
                <div className="tech-stack-badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span className="tech-badge" style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                    <i className="fab fa-python" style={{ color: '#3776ab' }}></i> Python
                  </span>
                  <span className="tech-badge" style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                    <i className="fab fa-js" style={{ color: '#f7df1e' }}></i> JavaScript
                  </span>
                  <span className="tech-badge" style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                    <i className="fas fa-file-code" style={{ color: '#3178c6' }}></i> TypeScript
                  </span>
                  <span className="tech-badge" style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                    <i className="fab fa-git-alt" style={{ color: '#f05032' }}></i> Git
                  </span>
                  <span className="tech-badge" style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                    <i className="fab fa-docker" style={{ color: '#2496ed' }}></i> Docker
                  </span>
                  <span className="tech-badge" style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                    <i className="fas fa-terminal" style={{ color: '#4d4d4d' }}></i> CI/CD
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Teaching & Courses */}
          <div className="education-column">
            <div className="education-header">
              <div className="edu-header-wrapper">
                <div className="edu-title-group">
                  <div className="title-with-badge">
                    <h2>Teaching Experiences</h2>
                    <a href="https://www.udemy.com/user/mohammadfarukhasan/" target="_blank" rel="noopener noreferrer" className="udemy-badge-sleek" title="View Udemy Profile">
                      <svg className="udemy-svg-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 18.72c-4.32 0-7.44-2.88-7.44-6.96V1.2h4.56v10.32c0 1.92 1.2 3.12 2.88 3.12s2.88-1.2 2.88-3.12V1.2h4.56v10.56c0 4.08-3.12 6.96-7.44 6.96zM12 22.8l-5.04-3.6h10.08L12 22.8z" fill="currentColor" />
                      </svg>
                      <span>Udemy Profile</span>
                    </a>
                  </div>
                  <p>Empowering the next generation of young learners!</p>
                </div>
              </div>
            </div>

            <div className="education-content">
              {/* Tutoring Stats */}
              <div className="tutoring-stats">
                <h3><i className="fas fa-chalkboard-teacher"></i> Impact</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">2000+</div>
                    <div className="stat-label">Students</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">12+</div>
                    <div className="stat-label">Years</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">4.82/5</div>
                    <div className="stat-label">Rating</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">10+</div>
                    <div className="stat-label">Courses</div>
                  </div>
                </div>
              </div>

              {/* Course Cards */}
              <div className="course-cards">
                <h3><i className="fas fa-graduation-cap"></i> Highlighted Courses</h3>
                <div className="course-list">
                  <div className="course-item">
                    <div className="course-info">
                      <h4>Python Fundamentals</h4>
                      <div className="course-platform-small">Udemy</div>
                    </div>
                    <div className="course-rating-small">
                      <a href="https://www.udemy.com/share/10bHxx/" target="_blank" rel="noopener noreferrer" className="course-btn-small">
                        View
                      </a>
                    </div>
                  </div>

                  <div className="course-item">
                    <div className="course-info">
                      <h4>AI & Machine Learning for Beginners</h4>
                      <div className="course-platform-small">Udemy</div>
                    </div>
                    <div className="course-rating-small">
                      <a href="https://www.udemy.com/share/10epAN3@05VLbZS6cyYWeanWr7aYYXJ9vYtzQ3pKj91dOS0vuGMtSk-q1ALWSAWO_Lam1fvX/" target="_blank" rel="noopener noreferrer" className="course-btn-small">
                        View
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tutoring Promo */}
            <div className="tutoring-promo">
              <p>Unlock your potential with premium 1-on-1 tutoring sessions at just <span className="promo-price">$55 / hour</span>.</p>
              <p className="promo-cta"><Link href="/tutoring#book">Book your session today!</Link></p>
            </div>

            {/* Quick Links */}
            <div className="education-links">
              <Link href="/tutoring" className="education-link">
                <i className="fas fa-user-graduate"></i>
                <span>Interested in Tutoring?</span>
                <i className="fas fa-arrow-right"></i>
              </Link>
              <Link href="/#courses" className="education-link">
                <i className="fas fa-book-open"></i>
                <span>Course Details</span>
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
