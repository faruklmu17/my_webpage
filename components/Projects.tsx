import Link from 'next/link';

export default function Projects() {
  return (
    <section id="projects">
      <div className="projects-wrapper">
        <h2 className="section-title">Projects & GitHub Activity</h2>

        <div className="projects-grid">
          {/* Project: AI-Driven Student Grader (New) */}
          <div className="project-card">
            <div className="project-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/student_grader_mockup.png" alt="AI-Driven Student Grader mockup" loading="lazy" />
              <div className="project-overlay">
                <span className="project-tag">AI-Driven</span>
              </div>
            </div>
            <div className="project-content">
              <div className="project-header">
                <h3>AI-Driven Student Grader</h3>
                <div className="project-tags">
                  <span className="project-tag">Python</span>
                  <span className="project-tag">RAG / OpenAI</span>
                  <span className="project-tag">EdTech</span>
                </div>
              </div>
              <p className="project-description">
                An intelligent grading system that leverages Retrieval-Augmented Generation
                (RAG) to provide students with deeply personalized feedback and evidence-based scoring based on specific
                rubrics.
              </p>
              <div className="project-links">
                <a href="https://github.com/faruklmu17/student_grader" className="project-link github-btn" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i> GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Project 1 */}
          <div className="project-card">
            <div className="project-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/playwright_extension.png" alt="Playwright Browser Extension Mockup" loading="lazy" />
              <div className="project-overlay">
                <span className="project-tag">Open Source</span>
              </div>
            </div>
            <div className="project-content">
              <div className="project-header">
                <h3>Playwright Browser Extension</h3>
                <div className="project-tags">
                  <span className="project-tag">TypeScript</span>
                  <span className="project-tag">Chrome Extension</span>
                  <span className="project-tag">QA</span>
                </div>
              </div>
              <p className="project-description">
                A high-performance Chrome extension that integrates with Playwright to
                deliver real-time test execution results directly in your browser. Features live status updates and
                detailed failure logs.
              </p>
              <div className="project-links">
                <a href="https://github.com/faruklmu17/playwright_test_result" className="project-link github-btn" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-github"></i> GitHub
                </a>
                <Link href="/projects/playwright_test_result_chrome_extension" className="project-link demo-btn">
                  <i className="fas fa-external-link-alt"></i> Demo
                </Link>
              </div>
            </div>
          </div>
          
          {/* Project: AI Planet Builder */}
          <div className="project-card">
            <div className="project-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/ai_civilization_mockup.png" alt="AI Planet Builder Mockup" loading="lazy" />
              <div className="project-overlay">
                <span className="project-tag">System Simulation</span>
              </div>
            </div>
            <div className="project-content">
              <div className="project-header">
                <h3>AI Planet Builder</h3>
                <div className="project-tags">
                  <span className="project-tag">JavaScript</span>
                  <span className="project-tag">HTML5 Canvas</span>
                  <span className="project-tag">Cyber-System Physics</span>
                </div>
              </div>
              <p className="project-description">
                A premium cyber-planet sandbox simulation. Scale compute capacity, manage
                advanced CPU arrays and renewable energy grids, and maintain core temperatures to prevent ecological
                collapse!
              </p>
              <div className="project-links">
                <Link href="/games/ai_civilization" className="project-link demo-btn">
                  <i className="fas fa-play"></i> Play Now
                </Link>
              </div>
            </div>
          </div>

          {/* Project: Robo-Balance RL Game */}
          <div className="project-card">
            <div className="project-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/mascot.png" alt="Robo-Balance: RL Game Mockup" loading="lazy" style={{ background: 'white', objectFit: 'contain', padding: '20px' }} />
              <div className="project-overlay">
                <span className="project-tag">Interactive AI</span>
              </div>
            </div>
            <div className="project-content">
              <div className="project-header">
                <h3>Robo-Balance: RL Game</h3>
                <div className="project-tags">
                  <span className="project-tag">JavaScript</span>
                  <span className="project-tag">Reinforcement Learning</span>
                  <span className="project-tag">CartPole</span>
                </div>
              </div>
              <p className="project-description">
                An interactive web application that teaches Reinforcement Learning basics
                through a gamified CartPole simulation. Help the robot learn to balance using AI dynamics!
              </p>
              <div className="project-links">
                <Link href="/games/cartpole_balance" className="project-link demo-btn">
                  <i className="fas fa-play"></i> Play Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
