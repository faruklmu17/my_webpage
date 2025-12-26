/* Shared Header and Footer JavaScript for All Quizzes */

// Detect current depth relative to root
function getRootPath() {
  const path = window.location.pathname;
  // If we are in a subfolder like /quizzes/GED/, we need ../../
  // A simple way is to count slashes or check current directory
  // Since we know the structure:
  // /index.html (0)
  // /about/about_me.html (1)
  // /quizzes/GED/quiz.html (2)

  // This is a more robust way to find the root relative to the current file
  const scripts = document.getElementsByTagName('script');
  for (let script of scripts) {
    if (script.src.includes('shared/header-footer.js')) {
      // The script source will tell us where the root is
      // If src is "../../shared/header-footer.js", then root is "../../"
      const src = script.getAttribute('src');
      return src.replace('shared/header-footer.js', '');
    }
  }
  return '../'; // Fallback
}

// Inject Header HTML (matching the homepage layout exactly)
function injectHeader() {
  const root = getRootPath();
  const headerHTML = `
    <header>
      <div class="header-content">
        <div class="header-left">
          <div class="profile-image">
            <img src="${root}assets/images/me.jpg" alt="Faruk Hasan">
          </div>
          <div class="headline">
            <h1>Faruk Hasan</h1>
            <p><span class="highlight">Software QA Engineer | Automation & AI-Driven Testing Specialist</span></p>
          </div>
        </div>
        <div class="nav-social-container">
          <nav>
            <ul>
              <li><a href="${root}index.html#about">About Me</a></li>
              <li><a href="${root}index.html#courses">Courses</a></li>
              <li><a href="${root}index.html#projects">Projects</a></li>
              <li><a href="${root}blog.html">Blog</a></li>
              <li><a href="${root}tutoring/tutoring.html">Tutoring</a></li>
              <li><a href="${root}index.html#dividend-income">Dividends</a></li>
              <li><a href="${root}resources/resources.html">Resources</a></li>
            </ul>
          </nav>
          <div class="social-icons">
            <a href="https://www.linkedin.com/in/md-faruk-hasan/" class="social-icon linkedin" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="https://www.youtube.com/@kidz_code" class="social-icon youtube" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
            <a href="https://www.facebook.com/HasanMd2020/" class="social-icon facebook" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          </div>
        </div>
      </div>
    </header>
  `;

  // Check if header already exists to avoid double injection
  if (document.querySelector('.header-content') || document.querySelector('header')) {
    console.log('Header already exists, skipping injection.');
    return;
  }

  // Insert header at the beginning of body
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

// Inject Footer HTML (matching the site footer structure)
function injectFooter() {
  const root = getRootPath();
  const footerHTML = `
    <footer>
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-logo">Faruk Hasan</div>
          <p>QA Engineer | Automation & AI-Driven Testing Specialist</p>
          <p>Empowering developers and testers with knowledge and tools for success.</p>
        </div>

        <div class="footer-social">
          <h4>Connect With Me</h4>
          <div class="social-icons-footer">
            <a href="https://www.linkedin.com/in/md-faruk-hasan/" class="social-icon linkedin" aria-label="LinkedIn" target="_blank"><i class="fab fa-linkedin"></i></a>
            <a href="https://www.youtube.com/@kidz_code" class="social-icon youtube" aria-label="YouTube" target="_blank"><i class="fab fa-youtube"></i></a>
            <a href="https://www.facebook.com/HasanMd2020/" class="social-icon facebook" aria-label="Facebook" target="_blank"><i class="fab fa-facebook-f"></i></a>
            <a href="https://github.com/faruklmu17" class="social-icon github" aria-label="GitHub" target="_blank"><i class="fab fa-github"></i></a>
          </div>
        </div>

        <div class="footer-share">
          <h4>Share This Page</h4>
          <div class="share-buttons">
            <a href="javascript:void(0)" onclick="shareOnFacebook()" class="share-btn facebook" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="javascript:void(0)" onclick="shareOnTwitter()" class="share-btn twitter" aria-label="Share on Twitter"><i class="fab fa-twitter"></i></a>
            <a href="javascript:void(0)" onclick="shareOnLinkedIn()" class="share-btn linkedin" aria-label="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            <a href="javascript:void(0)" onclick="shareByEmail()" class="share-btn email" aria-label="Share by Email"><i class="fas fa-envelope"></i></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Faruk Hasan. All rights reserved. |
          <a href="${root}index.html">Home</a> |
          <a href="${root}resources/resources.html">Resources</a> |
          <a href="${root}legal/privacy.html">Privacy Policy</a>
        </p>
      </div>
    </footer>
  `;

  // Check if footer already exists to avoid double injection
  if (document.querySelector('.footer-content') || document.querySelector('footer')) {
    console.log('Footer already exists, skipping injection.');
    return;
  }

  // Insert footer at the end of body
  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// Initialize header and footer on page load
document.addEventListener('DOMContentLoaded', function () {
  injectHeader();
  injectFooter();
});

// Social Sharing Functions
function shareOnFacebook() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareOnLinkedIn() {
  const url = encodeURIComponent(window.location.href);
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareByEmail() {
  const title = document.title;
  const url = window.location.href;
  const subject = `Check out this quiz: ${title}`;
  const body = `I thought you might be interested in this quiz: ${url}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}
