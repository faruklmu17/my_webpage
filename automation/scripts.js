// Track completed missions
let completedMissions = 0;
const totalMissions = 7;

// Update progress bar
function updateProgress() {
    const progressPercent = (completedMissions / totalMissions) * 100;
    const progressBar = document.getElementById('progress');
    const stickyProgressBar = document.getElementById('sticky-progress');
    
    progressBar.style.width = `${progressPercent}%`;
    if (stickyProgressBar) {
        stickyProgressBar.style.width = `${progressPercent}%`;
    }
    
    // Add animation
    progressBar.style.transition = 'width 0.5s ease-in-out';
    
    // Show completion message if all missions completed
    if (completedMissions === totalMissions) {
        const header = document.querySelector('header');
        const completionMsg = document.createElement('div');
        completionMsg.className = 'completion-message';
        completionMsg.innerHTML = '<h2>🎉 Congratulations! You\'ve completed all missions!</h2>';
        header.appendChild(completionMsg);
    }
}

// Dropdown
function checkDropdown() {
    const selectedValue = document.getElementById('pizza-size').value;
    document.getElementById('dropdown-result').innerHTML = `You selected: <strong>${selectedValue}</strong>`;
    markMissionComplete('dropdown');
}

// Checkbox
function checkCheckbox() {
    const toppings = [];
    if (document.getElementById('topping1').checked) toppings.push('Cheese');
    if (document.getElementById('topping2').checked) toppings.push('Pepperoni');
    
    const result = toppings.length > 0 ? toppings.join(', ') : 'No toppings';
    document.getElementById('checkbox-result').innerHTML = `You selected: <strong>${result}</strong>`;
    markMissionComplete('checkbox');
}

// Radio Button
function checkRadio() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked')?.value;
    if (selectedPayment) {
        document.getElementById('radio-result').innerHTML = `You selected: <strong>${selectedPayment}</strong>`;
        markMissionComplete('radio');
    } else {
        document.getElementById('radio-result').innerHTML = 'Please select a payment method';
    }
}

// Date Picker
function checkDate() {
    const selectedDate = document.getElementById('date-picker').value;
    if (selectedDate) {
        // Format date for better display
        const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('date-result').innerHTML = `You selected: <strong>${formattedDate}</strong>`;
        markMissionComplete('date');
    } else {
        document.getElementById('date-result').innerHTML = 'Please select a date';
    }
}

// Drag and Drop
function allowDrop(event) {
    event.preventDefault();
    event.target.style.background = '#e6ecff';
    event.target.style.borderStyle = 'solid';
}

function dragLeave(event) {
    event.target.style.background = '#f0f4ff';
    event.target.style.borderStyle = 'dashed';
}

function dragStart(event) {
    event.dataTransfer.setData("text", event.target.id);
    event.target.style.opacity = '0.5';
}

function dragEnd(event) {
    event.target.style.opacity = '1';
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggableElement = document.getElementById(data);
    const dropContainer = document.getElementById('drop-container');
    
    // Reset styles
    dropContainer.style.background = '#f0f4ff';
    dropContainer.style.borderStyle = 'dashed';
    
    // Clear the text content of the drop container
    dropContainer.textContent = '';
    dropContainer.classList.remove('empty');
    
    // Only append if it's not already a child
    if (!dropContainer.contains(draggableElement)) {
        dropContainer.appendChild(draggableElement);
        document.getElementById('drag-result').innerHTML = "<strong>Success!</strong> Item dropped correctly!";
        markMissionComplete('drag-drop');
        
        // Center the draggable element in the drop container
        draggableElement.style.margin = 'auto';
        draggableElement.style.position = 'relative';
        draggableElement.style.top = '0';
        draggableElement.style.left = '0';
    }
}

// Button Click
function showMessage() {
    const messages = [
        "You clicked the button!",
        "Great job clicking!",
        "Button clicks are fun!",
        "You're a natural button clicker!",
        "Click-tastic work!"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('button-result').innerHTML = `<strong>${randomMessage}</strong>`;
    markMissionComplete('button');
}

// Search
function searchFunction() {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        document.getElementById('search-result').innerHTML = `You searched for: <strong>${query}</strong>`;
        markMissionComplete('search');
    } else {
        document.getElementById('search-result').innerHTML = 'Please enter a search term';
    }
}

// Mark mission as complete
function markMissionComplete(missionId) {
    const section = document.getElementById(missionId);
    if (!section.classList.contains('completed')) {
        section.classList.add('completed');
        completedMissions++;
        updateProgress();
        
        // Add completion indicator
        const missionTitle = section.querySelector('h2');
        if (!missionTitle.querySelector('.completion-badge')) {
            const badge = document.createElement('span');
            badge.className = 'completion-badge';
            badge.innerHTML = '✓';
            missionTitle.appendChild(badge);
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners for drag and drop
    const dropContainer = document.getElementById('drop-container');
    dropContainer.addEventListener('dragleave', dragLeave);
    dropContainer.classList.add('empty');
    
    const draggable = document.getElementById('draggable');
    draggable.addEventListener('dragend', dragEnd);
    
    // Add smooth scrolling for navigation
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
    
    // Handle sticky progress bar
    const header = document.querySelector('header');
    const stickyProgress = document.querySelector('.sticky-progress');
    
    window.addEventListener('scroll', function() {
        const headerBottom = header.getBoundingClientRect().bottom;
        
        if (headerBottom <= 0) {
            stickyProgress.style.display = 'block';
        } else {
            stickyProgress.style.display = 'none';
        }
    });
});
