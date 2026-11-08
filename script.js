/* ============================================================
   TITAN FITNESS CLUB — Premium JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ============================
  // 1. PRELOADER & INITIAL SETUP
  // ============================
  document.body.style.overflowX = 'hidden';

  // ============================
  // 2. SCROLL PROGRESS BAR
  // ============================
  const scrollProgress = document.getElementById('scrollProgress');

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + '%';
    }
  }

  // ============================
  // 3. NAVBAR
  // ============================
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navOverlay = document.getElementById('navOverlay');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Mobile menu toggle
  if (navToggle && navOverlay) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navOverlay.classList.toggle('active');
      document.body.style.overflow = navOverlay.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Active nav link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function highlightActiveLink() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ============================
  // 4. SMOOTH SCROLLING
  // ============================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = target.offsetTop - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================
  // 5. BACK TO TOP BUTTON
  // ============================
  const backToTop = document.getElementById('backToTop');

  function handleBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================
  // 6. SCROLL EVENT — DEBOUNCED
  // ============================
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollProgress();
        handleNavbarScroll();
        handleBackToTop();
        highlightActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initialize on load
  updateScrollProgress();
  handleNavbarScroll();

  // ============================
  // 7. INTERSECTION OBSERVER — SCROLL REVEALS
  // ============================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: stop observing once revealed
        // revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Stagger animation delay for grid children
  document.querySelectorAll('.stats-grid, .programs-grid, .trainers-grid, .plans-grid, .features-grid').forEach(grid => {
    const children = grid.querySelectorAll('.reveal');
    children.forEach((child, index) => {
      child.style.transitionDelay = `${index * 0.1}s`;
    });
  });

  // ============================
  // 8. ANIMATED COUNTERS
  // ============================
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;

    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'));
      const suffix = stat.getAttribute('data-suffix') || '';
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        // Format large numbers
        if (target >= 1000) {
          stat.textContent = current.toLocaleString() + suffix;
        } else {
          stat.textContent = current + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          if (target >= 1000) {
            stat.textContent = target.toLocaleString() + suffix;
          } else {
            stat.textContent = target + suffix;
          }
        }
      }

      requestAnimationFrame(updateCounter);
    });

    countersAnimated = true;
  }

  // Trigger counters when stats section is visible
  const trustSection = document.getElementById('trust');
  if (trustSection) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counterObserver.observe(trustSection);
  }

  // ============================
  // 9. TESTIMONIAL SLIDER
  // ============================
  const testimonialTrack = document.getElementById('testimonialTrack');
  const testimonialPrev = document.getElementById('testimonialPrev');
  const testimonialNext = document.getElementById('testimonialNext');
  const testimonialDots = document.getElementById('testimonialDots');
  let currentTestimonialSlide = 0;
  let totalTestimonialSlides = 0;

  if (testimonialTrack) {
    const slides = testimonialTrack.querySelectorAll('.testimonial-slide');
    totalTestimonialSlides = slides.length;

    function goToTestimonialSlide(index) {
      if (index < 0) index = totalTestimonialSlides - 1;
      if (index >= totalTestimonialSlides) index = 0;
      currentTestimonialSlide = index;
      testimonialTrack.style.transform = `translateX(-${index * 100}%)`;

      // Update dots
      if (testimonialDots) {
        testimonialDots.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }
    }

    if (testimonialPrev) {
      testimonialPrev.addEventListener('click', () => {
        goToTestimonialSlide(currentTestimonialSlide - 1);
      });
    }

    if (testimonialNext) {
      testimonialNext.addEventListener('click', () => {
        goToTestimonialSlide(currentTestimonialSlide + 1);
      });
    }

    if (testimonialDots) {
      testimonialDots.querySelectorAll('.testimonial-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const index = parseInt(dot.getAttribute('data-index'));
          goToTestimonialSlide(index);
        });
      });
    }

    // Auto-slide every 6 seconds
    setInterval(() => {
      goToTestimonialSlide(currentTestimonialSlide + 1);
    }, 6000);
  }

  // ============================
  // 10. GALLERY LIGHTBOX
  // ============================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentGalleryIndex = 0;
  const galleryImages = [];

  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (img) {
      // Get the high-res version
      const src = img.src.replace('w=600', 'w=1400');
      galleryImages.push(src);
    }

    item.addEventListener('click', () => {
      currentGalleryIndex = index;
      openLightbox(index);
    });
  });

  function openLightbox(index) {
    if (lightbox && lightboxImage) {
      lightboxImage.src = galleryImages[index];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function navigateLightbox(direction) {
    currentGalleryIndex += direction;
    if (currentGalleryIndex < 0) currentGalleryIndex = galleryImages.length - 1;
    if (currentGalleryIndex >= galleryImages.length) currentGalleryIndex = 0;
    if (lightboxImage) {
      lightboxImage.style.opacity = '0';
      setTimeout(() => {
        lightboxImage.src = galleryImages[currentGalleryIndex];
        lightboxImage.style.opacity = '1';
      }, 200);
    }
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    }
  });

  // ============================
  // 11. TRANSFORMATION BEFORE/AFTER SLIDER
  // ============================
  const transformSlider = document.getElementById('transformationSlider');
  const sliderHandle = document.getElementById('sliderHandle');

  if (transformSlider && sliderHandle) {
    let isDragging = false;
    const afterImage = transformSlider.querySelector('.after-image');

    function updateSliderPosition(clientX) {
      const rect = transformSlider.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const percent = (x / rect.width) * 100;

      if (afterImage) {
        afterImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      }
      sliderHandle.style.left = percent + '%';
    }

    transformSlider.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSliderPosition(e.clientX);
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updateSliderPosition(e.clientX);
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    transformSlider.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (isDragging) {
        updateSliderPosition(e.touches[0].clientX);
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // ============================
  // 12. BMI CALCULATOR
  // ============================
  const bmiCalculate = document.getElementById('bmiCalculate');
  const bmiResult = document.getElementById('bmiResult');

  if (bmiCalculate) {
    bmiCalculate.addEventListener('click', () => {
      const age = parseFloat(document.getElementById('bmiAge').value);
      const height = parseFloat(document.getElementById('bmiHeight').value);
      const weight = parseFloat(document.getElementById('bmiWeight').value);

      // Validation
      if (!age || !height || !weight || age < 15 || age > 120 || height < 50 || weight < 10) {
        alert('Please enter valid values for all fields.');
        return;
      }

      // BMI Formula: weight (kg) / height (m)^2
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      const bmiRounded = bmi.toFixed(1);

      // Determine category
      let category = '';
      let description = '';
      let categoryClass = '';

      if (bmi < 18.5) {
        category = 'Underweight';
        description = 'Your BMI suggests you are underweight. Consider consulting a nutritionist for a healthy weight gain plan.';
        categoryClass = 'underweight';
      } else if (bmi < 25) {
        category = 'Normal Weight';
        description = 'Great job! Your BMI is within the healthy range. Keep maintaining your balanced lifestyle!';
        categoryClass = 'normal';
      } else if (bmi < 30) {
        category = 'Overweight';
        description = 'Your BMI indicates you are overweight. Regular exercise and a balanced diet can help achieve a healthier weight.';
        categoryClass = 'overweight';
      } else {
        category = 'Obese';
        description = 'Your BMI indicates obesity. We recommend consulting a healthcare professional and starting a guided fitness program.';
        categoryClass = 'obese';
      }

      // Display result
      const bmiValue = document.getElementById('bmiValue');
      const bmiCategory = document.getElementById('bmiCategory');
      const bmiDesc = document.getElementById('bmiDesc');

      if (bmiResult && bmiValue && bmiCategory && bmiDesc) {
        bmiResult.className = 'bmi-result active ' + categoryClass;
        bmiCategory.textContent = category;
        bmiDesc.textContent = description;

        // Animate the BMI value
        let currentVal = 0;
        const targetVal = parseFloat(bmiRounded);
        const increment = targetVal / 40;
        const counterInterval = setInterval(() => {
          currentVal += increment;
          if (currentVal >= targetVal) {
            currentVal = targetVal;
            clearInterval(counterInterval);
          }
          bmiValue.textContent = currentVal.toFixed(1);
        }, 30);
      }
    });
  }

  // ============================
  // 13. FAQ ACCORDION
  // ============================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all others
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        });

        // Toggle current
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  // ============================
  // 14. CONTACT FORM
  // ============================
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();

      if (!name || !email) {
        alert('Please fill in at least your name and email.');
        return;
      }

      // Simulate form submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending... ⏳';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = 'Message Sent! ✓';
        submitBtn.style.background = 'var(--accent-dark)';

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
          contactForm.reset();
        }, 3000);
      }, 1500);
    });
  }

  // ============================
  // 15. PARALLAX EFFECTS
  // ============================
  const heroContent = document.querySelector('.hero-content');

  function handleParallax() {
    const scrollY = window.scrollY;

    // Hero parallax - content moves slower than scroll
    if (heroContent && scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
    }
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(handleParallax);
  });

  // ============================
  // 16. LAZY LOADING IMAGES
  // ============================
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // Add a fade-in effect when image loads
          img.style.opacity = '0';
          img.style.transition = 'opacity 0.5s ease';

          img.addEventListener('load', () => {
            img.style.opacity = '1';
          }, { once: true });

          // If image is already loaded (from cache)
          if (img.complete) {
            img.style.opacity = '1';
          }

          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px 0px'
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // ============================
  // 17. CARD TILT EFFECT (DESKTOP)
  // ============================
  if (window.matchMedia('(min-width: 1024px)').matches) {
    const tiltCards = document.querySelectorAll('.program-card, .feature-card');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 25;
        const rotateY = (centerX - x) / 25;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ============================
  // 18. HERO VIDEO FALLBACK
  // ============================
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    heroVideo.addEventListener('error', () => {
      // If video fails to load, ensure poster/background image is visible
      heroVideo.style.display = 'none';
    });

    // Ensure video plays (some browsers block autoplay)
    heroVideo.play().catch(() => {
      // Autoplay was prevented, poster image is the fallback
    });
  }

  // ============================
  // 19. LIGHTBOX IMAGE TRANSITION
  // ============================
  if (lightboxImage) {
    lightboxImage.style.transition = 'opacity 0.3s ease';
    lightboxImage.style.opacity = '1';
  }

  // ============================
  // 20. PERFORMANCE: Reduce motion for users who prefer it
  // ============================
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      el.style.transition = 'none';
      el.classList.add('visible');
    });
  }
});
