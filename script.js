// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const profileImage = document.getElementById('profileImage');
const profilePlaceholder = document.getElementById('profilePlaceholder');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Smooth scroll navigation functionality
function initNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = link.getAttribute('data-section');
            const section = document.getElementById(targetSection);
            
            if (section) {
                // Smooth scroll to the section
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active states after scroll
                setTimeout(() => {
                    updateActiveStates(targetSection);
                }, 100);
            }
        });
    });
    
    // Handle scroll to update active states with ultra-smooth detection
    let isScrolling = false;
    
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            requestAnimationFrame(() => {
                const sections = document.querySelectorAll('.content-section');
                let currentSection = '';
                let minDistance = Infinity;
                
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    const distance = Math.abs(rect.top);
                    
                    // More sensitive detection for quicker transitions
                    if (distance < minDistance && rect.top <= window.innerHeight * 0.6) {
                        minDistance = distance;
                        currentSection = section.id;
                    }
                });
                
                if (currentSection) {
                    updateActiveStates(currentSection);
                }
                
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
}

function updateActiveStates(activeSectionId) {
    // Remove active class from all links and sections
    navLinks.forEach(l => l.classList.remove('active'));
    contentSections.forEach(s => s.classList.remove('active'));
    
    // Add active class to current section
    const activeSection = document.getElementById(activeSectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Add active class to corresponding nav link
    const activeLink = document.querySelector(`[data-section="${activeSectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Profile image handling
function initProfileImage() {
    // Check if profile image exists
    if (profileImage) {
        // Show the image by default
        profileImage.style.display = 'block';
        profilePlaceholder.style.display = 'none';
        
        profileImage.addEventListener('load', () => {
            profilePlaceholder.style.display = 'none';
            profileImage.style.display = 'block';
        });
        
        profileImage.addEventListener('error', () => {
            console.log('Profile image failed to load');
            profilePlaceholder.style.display = 'flex';
            profileImage.style.display = 'none';
        });
    }
}

// Smooth animations and interactions
function initAnimations() {
    // Add hover effects to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-3px) scale(1.1)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add typing effect to main title (optional enhancement)
    const mainTitle = document.querySelector('.main-title');
    if (mainTitle) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 1s ease-out';
                }
            });
        });
        observer.observe(mainTitle);
    }
}

// Mobile menu toggle (for responsive design)
function initMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const mobileThemeIcon = document.getElementById('mobileThemeIcon');
    
    // Create mobile menu toggle button
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-chevron-right"></i><i class="fas fa-chevron-left"></i>';
    menuToggle.setAttribute('aria-label', 'Toggle menu');
    
    document.body.appendChild(menuToggle);
    
    // Function to open sidebar
    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        menuToggle.classList.add('open');
        menuToggle.setAttribute('aria-label', 'Close menu');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    // Function to close sidebar
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Toggle sidebar when menu toggle is clicked
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
    
    // Close sidebar when overlay is clicked
    overlay.addEventListener('click', () => {
        closeSidebar();
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                closeSidebar();
            }
        }
    });
    
    // Close sidebar when navigation link is clicked on mobile
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Show/hide menu toggle based on screen size
    function handleResize() {
        if (window.innerWidth <= 768) {
            menuToggle.style.display = 'block';
        } else {
            menuToggle.style.display = 'none';
            closeSidebar(); // Close sidebar when switching to desktop
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
}

// Parallax effect for background (subtle) - disabled on mobile
function initParallax() {
    // Disable parallax on mobile devices to prevent jumping
    if (window.innerWidth <= 768) {
        return;
    }
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-content');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Add CSS animations dynamically
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }
        
        .profile-image-container:hover {
            animation: pulse 2s infinite;
        }
        
        .nav-link {
            position: relative;
            overflow: hidden;
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.6s;
        }
        
        .nav-link:hover::after {
            left: 100%;
        }
    `;
    document.head.appendChild(style);
}

// Theme toggle functionality
function initThemeToggle() {
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const mobileThemeIcon = document.getElementById('mobileThemeIcon');
    
    // Get saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Desktop theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    // Mobile theme toggle event listener
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const mobileThemeIcon = document.getElementById('mobileThemeIcon');
    
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-moon';
        themeToggle.setAttribute('data-tooltip', 'Enable Light Mode');
        if (mobileThemeIcon) {
            mobileThemeIcon.className = 'fas fa-moon';
        }
    } else {
        themeIcon.className = 'fas fa-sun';
        themeToggle.setAttribute('data-tooltip', 'Enable Dark Mode');
        if (mobileThemeIcon) {
            mobileThemeIcon.className = 'fas fa-sun';
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Always start at the top (home screen) on page load/refresh
    window.scrollTo(0, 0);
    
    initNavigation();
    initProfileImage();
    initAnimations();
    initMobileMenu();
    initParallax();
    initThemeToggle();
    addDynamicStyles();
    
    // Set initial active section to home
    updateActiveStates('home');
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
});

// Handle external links
document.addEventListener('click', (e) => {
    if (e.target.closest('.social-link')) {
        e.preventDefault();
        // You can add analytics or other tracking here
        console.log('Social link clicked:', e.target.closest('.social-link').getAttribute('aria-label'));
    }
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu on escape
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events - disabled on mobile
const debouncedParallax = debounce(() => {
    // Disable parallax on mobile devices
    if (window.innerWidth <= 768) {
        return;
    }
    
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-content');
    
    parallaxElements.forEach(element => {
        const speed = 0.3;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
}, 10);

// Only add scroll listener on desktop
if (window.innerWidth > 768) {
    window.addEventListener('scroll', debouncedParallax);
}

