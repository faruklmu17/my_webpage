# Shared Header and Footer Components

This directory contains reusable header and footer components that ensure consistent styling and functionality across all quizzes and pages on the website.

## 🎯 NEW: Automatic Header/Footer Injection

**The header and footer are now automatically injected by JavaScript!** You no longer need to manually add the HTML code.

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
- **Automatic header/footer HTML injection** (NEW!)
- Social sharing (Facebook, Twitter, LinkedIn, Email)
- Header scroll effects
- Smooth scrolling for anchor links
- Mobile menu functionality (future enhancement)

### `quiz-template.html`
A template file showing how to properly implement the shared header and footer in new quizzes.

## ✨ Quick Start - How to Use

### Step 1: Include Required Files in `<head>`

```html
<head>
  <!-- Your meta tags and title -->
  <title>Your Quiz Title</title>

  <!-- Font Awesome for icons (REQUIRED) -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <!-- Shared Header/Footer CSS (REQUIRED) -->
  <link rel="stylesheet" href="../../shared/header-footer.css">

  <!-- Your quiz-specific styles -->
  <style>
    /* Your custom styles here */
  </style>
</head>
```

### Step 2: Include JavaScript Before Closing `</body>`

```html
  <!-- Shared Header and Footer JavaScript (REQUIRED) -->
  <script src="../../shared/header-footer.js"></script>
</body>
</html>
```

### Step 3: Structure Your Quiz Body

**IMPORTANT: Do NOT manually add `<header>` or `<footer>` tags!**

The JavaScript will automatically inject them. Your body should look like:

```html
<body>
  <!-- Header will be automatically injected here by JavaScript -->

  <div class="quiz-container">
    <h1 class="quiz-title">Your Quiz Title</h1>
    <!-- Your quiz content here -->
  </div>

  <!-- Footer will be automatically injected here by JavaScript -->

  <script src="../../shared/header-footer.js"></script>
</body>
```

That's it! The header and footer will be automatically added when the page loads.

## 📋 Complete Example

Here's a complete minimal quiz file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Quiz</title>

  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <!-- Shared Header/Footer CSS -->
  <link rel="stylesheet" href="../../shared/header-footer.css">

  <style>
    /* Your quiz styles */
    .quiz-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 2rem;
    }
  </style>
</head>
<body>
  <!-- Header injected automatically -->

  <div class="quiz-container">
    <h1>My Quiz</h1>
    <!-- Your quiz content -->
  </div>

  <!-- Footer injected automatically -->

  <script src="../../shared/header-footer.js"></script>
</body>
</html>
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

## 🎨 What Gets Injected

### Header Includes:
- Profile image (automatically points to `../../me.jpg`)
- Name: "Faruk Hasan"
- Tagline: "Software QA Engineer | Automation & AI-Driven Testing Specialist"
- Navigation menu (About Me, Career, Courses, Projects, Resources, Contact)
- Social icons (LinkedIn, YouTube, Facebook)

### Footer Includes:
- Footer logo and description
- Social media links (LinkedIn, YouTube, Facebook, GitHub)
- Share buttons (Facebook, Twitter, LinkedIn, Email)
- Copyright notice
- Links to Home and Resources pages

## 🔧 Path Adjustments

The JavaScript assumes your quiz is located at:
```
quizzes/[CATEGORY]/your-quiz.html
```

If your quiz is in a different location, you'll need to adjust paths in the JavaScript:

- **Two levels deep** (standard): `../../`
- **One level deep**: `../`
- **Root level**: `./`

## ✅ Benefits

1. **Automatic** - No manual HTML copying needed
2. **Consistency** - All pages have identical header/footer
3. **Maintainability** - Update once in JS file, applies everywhere
4. **Performance** - Shared CSS/JS files are cached
5. **Responsive** - Mobile-optimized design
6. **SEO-friendly** - Proper semantic HTML structure
7. **Accessibility** - ARIA labels and keyboard navigation

## 🐛 Troubleshooting

**Header/Footer not showing?**
- Check browser console for errors
- Verify the script path is correct: `../../shared/header-footer.js`
- Make sure Font Awesome CSS is loaded
- Check that JavaScript is enabled in browser

**Styles look wrong?**
- Verify CSS path is correct: `../../shared/header-footer.css`
- Check for conflicting styles in your quiz CSS
- Clear browser cache and reload

**Images not loading?**
- Profile image should be at: `me.jpg` (from root)
- Adjust path in `header-footer.js` if your structure is different

**Links not working?**
- Verify your quiz is in the correct folder structure
- Adjust `../../` in the JavaScript if needed

## 📝 Customization

If you need to customize the header/footer for a specific quiz:

**Option 1: Override with CSS** (Recommended)
```html
<style>
  /* Override header background for this quiz only */
  header {
    background-color: #custom-color !important;
  }
</style>
```

**Option 2: Modify the JavaScript** (Not recommended)
- Only do this if you need different content
- Better to create a separate version for special cases

## 📂 Example Folder Structure

```
my_webpage/
├── index.html
├── resources.html
├── me.jpg (profile image)
├── shared/
│   ├── header-footer.css
│   ├── header-footer.js
│   ├── quiz-template.html
│   └── README.md
└── quizzes/
    ├── Python/
    │   └── python-basics.html
    ├── AI/
    │   └── ai_quiz_1.html
    └── Arduino/
        └── arduino_basics_quiz.html
```

## 🚀 Migration Guide

If you have existing quizzes with manual header/footer:

1. **Remove** the `<header>` HTML from your quiz
2. **Remove** the `<footer>` HTML from your quiz
3. **Add** the CSS link in `<head>`: `<link rel="stylesheet" href="../../shared/header-footer.css">`
4. **Add** the JS script before `</body>`: `<script src="../../shared/header-footer.js"></script>`
5. **Test** the page to ensure header/footer appear correctly

## 📞 Support

For issues or questions:
- Check this README first
- Review `quiz-template.html` for a working example
- Contact: Faruk Hasan
