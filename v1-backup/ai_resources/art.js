// Cosmic Galaxy Art - Vanilla JavaScript Version
// Converted from React JSX to work with static HTML

function createCosmicGalaxyArt() {
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
  
  // Add canvas to body
  document.body.appendChild(canvas);
  
  // Get canvas context
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  // Initial resize
  resizeCanvas();
  
  // Resize on window resize
  window.addEventListener('resize', resizeCanvas);
  
  // Initialize arrays and colors
  const stars = [];
  const shootingStars = [];
  const colors = ["#ff9ff3", "#feca57", "#5f27cd", "#48dbfb", "#1dd1a1", "#ff6b6b"];
  
  // Create initial stars
  for (let i = 0; i < 500; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      angle: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  
  // Create shooting star
  function createShootingStar() {
    shootingStars.push({
      x: Math.random() * canvas.width,
      y: 0,
      length: Math.random() * 80 + 10,
      speed: 6,
      angle: Math.PI / 4,
      opacity: 1
    });
  }
  
  // Draw function
  function draw() {
    // Clear canvas with dark background
    ctx.fillStyle = "rgba(5, 5, 30, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    stars.forEach((star) => {
      // Update star position
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      
      // Wrap around screen edges
      if (star.x < 0) star.x = canvas.width;
      if (star.x > canvas.width) star.x = 0;
      if (star.y < 0) star.y = canvas.height;
      if (star.y > canvas.height) star.y = 0;
      
      // Draw star
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.fill();
    });
    
    // Draw shooting stars
    shootingStars.forEach((s, index) => {
      // Update shooting star position
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.opacity -= 0.01;
      
      // Draw shooting star trail
      ctx.strokeStyle = `rgba(255,255,255,${s.opacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.length, s.y - s.length);
      ctx.stroke();
      
      // Remove faded shooting stars
      if (s.opacity <= 0) {
        shootingStars.splice(index, 1);
      }
    });
  }
  
  // Animation loop
  function animate() {
    draw();
    
    // Randomly create shooting stars
    if (Math.random() < 0.005) {
      createShootingStar();
    }
    
    requestAnimationFrame(animate);
  }
  
  // Start animation
  animate();
  
  // Return cleanup function
  return function cleanup() {
    window.removeEventListener('resize', resizeCanvas);
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  };
}

// Auto-start when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createCosmicGalaxyArt);
} else {
  createCosmicGalaxyArt();
}

// Export for manual use
window.createCosmicGalaxyArt = createCosmicGalaxyArt;
