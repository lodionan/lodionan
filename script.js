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

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

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

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add loading class to body
    document.body.classList.add('loaded');

    // Trigger initial animations
    setTimeout(() => {
        document.querySelectorAll('.timeline-item').forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 200);
        });
    }, 500);
});