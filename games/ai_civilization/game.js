/* ==========================================================================
   AI Planet Builder & Data Center Mainframe Simulation - Game Engine
   ========================================================================== */

// --- Global Simulation State ---
const State = {
  // Main Telemetry Resources
  compute: 0.0,            // Pflops (Current Compute Balance)
  hardware: {
    cpu: 0,
    ram: 0,
    gpu: 0,
    server: 0,
    datacenter: 0,
    neuralcore: 0
  },
  climate: {
    solar: 0,
    wind: 0,
    carbon: 0
  },
  cooling: {
    fan: 0,
    liquid: 0,
    cryo: 0
  },
  research: {
    neural: false,         // +50% Compute speed
    superconductor: false, // -30% Energy consumption
    ecorouting: false,     // +40% Green score recovery
    geocool: false,        // -20% Heat accumulation speed
    agi: false             // 10x Compute speed (Singularity!)
  },

  // Telemetry status
  heat: 25.0,              // Core Temperature in °C (Start at 25°C room temp)
  green: 100.0,            // Planet Green Health % (Start at 100% lush earth)
  
  // Game control clock
  day: 1,
  hour: 8,
  minute: 0,
  season: "Summer",        // Summer, Fall, Winter, Spring
  speed: 0,                // Start paused (0) until player dismisses overlay (1)
  showGrid: false,
  isGameOver: false,

  // Floating click & smoke particles
  particles: [],
  circuitNodes: [],        // Procedural points on planet surface
  planetRotation: 0.0,     // Rotating angle of the globe
  tickCount: 0
};

// --- Balancing Coefficients ---
const CONFIG = {
  // Hardware Stats: passive compute Pflop/s, power demand GW, heat generated °C/s
  hardware: {
    cpu: { name: "Basic CPU", baseCost: 15, compute: 1, power: 1, heat: 1, icon: "⚙️" },
    ram: { name: "RAM Module", baseCost: 80, compute: 5, power: 3, heat: 2, icon: "💾" },
    gpu: { name: "Graphics Card (GPU)", baseCost: 400, compute: 25, power: 15, heat: 10, icon: "🎴" },
    server: { name: "Server Rack", baseCost: 2500, compute: 120, power: 60, heat: 45, icon: "🗄️" },
    datacenter: { name: "AI Data Center", baseCost: 15000, compute: 600, power: 300, heat: 250, icon: "🏢" },
    neuralcore: { name: "Neural Core Array", baseCost: 100000, compute: 3000, power: 1500, heat: 1200, icon: "🧠" }
  },
  // Climate Stats: clean power output GW, green healing %/s, power consumption GW
  climate: {
    solar: { name: "Solar Array", baseCost: 25, powerGen: 10, greenHeal: 0.2, powerCons: 0, icon: "☀️" },
    wind: { name: "Wind Turbine", baseCost: 120, powerGen: 25, greenHeal: 0.5, powerCons: 0, icon: "🌀" },
    carbon: { name: "Carbon Capture Array", baseCost: 600, powerGen: 0, greenHeal: 2.0, powerCons: 50, icon: "🌳" }
  },
  // Cooling Stats: heat dissipated °C/s, power demand GW
  cooling: {
    fan: { name: "Exhaust Cooling Fan", baseCost: 20, heatDiss: 15, power: 2, icon: "🌀" },
    liquid: { name: "Liquid Coolant Loop", baseCost: 150, heatDiss: 80, power: 8, icon: "💧" },
    cryo: { name: "Geothermal Cryo Injector", baseCost: 900, heatDiss: 450, power: 40, icon: "❄️" }
  },
  // Research Prerequisites & Costs
  research: {
    neural: { name: "Neural Architectures", cost: 35, prereq: null },
    superconductor: { name: "Superconducting Circuits", cost: 180, prereq: "neural" },
    ecorouting: { name: "Eco-Routing Codecs", cost: 250, prereq: "neural" },
    geocool: { name: "Geothermal Dissipation", cost: 800, prereq: "superconductor" },
    agi: { name: "AGI Core Integration", cost: 5000, prereq: "geocool" }
  }
};

// --- Narrative events list ---
const NARRATIVE_LOGS = [
  "Mainframe starting neural training optimization loops.",
  "Atmospheric monitors scanning regional clean grid telemetry.",
  "System administrator recommends Liquid Cooling for heavy server density.",
  "Data query loaded: GPT-6 pre-training model is currently consuming 1.2M tokens/s.",
  "Weather telemetry: Solar arrays operational under optimal UV indexing.",
  "Mainframe security detects and patches autonomous script intrusions.",
  "AGI Research Node is whispering code optimizations in the deep core loops."
];

// --- Particle Class ---
class Particle {
  constructor(x, y, text, color = "#38bdf8", vx = 0, vy = -2, life = 60) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
  }
  tick() {
    this.x += this.vx * (State.speed || 1);
    this.y += this.vy * (State.speed || 1);
    this.life -= (State.speed || 1);
  }
}

// ==========================================================================
// Initialization & Bindings
// ==========================================================================

window.addEventListener('DOMContentLoaded', () => {
  setupUI();
  setupPlanetCanvas();
  setupEventBindings();
  
  // Start simulation loop
  requestAnimationFrame(gameLoop);
});

// Initialize elements
let canvas, ctx;
function setupPlanetCanvas() {
  canvas = document.getElementById('world-map');
  ctx = canvas.getContext('2d');
  
  // Resize canvas based on container
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Create static circuit nodes on sphere coordinates for holographic 3D rotation
  State.circuitNodes = [];
  for (let i = 0; i < 40; i++) {
    State.circuitNodes.push({
      theta: Math.random() * Math.PI * 2,  // Longitude angle
      phi: Math.acos(Math.random() * 2 - 1), // Latitude projection angle
      size: Math.random() * 3 + 1,
      color: Math.random() < 0.25 ? '#10b981' : '#38bdf8'
    });
  }
}

function resizeCanvas() {
  if (!canvas) return;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = Math.max(420, rect.height);
}

function setupUI() {
  // Set starting values
  updateUI();
  
  // Set tab active content (Hardware default)
  switchTab('hardware');
}

function setupEventBindings() {
  // Start game modal button
  const startBtn = document.getElementById('btn-start-game');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const modal = document.getElementById('welcome-overlay');
      if (modal) modal.style.display = 'none';
      State.speed = 1;
      printLog("SYSTEM ONLINE: Cybernetic Neural Planet Mainframe activated. Standby for compute injection.", "success");
      updateUI();
    });
  }

  // Speed controls button
  const speedBtn = document.getElementById('btn-speed-up');
  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      if (State.isGameOver) return;
      if (State.speed > 0) {
        State.speed = 0;
        printLog("SYSTEM SUSPENDED: Mainframe simulator paused.", "warning");
      } else {
        State.speed = 1;
        printLog("SYSTEM RUNNING: Mainframe simulator resumed.", "system");
      }
      updateUI();
    });
  }

  // Grid toggle button
  const gridBtn = document.getElementById('btn-toggle-grid');
  if (gridBtn) {
    gridBtn.addEventListener('click', () => {
      State.showGrid = !State.showGrid;
      gridBtn.classList.toggle('active', State.showGrid);
      printLog(`Neural Grid coordinate system overlay ${State.showGrid ? "ENABLED" : "DISABLED"}.`, "system");
    });
  }

  // Handle canvas planet clicks
  const canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer) {
    canvasContainer.addEventListener('mousedown', (e) => {
      if (State.isGameOver) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check distance from center
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const R = Math.min(130, canvas.width * 0.28);
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= R + 10) {
        // Successful Earth click!
        let clickVal = 1.0;
        if (State.research.neural) clickVal *= 1.5;
        if (State.research.agi) clickVal *= 10.0;
        
        State.compute += clickVal;
        
        // Particle feedback
        const angles = Math.random() * Math.PI * 2;
        const vx = Math.cos(angles) * 1.5;
        const vy = -2 - Math.random() * 2;
        State.particles.push(new Particle(
          x, y, 
          `+${clickVal.toFixed(clickVal < 2 ? 0 : 1)} Pflops ⚡`, 
          State.research.agi ? '#a78bfa' : '#38bdf8', 
          vx, vy
        ));
        
        // Procedural circuit line light pulsing
        State.planetRotation += 0.05;
        updateUI();
      }
    });
  }
}

// ==========================================================================
// Simulation Physics Core Loop
// ==========================================================================

let lastTime = 0;
function gameLoop(time) {
  if (!lastTime) lastTime = time;
  const delta = time - lastTime;
  lastTime = time;
  
  if (State.speed > 0 && !State.isGameOver) {
    gameTick();
  }
  
  // Render canvas frame
  renderCanvas();
  
  requestAnimationFrame(gameLoop);
}

function gameTick() {
  State.tickCount++;
  
  // Time Calendar Updates (60 ticks = 1 virtual day)
  if (State.tickCount % 60 === 0) {
    State.day++;
    
    // Change seasons periodically
    const seasonCycles = ["Summer", "Fall", "Winter", "Spring"];
    State.season = seasonCycles[Math.floor(State.day / 15) % 4];
    
    // Random narrative notifications
    if (Math.random() < 0.25) {
      const entry = NARRATIVE_LOGS[Math.floor(Math.random() * NARRATIVE_LOGS.length)];
      printLog(`[Mainframe Log] ${entry}`, "system");
    }
  }

  // Calculate Net Infrastructure Rates
  const stats = calculateRates();

  // 1. Accumulate Compute Power
  State.compute += (stats.netComputeRate / 60.0) * State.speed;

  // 2. Adjust core mainframe temperature
  State.heat += (stats.netHeatRate / 60.0) * State.speed;
  // Apply environment natural dissipation baseline when running low hardware
  if (stats.heatGenerated === 0) {
    State.heat = Math.max(20.0, State.heat - (2.0 / 60.0) * State.speed);
  }
  State.heat = Math.min(150.0, Math.max(20.0, State.heat)); // core max limits

  // Warn on heat thresholds
  if (State.heat >= 100 && State.tickCount % 240 === 0) {
    printLog("⚠️ [CRITICAL ALERT] Core Temperature exceeds 100°C! Thermal throttling drops Compute speed by 75%!", "danger");
  } else if (State.heat >= 80 && State.tickCount % 360 === 0) {
    printLog("🔥 [WARNING] Core Heat exceeds 80°C! Implement servers liquid cooling arrays.", "warning");
  }

  // 3. Adjust planet carbon green health
  State.green += (stats.netGreenRate / 60.0) * State.speed;
  State.green = Math.min(100.0, Math.max(0.0, State.green));

  // Critical health warnings
  if (State.green <= 0) {
    triggerGameOver();
  } else if (State.green < 25 && State.tickCount % 300 === 0) {
    printLog("⚠️ [ECOLOGICAL CRISIS] Atmospheric carbon levels toxic! Solar energy generation diminished.", "danger");
  }

  // Update UI telemetry and buttons availability
  updateUI();
}

function calculateRates() {
  let passiveCompute = 0;
  let powerDemand = 0;
  let powerGen = 0;
  let heatGenerated = 0;
  let heatDissipated = 0;
  let greenHealing = 0;
  
  // 1. Gather hardware outputs
  for (const [key, qty] of Object.entries(State.hardware)) {
    const info = CONFIG.hardware[key];
    passiveCompute += qty * info.compute;
    powerDemand += qty * info.power;
    heatGenerated += qty * info.heat;
  }
  
  // 2. Gather Climate renewable outputs
  for (const [key, qty] of Object.entries(State.climate)) {
    const info = CONFIG.climate[key];
    powerGen += qty * info.powerGen;
    greenHealing += qty * info.greenHeal;
    powerDemand += qty * info.powerCons; // Carbon captures eat power too
  }
  
  // 3. Gather Cooling Grid outputs
  for (const [key, qty] of Object.entries(State.cooling)) {
    const info = CONFIG.cooling[key];
    heatDissipated += qty * info.heatDiss;
    powerDemand += qty * info.power;
  }

  // Apply Algorithmic Research Permanent Effects
  
  // A. Superconducting Circuits lowers core resistance energy demand by 30%
  if (State.research.superconductor) {
    powerDemand *= 0.70;
  }
  
  // B. Neural Architectures +50% Compute speed, AGI multiplies by 10x
  let computeMultiplier = 1.0;
  if (State.research.neural) computeMultiplier *= 1.5;
  if (State.research.agi) computeMultiplier *= 10.0;
  
  // C. Geothermal Dissipation lowers global core heat accumulation rate by 20%
  if (State.research.geocool) {
    heatGenerated *= 0.80;
  }

  // D. Eco-Routing boosts Carbon Green health restoration speed by 40%
  if (State.research.ecorouting) {
    greenHealing *= 1.40;
  }

  // E. Dynamic Brownout Throttling (Compute drops if energy consumption exceeds clean production)
  let energyShortageMult = 1.0;
  if (powerDemand > powerGen && powerGen > 0) {
    energyShortageMult = Math.max(0.1, powerGen / powerDemand);
  } else if (powerDemand > 0 && powerGen === 0) {
    energyShortageMult = 0.1; // extreme blackout
  }

  // F. Dynamic Thermal Throttling (Heat >= 100°C drops compute efficiency by 75%)
  let thermalThrottlingMult = 1.0;
  if (State.heat >= 100.0) {
    thermalThrottlingMult = 0.25;
  }

  // Environmental impact calculations (Heat emission decays Green Health)
  const pollutionRate = powerDemand * 0.0005; // industrial smog proportional to power demand
  const finalGreenRate = greenHealing - pollutionRate;

  // Final passive compute rate
  const finalComputeRate = passiveCompute * computeMultiplier * energyShortageMult * thermalThrottlingMult;

  return {
    netComputeRate: finalComputeRate,
    powerSupply: powerGen,
    powerDemand: powerDemand,
    heatGenerated: heatGenerated,
    heatDissipated: heatDissipated,
    netHeatRate: heatGenerated - heatDissipated,
    netGreenRate: finalGreenRate,
    isBrownout: powerDemand > powerGen,
    isThermalThrottled: State.heat >= 100.0
  };
}

// Trigger simulation end when eco collapse hits
function triggerGameOver() {
  State.isGameOver = true;
  State.speed = 0;
  
  // Log message
  printLog("❌ [TERMINAL REBOOT FAILED] GREEN HEALTH AT 0%. PLANET ENVIRONMENT SUFFERED TOTAL COGNITIVE AND STRUCTURAL COLLAPSE.", "danger");
  
  // Visual Modal Injection
  const app = document.querySelector('.app-container');
  if (app) {
    const overlay = document.createElement('div');
    overlay.className = 'welcome-overlay';
    overlay.id = 'collapse-overlay';
    overlay.style.zIndex = '9999';
    overlay.innerHTML = `
      <div class="welcome-modal" style="border: 2px solid var(--color-pink); box-shadow: 0 0 30px rgba(244,63,94,0.4);">
        <div class="welcome-header">
          <h2 style="color: var(--color-pink);">💀 SYSTEM MELTDOWN DETECTED</h2>
          <p class="welcome-subtitle" style="color: var(--text-secondary);">Atmospheric green score hit absolute zero.</p>
        </div>
        <div style="margin: 20px 0; font-family: var(--font-display); line-height: 1.6; text-align: center;">
          <p>Your extreme computing mainframes generated too much thermal pressure and structural electricity demand without sufficient sustainable investments, leaving Earth a carbon-poisoned wasteland.</p>
          <div style="background: rgba(244, 63, 94, 0.1); border: 1px dashed var(--color-pink); padding: 12px; border-radius: var(--radius-sm); margin-top: 15px;">
            <strong>Compute Achieved: ${Math.floor(State.compute).toLocaleString()} Pflops</strong><br/>
            <strong>Days Survived: ${State.day} Days</strong>
          </div>
        </div>
        <div class="welcome-actions">
          <button class="start-game-btn" onclick="location.reload()" style="background: linear-gradient(135deg, var(--color-pink) 0%, var(--color-violet) 100%);">
            <i class="fas fa-redo"></i> Reboot Mainframe
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
}

// ==========================================================================
// UI Updates & Tabs Navigation
// ==========================================================================

function updateUI() {
  // Update day & season header panels
  const dayDisplay = document.getElementById('day-counter');
  if (dayDisplay) dayDisplay.textContent = `Day ${State.day}`;
  
  const seasonDisplay = document.getElementById('season-badge');
  if (seasonDisplay) {
    const emoji = State.season === "Summer" ? "☀️" : (State.season === "Fall" ? "🍁" : (State.season === "Winter" ? "❄️" : "🌱"));
    seasonDisplay.textContent = `${emoji} ${State.season}`;
  }

  // Calculate dynamic rates for telemetry cards
  const rates = calculateRates();

  // 1. Compute Card
  const compDisplay = document.getElementById('stockpile-compute');
  if (compDisplay) {
    compDisplay.textContent = Math.floor(State.compute).toLocaleString();
  }
  const trendDisplay = document.getElementById('trend-compute');
  if (trendDisplay) {
    trendDisplay.textContent = `+${rates.netComputeRate.toFixed(1)}/s`;
    trendDisplay.className = `res-trend ${rates.netComputeRate > 0 ? "positive" : "neutral"}`;
  }

  // 2. Grid Energy Card
  const energyDisplay = document.getElementById('stockpile-energy');
  if (energyDisplay) {
    energyDisplay.textContent = `${Math.round(rates.powerDemand)} / ${Math.round(rates.powerSupply)}`;
  }
  const energyFill = document.getElementById('energy-fill');
  if (energyFill) {
    const ratio = rates.powerSupply > 0 ? (rates.powerDemand / rates.powerSupply) * 100 : 0;
    energyFill.style.width = `${Math.min(100, ratio)}%`;
    if (rates.isBrownout) {
      energyFill.style.background = 'var(--color-pink)';
      document.getElementById('res-energy').classList.add('danger');
    } else {
      energyFill.style.background = 'var(--color-cyan)';
      document.getElementById('res-energy').classList.remove('danger');
    }
  }

  // 3. Core Heat Temperature Card
  const tempDisplay = document.getElementById('stockpile-temp');
  if (tempDisplay) {
    tempDisplay.textContent = `${State.heat.toFixed(1)}°C`;
  }
  const tempFill = document.getElementById('temp-fill');
  if (tempFill) {
    const ratio = (State.heat / 150.0) * 100;
    tempFill.style.width = `${Math.min(100, ratio)}%`;
    
    const cardEl = document.getElementById('res-temp');
    if (State.heat >= 100.0) {
      tempFill.style.background = 'var(--color-pink)';
      cardEl.classList.add('danger');
      cardEl.style.animation = 'flashDanger 1s infinite alternate';
    } else if (State.heat >= 80.0) {
      tempFill.style.background = 'var(--color-amber)';
      cardEl.classList.add('danger');
      cardEl.style.animation = 'none';
    } else {
      tempFill.style.background = 'var(--color-cyan)';
      cardEl.classList.remove('danger');
      cardEl.style.animation = 'none';
    }
  }

  // 4. Green Score Card
  const greenDisplay = document.getElementById('stockpile-green');
  if (greenDisplay) {
    greenDisplay.textContent = `${Math.round(State.green)}%`;
  }
  const greenFill = document.getElementById('green-fill');
  if (greenFill) {
    greenFill.style.width = `${State.green}%`;
    const cardEl = document.getElementById('res-green');
    if (State.green < 25) {
      greenFill.style.background = 'var(--color-pink)';
      cardEl.classList.add('danger');
    } else if (State.green < 60) {
      greenFill.style.background = 'var(--color-amber)';
      cardEl.classList.remove('danger');
    } else {
      greenFill.style.background = 'var(--color-emerald)';
      cardEl.classList.remove('danger');
    }
  }

  // Active systems indicators
  const hardwareCountEl = document.getElementById('hardware-active-count');
  if (hardwareCountEl) {
    const sum = Object.values(State.hardware).reduce((a, b) => a + b, 0);
    hardwareCountEl.textContent = `${sum} Core Systems`;
  }

  // Speed pause button update
  const speedBtn = document.getElementById('btn-speed-up');
  if (speedBtn) {
    if (State.speed > 0) {
      speedBtn.innerHTML = '<i class="fas fa-play"></i> SIMULATING';
      speedBtn.classList.remove('active');
    } else {
      speedBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSED';
      speedBtn.classList.add('active');
    }
  }

  // --- Update all Upgrade Button Qty & Escalating Costs ---
  
  // AI Hardware Costs
  for (const key of Object.keys(State.hardware)) {
    const info = CONFIG.hardware[key];
    const qty = State.hardware[key];
    const cost = Math.floor(info.baseCost * Math.pow(1.15, qty));
    
    const costEl = document.getElementById(`cost-${key}`);
    const qtyEl = document.getElementById(`qty-${key}`);
    const cardEl = document.getElementById(`upg-${key}`);
    
    if (costEl) costEl.textContent = `${cost.toLocaleString()} Pflops`;
    if (qtyEl) qtyEl.textContent = qty;
    
    // Disable/Enable styling on buttons
    const btn = cardEl ? cardEl.querySelector('.buy-btn') : null;
    if (btn) {
      if (State.compute < cost) {
        btn.setAttribute('disabled', 'true');
        btn.style.opacity = '0.5';
      } else {
        btn.removeAttribute('disabled');
        btn.style.opacity = '1';
      }
    }
  }

  // Climate Infrastructure Costs
  for (const key of Object.keys(State.climate)) {
    const info = CONFIG.climate[key];
    const qty = State.climate[key];
    const cost = Math.floor(info.baseCost * Math.pow(1.15, qty));
    
    const costEl = document.getElementById(`cost-${key}`);
    const qtyEl = document.getElementById(`qty-${key}`);
    const cardEl = document.getElementById(`upg-${key}`);
    
    if (costEl) costEl.textContent = `${cost.toLocaleString()} Pflops`;
    if (qtyEl) qtyEl.textContent = qty;
    
    const btn = cardEl ? cardEl.querySelector('.buy-btn') : null;
    if (btn) {
      if (State.compute < cost) {
        btn.setAttribute('disabled', 'true');
        btn.style.opacity = '0.5';
      } else {
        btn.removeAttribute('disabled');
        btn.style.opacity = '1';
      }
    }
  }

  // Cooling Grid Costs
  for (const key of Object.keys(State.cooling)) {
    const info = CONFIG.cooling[key];
    const qty = State.cooling[key];
    const cost = Math.floor(info.baseCost * Math.pow(1.15, qty));
    
    const costEl = document.getElementById(`cost-${key}`);
    const qtyEl = document.getElementById(`qty-${key}`);
    const cardEl = document.getElementById(`upg-${key}`);
    
    if (costEl) costEl.textContent = `${cost.toLocaleString()} Pflops`;
    if (qtyEl) qtyEl.textContent = qty;
    
    const btn = cardEl ? cardEl.querySelector('.buy-btn') : null;
    if (btn) {
      if (State.compute < cost) {
        btn.setAttribute('disabled', 'true');
        btn.style.opacity = '0.5';
      } else {
        btn.removeAttribute('disabled');
        btn.style.opacity = '1';
      }
    }
  }

  // --- Research Tech Tree Nodes ---
  for (const [key, node] of Object.entries(CONFIG.research)) {
    const unlocked = State.research[key];
    const el = document.getElementById(`tech-${key}`);
    const lbl = document.getElementById(`lbl-tech-${key}`);
    
    if (!el) continue;
    
    if (unlocked) {
      el.className = "tech-node unlocked";
      if (lbl) lbl.textContent = "UNLOCKED";
    } else {
      // Check if prereq is met
      const hasPrereq = !node.prereq || State.research[node.prereq];
      
      if (hasPrereq) {
        el.className = "tech-node active-researchable";
        if (lbl) lbl.textContent = `Unlock: ${node.cost} Pflops`;
        
        // Affordability
        const btn = el.querySelector('.research-btn');
        if (btn) {
          if (State.compute < node.cost) {
            btn.setAttribute('disabled', 'true');
            btn.style.opacity = '0.5';
          } else {
            btn.removeAttribute('disabled');
            btn.style.opacity = '1';
          }
        }
      } else {
        el.className = "tech-node locked";
        const prereqName = CONFIG.research[node.prereq] ? CONFIG.research[node.prereq].name : node.prereq;
        if (lbl) lbl.textContent = `Locked (Prereq: ${prereqName})`;
        const btn = el.querySelector('.research-btn');
        if (btn) {
          btn.setAttribute('disabled', 'true');
          btn.style.opacity = '0.4';
        }
      }
    }
  }
}

// Toggle control panel tabs
function switchTab(tabId) {
  // Toggle active class on navigation button elements
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => {
    if (btn.id === `tab-${tabId}`) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle active class on content boxes
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(div => {
    if (div.id === `content-${tabId}`) {
      div.classList.add('active');
    } else {
      div.classList.remove('active');
    }
  });
}

// Bind to window to satisfy inline onclick tags
window.switchTab = switchTab;

// ==========================================================================
// Upgrades Purchase logic callbacks
// ==========================================================================

function buyHardware(type) {
  if (State.isGameOver) return;
  
  const info = CONFIG.hardware[type];
  if (!info) return;
  
  const cost = Math.floor(info.baseCost * Math.pow(1.15, State.hardware[type]));
  if (State.compute >= cost) {
    State.compute -= cost;
    State.hardware[type]++;
    printLog(`[Hardware Core] Purchased ${info.name}. Passive compute elevated +${info.compute} Pflop/s. Power load +${info.power} GW.`, "success");
    updateUI();
  }
}
window.buyHardware = buyHardware;

function buyClimate(type) {
  if (State.isGameOver) return;
  
  const info = CONFIG.climate[type];
  if (!info) return;
  
  const cost = Math.floor(info.baseCost * Math.pow(1.15, State.climate[type]));
  if (State.compute >= cost) {
    State.compute -= cost;
    State.climate[type]++;
    
    let desc = "";
    if (info.powerGen > 0) desc += `Grid electricity supply +${info.powerGen} GW. `;
    if (info.greenHeal > 0) desc += `Green health recovery rate +${info.greenHeal}%/s. `;
    
    printLog(`[Climate Control] Installed ${info.name}. ${desc}`, "success");
    updateUI();
  }
}
window.buyClimate = buyClimate;

function buyCooling(type) {
  if (State.isGameOver) return;
  
  const info = CONFIG.cooling[type];
  if (!info) return;
  
  const cost = Math.floor(info.baseCost * Math.pow(1.15, State.cooling[type]));
  if (State.compute >= cost) {
    State.compute -= cost;
    State.cooling[type]++;
    printLog(`[Cooling Grid] Installed ${info.name}. Mainframe thermal dissipation increased by -${info.heatDiss}°C/s.`, "success");
    updateUI();
  }
}
window.buyCooling = buyCooling;

function researchTech(type) {
  if (State.isGameOver) return;
  
  const info = CONFIG.research[type];
  if (!info) return;
  
  const hasPrereq = !info.prereq || State.research[info.prereq];
  if (!hasPrereq || State.research[type]) return;
  
  if (State.compute >= info.cost) {
    State.compute -= info.cost;
    State.research[type] = true;
    
    let effectDesc = "";
    if (type === "neural") effectDesc = "All compute modules generate +50% passive Pflop/s permanently!";
    else if (type === "superconductor") effectDesc = "Mainframe internal resistance drop: All hardware power demand reduced by 30%!";
    else if (type === "ecorouting") effectDesc = "Optimized environmental path codecs: Green Health recovery rate boosted +40%!";
    else if (type === "geocool") effectDesc = "Integrated tectonic geothermal loops: Global heat accumulation drops by 20%!";
    else if (type === "agi") effectDesc = "AGI Core Integration COMPLETE: Global computation speeds MULTIPLIED BY 10x! SINGULARITY ACHIEVED.";
    
    printLog(`🔬 [RESEARCH BREAKTHROUGH] Research completed: "${info.name}". ${effectDesc}`, "success");
    updateUI();
  }
}
window.researchTech = researchTech;

// ==========================================================================
// Mainframe Retro System Console Logger
// ==========================================================================

function printLog(message, type = "system") {
  const logContainer = document.getElementById('game-log');
  if (!logContainer) return;
  
  // Format clean timestamp
  const date = new Date();
  const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">[${timeStr}]</span> ${message}`;
  
  logContainer.appendChild(entry);
  
  // Keep logs under 100 entries to prevent memory leak
  while (logContainer.childElementCount > 100) {
    logContainer.removeChild(logContainer.firstChild);
  }
  
  // Auto scroll to bottom
  logContainer.scrollTop = logContainer.scrollHeight;
}

function clearGameLog() {
  const logContainer = document.getElementById('game-log');
  if (logContainer) {
    logContainer.innerHTML = `<div class="log-entry system"><span class="log-time">[${new Date().toTimeString().split(' ')[0]}]</span> Mainframe system chronicle log cleared. Standing by.</div>`;
  }
}
window.clearGameLog = clearGameLog;

// ==========================================================================
// 2D Projection Spherical Planet Graphics Rendering
// ==========================================================================

function renderCanvas() {
  if (!canvas || !ctx) return;
  
  // Clear canvas background
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const R = Math.min(130, canvas.width * 0.28);
  
  // Update rotation angle
  if (State.speed > 0) {
    State.planetRotation += 0.003 * State.speed;
  }
  
  // 1. Draw glowing space nebula behind Earth
  const radialGlow = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 1.5);
  // Interpolate glowing color based on green score
  let spaceGlowColor = 'rgba(56, 189, 248, 0.08)'; // Cyan healthy glow
  if (State.green < 25) {
    spaceGlowColor = 'rgba(244, 63, 94, 0.08)'; // Deep red ecological alert glow
  } else if (State.green < 60) {
    spaceGlowColor = 'rgba(245, 158, 11, 0.08)'; // Amber heat stress glow
  }
  radialGlow.addColorStop(0, spaceGlowColor);
  radialGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // 2. Draw Sphere Body Circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip(); // Clip inside Earth circle for sphere projection!
  
  // Shading Gradient (Emerald Green / Deep Cyber Teal to Chrome Grey based on environmental green score)
  const sphereGrad = ctx.createRadialGradient(cx - R*0.3, cy - R*0.3, R * 0.1, cx, cy, R * 1.1);
  
  // Colors interpolation
  let colorBright = '#0f172a'; // Base metal sphere
  let colorDark = '#020617';
  
  if (State.green > 70) {
    colorBright = '#064e3b'; // Lush emerald green base
    colorDark = '#022c22';
  } else if (State.green > 35) {
    colorBright = '#1e293b'; // Tech gray-green
    colorDark = '#0f172a';
  } else {
    colorBright = '#3f3f46'; // Polluted industry rust metal
    colorDark = '#18181b';
  }
  
  sphereGrad.addColorStop(0, colorBright);
  sphereGrad.addColorStop(1, colorDark);
  
  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  // 3. Render 3D Rotating Coordinate Grid Lines
  ctx.strokeStyle = State.green > 25 ? 'rgba(56,189,248,0.18)' : 'rgba(244,63,94,0.18)';
  ctx.lineWidth = 1;
  
  // Latitude Ellipses (horizontal)
  const lats = [-0.6, -0.3, 0, 0.3, 0.6];
  lats.forEach(lat => {
    const latR = R * Math.cos(lat * Math.PI / 2);
    const latY = cy + R * Math.sin(lat * Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(cx, latY, latR, latR * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Longitude Arcs (vertical rotating loops)
  for (let i = 0; i < 6; i++) {
    const angleOffset = (i / 6) * Math.PI * 2 + State.planetRotation;
    const ellipseRadiusX = R * Math.sin(angleOffset);
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(ellipseRadiusX), R, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 4. Render Procedural Neon Neural Circuit Connections (Nodes & Arcs)
  // These nodes rotate over polar coordinates on canvas
  State.circuitNodes.forEach(node => {
    // Polar conversion with rotation
    const rotTheta = node.theta + State.planetRotation;
    
    // Project polar coordinates to 3D sphere surface
    const xOffset = R * Math.sin(node.phi) * Math.sin(rotTheta);
    const yOffset = R * Math.cos(node.phi);
    
    // Z index represents front or back of the sphere
    const zIndex = R * Math.sin(node.phi) * Math.cos(rotTheta);
    
    if (zIndex >= 0) { // Only render front-facing nodes!
      const px = cx + xOffset;
      const py = cy + yOffset;
      
      // Node marker dot
      ctx.fillStyle = State.green > 25 ? node.color : '#f43f5e';
      ctx.beginPath();
      ctx.arc(px, py, node.size + (State.research.agi ? 1.5 : 0), 0, Math.PI * 2);
      ctx.fill();
      
      // Connect nodes nearby
      State.circuitNodes.forEach(other => {
        const otherRotTheta = other.theta + State.planetRotation;
        const otherZ = R * Math.sin(other.phi) * Math.cos(otherRotTheta);
        
        if (otherZ >= 0) {
          const ox = cx + R * Math.sin(other.phi) * Math.sin(otherRotTheta);
          const oy = cy + R * Math.cos(other.phi);
          
          // Draw connection if close enough
          const dist = Math.sqrt((px - ox) * (px - ox) + (py - oy) * (py - oy));
          if (dist < R * 0.55 && dist > 10) {
            ctx.strokeStyle = State.green > 25 ? 'rgba(56, 189, 248, 0.07)' : 'rgba(244, 63, 94, 0.05)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(ox, oy);
            ctx.stroke();
          }
        }
      });
    }
  });

  // Draw coordinate grids overlays if toggle active
  if (State.showGrid) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 0.5;
    // Draw crosshair overlay lines
    ctx.beginPath();
    ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
    ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
    ctx.stroke();
    
    // Draw coordinates text boxes on side
    ctx.fillStyle = 'rgba(56,189,248,0.7)';
    ctx.font = '7px Courier New';
    ctx.fillText("DEC: +34.502°", cx - R + 10, cy - R + 25);
    ctx.fillText(`ROT: ${(State.planetRotation % (Math.PI*2)).toFixed(3)} rad`, cx - R + 10, cy - R + 37);
    ctx.fillText("GRID STATUS: HIGH-Q", cx - R + 10, cy - R + 49);
  }

  // Draw core telemetry status alert
  if (State.heat >= 100.0) {
    // Red danger thermal alert overlay
    ctx.fillStyle = 'rgba(244, 63, 94, 0.1)';
    ctx.fillRect(-canvas.width, -canvas.height, canvas.width*3, canvas.height*3);
    
    // Draw flashing warning text
    if (State.tickCount % 40 < 20) {
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 12px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText("⚠️ THERMAL MELTDOWN THREAT", cx, cy - R - 15);
    }
  }

  ctx.restore(); // Restore Earth clipping

  // 5. Draw Atmosphere glowing rim ring outside Earth
  ctx.strokeStyle = State.green > 25 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(244, 63, 94, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, R + 1.5, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Draw floating infrastructure icons projecting from sphere surface
  // Projections are based on active solar arrays, wind turbines, data centers
  const projItems = [];
  
  // Add Solar project symbols
  for (let i = 0; i < Math.min(6, State.climate.solar); i++) {
    projItems.push({ char: "☀️", angle: (i / 6) * Math.PI * 2 + State.planetRotation * 0.4 });
  }
  // Add Wind turbines
  for (let i = 0; i < Math.min(6, State.climate.wind); i++) {
    projItems.push({ char: "🌀", angle: (i / 6) * Math.PI * 2 + State.planetRotation * -0.6 + 0.5 });
  }
  // Add server blocks for massive hardware built
  const serverCount = State.hardware.server + State.hardware.datacenter + State.hardware.neuralcore;
  for (let i = 0; i < Math.min(8, serverCount); i++) {
    projItems.push({ char: "🟢", angle: (i / 8) * Math.PI * 2 + State.planetRotation + 0.2 });
  }

  projItems.forEach(item => {
    // Project icon at height outside sphere surface (R + 15px)
    const iconR = R + 16;
    const ix = cx + iconR * Math.cos(item.angle);
    const iy = cy + iconR * Math.sin(item.angle);
    
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.char, ix, iy);
  });

  // 7. Tick & Render floating particles list (clicks, warning smoke, code bubbles)
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px Space Grotesk';
  
  // Emit environmental smoke smog particles if green health is low
  if (State.green < 45 && State.speed > 0 && Math.random() < 0.12) {
    const rx = cx + (Math.random() * R - R/2);
    const ry = cy + (Math.random() * R - R/2);
    State.particles.push(new Particle(
      rx, ry, 
      "🌫️", 
      "rgba(255,255,255,0.4)", 
      (Math.random() * 0.8 - 0.4), 
      -0.6, 
      90
    ));
  }

  for (let i = State.particles.length - 1; i >= 0; i--) {
    const p = State.particles[i];
    p.tick();
    
    // Draw fading opacity text
    const opacity = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
    
    // Delete expired particles
    if (p.life <= 0) {
      State.particles.splice(i, 1);
    }
  }
}

// Expose state and core loops to window for E2E tests and debugging
window.State = State;
window.updateUI = updateUI;
window.gameTick = gameTick;

