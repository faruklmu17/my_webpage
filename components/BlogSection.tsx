import Link from 'next/link';
import Image from 'next/image';

export default function BlogSection() {
  const blogPosts = [
    {
      title: "Mastering Python Decorators: A 5-Step Guide for Beginners",
      date: "May 11, 2026",
      readTime: "8 min read",
      excerpt: "Understand how Python decorators work behind the scenes. Learn everything from function objects to the magic of @decorator syntax in 5 simple steps.",
      imageSrc: "/blog_images/python_decorator_cover.png",
      link: "/blog_post/python_decorator_tutorial"
    },
    {
      title: "Playwright Screencast API Tutorial (v1.59+): Record Test Videos with Action Annotations",
      date: "April 25, 2026",
      readTime: "6 min read",
      excerpt: "Master the new Screencast API. Learn how to record custom test videos with visual action annotations for better debugging and documentation.",
      imageSrc: "/blog_images/playwright_screencast_thumb.png",
      link: "/blog_post/playwright_screencast_api_basics"
    },
    {
      title: "Mastering Playwright Soft Assertions: The Guide to expect.soft()",
      date: "January 11, 2026",
      readTime: "5 min read",
      excerpt: "Stop debugging blindly. Learn how Playwright soft assertions (expect.soft) let you catch multiple UI failures in a single test run.",
      imageSrc: "/blog_images/soft_assertion_cover.png",
      link: "/blog_post/playwright_soft_assertion"
    },
    {
      title: "Context-Switching is Dead: Monitoring Playwright Results via Browser Extension",
      date: "December 20, 2025",
      readTime: "7 min read",
      excerpt: "Stop digging through CI logs. Learn how to monitor your Playwright test results directly from your Chrome toolbar using a live status badge and GitHub Actions.",
      imageSrc: "/blog_images/playwright_extension_thumb.png",
      link: "/blog_post/playwright_browser_extension_test_result"
    }
  ];

  return (
    <section id="blog" className="blog-section">
      <div className="container">
        <h2 className="section-title">Latest Blog Posts</h2>
        <div className="blog-grid">
          {blogPosts.map((post, index) => (
            <div className="blog-card" key={index}>
              <div className="blog-image">
                <Link href={post.link}>
                  {/* Using regular img to avoid unconfigured remote Image domains or layout issues, since these are likely in the public directory */}
                  <img src={post.imageSrc} alt={post.title} loading="lazy" />
                </Link>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <div className="blog-date">
                    <i className="far fa-calendar-alt"></i>
                    <span>{post.date}</span>
                  </div>
                  <div className="blog-read-time">
                    <i className="far fa-clock"></i>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>

                <Link href={post.link} className="read-more-link">
                  Read More <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
