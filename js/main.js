// ============================================
//   UTILITY FUNCTIONS
// ============================================
function getCookie(name) {
  const cookies = document.cookie.split('; ');
  const found = cookies.find(row => row.startsWith(name + '='));
  return found ? found.split('=')[1] : null;
}

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

// Close menu when a non-dropdown link is clicked
document.querySelectorAll('.nav-link:not(.dropdown-toggle)')
.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    // Close all dropdowns too
    document.querySelectorAll('.dropdown-menu')
      .forEach(m => m.classList.remove('open'));
  });
});

// ── Mobile dropdown toggle ──
document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    // Only intercept on mobile
    if (window.innerWidth > 768) return;

    e.preventDefault(); // don't navigate yet

    const parentLi = toggle.closest('.nav-item-dropdown');
    const dropdownMenu = parentLi.querySelector('.dropdown-menu');

    // Close all other dropdowns first
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      if (menu !== dropdownMenu) {
        menu.classList.remove('open');
      }
    });

    // Toggle this dropdown
    dropdownMenu.classList.toggle('open');
  });
});

// Dropdown link clicked on mobile → navigate + close menu
document.querySelectorAll('.dropdown-menu a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.querySelectorAll('.dropdown-menu')
      .forEach(m => m.classList.remove('open'));
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
if (slides.length > 0) {
  const autoPlay = setInterval(() => {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }, 5000);
}

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
   'enqCourseError','captchaError','enqConsentError', 'enqMessageError']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
};

enquiryForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const name    = document.getElementById('enqName').value.trim();
  const email   = document.getElementById('enqEmail').value.trim();
  const phone   = document.getElementById('enqPhone').value.trim();
  const course  = document.getElementById('enqCourse').value;
  const message  = document.getElementById('enqMessage').value.trim();
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
    const csrftoken = getCookie('csrftoken');

    const payload = {
      name: name,
      email: email,
      phone: phone,
      course: course,
      message: message
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/enquiry/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log(data)

      if (response.ok) {
        document.getElementById('formSuccess').style.display = 'block';
        enquiryForm.reset();
        generateCaptcha();
        setTimeout(() => {
          document.getElementById('formSuccess').style.display = 'none';
          closeModal();
        }, 3000);
      } else {
        const errorMap = {
          name: 'enqNameError',
          email: 'enqEmailError',
          phone: 'enqPhoneError',
          course: 'enqCourseError',
          message: 'enqMessageError'
        };
        Object.keys(data).forEach(field => {
          if (errorMap[field]) {
            showError(errorMap[field], data[field][0]);
          }
        });
      }

    } catch (err) {
      showError('enqNameError', 'Network error. Please check your connection.');
    }
  }
});

// ============================================
//   ABOUT PAGE - SIDEBAR TAB SWITCHING
// ============================================
const sidebarBtns = document.querySelectorAll('.sidebar-btn');
const contentPanels = document.querySelectorAll('.content-panel');

const activateSection = (targetId) => {
  if (!targetId) return;

  // Check if section exists on this page
  const targetPanel = document.getElementById(targetId);
  if (!targetPanel) return;

  // Update sidebar buttons
  sidebarBtns.forEach(b => b.classList.remove('active'));
  const targetBtn = document.querySelector(
    `.sidebar-btn[data-section="${targetId}"]`
  );
  if (targetBtn) targetBtn.classList.add('active');

  // Update panels
  contentPanels.forEach(p => p.classList.remove('active'));
  targetPanel.classList.add('active');
};


// Handle sidebar clicks
sidebarBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-section');

    // Update URL hash without page jump
    history.pushState(null, null, `#${target}`);

    activateSection(target);

    // Scroll to content on mobile
    if (window.innerWidth < 768) {
      document.querySelector('.about-content')
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ── Listen for hash changes (navbar dropdown clicks) ──
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  activateSection(hash);

  // Scroll to top of content smoothly
  document.querySelector('.about-content, .about-page')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// On page load — read hash from URL
const initialHash = window.location.hash.replace('#', '');
if (initialHash && document.getElementById(initialHash)) {
  activateSection(initialHash);
} else if (contentPanels.length > 0) {
  const firstBtn = sidebarBtns[0];
  if (firstBtn) {
    activateSection(firstBtn.getAttribute('data-section'));
  }
}

// ============================================
//   FAQ ACCORDION
// ============================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all first
    faqItems.forEach(i => i.classList.remove('open'));

    // Open clicked one if it was closed
    if (!isOpen) item.classList.add('open');
  });
});

// ============================================
//   COURSE PAGE - Sidebar Active Link on Scroll
// ============================================
const courseSections = document.querySelectorAll('.course-section');
const sidebarLinks = document.querySelectorAll('.course-sidebar-link');

if (courseSections.length > 0) {
  window.addEventListener('scroll', () => {
    let current = '';

    courseSections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    sidebarLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ============================================
//   GALLERY - Filter + Lightbox
// ============================================
const filterBtns = document.querySelectorAll('.gallery-filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxLabel = document.getElementById('lightboxLabel');
const lightboxCaption = document.getElementById('lightboxCaption');

let currentIndex = 0;
let visibleItems = [];

// ── Filter ──
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    galleryItems.forEach(item => {
      const cat = item.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        item.classList.remove('hidden');
        item.classList.add('fade-in');
        setTimeout(() => item.classList.remove('fade-in'), 400);
      } else {
        item.classList.add('hidden');
      }
    });

    // Update visible items for lightbox
    updateVisibleItems();
  });
});

// ── Update visible items list ──
const updateVisibleItems = () => {
  visibleItems = [...galleryItems].filter(
    item => !item.classList.contains('hidden')
  );
};

// Initial visible items
updateVisibleItems();

// ── Open Lightbox ──
galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const index = parseInt(item.getAttribute('data-index'));
    const label = item.querySelector('span')?.textContent || '';

    // Find position in visible items
    currentIndex = visibleItems.indexOf(item);

    showLightbox(label);
  });
});

const showLightbox = (label) => {
  const item = visibleItems[currentIndex];
  const caption = item?.querySelector('span')?.textContent || '';

  lightboxLabel.textContent = caption;
  lightboxCaption.textContent = caption;

  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
};

// ── Close Lightbox ──
const closeLightbox = () => {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
};

lightboxClose?.addEventListener('click', closeLightbox);

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox?.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') navigateLightbox(1);
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
});

// ── Navigate Lightbox ──
const navigateLightbox = (direction) => {
  currentIndex = (currentIndex + direction + visibleItems.length)
    % visibleItems.length;
  const caption = visibleItems[currentIndex]
    ?.querySelector('span')?.textContent || '';
  lightboxLabel.textContent = caption;
  lightboxCaption.textContent = caption;
};

lightboxNext?.addEventListener('click', () => navigateLightbox(1));
lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));

// ============================================
//   NOTICES - Filter
// ============================================
const noticeFilterBtns = document.querySelectorAll(
  '.notices-page .gallery-filter-btn'
);
const noticeRows = document.querySelectorAll('.notice-row');

noticeFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    noticeFilterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    noticeRows.forEach(row => {
      const cat = row.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        row.classList.remove('hidden');
        row.classList.add('fade-in');
        setTimeout(() => row.classList.remove('fade-in'), 300);
      } else {
        row.classList.add('hidden');
      }
    });
  });
});

// ============================================
//   CONTACT FORM VALIDATION
// ============================================
const contactForm = document.getElementById('contactForm');

// const showError = (id, msg) => {
//   document.getElementById(id).textContent = msg;
// };

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('ctName')?.value.trim();
  const email   = document.getElementById('ctEmail')?.value.trim();
  const subject = document.getElementById('ctSubject')?.value.trim();
  const message = document.getElementById('ctMessage')?.value.trim();

  let valid = true;

  // Clear errors
  ['ctNameError','ctEmailError','ctMessageError', 'ctSubjectError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });

  if (!name) {
    document.getElementById('ctNameError').textContent =
      'Please enter your name.';
    valid = false;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('ctEmailError').textContent =
      'Please enter a valid email.';
    valid = false;
  }

  if (!subject) {
    document.getElementById('ctSubjectError').textContent =
      'Please enter a valid subject.';
    valid = false;
  }

  if (!message) {
    document.getElementById('ctMessageError').textContent =
      'Please enter your message.';
    valid = false;
  }

  if (valid) {
    const csrftoken = getCookie('csrftoken');

    const payload = {
      name: name,
      email: email,
      subject: subject,
      message: message
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log(data)

      if (response.ok) {
        document.getElementById('ctFormSuccess').style.display = 'block';
        contactForm.reset();
        setTimeout(() => {
          document.getElementById('ctFormSuccess').style.display = 'none';
        }, 3000);
      } else {
        const errorMap = {
          name: 'ctNameError',
          email: 'ctEmailError',
          subject: 'ctSubjectError',
          message: 'ctMessageError'
        };
        Object.keys(data).forEach(field => {
          if (errorMap[field]) {
            showError(errorMap[field], data[field][0]);
          }
        });
      }

    } catch (err) {
      showError('ctNameError', 'Network error. Please check your connection.');
    }
  }
});

// ============================================
//   MULTI-STEP APPLICATION FORM
// ============================================
const appForm = document.getElementById('applicationForm');
const appSuccess = document.getElementById('appSuccess');
const stepIndicators = document.querySelectorAll('.step-indicator');
const stepConnectors = document.querySelectorAll('.step-connector');
const formSteps = document.querySelectorAll('.form-step');

let currentStep = 1;
const STORAGE_KEY = 'rml_application_draft';

// ── Restore from localStorage on load ──
const restoreFormData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const data = JSON.parse(saved);
  Object.keys(data).forEach(id => {
    const el = document.getElementById(id);
    if (el && el.type !== 'file' && el.type !== 'checkbox') {
      el.value = data[id];
    }
  });
};

// ── Save to localStorage on any input ──
const saveFormData = () => {
  const fields = [
    'appName','appFather','appMother','appDob',
    'appGender','appMobile','appEmail','appAddress',
    'appCourse','appQualification','appBoard',
    'appYear','appPercent','appCategory'
  ];

  const data = {};
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) data[id] = el.value;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Attach save listener to all inputs
document.querySelectorAll('.app-input').forEach(input => {
  input.addEventListener('input', saveFormData);
  input.addEventListener('change', saveFormData);
});

// ── Go to step ──
const goToStep = (step) => {
  formSteps.forEach(s => s.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');

  stepIndicators.forEach((ind, i) => {
    ind.classList.remove('active', 'completed');
    if (i + 1 === step) ind.classList.add('active');
    if (i + 1 < step) ind.classList.add('completed');
  });

  stepConnectors.forEach((conn, i) => {
    conn.classList.toggle('completed', i + 1 < step);
  });

  currentStep = step;

  // Scroll to form top
  document.querySelector('.application-form-wrap')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ── Step 1 Validation ──
const validateStep1 = () => {
  let valid = true;
  const errors = {
    appName:    ['appNameError',   'Please enter student name.'],
    appFather:  ['appFatherError', "Please enter father's name."],
    appMother:  ['appMotherError', "Please enter mother's name."],
    appDob:     ['appDobError',    'Please select date of birth.'],
    appGender:  ['appGenderError', 'Please select gender.'],
    appMobile:  ['appMobileError', 'Enter valid 10-digit mobile.'],
    appEmail:   ['appEmailError',  'Enter a valid email address.'],
    appAddress: ['appAddressError','Please enter your address.'],
  };

  Object.entries(errors).forEach(([id, [errId, msg]]) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(errId);
    if (!el || !errEl) return;

    let fieldValid = el.value.trim() !== '';

    if (id === 'appMobile') {
      fieldValid = /^\d{10}$/.test(el.value.trim());
    }
    if (id === 'appEmail') {
      fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(el.value.trim());
    }

    errEl.textContent = fieldValid ? '' : msg;
    if (!fieldValid) valid = false;
  });

  return valid;
};

// ── Step 2 Validation ──
const validateStep2 = () => {
  let valid = true;
  const errors = {
    appCourse:        ['appCourseError', 'Please select a course.'],
    appQualification: ['appQualError',   'Please select qualification.'],
    appBoard:         ['appBoardError',  'Please enter board/university.'],
    appYear:          ['appYearError',   'Please enter year of passing.'],
    appPercent:       ['appPercentError','Please enter percentage/CGPA.'],
  };

  Object.entries(errors).forEach(([id, [errId, msg]]) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(errId);
    if (!el || !errEl) return;

    const fieldValid = el.value.trim() !== '';
    errEl.textContent = fieldValid ? '' : msg;
    if (!fieldValid) valid = false;
  });

  return valid;
};

// ── Step 3 Validation ──
const validateStep3 = () => {
  let valid = true;

  const photo = document.getElementById('appPhoto');
  const photoErr = document.getElementById('appPhotoError');
  if (photo && photoErr) {
    if (!photo.files || photo.files.length === 0) {
      photoErr.textContent = 'Please upload your passport photo.';
      valid = false;
    } else {
      photoErr.textContent = '';
    }
  }

  const docs = document.getElementById('appDocs');
  const docsErr = document.getElementById('appDocsError');
  if (docs && docsErr) {
    if (!docs.files || docs.files.length === 0) {
      docsErr.textContent = 'Please upload your documents.';
      valid = false;
    } else {
      docsErr.textContent = '';
    }
  }

  const decl = document.getElementById('appDeclaration');
  const declErr = document.getElementById('appDeclError');
  if (decl && declErr) {
    if (!decl.checked) {
      declErr.textContent = 'Please accept the declaration.';
      valid = false;
    } else {
      declErr.textContent = '';
    }
  }

  return valid;
};

// ── Next buttons ──
document.getElementById('step1Next')
  ?.addEventListener('click', () => {
    if (validateStep1()) goToStep(2);
  });

document.getElementById('step2Next')
  ?.addEventListener('click', () => {
    if (validateStep2()) goToStep(3);
  });

// ── Prev buttons ──
document.getElementById('step2Prev')
  ?.addEventListener('click', () => goToStep(1));

document.getElementById('step3Prev')
  ?.addEventListener('click', () => goToStep(2));

// ── File upload preview ──
document.getElementById('appPhoto')
  ?.addEventListener('change', (e) => {
    const preview = document.getElementById('photoPreview');
    if (e.target.files.length > 0) {
      preview.textContent = `✓ ${e.target.files[0].name}`;
    }
  });

document.getElementById('appDocs')
  ?.addEventListener('change', (e) => {
    const preview = document.getElementById('docsPreview');
    const files = [...e.target.files];
    preview.textContent = files.map(f => `✓ ${f.name}`).join(' | ');
  });

// ── Form Submit ──
appForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validateStep3()) return;

  // Clear localStorage on success
  localStorage.removeItem(STORAGE_KEY);

  // Hide form, show success
  appForm.style.display = 'none';
  document.querySelector('.step-indicators').style.display = 'none';
  appSuccess.style.display = 'block';
});

// ── Restore data on load ──
restoreFormData();