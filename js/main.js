console.log("PAGE LOADED");
const API_BASE = 'http://127.0.0.1:8000/api';

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

function observeRevealElements() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    revealObserver.observe(el);
  });
}

observeRevealElements();

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
//   NOTICES HOME - Get Latest from server
// ============================================
async function renderNoticeCarousel() {
    const container = document.getElementById('newsSlides');

  const skeletonHTML = `
    <div class="news-slide active">
      <div class="news-slide-text">
        <span class="news-tag">
        <div class="skeleton-box" style="width: 100px; height: 36px; border-radius: 20px;"></div>
        </span>
        <h3 class="news-slide-title">
          <div class="skeleton-box" style="height: 18px; width: 90%;"></div>
        </h3>
        <p class="news-slide-excerpt">
        <div class="skeleton-box" style="height: 14px; width: 60%; margin-bottom: 8px;"></div>
        <div class="skeleton-box" style="height: 14px; width: 50%; margin-bottom: 5rem;"></div>
        </p>
        <div class="skeleton-box" style="width: 120px; height: 36px; border-radius: var(--radius-md);"></div>
      </div>
      <div class="news-slide-image">
        <div class="skeleton-box" style="width: 360px; height: 360px; border-radius: var(--radius-md);"></div>
      </div>
    </div>
  `;

  container.innerHTML = skeletonHTML;

  try {
    const response = await fetch(`${API_BASE}/notices/latest`);
    const result = await response.json();
    const notices = result.data;

    container.innerHTML = "";

    notices.forEach((notice, index) => {
      const noticeCard = document.createElement("div");
      noticeCard.className = `news-slide ${index === 0 ? 'active' : ''}`.trim();

      noticeCard.innerHTML = `
        <div class="news-slide-text">
          <span class="news-tag ${notice.category}">${notice.category}</span>
          <p class="news-date">📅 ${new Date(notice.modified_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}</p>
          <h3 class="news-slide-title">
          ${notice.title}
          </h3>
          <p class="news-slide-excerpt">
          ${notice.description}
          </p>
          <a href="notices.html" class="btn btn-primary">Read More</a>
        </div>
        <div class="news-slide-image">
          <img src="images/news-1.jpg" alt="${notice.title}" />
        </div>
      `;

      container.appendChild(noticeCard);
    });

    observeRevealElements();

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
  } catch (error) {
    console.error("Error loading notices:", error);
  }
}

if (document.getElementById('newsSlides')) {
  document.addEventListener('DOMContentLoaded', renderNoticeCarousel);
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
      const response = await fetch(`${API_BASE}/enquiry/`, {
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

function initGalleryFilters() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const galleryItems = document.querySelectorAll('.gallery-item');

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
    });
  });
}

// ── Lightbox (runs after gallery is rendered) ──
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxLabel = document.getElementById('lightboxLabel');
  const lightboxCaption = document.getElementById('lightboxCaption');

  let currentIndex = 0;
  let visibleItems = [];

  const updateVisibleItems = () => {
    visibleItems = [...galleryItems].filter(
      item => !item.classList.contains('hidden')
    );
  };

  updateVisibleItems();

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      currentIndex = visibleItems.indexOf(item);
      showLightbox();
    });
  });

  const showLightbox = () => {
    const item = visibleItems[currentIndex];
    const caption = item?.querySelector('span')?.textContent || '';
    const imgSrc = item?.querySelector('img')?.src || '';

    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxPlaceholder = document.getElementById('lightboxPlaceholder');

    lightboxImg.src = imgSrc;
    lightboxLabel.textContent = caption;
    lightboxCaption.textContent = caption;
    
    // Show image if src exists, otherwise show placeholder
    if (imgSrc) {
      lightboxImg.style.display = 'block';
      lightboxPlaceholder.style.display = 'none';
    } else {
      lightboxImg.style.display = 'none';
      lightboxPlaceholder.style.display = 'flex';
    }


    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  const navigateLightbox = (direction) => {
    currentIndex = (currentIndex + direction + visibleItems.length)
      % visibleItems.length;
    const caption = visibleItems[currentIndex]
      ?.querySelector('span')?.textContent || '';
    lightboxLabel.textContent = caption;
    lightboxCaption.textContent = caption;

    const imgSrc = visibleItems[currentIndex]?.querySelector('img')?.src || '';
    document.getElementById('lightboxImg').src = imgSrc;
  };

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxNext?.addEventListener('click', () => navigateLightbox(1));
  lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
  });
}

// ============================================
//   GALLERY - Get from Server
// ============================================

async function renderGallery() {
  const container = document.getElementById('galleryGrid');

  const skeletonHTML = `
    <div class="gallery-item">
      <div class="skeleton-box" style="height: 200px"></div>
    </div>
    <div class="gallery-item">
      <div class="skeleton-box" style="height: 200px"></div>
    </div>
    <div class="gallery-item tall">
      <div class="skeleton-box" style="height: 320px"></div>
    </div>
    <div class="gallery-item wide">
      <div class="skeleton-box" style="height: 200px"></div>
    </div>
    <div class="gallery-item">
      <div class="skeleton-box" style="height: 200px"></div>
    </div>
    <div class="gallery-item">
      <div class="skeleton-box" style="height: 200px"></div>
    </div>
  `;

  container.innerHTML = skeletonHTML;

  try {
    const response = await fetch(`${API_BASE}/gallery`);
    const result = await response.json();
    const gallery = result.data;

    const layouts = ['', '', 'tall', 'wide', ''];

    container.innerHTML = "";

    gallery.forEach((item, index) => {
      const layout = layouts[index % layouts.length];
      const galleryCard = document.createElement("div");

      galleryCard.className = `gallery-item ${layout} reveal`.trim();
      galleryCard.dataset.category = item.category;
      galleryCard.dataset.index = index


      galleryCard.innerHTML = `
        <div class="gallery-placeholder">
          <img src="${item.image_url}"/>
          <span>${item.title}</span>
        </div>
      `;

      container.appendChild(galleryCard);
    });

    observeRevealElements();
    initLightbox();
  } catch (error) {
    console.error("Error loading gallery:", error);
  }
}

if (document.getElementById('galleryGrid')) {
  document.addEventListener('DOMContentLoaded', () => {
    initGalleryFilters();
    renderGallery();
  });
}

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

    const noticeRows = document.querySelectorAll('.notice-row');

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
//   NOTICES - Get from Server
// ============================================
async function renderNotices() {
  const container = document.getElementById('noticesList');

  const skeletonHTML = `
    <div class="notice-row">
      <div class="notice-left" style="flex: 1; display: flex; gap: 1rem; align-items: center;">
        <div class="skeleton-box" style="width: 60px; height: 24px; border-radius: 20px;"></div>
        <div style="flex: 1;">
          <div class="skeleton-box" style="height: 16px; width: 70%; margin-bottom: 8px;"></div>
          <div class="skeleton-box" style="height: 14px; width: 40%;"></div>
        </div>
      </div>
      <div class="skeleton-box" style="width: 120px; height: 36px; border-radius: var(--radius-md);"></div>
    </div>
    <div class="notice-row">
      <div class="notice-left" style="flex: 1; display: flex; gap: 1rem; align-items: center;">
        <div class="skeleton-box" style="width: 60px; height: 24px; border-radius: 20px;"></div>
        <div style="flex: 1;">
          <div class="skeleton-box" style="height: 16px; width: 70%; margin-bottom: 8px;"></div>
          <div class="skeleton-box" style="height: 14px; width: 40%;"></div>
        </div>
      </div>
      <div class="skeleton-box" style="width: 120px; height: 36px; border-radius: var(--radius-md);"></div>
    </div>
    <div class="notice-row">
      <div class="notice-left" style="flex: 1; display: flex; gap: 1rem; align-items: center;">
        <div class="skeleton-box" style="width: 60px; height: 24px; border-radius: 20px;"></div>
        <div style="flex: 1;">
          <div class="skeleton-box" style="height: 16px; width: 70%; margin-bottom: 8px;"></div>
          <div class="skeleton-box" style="height: 14px; width: 40%;"></div>
        </div>
      </div>
      <div class="skeleton-box" style="width: 120px; height: 36px; border-radius: var(--radius-md);"></div>
    </div>
  `;

  container.innerHTML = skeletonHTML;
  try {
    const response = await fetch(`${API_BASE}/notices`);
    const result = await response.json();
    const notices = result.data;

    container.innerHTML = "";

    notices.forEach((notice) => {
      const noticeCard = document.createElement("div");
      noticeCard.className = "notice-row reveal";
      noticeCard.dataset.category = notice.category;

      noticeCard.innerHTML = `
        <div class="notice-left">
            <span class="notice-tag ${notice.category}">${notice.category}</span>
            <div class="notice-info">
              <h3 class="notice-title">
                ${notice.title}
              </h3>
              <p class="notice-desc">
                ${notice.description}
              </p>
              <span class="notice-date">
                📅 ${new Date(notice.modified_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          </div>
          ${notice.pdf_url 
            ? `<a href="${notice.pdf_url}" class="notice- ">
                <span class="download-icon">⬇</span>Download PDF
              </a>` 
            : ''
          }
      `;

      container.appendChild(noticeCard);
    });

    observeRevealElements();
  } catch (error) {
    console.error("Error loading notices:", error);
  }
}

if (document.getElementById('noticesList')) {
  document.addEventListener('DOMContentLoaded', renderNotices);
}
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
      const response = await fetch(`${API_BASE}/contact/`, {
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
//   DOWNLOADS - Get from Server
// ============================================
async function renderDownloads() {
  const container = document.getElementById('downloadsTableBody');

  const skeletonHTML = `
    <tr>
      <td class="col-sno">
        <div class="skeleton-box" style="width: 24px; height: 35px; border-radius: 20px;"></div>
      </td>
      <td class="col-name">
        <div class="doc-name-wrap">
          <div class="skeleton-box" style="width: 44px; height: 44px; border-radius: 4px; flex-shrink: 0;"></div>
          <div style="flex: 1;">
            <div class="skeleton-box" style="height: 16px; width: 70%; margin-bottom: 6px;"></div>
            <div class="skeleton-box" style="height: 13px; width: 45%;"></div>
          </div>
        </div>
      </td>
      <td class="col-size">
      <div class="skeleton-box" style="height: 16px; border-radius: 20px; font-size: 0.82rem;"></div>
      </td>
      <td class="col-download">
      <div class="skeleton-box" style="height: 16px; border-radius: 20px; font-size: 0.82rem;"></div>
      </td>
    </tr>
    <tr>
      <td class="col-sno">
        <div class="skeleton-box" style="width: 24px; height: 35px; border-radius: 20px;"></div>
      </td>
      <td class="col-name">
        <div class="doc-name-wrap">
          <div class="skeleton-box" style="width: 44px; height: 44px; border-radius: 4px; flex-shrink: 0;"></div>
          <div style="flex: 1;">
            <div class="skeleton-box" style="height: 16px; width: 70%; margin-bottom: 6px;"></div>
            <div class="skeleton-box" style="height: 13px; width: 45%;"></div>
          </div>
        </div>
      </td>
      <td class="col-size">
      <div class="skeleton-box" style="height: 16px; border-radius: 20px; font-size: 0.82rem;"></div>
      </td>
      <td class="col-download">
      <div class="skeleton-box" style="height: 16px; border-radius: 20px; font-size: 0.82rem;"></div>
      </td>
    </tr>
    <tr>
      <td class="col-sno">
        <div class="skeleton-box" style="width: 24px; height: 35px; border-radius: 20px;"></div>
      </td>
      <td class="col-name">
        <div class="doc-name-wrap">
          <div class="skeleton-box" style="width: 44px; height: 44px; border-radius: 4px; flex-shrink: 0;"></div>
          <div style="flex: 1;">
            <div class="skeleton-box" style="height: 16px; width: 70%; margin-bottom: 6px;"></div>
            <div class="skeleton-box" style="height: 13px; width: 45%;"></div>
          </div>
        </div>
      </td>
      <td class="col-size">
      <div class="skeleton-box" style="height: 16px; border-radius: 20px; font-size: 0.82rem;"></div>
      </td>
      <td class="col-download">
      <div class="skeleton-box" style="height: 16px; border-radius: 20px; font-size: 0.82rem;"></div>
      </td>
    </tr>
  `;

  container.innerHTML = skeletonHTML;
  try {
    const response = await fetch(`${API_BASE}/downloads`);
    const result = await response.json();
    const downloads = result.data;

    container.innerHTML = "";

    downloads.forEach((item, index) => {
      const downloadCard = document.createElement("tr");

      downloadCard.innerHTML = `
        <td class="col-sno">${index+1}</td>
        <td class="col-name">
        <div class="doc-name-wrap">
            <div class="doc-icon-sm">
            <svg viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 
                0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            </div>
            <div>
            <p class="doc-title">${item.title}</p>
            <p class="doc-subtitle">
              ${item.description}
            </p>
            </div>
        </div>
        </td>
        <td class="col-size">
        <span class="size-tag">PDF • ${item.file_size}</span>
        </td>
        <td class="col-download">
        <a href="${item.file_url}" class="download-btn">
            <svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5"
            width="16" height="16">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 
            0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
        </a>
        </td>
      `;

      container.appendChild(downloadCard);
    });

  } catch (error) {
    console.error("Error loading notices:", error);
  }
}

if (document.getElementById('downloadsTableBody')) {
  document.addEventListener('DOMContentLoaded', renderDownloads);
}

// ============================================
//   MULTI-STEP APPLICATION FORM
// ============================================
const appForm = document.getElementById('applicationForm');
const appSuccess = document.getElementById('appSuccess');
const stepIndicators = document.querySelectorAll('.step-indicator');
const stepConnectors = document.querySelectorAll('.step-connector');
const formSteps = document.querySelectorAll('.form-step');

let currentStep = 1;
if (
  sessionStorage.getItem('applicationSubmitted') === 'true' &&
  appForm &&
  appSuccess &&
  document.querySelector('.step-indicators')
) {
  appForm.style.display = 'none';
  document.querySelector('.step-indicators').style.display = 'none';
  appSuccess.style.display = 'block';
}
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

  const photo = document.getElementById('appPassportPhoto');
  const photoErr = document.getElementById('appPhotoError');

  if (!photo || !photoErr) return false;

  if (!photo.files || photo.files.length === 0) {
    photoErr.textContent = 'Please upload your passport photo.';
    valid = false;
  } else {
    photoErr.textContent = '';
  }

  const mark10 = document.getElementById('appMarksheet10');
  const mark10Err = document.getElementById('appMarksheet10Error');
  if (!mark10.files || mark10.files.length === 0) {
    mark10Err.textContent = 'Please upload your 10th marksheet.';
    valid = false;
  } else {
    mark10Err.textContent = '';
  }

  const mark12 = document.getElementById('appMarksheet12');
  const mark12Err = document.getElementById('appMarksheet12Error');
  if (!mark12.files || mark12.files.length === 0) {
    mark12Err.textContent = 'Please upload your 12th marksheet.';
    valid = false;
  } else {
    mark12Err.textContent = '';
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

// ── Step 4 — OTP Validation ──
const validateStep4 = () => {
  const otp = String(document.getElementById('otpInput')?.value.trim());
  const otpErr = document.getElementById('otpError');

  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    if (otpErr) otpErr.textContent = 'Please enter a valid 6-digit OTP.';
    return false;
  }
  if (otpErr) otpErr.textContent = '';
  return true;
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

async function applyApplication() {
    // 1. Build FormData
    const formData = new FormData();

    // 2. Append text fields
    formData.append('student_name', document.getElementById('appName').value.trim());
    formData.append('father_name', document.getElementById('appFather').value.trim());
    formData.append('mother_name', document.getElementById('appMother').value.trim());
    formData.append('date_of_birth', document.getElementById('appDob').value);
    formData.append('gender', document.getElementById('appGender').value);
    formData.append('phone', document.getElementById('appMobile').value.trim());
    formData.append('email', document.getElementById('appEmail').value.trim());
    formData.append('address', document.getElementById('appAddress').value.trim());
    formData.append('course', document.getElementById('appCourse').value);
    formData.append('educational_qualification', document.getElementById('appQualification').value);
    formData.append('institution', document.getElementById('appBoard').value.trim());
    formData.append('year_passing', document.getElementById('appYear').value);
    formData.append('percentage', document.getElementById('appPercent').value.replace('%', ''));
    formData.append('caste', document.getElementById('appCategory').value);

    // 3. Append files
    formData.append('passport_photo', document.getElementById('appPassportPhoto').files[0]);
    formData.append('marksheet_10', document.getElementById('appMarksheet10').files[0]);
    formData.append('marksheet_12', document.getElementById('appMarksheet12').files[0]);

    // --- Helper: Clear previous form errors before new submission ---
    const clearFormErrors = () => {
        const errorIds = [
            'appNameError', 'appFatherError', 'appMotherError', 'appDobError',
            'appGenderError', 'appMobileError', 'appEmailError', 'appAddressError',
            'appCourseError', 'appQualError', 'appBoardError', 'appYearError',
            'appPercentError', 'appPhotoError', 'appMarksheet10Error', 'appMarksheet12Error',
            'appDeclError' 
        ];
        errorIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '';
        });
    };

    // 4. Call POST /api/apply/
    try {
      clearFormErrors();
      const csrftoken = getCookie('csrftoken');

      const response = await fetch(`${API_BASE}/apply/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': csrftoken },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        startOtpCountdown();
        goToStep(4);
        return true;
      } else {
        const errorMap = {
            student_name: 'appNameError',
            father_name: 'appFatherError',
            mother_name: 'appMotherError',
            date_of_birth: 'appDobError',
            gender: 'appGenderError',
            phone: 'appMobileError',
            email: 'appEmailError',
            address: 'appAddressError',
            course: 'appCourseError',
            educational_qualification: 'appQualError',
            institution: 'appBoardError',
            year_passing: 'appYearError',
            percentage: 'appPercentError',
            passport_photo: 'appPhotoError',
            marksheet_10: 'appMarksheet10Error',
            marksheet_12: 'appMarksheet12Error',
            non_field_errors: 'appDeclError', // Catches DRF root level validate() errors
            error: 'appDeclError' // Catches custom dictionary errors from views.py
        };

        let hasSpecificError = false;

        // Iterate over the DRF error dictionary and populate the correct spans
        Object.keys(data).forEach(field => {
            const errorElementId = errorMap[field];
            if (errorElementId) {
                const errorElement = document.getElementById(errorElementId);
                if (errorElement) {
                    // DRF returns arrays [0], custom views might return strings
                    const errorMsg = Array.isArray(data[field]) ? data[field][0] : data[field];
                    errorElement.textContent = errorMsg;
                    hasSpecificError = true;
                }
            }
        });

        // Fallback if the backend returns an error format we didn't explicitly map
        if (!hasSpecificError) {
            document.getElementById('appDeclError').textContent = 'Please check the form for invalid entries.';
        }
        return false;
      }

    } catch (err) {
      console.error(err);
      document.getElementById('appDeclError').textContent =
      'Network error. Please check your connection.';
      return false;
    }
}
document.getElementById('step3Next')
  ?.addEventListener('click', async () => {
    if (!validateStep3()) return;
    
    const btn = document.getElementById('step3Next');

    btn.disabled = true;
    btn.textContent = 'Sending OTP...';
    
    const success = await applyApplication();
    
    // If it failed, reset the button so they can fix errors and try again
    if (!success) {
      btn.disabled = false;
      btn.textContent = 'Next Step →';
    }
  });

async function verifyAndSubmit() {
  const csrftoken = getCookie('csrftoken');
  const email = document.getElementById('appEmail').value.trim();
  const otp = document.getElementById('otpInput').value.trim();
  const otpError = document.getElementById('otpError');

  if (!validateStep4()) return;

  try {
    // Step 1 — Verify OTP
    const verifyResponse = await fetch(`${API_BASE}/verify-otp/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({ email, otp })
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      otpError.textContent = verifyData.error || 'Invalid OTP. Please try again.';
      return;
    }

    // Step 2 — Submit application
    const submitData = new FormData();
    submitData.append('email', email);
    submitData.append('passport_photo', document.getElementById('appPassportPhoto').files[0]);
    submitData.append('marksheet_10', document.getElementById('appMarksheet10').files[0]);
    submitData.append('marksheet_12', document.getElementById('appMarksheet12').files[0]);

    const submitResponse = await fetch(`${API_BASE}/submit/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRFToken': csrftoken },
      body: submitData
    });

    const submitResult = await submitResponse.json();

    if (!submitResponse.ok) {
      otpError.textContent = submitResult.error || 'Submission failed. Please try again.';
      return;
    }

    // Success
    localStorage.removeItem(STORAGE_KEY);

    sessionStorage.setItem('applicationSubmitted', 'true');

    appForm.style.display = 'none';
    document.querySelector('.step-indicators').style.display = 'none';
    appSuccess.style.display = 'block';

  } catch (err) {
    console.error('Error:', err);
    otpError.textContent = 'Network error. Please check your connection.';
  }
}

// ── Prev buttons ──
document.getElementById('step2Prev')
  ?.addEventListener('click', () => goToStep(1));

document.getElementById('step3Prev')
  ?.addEventListener('click', () => goToStep(2));

document.getElementById('step4Prev')
  ?.addEventListener('click', () => goToStep(3));


// ── OTP Countdown Timer ──
let countdownTimer = null;

const startOtpCountdown = () => {
  const resendBtn = document.getElementById('resendOtpBtn');
  const countdownEl = document.getElementById('otpCountdown');
  const secondsEl = document.getElementById('countdownSeconds');

  let seconds = 30;

  // Reset state
  if (resendBtn) resendBtn.disabled = true;
  if (countdownEl) countdownEl.style.display = 'block';
  if (secondsEl) secondsEl.textContent = seconds;

  // Clear existing timer
  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    seconds--;
    if (secondsEl) secondsEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(countdownTimer);
      if (resendBtn) resendBtn.disabled = false;
      if (countdownEl) countdownEl.style.display = 'none';
    }
  }, 1000);
};

async function resendOtp() {
  const csrftoken = getCookie('csrftoken');
  const student_name = document.getElementById('appName').value.trim();
  const email = document.getElementById('appEmail').value.trim();
  const otpError = document.getElementById('otpError');

  try {
    const retryResponse = await fetch(`${API_BASE}/resend-otp/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type':'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({email, student_name})
    });

    const retryData = await retryResponse.json();
    if (!retryResponse.ok) {
      otpError.textContent = retryData.error || 'Invalid OTP. Please try again.';
      return false;
    }

    if (retryResponse.ok) {
      startOtpCountdown();
    }
  } catch (err) {
      console.log(err);
      otpError.textContent = 'Network error. Please try again.';
  }
}

// ── Resend OTP button ──
document.getElementById('resendOtpBtn')
  ?.addEventListener('click', async () => {
    await resendOtp();
  });

// ── File upload preview ──
document.getElementById('appPassportPhoto')
  ?.addEventListener('change', (e) => {
    document.getElementById('photoPreview').textContent = 
      e.target.files.length > 0 ? `✓ ${e.target.files[0].name}` : '';
  });

document.getElementById('appMarksheet10')
  ?.addEventListener('change', (e) => {
    document.getElementById('marksheet10Preview').textContent = 
      e.target.files.length > 0 ? `✓ ${e.target.files[0].name}` : '';
  });

document.getElementById('appMarksheet12')
  ?.addEventListener('change', (e) => {
    document.getElementById('marksheet12Preview').textContent = 
      e.target.files.length > 0 ? `✓ ${e.target.files[0].name}` : '';
  });

// ── Form Submit ──
document.getElementById('appSubmit')
  ?.addEventListener('click', async () => {
    await verifyAndSubmit();
  });

document.getElementById('applyAnotherBtn')?.addEventListener('click', () => {
  // 1. Clear the success state
  sessionStorage.removeItem('applicationSubmitted');
  
  // 2. Clear the form draft data just to be safe
  localStorage.removeItem(STORAGE_KEY);
  
  // 3. Reset the UI back to Step 1
  appSuccess.style.display = 'none';
  appForm.style.display = 'block';
  document.querySelector('.step-indicators').style.display = 'flex';
  appForm.reset();
  goToStep(1);
});

// ── Restore data on load ──
restoreFormData();

// ============================================
//   APPLICATION STATUS CHECK
// ============================================
const checkStatusBtn = document.getElementById('checkStatusBtn');
const statusFormCard = document.getElementById('statusFormCard');
const statusResult = document.getElementById('statusResult');
const checkAnotherBtn = document.getElementById('checkAnotherBtn');

const showStatusResult = (data) => {
  // Hide form, show result
  statusFormCard.style.display = 'none';
  statusResult.style.display = 'block';

  // Hide all status sections first
  document.querySelectorAll('.status-result')
    .forEach(el => el.classList.remove('show'));

  // Show correct status section
  const statusMap = { P: 'Pending', A: 'Accepted', R: 'Rejected' };
  const statusKey = Object.keys(statusMap).find(
    k => statusMap[k] === data.status
  );

  const resultId = {
    P: 'resultPending',
    A: 'resultAccepted',
    R: 'resultRejected'
  }[statusKey];

  const resultEl = document.getElementById(resultId);
  if (resultEl) {
    resultEl.classList.add('show');
    resultEl.querySelector('.status-result-message')
      .textContent = data.status_message;
  }

  // Fill details table
  document.getElementById('resultAppId').textContent =
    data.application_id;
  document.getElementById('resultName').textContent =
    data.student_name;
  document.getElementById('resultCourse').textContent =
    data.course;
  document.getElementById('resultSubmitted').textContent =
    data.submitted_on;
  document.getElementById('resultUpdated').textContent =
    data.last_updated;
};

checkStatusBtn?.addEventListener('click', async () => {
  const appId = document.getElementById('statusAppId')?.value.trim();
  const email = document.getElementById('statusEmail')?.value.trim();
  const appIdErr = document.getElementById('statusAppIdError');
  const emailErr = document.getElementById('statusEmailError');

  // Clear errors
  if (appIdErr) appIdErr.textContent = '';
  if (emailErr) emailErr.textContent = '';

  // Validate
  let valid = true;
  if (!appId) {
    appIdErr.textContent = 'Please enter your Application ID.';
    valid = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailErr.textContent = 'Please enter a valid email address.';
    valid = false;
  }
  if (!valid) return;

  // Show loading state
  checkStatusBtn.textContent = 'Checking...';
  checkStatusBtn.disabled = true;

  try {
    console.log("asd");

    const response = await fetch(
      `${API_BASE}/application-status/?id=${appId}&email=${encodeURIComponent(email)}`,
      { credentials: 'include' }
    );
    console.log(response);


    const data = await response.json();

    if (!response.ok) {
      appIdErr.textContent = data.error ||
        'No application found with these details.';
      return;
    }

    showStatusResult(data);

  } catch (err) {
    console.error(err);
    appIdErr.textContent = 'Network error. Please try again.';
  } finally {
    checkStatusBtn.textContent = 'Check Status';
    checkStatusBtn.disabled = false;
  }
});

// Reset — check another application
checkAnotherBtn?.addEventListener('click', () => {
  statusResult.style.display = 'none';
  statusFormCard.style.display = 'block';
  document.getElementById('statusAppId').value = '';
  document.getElementById('statusEmail').value = '';
});