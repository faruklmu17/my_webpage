// Advanced Automation Practice Scripts
let completedMissions = [];
const totalMissions = 15;

// Load user progress from localStorage on start
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};
    
    if (currentUser && registeredUsers[currentUser]) {
        // Initialize advanced progress if not exists
        if (!registeredUsers[currentUser].completedAdvancedMissions) {
            registeredUsers[currentUser].completedAdvancedMissions = [];
        }
        
        completedMissions = registeredUsers[currentUser].completedAdvancedMissions;
        
        // Mark existing completed sections in UI
        completedMissions.forEach(missionId => {
            const section = document.getElementById(missionId);
            if (section) {
                section.classList.add('completed');
                const title = section.querySelector('h2');
                if (title && !title.querySelector('.completion-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'completion-badge';
                    badge.innerHTML = '✓';
                    title.appendChild(badge);
                }
            }
        });
        
        updateProgressBar();
    }
});

function markMissionComplete(missionId) {
    const currentUser = localStorage.getItem('currentUser');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};
    
    if (currentUser && registeredUsers[currentUser]) {
        if (!completedMissions.includes(missionId)) {
            completedMissions.push(missionId);
            registeredUsers[currentUser].completedAdvancedMissions = completedMissions;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            
            // Add UI classes & badge
            const section = document.getElementById(missionId);
            if (section) {
                section.classList.add('completed');
                const title = section.querySelector('h2');
                if (title && !title.querySelector('.completion-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'completion-badge';
                    badge.innerHTML = '✓';
                    title.appendChild(badge);
                }
            }
            
            updateProgressBar();
        }
    }
}

function updateProgressBar() {
    const progress = document.getElementById('progress');
    const stickyProgress = document.getElementById('sticky-progress');
    
    const count = completedMissions.length;
    const progressPercent = Math.min((count / totalMissions) * 100, 100);
    
    if (progress) {
        progress.style.width = `${progressPercent}%`;
    }
    if (stickyProgress) {
        stickyProgress.style.width = `${progressPercent}%`;
    }

    // Congratulations message
    if (count === totalMissions) {
        const header = document.querySelector('header');
        if (!document.querySelector('.completion-message')) {
            const completionMsg = document.createElement('div');
            completionMsg.className = 'completion-message';
            completionMsg.style.background = 'rgba(16, 185, 129, 0.2)';
            completionMsg.style.border = '1px solid #10b981';
            completionMsg.style.padding = '15px';
            completionMsg.style.borderRadius = '8px';
            completionMsg.style.marginTop = '20px';
            completionMsg.innerHTML = '<h2 style="color: #10b981; margin:0;">🎉 Outstanding! You\'ve completed all 15 Advanced Missions!</h2>';
            header.appendChild(completionMsg);
        }
    }
}

// Set up scroll listener for sticky progress bar and general UI navigation behavior
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for navigation
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Handle sticky progress bar visibility
    const header = document.querySelector('header');
    const stickyProgress = document.querySelector('.sticky-progress');

    window.addEventListener('scroll', function() {
        if (header && stickyProgress) {
            const headerBottom = header.getBoundingClientRect().bottom;
            if (headerBottom <= 0) {
                stickyProgress.style.display = 'block';
            } else {
                stickyProgress.style.display = 'none';
            }
        }
    });
});
