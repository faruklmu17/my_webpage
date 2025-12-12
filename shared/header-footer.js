/* Shared Header and Footer JavaScript for All Quizzes */

// Inject Header HTML (matching the image layout exactly)
function injectHeader() {
  const headerHTML = `
    <header>
      <div class="header-content">
        <!-- Row 1: Home button + Name -->
        <div class="header-row-1">
          <div class="logo-container">
            <a href="../../index.html" class="home-button" aria-label="Home">
              <i class="fas fa-home"></i> Home
            </a>
          </div>
          <div class="headline">
            <h1>Faruk Hasan</h1>
          </div>
          <div></div> <!-- Empty div for spacing -->
        </div>

        <!-- Row 2: Subtitle -->
        <div class="header-row-2">
          <p><b>Software QA Engineer | Automation & AI-Driven Testing Specialist</b></p>
        </div>

        <!-- Row 3: Navigation + Social icons -->
        <div class="header-row-3">
          <nav>
            <ul>
              <li><a href="../../index.html#about">About Me</a></li>
              <li><a href="../../index.html#career">Career</a></li>
              <li><a href="../../index.html#courses">Courses</a></li>
              <li><a href="../../index.html#projects">Projects</a></li>
              <li><a href="../../resources.html">Resources</a></li>
              <li><a href="../../index.html#investment">Investment</a></li>
              <li><a href="../../index.html#contact">Contact</a></li>
            </ul>
          </nav>
          <div class="social-icons">
            <a href="https://www.linkedin.com/in/md-faruk-hasan/" class="social-icon linkedin" aria-label="LinkedIn">
              <i class="fab fa-linkedin"></i>
            </a>
            <a href="https://www.youtube.com/@kidz_code" class="social-icon youtube" aria-label="YouTube">
              <i class="fab fa-youtube"></i>
            </a>
            <a href="https://www.facebook.com/HasanMd2020/" class="social-icon facebook" aria-label="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
          </div>
        </div>
      </div>
    </header>
  `;

  // Insert header at the beginning of body
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

// Inject Footer HTML (matching resources.html structure)
function injectFooter() {
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
            <a href="https://www.linkedin.com/in/md-faruk-hasan/" class="social-icon linkedin" aria-label="LinkedIn" target="_blank">
              <i class="fab fa-linkedin"></i>
            </a>
            <a href="https://www.youtube.com/@kidz_code" class="social-icon youtube" aria-label="YouTube" target="_blank">
              <i class="fab fa-youtube"></i>
            </a>
            <a href="https://www.facebook.com/HasanMd2020/" class="social-icon facebook" aria-label="Facebook" target="_blank">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://github.com/faruklmu17" class="social-icon github" aria-label="GitHub" target="_blank">
              <i class="fab fa-github"></i>
            </a>
          </div>
        </div>

        <div class="footer-share">
          <h4>Share This Page</h4>
          <div class="share-buttons">
            <a href="javascript:void(0)" onclick="shareOnFacebook()" class="share-btn facebook" aria-label="Share on Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="javascript:void(0)" onclick="shareOnTwitter()" class="share-btn twitter" aria-label="Share on Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="javascript:void(0)" onclick="shareOnLinkedIn()" class="share-btn linkedin" aria-label="Share on LinkedIn">
              <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="javascript:void(0)" onclick="shareByEmail()" class="share-btn email" aria-label="Share by Email">
              <i class="fas fa-envelope"></i>
            </a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Faruk Hasan. All rights reserved. |
          <a href="../../index.html">Home</a> |
          <a href="../../resources.html">Resources</a>
        </p>
      </div>
    </footer>
  `;

  // Insert footer at the end of body
  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// Initialize header and footer on page load
document.addEventListener('DOMContentLoaded', function() {
  injectHeader();
  injectFooter();
});

// Social Sharing Functions
function shareOnFacebook() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
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
  const title = encodeURIComponent(document.title);
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareByEmail() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const subject = `Check out this quiz: ${document.title}`;
  const body = `I thought you might be interested in this quiz: ${window.location.href}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

// Header scroll effect (optional enhancement)
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  if (window.scrollY > 100) {
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
    header.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.1)';
  } else {
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
  }
});

// Mobile menu toggle (if needed for future enhancements)
function toggleMobileMenu() {
  const nav = document.querySelector('header nav');
  nav.classList.toggle('mobile-active');
}

// Additional initialization after header/footer are injected
function initializePageFeatures() {
  // Smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Skip if it's just "#" or if the target doesn't exist
      if (href === '#' || !document.querySelector(href)) {
        return;
      }

      e.preventDefault();

      const target = document.querySelector(href);
      const headerHeight = document.querySelector('header').offsetHeight;
      const targetPosition = target.offsetTop - headerHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

// Call initialization after DOM is loaded and header/footer are injected
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for header/footer to be injected
  setTimeout(initializePageFeatures, 100);
});
