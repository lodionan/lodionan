// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe timeline items
document.querySelectorAll('.timeline-item').forEach(item => {
    observer.observe(item);
});

// Observe other sections for fade-in
document.querySelectorAll('.about, .skills, .contact').forEach(section => {
    observer.observe(section);
});

// Navbar stays black all the time (removed scroll change behavior)

// Typing effect for hero text (optional enhancement)
const heroText = document.querySelector('.hero-text h2');
const originalText = heroText.textContent;
let i = 0;

function typeWriter() {
    if (i < originalText.length) {
        heroText.textContent = originalText.substring(0, i + 1);
        i++;
        setTimeout(typeWriter, 100);
    }
}

// Start typing effect after a delay
setTimeout(() => {
    heroText.textContent = '';
    typeWriter();
}, 1000);

// Bouncing spheres with physics
class BouncingSphere {
    constructor(element, container) {
        this.element = element;
        this.container = container;
        // Calculate initial position from CSS percentages
        const computedStyle = getComputedStyle(element);
        const leftPercent = parseFloat(computedStyle.left) / 100;
        const topPercent = parseFloat(computedStyle.top) / 100;
        this.x = leftPercent * container.offsetWidth;
        this.y = topPercent * container.offsetHeight;
        this.vx = (Math.random() - 0.5) * 6; // Random horizontal velocity
        this.vy = (Math.random() - 0.5) * 8; // Random vertical velocity, reduced for better control
        this.gravity = 0.1;
        this.bounce = 0.9;
        this.friction = 0.995;
        this.radius = element.offsetWidth / 2 * 1.75;

        // Drag properties
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartTime = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseVelocities = [];

        this.element.style.cursor = 'grab';
        this.updatePosition();
    }

    update() {
        // Skip physics update if dragging
        if (this.isDragging) return;

        // Apply gravity
        this.vy += this.gravity;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x <= 0 || this.x >= this.container.offsetWidth - this.radius * 2) {
            this.vx *= -this.bounce;
            this.x = Math.max(0, Math.min(this.x, this.container.offsetWidth - this.radius * 2));
        }

        // Constrain vertical movement to top half of the banner
        const maxY = this.container.offsetHeight / 2;
        console.log(`Sphere update - y: ${this.y}, vy: ${this.vy}, maxY: ${maxY}, containerHeight: ${this.container.offsetHeight}`);
        if (this.y <= 0 || this.y >= maxY) {
            console.log(`Vertical bounce triggered - y: ${this.y}, vy before: ${this.vy}`);
            this.vy *= -this.bounce;
            this.y = Math.max(0, Math.min(this.y, maxY));
            console.log(`After bounce - y: ${this.y}, vy after: ${this.vy}`);
        }

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    initDragEvents() {
        this.element.addEventListener('mousedown', (e) => {
            this.startDrag(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                this.endDrag(e);
            }
        });

        // Prevent default drag behavior
        this.element.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    }

    startDrag(e) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragStartTime = Date.now();
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.mouseVelocities = [];

        // Pause physics during drag
        this.element.style.cursor = 'grabbing';
        e.preventDefault();
    }

    drag(e) {
        if (!this.isDragging) return;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate mouse velocity for launch
        const timeDiff = Date.now() - this.dragStartTime;
        if (timeDiff > 0) {
            const velX = (mouseX - this.lastMouseX) / timeDiff * 10;
            const velY = (mouseY - this.lastMouseY) / timeDiff * 10;
            this.mouseVelocities.push({ vx: velX, vy: velY });

            // Keep only last few velocities for smoothing
            if (this.mouseVelocities.length > 5) {
                this.mouseVelocities.shift();
            }
        }

        // Update sphere position to follow mouse
        const rect = this.container.getBoundingClientRect();
        this.x = mouseX - rect.left - this.radius;
        this.y = mouseY - rect.top - this.radius;

        // Constrain to container bounds
        this.x = Math.max(0, Math.min(this.x, this.container.offsetWidth - this.radius * 2));
        this.y = Math.max(0, Math.min(this.y, this.container.offsetHeight - this.radius * 2));

        this.updatePosition();

        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;
    }

    endDrag(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.element.style.cursor = 'grab';

        // Calculate average velocity from recent mouse movements
        if (this.mouseVelocities.length > 0) {
            const avgVel = this.mouseVelocities.reduce(
                (acc, vel) => ({ vx: acc.vx + vel.vx, vy: acc.vy + vel.vy }),
                { vx: 0, vy: 0 }
            );

            avgVel.vx /= this.mouseVelocities.length;
            avgVel.vy /= this.mouseVelocities.length;

            // Cap velocity to same max as initial bouncing speed
            this.vx = Math.max(-3, Math.min(3, avgVel.vx));
            this.vy = Math.max(-3, Math.min(3, avgVel.vy));
        }
    }
}

const spheres = [];
const heroVisual = document.querySelector('.hero-visual');

document.querySelectorAll('.floating-circle').forEach(circle => {
    const sphere = new BouncingSphere(circle, heroVisual);
    sphere.initDragEvents();
    spheres.push(sphere);
});

function animate() {
    spheres.forEach(sphere => sphere.update());
    requestAnimationFrame(animate);
}

animate();

// Skill tags hover effect
document.querySelectorAll('.skill-tags span').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(2deg)';
    });

    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Timeline item hover effects
document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(10px)';
    });

    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

// Social links animation
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.querySelector('i').style.transform = 'scale(1.2) rotate(5deg)';
    });

    link.addEventListener('mouseleave', function() {
        this.querySelector('i').style.transform = 'scale(1) rotate(0deg)';
    });
});

// ============================================
// CYBER ATTACK MAP SYSTEM - Real-time Simulation
// ============================================

// City database with coordinates for realistic attacks
const cityDatabase = [
    { name: "New York", country: "US", coords: [40.7128, -74.0060], risk: 95 },
    { name: "Los Angeles", country: "US", coords: [34.0522, -118.2437], risk: 88 },
    { name: "San Francisco", country: "US", coords: [37.7749, -122.4194], risk: 92 },
    { name: "Chicago", country: "US", coords: [41.8781, -87.6298], risk: 78 },
    { name: "Miami", country: "US", coords: [25.7617, -80.1918], risk: 85 },
    { name: "Seattle", country: "US", coords: [47.6062, -122.3321], risk: 90 },
    { name: "London", country: "GB", coords: [51.5074, -0.1278], risk: 94 },
    { name: "Manchester", country: "GB", coords: [53.4808, -2.2426], risk: 72 },
    { name: "Paris", country: "FR", coords: [48.8566, 2.3522], risk: 89 },
    { name: "Lyon", country: "FR", coords: [45.7640, 4.8357], risk: 65 },
    { name: "Berlin", country: "DE", coords: [52.5200, 13.4050], risk: 87 },
    { name: "Munich", country: "DE", coords: [48.1351, 11.5820], risk: 70 },
    { name: "Tokyo", country: "JP", coords: [35.6762, 139.6503], risk: 96 },
    { name: "Osaka", country: "JP", coords: [34.6937, 135.5023], risk: 82 },
    { name: "Seoul", country: "KR", coords: [37.5665, 126.9780], risk: 93 },
    { name: "Beijing", country: "CN", coords: [39.9042, 116.4074], risk: 91 },
    { name: "Shanghai", country: "CN", coords: [31.2304, 121.4737], risk: 88 },
    { name: "Hong Kong", country: "HK", coords: [22.3193, 114.1694], risk: 90 },
    { name: "Singapore", country: "SG", coords: [1.3521, 103.8198], risk: 85 },
    { name: "Sydney", country: "AU", coords: [-33.8688, 151.2093], risk: 76 },
    { name: "Melbourne", country: "AU", coords: [-37.8136, 144.9631], risk: 71 },
    { name: "Mumbai", country: "IN", coords: [19.0760, 72.8777], risk: 84 },
    { name: "Delhi", country: "IN", coords: [28.7041, 77.1025], risk: 79 },
    { name: "São Paulo", country: "BR", coords: [-23.5505, -46.6333], risk: 81 },
    { name: "Mexico City", country: "MX", coords: [19.4326, -99.1332], risk: 86 },
    { name: "Buenos Aires", country: "AR", coords: [-34.6037, -58.3816], risk: 68 },
    { name: "Toronto", country: "CA", coords: [43.6532, -79.3832], risk: 77 },
    { name: "Vancouver", country: "CA", coords: [49.2827, -123.1207], risk: 73 },
    { name: "Moscow", country: "RU", coords: [55.7558, 37.6173], risk: 89 },
    { name: "Dubai", country: "AE", coords: [25.2048, 55.2708], risk: 83 },
    { name: "Tel Aviv", country: "IL", coords: [32.0853, 34.7818], risk: 91 },
    { name: "Amsterdam", country: "NL", coords: [52.3676, 4.9041], risk: 80 },
    { name: "Stockholm", country: "SE", coords: [59.3293, 18.0686], risk: 74 },
    { name: "Taipei", country: "TW", coords: [25.0330, 121.5654], risk: 87 }
];

// Attack types with visual characteristics
const attackTypes = [
    { name: "DDoS Attack", icon: "💀", color: "#ff0040", severity: "critical" },
    { name: "Malware", icon: "🦠", color: "#00ff88", severity: "high" },
    { name: "Phishing", icon: "🎣", color: "#ffaa00", severity: "medium" },
    { name: "Ransomware", icon: "🔒", color: "#ff00ff", severity: "critical" },
    { name: "SQL Injection", icon: "💉", color: "#00aaff", severity: "high" },
    { name: "Brute Force", icon: "🔨", color: "#ffff00", severity: "medium" },
    { name: "XSS Attack", icon: "⚡", color: "#ff6600", severity: "medium" },
    { name: "Zero Day", icon: "☠️", color: "#ff0040", severity: "critical" },
    { name: "Botnet", icon: "🧟", color: "#9900ff", severity: "high" },
    { name: "Port Scan", icon: "🔍", color: "#00ffcc", severity: "low" }
];

// Statistics
let attackStats = {
    total: 0,
    today: 0,
    critical: 0,
    countries: new Set()
};

// Active attack lines on map
let activeAttackLines = [];
let attackCounter = 0;

// Generate random attack
function generateRandomAttack() {
    const sourceCity = cityDatabase[Math.floor(Math.random() * cityDatabase.length)];
    let targetCity = cityDatabase[Math.floor(Math.random() * cityDatabase.length)];
    
    // Ensure source and target are different
    while (targetCity.name === sourceCity.name) {
        targetCity = cityDatabase[Math.floor(Math.random() * cityDatabase.length)];
    }
    
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    
    return {
        id: ++attackCounter,
        source: sourceCity,
        target: targetCity,
        type: attackType,
        timestamp: new Date(),
        progress: 0
    };
}

// Create animated attack line on map
function createAttackLine(attack, map) {
    const sourceCoords = attack.source.coords;
    const targetCoords = attack.target.coords;
    
    // Create animated dotted line
    const line = L.polyline([sourceCoords, targetCoords], {
        color: attack.type.color,
        weight: 2,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round'
    }).addTo(map);
    
    // Create source marker pulse
    const sourceMarker = L.circleMarker(sourceCoords, {
        radius: 8,
        fillColor: attack.type.color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);
    
    // Create target marker with pulse effect
    const targetMarker = L.circleMarker(targetCoords, {
        radius: 12,
        fillColor: attack.type.color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.6,
        className: 'pulse-marker'
    }).addTo(map);
    
    // Add attack info popup
    const popupContent = `
        <div class="attack-popup" style="background: #0a0a0a; color: ${attack.type.color}; padding: 10px; border: 1px solid ${attack.type.color}; border-radius: 5px; font-family: 'Courier New', monospace;">
            <div style="font-size: 18px; margin-bottom: 5px;">${attack.type.icon} ${attack.type.name}</div>
            <div style="font-size: 12px; opacity: 0.8;">
                📍 ${attack.source.name} → ${attack.target.name}<br>
                ⚠️ Severity: ${attack.type.severity.toUpperCase()}
            </div>
        </div>
    `;
    
    targetMarker.bindPopup(popupContent);
    
    return {
        line,
        sourceMarker,
        targetMarker,
        attack
    };
}

// Animate attack line (move the dash offset)
let animationFrame = 0;
function animateAttackLine(attackObj) {
    attackObj.attack.progress += 2;
    
    // Update dash offset for animation effect
    const newDashArray = attackObj.attack.progress % 20;
    attackObj.line.setStyle({
        dashArray: `${newDashArray}, 20`
    });
    
    // Pulse effect on target
    const pulse = Math.sin(attackObj.attack.progress * 0.5) * 4 + 12;
    attackObj.targetMarker.setRadius(pulse);
}

// Remove attack after animation completes
function removeAttack(attackObj, map) {
    map.removeLayer(attackObj.line);
    map.removeLayer(attackObj.sourceMarker);
    map.removeLayer(attackObj.targetMarker);
    
    // Update statistics
    attackStats.total++;
    attackStats.today++;
    attackStats.countries.add(attackObj.attack.source.country);
    attackStats.countries.add(attackObj.attack.target.country);
    
    if (attackObj.attack.type.severity === 'critical') {
        attackStats.critical++;
    }
    
    updateStatsDisplay();
}

// Update statistics display
function updateStatsDisplay() {
    const statsContainer = document.getElementById('attackStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-value" style="color: #00ff88;">${attackStats.total.toLocaleString()}</span>
                <span class="stat-label">TOTAL ATTACKS</span>
            </div>
            <div class="stat-item">
                <span class="stat-value" style="color: #ff0040;">${attackStats.critical.toLocaleString()}</span>
                <span class="stat-label">CRITICAL</span>
            </div>
            <div class="stat-item">
                <span class="stat-value" style="color: #00aaff;">${attackStats.countries.size}</span>
                <span class="stat-label">COUNTRIES</span>
            </div>
        `;
    }
}

// Main cyber attack simulation system
class CyberAttackSimulator {
    constructor(map) {
        this.map = map;
        this.attacks = [];
        this.maxConcurrentAttacks = 15;
        this.attackInterval = 800; // ms between attacks
        this.isRunning = false;
    }
    
    start() {
        this.isRunning = true;
        this.generateAttacks();
        this.animateAttacks();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    generateAttacks() {
        if (!this.isRunning) return;
        
        // Generate new attack if under limit
        if (this.attacks.length < this.maxConcurrentAttacks) {
            const attack = generateRandomAttack();
            const attackObj = createAttackLine(attack, this.map);
            this.attacks.push({
                ...attackObj,
                createdAt: Date.now()
            });
        }
        
        // Schedule next attack
        setTimeout(() => this.generateAttacks(), this.attackInterval + Math.random() * 500);
    }
    
    animateAttacks() {
        if (!this.isRunning) return;
        
        // Animate existing attacks
        this.attacks.forEach((attackObj, index) => {
            animateAttackLine(attackObj);
            
            // Remove after animation duration
            const age = Date.now() - attackObj.createdAt;
            if (age > 3000) { // 3 seconds
                removeAttack(attackObj, this.map);
                this.attacks.splice(index, 1);
            }
        });
        
        requestAnimationFrame(() => this.animateAttacks());
    }
}

// Initialize Leaflet map (Hacker-Cybernetic style)
function initHackerMap() {
    const map = L.map('world-map', {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        minZoom: 1,
        maxZoom: 8,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: false
    });

    // Add Cyberpunk tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    // Add grid overlay for hacker effect
    const gridLayer = L.gridLayer({
        createTile: function(coords) {
            const tile = document.createElement('div');
            tile.style.outline = '1px solid rgba(0, 255, 65, 0.1)';
            tile.style.backgroundColor = 'transparent';
            return tile;
        }
    }).addTo(map);

    // Initialize cyber attack simulator
    const cyberSimulator = new CyberAttackSimulator(map);
    
    // Start simulation after a short delay
    setTimeout(() => {
        cyberSimulator.start();
    }, 1500);

    return map;
}

// Initialize animations on page load
// ============================================
// BINARY TIDE BACKGROUND - Neon Blue Effect
// ============================================

class BinaryWave {
    constructor(container) {
        this.container = container;
        this.columns = [];
        this.columnCount = 0;
        this.digitsPerColumn = 0;
        this.waveInterval = null;
    }
    
    init() {
        // Clear existing content
        this.container.innerHTML = '';
        
        // MORE columns to cover 200% width with wider columns
        this.columnCount = Math.min(80, Math.max(40, Math.floor(window.innerWidth / 32)));
        
        // More digits per column to fill height with larger font
        this.digitsPerColumn = Math.min(30, Math.max(18, Math.floor(window.innerHeight / 28)));
        
        // Generate columns with optimized count
        for (let i = 0; i < this.columnCount; i++) {
            this.createColumn(i);
        }
        
        // Start wave cycle with less frequency
        this.startWaveCycle();
        
        // Handle resize with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 250);
        });
    }
    
    createColumn(columnIndex) {
        const column = document.createElement('div');
        column.className = 'binary-column';
        column.dataset.column = columnIndex;
        
        // Stagger animation delay for horizontal flow
        column.style.animationDelay = `${columnIndex * 0.12}s`;
        
        // Generate digits with optimized count
        for (let i = 0; i < this.digitsPerColumn; i++) {
            const digit = document.createElement('span');
            digit.className = 'binary-digit';
            digit.textContent = Math.random() > 0.5 ? '1' : '0';
            
            // OPTIMIZED: Slower, more consistent flicker duration
            // Reduces the number of unique animation calculations
            const flickerDuration = 1.5 + Math.random() * 1;
            digit.style.setProperty('--flicker-duration', `${flickerDuration}s`);
            
            // Simplified delay pattern
            const flickerDelay = (i % 5) * 0.3 + Math.random() * 0.5;
            digit.style.setProperty('--flicker-delay', `${flickerDelay}s`);
            
            // Fewer highlights to reduce visual complexity
            if (Math.random() > 0.92) {
                digit.classList.add('highlight');
            }
            
            column.appendChild(digit);
        }
        
        this.container.appendChild(column);
        this.columns.push(column);
    }
    
    startWaveCycle() {
        // OPTIMIZED: Less frequent waves to reduce CPU usage
        this.waveInterval = setInterval(() => {
            this.triggerWave();
        }, 6000); // Increased from 4000ms to 6000ms
        
        // Initial wave
        setTimeout(() => this.triggerWave(), 800);
    }
    
    triggerWave() {
        // OPTIMIZED: Only animate a subset of columns, not all
        // and skip the expensive text content updates
        const columnsToAnimate = Math.min(15, this.columns.length);
        
        for (let i = 0; i < columnsToAnimate; i++) {
            const columnIndex = Math.floor(Math.random() * this.columns.length);
            const column = this.columns[columnIndex];
            
            // Just toggle the wave class, don't update DOM content
            column.classList.add('wave');
            
            // Remove wave class after animation
            setTimeout(() => {
                column.classList.remove('wave');
            }, 3500);
        }
    }
    
    handleResize() {
        const newCount = Math.min(80, Math.max(40, Math.floor(window.innerWidth / 32)));
        
        if (Math.abs(newCount - this.columnCount) > 3) {
            this.columnCount = newCount;
            this.container.innerHTML = '';
            this.columns = [];
            
            for (let i = 0; i < this.columnCount; i++) {
                this.createColumn(i);
            }
        }
    }
    
    destroy() {
        if (this.waveInterval) {
            clearInterval(this.waveInterval);
        }
    }
}

// Initialize Binary Tide
let binaryWave = null;

document.addEventListener('DOMContentLoaded', () => {
    // Add loading class to body
    document.body.classList.add('loaded');

    // Initialize Binary Tide Background
    const binaryTideContainer = document.getElementById('binary-tide');
    if (binaryTideContainer) {
        binaryWave = new BinaryWave(binaryTideContainer);
        binaryWave.init();
    }

    // Trigger initial animations
    setTimeout(() => {
        document.querySelectorAll('.timeline-item').forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 200);
        });
    }, 500);
});