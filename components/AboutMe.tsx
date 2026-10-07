import Link from 'next/link';

export default function AboutMe() {
  return (
    <section id="about">
      <div className="about-container two-column">
        {/* Bio Column */}
        <div className="about-bio">
          <div className="section-title-wrapper">
            <h2 className="section-title">About Me</h2>
            <div className="title-underline"></div>
          </div>
          <div className="about-content">
            <div className="about-text">
              <p className="about-intro">
                Hi, I&apos;m <span className="name-highlight">Faruk Hasan</span> — a catalyst for quality and a passionate educator.
              </p>

              <div className="role-badges">
                <span className="role-badge"><i className="fas fa-microchip"></i> QA Architect</span>
                <span className="role-badge"><i className="fas fa-graduation-cap"></i> Tech Mentor</span>
                <span className="role-badge"><i className="fas fa-brain"></i> AI Pioneer</span>
              </div>

              <p>
                With over <span className="text-highlight">6+ years of specialized experience</span> in automation
                engineering, I bridge the gap between complex code and flawless user experiences. My expertise lies in
                architecting scalable testing frameworks that integrate seamlessly with modern CI/CD ecosystems.
              </p>

              <p>
                Beyond the terminal, I&apos;m committed to democratizing tech education. I design and lead curriculum for the
                next generation of engineers, transforming abstract concepts into hands-on innovation.
              </p>

              <div className="interest-tags">
                <span className="tag">#Playwright</span>
                <span className="tag">#DevOps</span>
                <span className="tag">#EdTech</span>
                <span className="tag">#AIAutomation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Career Highlights Column */}
        <div className="career-highlights">
          <div className="section-title-wrapper">
            <h2 className="section-title">Career Milestones</h2>
            <div className="title-underline"></div>
          </div>

          <div className="career-card compact premium">
            <div className="career-header">
              <div className="job-title-row">
                <h3>Senior Software QA Engineer</h3>
                <span className="company-badge">Digital.ai</span>
              </div>
              <div className="duration-location">
                <span className="duration"><i className="far fa-calendar-alt"></i> 2022 – Present</span>
              </div>
            </div>
            <div className="tech-stack-row">
              <span className="tech-tag">Playwright</span>
              <span className="tech-tag">GitHub Actions</span>
              <span className="tech-tag">TypeScript</span>
            </div>
            <ul className="achievements">
              <li>
                <i className="fas fa-bolt"></i>{' '}
                <span>
                  Architected Playwright frameworks that reduced regression testing time by <strong>50%</strong>.
                </span>
              </li>
              <li>
                <i className="fas fa-sync"></i>{' '}
                <span>
                  Integrated comprehensive end-to-end CI/CD pipelines to support high-velocity software releases.
                </span>
              </li>
              <li>
                <i className="fas fa-users"></i>{' '}
                <span>
                  Spearheaded quality assurance strategies for enterprise-grade cloud platforms and applications.
                </span>
              </li>
            </ul>
          </div>

          <div className="career-card compact premium">
            <div className="career-header">
              <div className="job-title-row">
                <h3>Software Test Engineer</h3>
                <span className="company-badge grey">M.M.Hayes Co</span>
              </div>
              <div className="duration-location">
                <span className="duration"><i className="far fa-calendar-alt"></i> 2020 – 2022</span>
              </div>
            </div>
            <div className="tech-stack-row">
              <span className="tech-tag">Selenium</span>
              <span className="tech-tag">Python</span>
              <span className="tech-tag">Azure DevOps</span>
            </div>
            <ul className="achievements">
              <li>
                <i className="fas fa-chart-line"></i>{' '}
                <span>
                  Optimized legacy automation suites, boosting overall execution efficiency by <strong>30%</strong>.
                </span>
              </li>
              <li>
                <i className="fas fa-chalkboard"></i>{' '}
                <span>Mentored and upskilled junior engineers on modern automation paradigms and best practices.</span>
              </li>
              <li>
                <i className="fas fa-check-circle"></i>{' '}
                <span>
                  Implemented robust cross-browser stability protocols to ensure seamless user experiences.
                </span>
              </li>
            </ul>
          </div>

          <div className="career-footer">
            <Link href="/assets/resume.pdf" target="_blank" className="view-more-link premium-btn">
              Full Portfolio <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
