// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const profileImage = document.getElementById('profileImage');
const profilePlaceholder = document.getElementById('profilePlaceholder');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Smooth scroll navigation functionality
function initNavigation() {
    const mainContent = document.querySelector('.main-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = link.getAttribute('data-section');
            const section = document.getElementById(targetSection);
            
            if (section) {
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile && mainContent) {
                    // On mobile, scroll the main-content container
                    const sectionTop = section.offsetTop;
                    mainContent.scrollTo({
                        top: sectionTop,
                        behavior: 'smooth'
                    });
                } else {
                    // On desktop, use scrollIntoView
                    section.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Update active states after scroll
                setTimeout(() => {
                    updateActiveStates(targetSection);
                }, 100);
            }
        });
    });
    
    // Handle scroll to update active states with ultra-smooth detection
    let isScrolling = false;
    
    const handleScroll = () => {
        if (!isScrolling) {
            requestAnimationFrame(() => {
                const isMobile = window.innerWidth <= 768;
                const sections = document.querySelectorAll('.content-section');
                let currentSection = '';
                let maxVisible = 0;
                
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    const viewportHeight = isMobile && mainContent ? mainContent.clientHeight : window.innerHeight;
                    
                    // Calculate how much of the section is visible
                    const visibleTop = Math.max(0, -rect.top);
                    const visibleBottom = Math.min(rect.height, viewportHeight - rect.top);
                    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                    const visibleRatio = visibleHeight / viewportHeight;
                    
                    // Find the section with the most visible area
                    if (visibleRatio > maxVisible && rect.top < viewportHeight * 0.7) {
                        maxVisible = visibleRatio;
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
    };
    
    // Add scroll listener to both containers (only one will actually fire on each device type)
    if (mainContent) {
        mainContent.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);
    
    // Add scroll snapping on both mobile and desktop - snap to nearest section when scroll ends
    let scrollTimeout;
    let lastScrollTop = 0;
    let isScrollingToSection = false;
    let lastScrollTime = Date.now();
    
    const handleScrollEnd = () => {
        const isMobile = window.innerWidth <= 768;
        const sections = document.querySelectorAll('.content-section');
        
        let scrollTop, viewportHeight, scrollContainer;
        
        if (isMobile && mainContent) {
            // Mobile: scroll happens on main-content
            scrollTop = mainContent.scrollTop;
            viewportHeight = mainContent.clientHeight;
            scrollContainer = mainContent;
        } else {
            // Desktop: scroll happens on window
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            viewportHeight = window.innerHeight;
            scrollContainer = window;
        }
        
        // Don't snap if we're already scrolling to a section
        if (isScrollingToSection) {
            lastScrollTop = scrollTop;
            return;
        }
        
        // Check if we're already at a section (within 30px threshold for more lenient snapping)
        let isAlreadyAtSection = false;
        sections.forEach(section => {
            let sectionTop;
            if (isMobile && mainContent) {
                sectionTop = section.offsetTop;
            } else {
                sectionTop = section.offsetTop;
            }
            
            const distance = Math.abs(scrollTop - sectionTop);
            if (distance < 30) {
                isAlreadyAtSection = true;
            }
        });
        
        // Calculate scroll delta first
        const scrollDelta = Math.abs(scrollTop - lastScrollTop);
        const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
        
        // If already at a section, don't snap (but allow if scrolling in opposite direction)
        // More lenient - allow snapping even if close to section if scrolling in opposite direction
        if (isAlreadyAtSection && scrollDelta < 30) {
            lastScrollTop = scrollTop;
            return;
        }
        
        let nearestSection = null;
        let minDistance = Infinity;
        
        // Only snap if there was significant scroll movement
        if (scrollDelta < 10) {
            lastScrollTop = scrollTop;
            return;
        }
        
        sections.forEach(section => {
            let sectionTop;
            if (isMobile && mainContent) {
                sectionTop = section.offsetTop;
            } else {
                // Desktop: get position relative to document
                sectionTop = section.offsetTop;
            }
            
            const sectionCenter = sectionTop + (section.offsetHeight / 2);
            const viewportCenter = scrollTop + (viewportHeight / 2);
            const distance = Math.abs(viewportCenter - sectionCenter);
            
            // On desktop, prefer sections in the scroll direction for more aggressive snapping
            if (!isMobile) {
                // Symmetric thresholds for both directions
                const isInScrollDirection = scrollDirection === 'down' 
                    ? sectionTop > scrollTop + 30   // Below current position
                    : sectionTop < scrollTop - 30;  // Above current position (same threshold)
                
                // If scrolling down and section is below, or scrolling up and section is above
                if (isInScrollDirection && distance < minDistance) {
                    minDistance = distance;
                    nearestSection = section;
                } else if (!nearestSection && distance < minDistance) {
                    // Fallback to nearest if no section in scroll direction
                    minDistance = distance;
                    nearestSection = section;
                }
            } else {
                // Mobile: use nearest section
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestSection = section;
                }
            }
        });
        
        // Only snap if we found a section and it's not the current one
        if (nearestSection) {
            const currentSectionTop = isMobile && mainContent 
                ? nearestSection.offsetTop 
                : nearestSection.offsetTop;
            const currentDistance = Math.abs(scrollTop - currentSectionTop);
            
            // Only snap if we're not already close to this section
            // Same threshold for both directions
            const distanceThreshold = 50;
            if (currentDistance > distanceThreshold) {
                isScrollingToSection = true;
                
                if (isMobile && mainContent) {
                    mainContent.scrollTo({
                        top: nearestSection.offsetTop,
                        behavior: 'smooth'
                    });
                } else {
                    // Desktop: scroll window to section
                    window.scrollTo({
                        top: nearestSection.offsetTop,
                        behavior: 'smooth'
                    });
                }
                
                // Update active state
                setTimeout(() => {
                    updateActiveStates(nearestSection.id);
                    isScrollingToSection = false;
                }, 400);
            }
        }
        
        lastScrollTop = scrollTop;
        lastScrollTime = Date.now();
    };
    
    // More aggressive scroll end detection for desktop
    const scrollEndHandler = () => {
        const isMobile = window.innerWidth <= 768;
        clearTimeout(scrollTimeout);
        
        // Update lastScrollTop continuously during scroll
        if (!isMobile) {
            lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        } else if (mainContent) {
            lastScrollTop = mainContent.scrollTop;
        }
        
        // Desktop: longer timeout to let CSS scroll snapping work first, only use as fallback
        // CSS scroll snapping should handle most of it
        const timeout = isMobile ? 150 : 200;
        
        scrollTimeout = setTimeout(() => {
            // Only run if not already scrolling to a section (wheel handler might have triggered)
            // And if enough time has passed since last scroll
            const timeSinceLastScroll = Date.now() - lastScrollTime;
            if (!isScrollingToSection && timeSinceLastScroll > 150) {
                handleScrollEnd();
            }
        }, timeout);
    };
    
    // Add scroll end handler to appropriate container
    if (mainContent) {
        mainContent.addEventListener('scroll', scrollEndHandler);
    }
    window.addEventListener('scroll', scrollEndHandler);
    
    // Initialize lastScrollTop
    if (mainContent) {
        lastScrollTop = mainContent.scrollTop;
    } else {
        lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    }
    
    // Desktop: Add immediate wheel-based scrolling for more responsive snapping
    let wheelTimeout;
    let wheelDelta = 0;
    let lastWheelTime = 0;
    
    const handleWheel = (e) => {
        // Only handle on desktop
        if (window.innerWidth <= 768) {
            return;
        }
        
        // Don't interfere if we're already scrolling to a section
        if (isScrollingToSection) {
            return;
        }
        
        const now = Date.now();
        const timeSinceLastWheel = now - lastWheelTime;
        lastWheelTime = now;
        
        // Accumulate wheel delta, reset if too much time passed
        if (timeSinceLastWheel > 100) {
            wheelDelta = 0;
        }
        
        wheelDelta += e.deltaY;
        const scrollDirection = wheelDelta > 0 ? 'down' : 'up';
        
        // Update lastScrollTop immediately to track scroll direction accurately
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        lastScrollTop = currentScrollTop;
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            // Same threshold for both directions - make it symmetric
            const scrollThreshold = 20; // Lower threshold for more responsive snapping
            
            if (Math.abs(wheelDelta) > scrollThreshold) {
                const sections = document.querySelectorAll('.content-section');
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const viewportHeight = window.innerHeight;
                const viewportTop = scrollTop;
                const viewportBottom = scrollTop + viewportHeight;
                const viewportCenter = scrollTop + (viewportHeight / 2);
                
                let targetSection = null;
                let minDistance = Infinity;
                
                sections.forEach((section) => {
                    const sectionTop = section.offsetTop;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    
                    // Symmetric logic for both directions - use viewport boundaries
                    if (scrollDirection === 'down') {
                        // Find next section that starts below viewport center
                        if (sectionTop > viewportCenter) {
                            const distance = sectionTop - viewportCenter;
                            if (distance < minDistance) {
                                minDistance = distance;
                                targetSection = section;
                            }
                        }
                    } else {
                        // Find previous section that ends above viewport center - symmetric logic
                        if (sectionBottom < viewportCenter) {
                            const distance = viewportCenter - sectionBottom;
                            if (distance < minDistance) {
                                minDistance = distance;
                                targetSection = section;
                            }
                        }
                    }
                });
                
                // If no section found in scroll direction, find nearest
                if (!targetSection) {
                    sections.forEach((section) => {
                        const sectionTop = section.offsetTop;
                        const sectionCenter = sectionTop + (section.offsetHeight / 2);
                        const viewportCenter = scrollTop + (viewportHeight / 2);
                        const distance = Math.abs(viewportCenter - sectionCenter);
                        
                        if (distance < minDistance) {
                            minDistance = distance;
                            targetSection = section;
                        }
                    });
                }
                
                // Only snap if we found a target and we're not already close to it
                if (targetSection && !isScrollingToSection) {
                    const currentDistance = Math.abs(scrollTop - targetSection.offsetTop);
                    
                    // Same threshold for both directions - make it symmetric
                    const distanceThreshold = 50;
                    
                    // Only snap if we're not already at this section
                    if (currentDistance > distanceThreshold) {
                        isScrollingToSection = true;
                        window.scrollTo({
                            top: targetSection.offsetTop,
                            behavior: 'smooth'
                        });
                        
                        // Update lastScrollTop to prevent conflicts
                        lastScrollTop = targetSection.offsetTop;
                        
                        setTimeout(() => {
                            updateActiveStates(targetSection.id);
                            isScrollingToSection = false;
                        }, 400);
                    }
                }
            }
            
            wheelDelta = 0;
        }, 60); // Shorter timeout for more responsive snapping (same for both directions)
    };
    
    // Use passive listener for better performance
    window.addEventListener('wheel', handleWheel, { passive: true });
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
    
    // Ensure sidebar is hidden on mobile on page load
    if (window.innerWidth <= 768 && sidebar) {
        sidebar.style.transform = 'translateX(-100%)';
        sidebar.classList.remove('open');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }
    
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

// Mobile background fade transition
function initMobileBackgroundFade() {
    // Only run on mobile devices
    if (window.innerWidth > 768) {
        return;
    }
    
    const homeSection = document.getElementById('home');
    if (!homeSection) return;
    
    const homeBackground = homeSection;
    let lastScrollY = window.scrollY;
    
    function updateBackgroundOpacity() {
        const scrollY = window.scrollY;
        const homeHeight = homeSection.offsetHeight;
        const scrollProgress = Math.min(scrollY / (homeHeight * 0.5), 1); // Fade out over first 50% of home section
        
        // Fade out background as user scrolls
        const opacity = Math.max(0, 1 - scrollProgress);
        homeBackground.style.setProperty('--bg-opacity', opacity);
        
        // Update the ::before pseudo-element opacity via CSS variable
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                #home::before {
                    opacity: var(--bg-opacity, 1) !important;
                }
            }
        `;
        // Remove old style if exists
        const oldStyle = document.getElementById('mobile-bg-fade-style');
        if (oldStyle) oldStyle.remove();
        style.id = 'mobile-bg-fade-style';
        document.head.appendChild(style);
        
        lastScrollY = scrollY;
    }
    
    // Set initial opacity
    homeBackground.style.setProperty('--bg-opacity', '1');
    
    // Throttle scroll events for better performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateBackgroundOpacity();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial call
    updateBackgroundOpacity();
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
    initMobileBackgroundFade();
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

