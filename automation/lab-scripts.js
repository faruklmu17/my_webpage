// Mock Product Data for DDT
const products = [
    { id: 1, name: "Core Processor X1", price: 299, type: "Hardware", icon: "💻" },
    { id: 2, name: "Edge Router Pro", price: 150, type: "Hardware", icon: "🌐" },
    { id: 3, name: "Cloud Sync v5", price: 49, type: "Software", icon: "☁️" },
    { id: 4, name: "Security Suite", price: 89, type: "Software", icon: "🛡️" },
    { id: 5, name: "Premium Support", price: 199, type: "Service", icon: "🛠️" },
    { id: 6, name: "Advanced Analytics", price: 120, type: "Software", icon: "📊" },
    { id: 7, name: "Ultra Display 4K", price: 450, type: "Hardware", icon: "🖥️" },
    { id: 8, name: "Site Deployment", price: 500, type: "Service", icon: "🚀" }
];

// Initialize Catalog
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
});

function displayProducts(items) {
    const container = document.getElementById('product-list');
    container.innerHTML = '';
    
    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);
        card.setAttribute('data-category', product.type);
        
        card.innerHTML = `
            <div class="product-image">${product.icon}</div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <div class="price">$${product.price} <span class="tag">${product.type}</span></div>
            </div>
        `;
        container.appendChild(card);
    });

    const info = document.getElementById('search-results-info');
    info.textContent = `Showing ${items.length} item(s)`;
}

// Handle Login (POM Practice)
function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const msg = document.getElementById('login-message');
    
    msg.style.display = 'block';
    
    // Automation scenarios:
    // Success: user=admin, pass=password123
    // Fail: anything else
    if (user === 'admin' && pass === 'password123') {
        msg.textContent = "Login Successful! Redirecting...";
        msg.className = "status-message success";
    } else {
        msg.textContent = "Invalid username or password. Please try again.";
        msg.className = "status-message error";
    }
    
    return false;
}

// Search Logic
function performSearch() {
    const query = document.getElementById('lab-search').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    displayProducts(filtered);
}

// Filter Logic
function filterBy(type) {
    // Update active chip
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    
    if (type === 'All') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.type === type);
        displayProducts(filtered);
    }
}

// Handle Contact Form (DDT Practice)
function handleContact(event) {
    event.preventDefault();
    const msg = document.getElementById('contact-message-status');
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    
    msg.style.display = 'block';
    
    // Logic for DDT Verification
    if (name && email.includes('@')) {
        msg.textContent = `Thank you, ${name}. Your inquiry has been sent!`;
        msg.className = "status-message success";
        document.getElementById('lab-contact-form').reset();
    } else {
        msg.textContent = "Please provide a valid name and email address.";
        msg.className = "status-message error";
    }
    
    return false;
}
