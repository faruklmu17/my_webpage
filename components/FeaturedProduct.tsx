"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function FeaturedProduct() {
  const [testState, setTestState] = useState<'pass' | 'fail'>('fail');

  return (
    <section id="featured-product" className="featured-product-section">
      <div className="section-title-wrapper" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ color: 'white' }}>Featured Project</h2>
        <div className="title-underline" style={{ margin: '0 auto', background: 'linear-gradient(90deg, #38bdf8, #818cf8)' }}></div>
      </div>
      
      <div className="featured-product-container">
        <div className="featured-product-content">
          <span className="featured-badge">v1.12 Release (100% Free)</span>
          <h2 className="featured-title">
            Playwright Browser Extension <br />
            <span style={{ color: '#38bdf8' }}>Monitor Tests in Browser</span>
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.95rem', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
            <i className="fas fa-code" style={{ color: '#38bdf8' }}></i> 
            <span>Designed & Developed by <strong>Faruk Hasan</strong></span>
          </div>

          <p className="featured-description">
            I built this Chrome extension to solve my own context-switching pain. It integrates seamlessly with Playwright
            to deliver real-time test execution results directly to your browser toolbar. Now featuring Dark Mode and
            Detailed Failed Test Logs.
          </p>

          <ul className="featured-features">
            <li><i className="fas fa-check-circle"></i> Live Status Badge & Test Summaries</li>
            <li><i className="fas fa-check-circle"></i> Beautiful Dark & Light Mode</li>
            <li><i className="fas fa-check-circle"></i> Detailed Failure Logs & Stack Traces</li>
            <li><i className="fas fa-check-circle"></i> Works with GitHub (Public, Private, Org) & AWS</li>
          </ul>

          <div className="featured-actions">
            <a href="https://chromewebstore.google.com/detail/cnbifhpjofgeaobfppnfnngfkkjniodh?utm_source=item-share-cb" target="_blank" rel="noopener noreferrer" className="featured-btn primary">
              <i className="fab fa-chrome"></i> Get Extension
            </a>
            <Link href="/projects/playwright_test_result_chrome_extension" className="featured-btn secondary">
              Learn More
            </Link>
          </div>
        </div>

        <div className="featured-product-visual interactive-mockup-section">
          {/* Mockup Toolbar / Browser Chrome */}
          <div className="browser-mockup-header">
            <div className="browser-dots">
              <span></span><span></span><span></span>
            </div>
            <div className="browser-address-bar">
              <i className="fas fa-lock"></i> github.com/pulls
            </div>
            <div className="browser-extensions">
              <div className="ext-icon badge-container" id="mockup-ext-badge">
                <i className="fas fa-flask" style={{ color: 'white', fontSize: '14px' }}></i>
                <span className={`ext-badge ${testState === 'pass' ? 'pass' : 'fail'}`} id="mockup-badge-count">
                  {testState === 'pass' ? 'OK' : '2'}
                </span>
              </div>
            </div>
          </div>

          {/* Extension Popup Mockup */}
          <div className={`ext-popup-mockup ${testState === 'pass' ? 'pass-state' : 'fail-state'}`} id="ext-popup">
            <div className="ext-header">
              <div className="ext-title">
                <span className="ext-logo">🎭</span> Test Results
              </div>
              <i className="far fa-moon ext-theme-icon"></i>
            </div>

            <div className="ext-url-section">
              <label>Results JSON URL (GitHub, AWS, etc)</label>
              <div className="ext-input-group">
                <input type="text" value="https://raw.githubusercontent.com/faruklmu17..." readOnly />
                <i className="far fa-clone"></i>
              </div>
              <div className="ext-url-actions">
                <button className="ext-btn save-btn">Save URL</button>
                <button className="ext-btn refresh-btn"><i className="fas fa-sync-alt"></i> Refresh</button>
              </div>
            </div>

            <div className="ext-summary-section">
              <label>SUMMARY</label>
              <div className="ext-summary-cards">
                <div className="ext-card pass-card">
                  <div className="ext-card-count" id="mockup-pass-count">
                    <i className="far fa-check-circle"></i> {testState === 'pass' ? '15' : '13'}
                  </div>
                  <div className="ext-card-label">PASSED</div>
                </div>
                <div className="ext-card fail-card" id="mockup-fail-card" style={{ opacity: testState === 'pass' ? '0.4' : '1' }}>
                  <div className="ext-card-count" id="mockup-fail-count">
                    <i className="far fa-times-circle"></i> {testState === 'pass' ? '0' : '2'}
                  </div>
                  <div className="ext-card-label">FAILED</div>
                </div>
              </div>
            </div>

            {testState === 'fail' && (
              <div className="ext-failures-section" id="mockup-failures-list" style={{ display: 'block' }}>
                <label>FAILING TESTS</label>
                <div className="ext-fail-item">
                  <i className="fas fa-times"></i> page has proper language attribute
                </div>
                <div className="ext-fail-item">
                  <i className="fas fa-times"></i> footer is present
                </div>
              </div>
            )}

            <div className="ext-footer">
              <div className="ext-total">15 Total Tests</div>
              <div className="ext-time"><i className="far fa-clock"></i> Last updated: 1 day ago</div>
            </div>
          </div>

          {/* Simulation Toggles */}
          <div className="mockup-controls">
            <button 
              className={`mockup-toggle-btn pass ${testState === 'pass' ? 'active' : ''}`} 
              onClick={() => setTestState('pass')}
            >
              <i className="fas fa-check"></i> Simulate Test Pass
            </button>
            <button 
              className={`mockup-toggle-btn fail ${testState === 'fail' ? 'active' : ''}`} 
              onClick={() => setTestState('fail')}
            >
              <i className="fas fa-times"></i> Simulate Test Fail
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
