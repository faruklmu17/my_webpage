/* Shared Header and Footer JavaScript for All Quizzes */

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

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
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
});
