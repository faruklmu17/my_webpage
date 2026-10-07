export default function Courses() {
  return (
    <section id="courses">
      <div className="courses-wrapper">
        <h2>Courses</h2>
        <div className="courses-grid">
          <div className="course-card">
            <div className="course-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/udemy_course_image.jpg" alt="Python Fundamentals Course" loading="lazy" />
            </div>
            <div className="course-badge">Udemy</div>
            <a href="https://www.udemy.com/share/10bHxx/" target="_blank" rel="noopener noreferrer" className="course-link">
              <h3>Python Fundamentals: Fun and Practical Projects for Beginners</h3>
            </a>
            <div className="course-year">2024</div>
            <p className="course-description">An interactive course focusing on Python basics through real-world projects.</p>

            {/* Reviews Section for first course */}
            <div className="course-reviews">
              <h4>Student Reviews</h4>
              <div className="review-container">
                <div className="review">
                  <div className="stars">
                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                  </div>
                  <p className="review-text">&quot;Great course. This is actually fun. Never learned Python but it looks so easy now. Thank You Instructor Mr. Faruk Hasan.&quot;</p>
                  <p className="reviewer">- Habibus Sobhan S.</p>
                </div>
                <div className="review">
                  <div className="stars">
                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                  </div>
                  <p className="review-text">&quot;Really easy to follow and learn!&quot;</p>
                  <p className="reviewer">- Syed M.</p>
                </div>
              </div>
            </div>

            <a href="https://www.udemy.com/share/10bHxx/" target="_blank" rel="noopener noreferrer" className="course-button">View Course</a>
          </div>

          <div className="course-card">
            <div className="course-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/blog_images/ai.jpg" alt="AI & Machine Learning for Beginners Course" loading="lazy" />
            </div>
            <div className="course-badge">Udemy</div>
            <a href="https://www.udemy.com/share/10epAN3@05VLbZS6cyYWeanWr7aYYXJ9vYtzQ3pKj91dOS0vuGMtSk-q1ALWSAWO_Lam1fvX/" target="_blank" rel="noopener noreferrer" className="course-link">
              <h3>AI & Machine Learning for Beginners</h3>
            </a>
            <div className="course-year">2024</div>
            <p className="course-description">An accessible introduction to AI and machine learning concepts with hands-on projects for beginners.</p>
            <a href="https://www.udemy.com/share/10epAN3@05VLbZS6cyYWeanWr7aYYXJ9vYtzQ3pKj91dOS0vuGMtSk-q1ALWSAWO_Lam1fvX/" target="_blank" rel="noopener noreferrer" className="course-button">View Course</a>
          </div>
        </div>
      </div>
    </section>
  );
}
