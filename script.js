// ========================================
// КОЛБАСOFF - ОПТИМИЗИРОВАННЫЙ JS
// ========================================

// Конфигурация
const CONFIG = {
  headerOffset: 80,
  activeOffset: 200,
  map: { center: [54.71044, 20.50702], zoom: 17 }
};

// Утилиты
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// ----------------------------------------
// 1. УПРАВЛЕНИЕ НАВИГАЦИЕЙ
// ----------------------------------------
class Navigation {
  constructor() {
    this.#initSmoothScroll();
    this.#initActiveTracking();
  }
  
  #initSmoothScroll() {
    $$('nav a[href^="#"], .btn[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = $(link.getAttribute('href'));
        if (target) {
          window.scrollTo({
            top: target.offsetTop - CONFIG.headerOffset,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  #initActiveTracking() {
    const updateActive = () => {
      const sections = $$('section[id]');
      const links = $$('nav a[href^="#"]');
      let current = '';
      
      sections.forEach(s => {
        if (window.pageYOffset >= s.offsetTop - CONFIG.activeOffset) {
          current = s.id;
        }
      });
      
      links.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
      });
    };
    
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }
}

// ----------------------------------------
// 2. МОБИЛЬНОЕ МЕНЮ
// ----------------------------------------
class MobileMenu {
  constructor() {
    this.toggle = $('.mobile-menu-toggle');
    this.nav = $('.nav');
    if (!this.toggle) return;
    
    this.toggle.addEventListener('click', () => {
      this.nav.classList.toggle('mobile-active');
      this.toggle.classList.toggle('active');
    });
    
    $$('nav a').forEach(link => {
      link.addEventListener('click', () => {
        this.nav.classList.remove('mobile-active');
        this.toggle.classList.remove('active');
      });
    });
  }
}

// ----------------------------------------
// 3. ФОРМА БРОНИРОВАНИЯ И МОДАЛКА
// ----------------------------------------
class BookingForm {
  constructor() {
    this.modal = $('#successModal');
    this.closeBtn = $('#closeModal');
    this.form = $('.booking-form');
    if (!this.form || !this.modal) return;
    
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.#initPhoneMask();
    this.#initValidation();
    this.form.addEventListener('submit', this.#handleSubmit.bind(this));
    this.#initModal();
  }
  
  #initPhoneMask() {
    const phone = this.form.querySelector('input[type="tel"]');
    if (!phone) return;
    
    phone.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (!val.startsWith('7')) val = '7' + val;
      val = val.slice(0, 11);
      
      e.target.value = val
        ? `+7 (${val.slice(1,4)}) ${val.slice(4,7)}-${val.slice(7,9)}-${val.slice(9,11)}`
        : '';
    });
  }
  
  #initValidation() {
    const validateField = field => {
      field.classList.remove('error');
      const val = field.value.trim();
      let error = false;
      
      if (field.name === 'name') {
        error = !val || val.length < 2 || !/^[А-ЯЁ][а-яё\s]{1,29}$/.test(val);
      } else if (field.type === 'tel') {
        const clean = val.replace(/[\s\-\+\(\)]/g, '');
        error = !val || !/^7\d{10}$/.test(clean);
      } else if (field.tagName === 'SELECT' && !field.value) {
        error = true;
      }
      
      if (error) field.classList.add('error');
      this.#updateSubmitState();
    };
    
    this.form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('input', () => validateField(field));
      field.addEventListener('blur', () => validateField(field));
    });
  }
  
  #updateSubmitState() {
    const hasErrors = this.form.querySelector('.error');
    this.submitBtn.disabled = !!hasErrors;
    this.submitBtn.style.opacity = hasErrors ? '0.6' : '1';
  }
  
  #handleSubmit(e) {
    e.preventDefault();
    if (this.form.querySelector('.error')) return;
    
    this.submitBtn.disabled = true;
    this.submitBtn.textContent = 'Отправляем...';
    
    setTimeout(() => {
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.form.reset();
      this.form.querySelectorAll('.error').forEach(f => f.classList.remove('error'));
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = 'Забронировать стол';
      this.#updateSubmitState();
    }, 1500);
  }
  
  #initModal() {
    this.closeBtn.addEventListener('click', () => this.#closeModal());
    this.modal.addEventListener('click', e => e.target === this.modal && this.#closeModal());
    document.addEventListener('keydown', e => e.key === 'Escape' && this.modal.classList.contains('active') && this.#closeModal());
  }
  
  #closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ----------------------------------------
// 4. КАРТА
// ----------------------------------------
class MapWidget {
  constructor() {
    if (!$('#map') || typeof ymaps === 'undefined') return;
    ymaps.ready(() => this.#init());
  }
  
  #init() {
    new ymaps.Map('map', {
      center: CONFIG.map.center,
      zoom: CONFIG.map.zoom,
      controls: ['zoomControl', 'fullscreenControl']
    }).geoObjects.add(new ymaps.Placemark(CONFIG.map.center, {
      hintContent: 'Колбасoff',
      balloonContent: 'г. Калининград, ул. Мореходная, 3'
    }, { preset: 'islands#icon', iconColor: '#b84a2c' }));
  }
}

// ----------------------------------------
// 5. ИНИЦИАЛИЗАЦИЯ
// ----------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
  new MobileMenu();
  new BookingForm();
  new MapWidget();
  
  // Активация первой секции для index.html
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    setTimeout(() => $('nav a[href="#about"]')?.classList.add('active'), 100);
  }
  
  console.log('✅ Колбасoff: Все модули загружены');
});
