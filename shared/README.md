# Shared Header and Footer Components

This directory contains reusable header and footer components that ensure consistent styling and functionality across all quizzes and pages on the website.

## Files

### `header-footer.css`
Contains all the CSS styles for:
- Header with profile image, navigation, and social icons
- Footer with three sections (info, social, share)
- Responsive design for mobile devices
- CSS variables for consistent theming
- Google Fonts imports (Dancing Script, Inter)

### `header-footer.js`
Contains JavaScript functions for:
- Social sharing (Facebook, Twitter, LinkedIn, Email)
- Header scroll effects
- Smooth scrolling for anchor links
- Mobile menu functionality (future enhancement)

### `quiz-template.html`
A template file showing how to properly implement the shared header and footer in new quizzes.

## Usage

### 1. Include the CSS and JS files

```html
<!-- In the <head> section -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="../../shared/header-footer.css">

<!-- Before closing </body> tag -->
<script src="../../shared/header-footer.js"></script>
```

### 2. Add the Header HTML

```html
<header>
  <div class="header-content">
    <div class="header-left">
      <div class="profile-image">
        <img src="../../me.jpg" alt="Faruk Hasan">
      </div>
      <div class="headline">
        <h1>Faruk Hasan</h1>
        <p><span class="highlight">Software QA Engineer | Automation & AI-Driven Testing Specialist</span></p>
      </div>
    </div>
    <div class="nav-social-container">
      <nav>
        <ul>
          <li><a href="../../index.html#about">About Me</a></li>
          <li><a href="../../index.html#courses">Courses</a></li>
          <li><a href="../../index.html#projects">Projects</a></li>
          <li><a href="../../index.html#blog">Blog</a></li>
          <li><a href="../../index.html#my dividends">Dividends</a></li>
          <li><a href="../../resources.html">Resources</a></li>
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
```

### 3. Add the Footer HTML

```html
<footer>
  <div class="footer-content">
    <div class="footer-info">
      <div class="footer-logo">Faruk Hasan</div>
      <p>QA Engineer | Automation & AI-Driven Testing Specialist</p>
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
    <p>&copy; 2025 Faruk Hasan. All rights reserved.</p>
  </div>
</footer>
```

### 4. Add Quiz-Specific Styles

```html
<style>
  /* Header margin adjustment for quiz */
  header {
    margin-bottom: 2rem;
  }
  
  /* Your quiz-specific styles here */
  body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }
</style>
```

## Features

### Header Features
- **Sticky positioning** - Header stays at top when scrolling
- **Backdrop blur effect** - Modern glass morphism design
- **Profile image** - 90px circular image with hover effects
- **Dancing Script font** - Elegant cursive font for name
- **Navigation menu** - Animated underlines on hover
- **Social icons** - LinkedIn, YouTube, Facebook with hover effects
- **Responsive design** - Mobile-friendly layout

### Footer Features
- **Three-column layout** - Info, Social, Share sections
- **Social media links** - All major platforms
- **Share functionality** - Facebook, Twitter, LinkedIn, Email
- **Responsive design** - Single column on mobile

### JavaScript Features
- **Social sharing functions** - Ready-to-use sharing functionality
- **Smooth scrolling** - For anchor links
- **Header scroll effects** - Enhanced backdrop on scroll
- **Mobile-friendly** - Touch-optimized interactions

## Path Adjustments

When using in different directory levels, adjust the paths:

- **Root level**: `href="shared/header-footer.css"`
- **One level deep**: `href="../shared/header-footer.css"`
- **Two levels deep**: `href="../../shared/header-footer.css"`

Same applies to:
- Image paths (`me.jpg`)
- Navigation links (`index.html`, `resources.html`)
- JavaScript file (`header-footer.js`)

## Benefits

1. **Consistency** - All pages have identical header/footer
2. **Maintainability** - Update once, applies everywhere
3. **Performance** - Shared CSS/JS files are cached
4. **Responsive** - Mobile-optimized design
5. **SEO-friendly** - Proper semantic HTML structure
6. **Accessibility** - ARIA labels and keyboard navigation

## Example Implementation

See `quiz-template.html` for a complete example of how to implement the shared header and footer in a new quiz.
