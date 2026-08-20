// Site-wide Canonical Person Entity for Faruk Hasan
(function() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://faruk-hasan.com/#faruk-hasan",
    "name": "Faruk Hasan",
    "url": "https://faruk-hasan.com/",
    "image": "https://faruk-hasan.com/assets/images/me.jpg",
    "jobTitle": [
      "Coding Instructor",
      "Senior Software Development Engineer in Test (SDET)"
    ],
    "hasCredential": "Master of Science in Electrical Engineering (MSEE)",
    "sameAs": [
      "https://outschool.com/teachers/Faruk-Hasan",
      "https://github.com/faruklmu17",
      "https://www.linkedin.com/in/md-faruk-hasan/",
      "https://youtube.com/@kidzcodeai"
    ]
  });
  document.head.appendChild(script);
})();
