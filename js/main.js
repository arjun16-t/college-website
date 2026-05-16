// ============================================
//   NAVBAR - Scroll Shadow Effect
// ============================================
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});


// ============================================
//   NAVBAR - Hamburger Menu Toggle
// ============================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});


// ============================================
//   NAVBAR - Close menu when a link is clicked
// ============================================
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ============================================
//   SCROLL REVEAL - Intersection Observer
// ============================================
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Stop observing once revealed - saves memory
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15  // trigger when 15% of element is visible
});

revealElements.forEach(el => revealObserver.observe(el));

// ============================================
//   STATS COUNT-UP ANIMATION
// ============================================

const statNumbers = document.querySelectorAll('.stat-number');

const countUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 1500;      // 2 seconds
    const stepTime = 10;        // update every 20ms
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current);
        }
    }, stepTime);
};

// Only trigger when section enters viewport
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            statNumbers.forEach(countUp);
            statObserver.disconnect();      // run only once
        }
    });
}, { threshold: 0.3 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) statObserver.observe(statsSection);

// ============================================
//   NEWS CAROUSEL
// ============================================
const slides = document.querySelectorAll('.news-slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('newsPrev');
const nextBtn = document.getElementById('newsNext');

let currentSlide = 0;

const goToSlide = (index) => {
  // Remove active from all
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  // Add active to target
  slides[index].classList.add('active');
  dots[index].classList.add('active');
  currentSlide = index;
};

// Arrow navigation
if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prev);
  });

  nextBtn.addEventListener('click', () => {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  });
}

// Dot navigation
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goToSlide(parseInt(dot.getAttribute('data-index')));
  });
});

// Auto-play every 5 seconds
const autoPlay = setInterval(() => {
  const next = (currentSlide + 1) % slides.length;
  goToSlide(next);
}, 5000);

// ============================================
//   ENQUIRY MODAL
// ============================================
const enquireBtn = document.getElementById('enquireBtn');
const enquiryModal = document.getElementById('enquiryModal');
const modalClose = document.getElementById('modalClose');

// Open modal
if (enquireBtn) {
  enquireBtn.addEventListener('click', () => {
    enquiryModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent bg scroll
    generateCaptcha();
  });
}

// Close modal
const closeModal = () => {
  enquiryModal.classList.remove('open');
  document.body.style.overflow = '';
};

if (modalClose) modalClose.addEventListener('click', closeModal);

// Close on overlay click
enquiryModal?.addEventListener('click', (e) => {
  if (e.target === enquiryModal) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});


// ============================================
//   MATH CAPTCHA
// ============================================
let captchaAnswer = 0;

const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  captchaAnswer = num1 + num2;
  document.getElementById('captchaQuestion').textContent = 
    `What is ${num1} + ${num2} ?`;
  document.getElementById('captchaAnswer').value = '';
};

document.getElementById('captchaRefresh')
  ?.addEventListener('click', generateCaptcha);


// ============================================
//   ENQUIRY FORM VALIDATION
// ============================================
const enquiryForm = document.getElementById('enquiryForm');

const showError = (id, msg) => {
  document.getElementById(id).textContent = msg;
};

const clearErrors = () => {
  ['enqNameError','enqEmailError','enqPhoneError',
   'enqCourseError','captchaError','enqConsentError']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
};

enquiryForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors();

  const name    = document.getElementById('enqName').value.trim();
  const email   = document.getElementById('enqEmail').value.trim();
  const phone   = document.getElementById('enqPhone').value.trim();
  const course  = document.getElementById('enqCourse').value;
  const captcha = parseInt(document.getElementById('captchaAnswer').value);
  const consent = document.getElementById('enqConsent').checked;

  let valid = true;

  if (!name) {
    showError('enqNameError', 'Name is required.'); valid = false;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('enqEmailError', 'Enter a valid email address.'); valid = false;
  }

  if (!phone || !/^\d{10}$/.test(phone)) {
    showError('enqPhoneError', 'Enter a valid 10-digit mobile number.'); valid = false;
  }

  if (!course) {
    showError('enqCourseError', 'Please select a course.'); valid = false;
  }

  if (isNaN(captcha) || captcha !== captchaAnswer) {
    showError('captchaError', 'Incorrect answer. Please try again.'); 
    generateCaptcha(); valid = false;
  }

  if (!consent) {
    showError('enqConsentError', 'Please give your consent to proceed.');
    valid = false;
  }

  if (valid) {
    // Show success — backend will be wired later
    document.getElementById('formSuccess').style.display = 'block';
    enquiryForm.reset();
    generateCaptcha();
    setTimeout(() => {
      document.getElementById('formSuccess').style.display = 'none';
      closeModal();
    }, 3000);
  }
});