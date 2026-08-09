"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-[#94a3b8] py-12 border-t border-[var(--glass-border)] mt-16">
      <div className="w-[90%] max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="text-2xl font-bold font-[Dancing Script] text-[var(--color-primary)]">
            Faruk Hasan
          </div>
          <p className="text-sm">QA Engineer | Automation & AI-Driven Testing Specialist</p>
          <p className="text-xs text-[#64748b]">Empowering developers and testers with knowledge and tools for success.</p>
        </div>

        {/* Social Connect */}
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-semibold text-white">Connect With Me</h4>
          <div className="flex items-center gap-3">
            <a href="https://www.linkedin.com/in/md-faruk-hasan/" className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center hover:bg-blue-600 transition-colors" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
            <a href="https://www.youtube.com/@kidzcodeai" className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center hover:bg-red-600 transition-colors" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
            <a href="https://www.facebook.com/HasanMd2020/" className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center hover:bg-blue-800 transition-colors" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
            <a href="https://github.com/faruklmu17" className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center hover:bg-[#333] transition-colors" target="_blank" rel="noopener noreferrer"><i className="fab fa-github"></i></a>
          </div>
        </div>

        {/* Share */}
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-semibold text-white">Share This Page</h4>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center hover:bg-[#0ea5e9] transition-colors" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`)}><i className="fab fa-twitter"></i></button>
            <button className="w-10 h-10 rounded-full bg-[#1e293b] text-white flex items-center justify-center hover:bg-blue-600 transition-colors" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`)}><i className="fab fa-linkedin-in"></i></button>
          </div>
        </div>
      </div>
      
      <div className="w-[90%] max-w-[1100px] mx-auto mt-12 pt-6 border-t border-[#1e293b] text-xs text-center">
        <p>&copy; {new Date().getFullYear()} Faruk Hasan. All rights reserved. | <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link> | <Link href="/resources" className="hover:text-[var(--color-primary)]">Resources</Link></p>
      </div>
    </footer>
  );
}
