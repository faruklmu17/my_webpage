"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <style jsx>{`
        .headline-highlight {
          background: linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #e74c3c 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: 600;
          font-size: 0.9rem;
          animation: gradientShift 4s ease-in-out infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .nav-link {
          position: relative;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          transition: width 0.3s ease, left 0.3s ease;
        }

        .nav-link:hover::after {
          width: 80%;
          left: 10%;
        }

        .social-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          transition: all 0.3s ease;
          font-size: 1.2rem;
          background-color: rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          border: 2px solid transparent;
        }

        .social-icon-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .social-linkedin { color: #0077B5; border-color: rgba(0, 119, 181, 0.3); }
        .social-youtube { color: #FF0000; border-color: rgba(255, 0, 0, 0.3); }
        .social-facebook { color: #1877F2; border-color: rgba(24, 119, 242, 0.3); }

        /* Dark mode overrides for social icons */
        @media (prefers-color-scheme: dark) {
          .social-icon-btn {
            background-color: rgba(15, 23, 42, 0.9);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
          }
        }
      `}</style>
      
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] sticky top-0 z-50 py-2 transition-all duration-300 w-full">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center h-full px-4">
          
          {/* Left Side: Profile & Title */}
          <div className="flex items-center gap-[0.8rem] pr-2 shrink-0">
            <div className="w-[65px] h-[65px] rounded-full overflow-hidden border-[3px] border-[#3a6ea5] shadow-[0_4px_10px_rgba(0,0,0,0.1)] shrink-0 m-[0.5rem]">
              <Image 
                src="/assets/images/me.jpg" 
                alt="Faruk Hasan" 
                width={65} 
                height={65} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-dancing)] text-[2.2rem] text-[#0077b5] whitespace-nowrap m-0 mb-[0.5rem] font-bold leading-none">
                Faruk Hasan
              </h1>
              <p className="text-[var(--secondary-color)] text-[0.85rem] font-medium leading-[1.3] m-0 mt-[0.3rem] tracking-[0.1px] whitespace-nowrap hidden md:block dark:text-slate-300">
                <span className="headline-highlight">Software QA Engineer | Automation & AI-Driven Testing Specialist</span>
              </p>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex text-[1.8rem] text-[var(--secondary-color)] dark:text-slate-300 bg-transparent border-none cursor-pointer p-2 z-[2002]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          {/* Navigation Links & Socials */}
          <div className={`md:flex items-center gap-4 justify-end ${isOpen ? 'fixed top-0 left-0 w-[100vw] h-[100vh] bg-white/98 dark:bg-slate-900/98 flex-col justify-center items-center gap-[2rem] z-[2000] backdrop-blur-[10px]' : 'hidden'}`}>
            <nav className="flex justify-end">
              <ul className="flex flex-col md:flex-row list-none gap-2 flex-nowrap items-center m-0 p-0">
                <li><Link href="/" className="nav-link no-underline text-[var(--secondary-color)] dark:text-slate-300 font-medium py-[0.5rem] px-[0.6rem] text-[0.9rem] transition-all duration-300 rounded-[6px] whitespace-nowrap hover:text-[#38bdf8]" onClick={() => setIsOpen(false)}>Home</Link></li>
                <li><Link href="/#about" className="nav-link no-underline text-[var(--secondary-color)] dark:text-slate-300 font-medium py-[0.5rem] px-[0.6rem] text-[0.9rem] transition-all duration-300 rounded-[6px] whitespace-nowrap hover:text-[#38bdf8]" onClick={() => setIsOpen(false)}>About Me</Link></li>
                <li><Link href="/#courses" className="nav-link no-underline text-[var(--secondary-color)] dark:text-slate-300 font-medium py-[0.5rem] px-[0.6rem] text-[0.9rem] transition-all duration-300 rounded-[6px] whitespace-nowrap hover:text-[#38bdf8]" onClick={() => setIsOpen(false)}>Courses</Link></li>
                <li><Link href="/#projects" className="nav-link no-underline text-[var(--secondary-color)] dark:text-slate-300 font-medium py-[0.5rem] px-[0.6rem] text-[0.9rem] transition-all duration-300 rounded-[6px] whitespace-nowrap hover:text-[#38bdf8]" onClick={() => setIsOpen(false)}>Projects</Link></li>
                <li><Link href="/blog" className="nav-link no-underline text-[var(--secondary-color)] dark:text-slate-300 font-medium py-[0.5rem] px-[0.6rem] text-[0.9rem] transition-all duration-300 rounded-[6px] whitespace-nowrap hover:text-[#38bdf8]" onClick={() => setIsOpen(false)}>Blog</Link></li>
                <li><Link href="/tutoring" className="nav-link no-underline text-[var(--secondary-color)] dark:text-slate-300 font-medium py-[0.5rem] px-[0.6rem] text-[0.9rem] transition-all duration-300 rounded-[6px] whitespace-nowrap hover:text-[#38bdf8]" onClick={() => setIsOpen(false)}>Tutoring</Link></li>
                <li><Link href="/resources" className="nav-link no-underline text-[var(--secondary-color)] dark:text-slate-300 font-medium py-[0.5rem] px-[0.6rem] text-[0.9rem] transition-all duration-300 rounded-[6px] whitespace-nowrap hover:text-[#38bdf8]" onClick={() => setIsOpen(false)}>Resources</Link></li>
              </ul>
            </nav>

            <div className="flex gap-4 ml-0 md:ml-auto mt-4 md:mt-0">
              <a href="https://www.linkedin.com/in/md-faruk-hasan/" className="social-icon-btn social-linkedin" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
              <a href="https://www.youtube.com/@kidzcodeai" className="social-icon-btn social-youtube" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
              <a href="https://www.facebook.com/HasanMd2020/" className="social-icon-btn social-facebook" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
            </div>
          </div>

        </div>
      </header>
    </>
  );
}
