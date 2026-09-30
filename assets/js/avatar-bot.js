// avatar-bot.js - Logic for AI Faruk Avatar Modal

document.addEventListener('DOMContentLoaded', () => {
  // Create Modal HTML Structure
  const modalHTML = `
    <div class="avatar-modal-overlay" id="avatarModalOverlay">
      <div class="avatar-modal-content">
        <!-- Header -->
        <div class="avatar-modal-header">
          <h3 class="avatar-modal-title">
            <i class="fas fa-video"></i> AI Faruk Assistant 
            <span class="avatar-version-badge">v1 (Experimental)</span>
          </h3>
          <button class="avatar-modal-close" id="avatarModalClose">&times;</button>
        </div>
        
        <!-- Video Player Area -->
        <div class="avatar-video-container">
          <div class="avatar-ai-disclosure">
            <i class="fas fa-robot"></i> AI-Generated Video
          </div>
          <video id="avatar-video" playsinline webkit-playsinline preload="metadata">
            <source id="avatar-video-source" src="" type="video/mp4">
          </video>
          
          <div class="avatar-play-overlay" id="avatarPlayOverlay">
            <button class="avatar-play-btn" id="avatarPlayBtn">
              <i class="fas fa-play"></i>
            </button>
          </div>
          
          <div class="avatar-controls">
            <button class="avatar-control-btn" id="avatarMuteBtn" title="Mute/Unmute">
              <i class="fas fa-volume-up"></i>
            </button>
          </div>
        </div>
        
        <!-- Transcript Area -->
        <div class="avatar-transcript-area">
          <p class="avatar-transcript-text" id="avatarTranscript">"Hi! I'm AI Faruk. Ask me about classes, or choose a question below."</p>
        </div>
        
        <!-- Suggested Questions -->
        <div class="avatar-suggestions-area">
          <h4 class="avatar-suggestions-title">Suggested Questions</h4>
          <div class="avatar-suggestions-list" id="avatarSuggestionsList">
            <!-- Populated by JS -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Inject HTML right before </body>
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer);

  // Fake FAQ Database (Phase 1)
  const FAQ_DATABASE = {
    'welcome': {
      videoSrc: 'assets/avatar/welcome-v1.mp4',
      transcript: 'Hi! I’m AI Faruk. Ask me about classes, or choose a question below.'
    }
    // More questions will be added later
  };

  // State
  let currentVideoId = null;

  // DOM Elements
  const overlay = document.getElementById('avatarModalOverlay');
  const closeBtn = document.getElementById('avatarModalClose');
  const videoEl = document.getElementById('avatar-video');
  const videoSourceEl = document.getElementById('avatar-video-source');
  const playOverlay = document.getElementById('avatarPlayOverlay');
  const playBtn = document.getElementById('avatarPlayBtn');
  const muteBtn = document.getElementById('avatarMuteBtn');
  const transcriptEl = document.getElementById('avatarTranscript');
  const launcherBtn = document.getElementById('avatarLauncher'); // Assuming injected in index.html

  // Initialize UI
  function populateSuggestions() {
    const list = document.getElementById('avatarSuggestionsList');
    list.innerHTML = `
      <button class="avatar-suggestion-btn" data-faq="welcome">
        <span>Play Introduction</span> <i class="fas fa-chevron-right"></i>
      </button>
      <button class="avatar-suggestion-btn" style="opacity: 0.5; cursor: not-allowed;" disabled title="More coming soon!">
        <span>What do you teach?</span> <i class="fas fa-chevron-right"></i>
      </button>
      <button class="avatar-suggestion-btn" style="opacity: 0.5; cursor: not-allowed;" disabled title="More coming soon!">
        <span>Which class should I choose?</span> <i class="fas fa-chevron-right"></i>
      </button>
    `;

    // Add click listeners
    const suggestionBtns = list.querySelectorAll('.avatar-suggestion-btn:not([disabled])');
    suggestionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const faqId = btn.getAttribute('data-faq');
        playFAQ(faqId);
      });
    });
  }

  // Load and Play a specific FAQ
  function playFAQ(faqId) {
    const faq = FAQ_DATABASE[faqId];
    if (!faq) return;
    
    currentVideoId = faqId;
    videoSourceEl.src = faq.videoSrc;
    transcriptEl.textContent = '"' + faq.transcript + '"';
    
    videoEl.load();
    
    // Attempt Autoplay
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Autoplay started!
        playOverlay.style.display = 'none';
      }).catch(error => {
        // Autoplay was prevented.
        playOverlay.style.display = 'flex';
      });
    }
  }

  // Event Listeners
  if (launcherBtn) {
    launcherBtn.addEventListener('click', () => {
      overlay.classList.add('active');
      populateSuggestions();
      playFAQ('welcome'); // Auto-play the welcome clip
    });
  }

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
    videoEl.pause();
    videoEl.currentTime = 0;
  });

  // Close on outside click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeBtn.click();
    }
  });

  // Manual Play Button
  playBtn.addEventListener('click', () => {
    videoEl.play();
    playOverlay.style.display = 'none';
  });
  playOverlay.addEventListener('click', () => {
    videoEl.play();
    playOverlay.style.display = 'none';
  });

  // Mute Toggle
  muteBtn.addEventListener('click', () => {
    if (videoEl.muted) {
      videoEl.muted = false;
      muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
      videoEl.muted = true;
      muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
  });

  // Video Events
  videoEl.addEventListener('ended', () => {
    // Show play button again or do idle animation
    playOverlay.style.display = 'flex';
    playOverlay.innerHTML = '<button class="avatar-play-btn"><i class="fas fa-redo"></i></button>';
  });
});
