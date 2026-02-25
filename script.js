// ========================================
// 1. КОНСТАНТЫ И НАСТРОЙКИ
// ========================================
const CONFIG = {
  headerOffset: 80,           // Отступ от фиксированной шапки
  activeSectionOffset: 200,   // Отступ для активации секции
  map: {
    center: [54.701465, 20.507020],
    zoom: 16
  }
};

// ========================================
// 2. УТИЛИТЫ ДЛЯ ВЫБОРА ЭЛЕМЕНТОВ
// ========================================
const selectElements = (selector) => document.querySelectorAll(selector);
const selectElement = (selector) => document.querySelector(selector);

// ========================================
// 3. ПЛАВНАЯ ПРОКРУТКА
// ========================================
class SmoothScroll {
  constructor(offset = CONFIG.headerOffset) {
    this.offset = offset;
    this.init();
  }

  init() {
    // Навигация в шапке + кнопки Hero
    selectElements('nav a[href^="#"], .btn[href^="#"]').forEach(this.bindScrollEvent);
  }

  bindScrollEvent = (anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetSection = selectElement(targetId);
      
      if (targetSection) {
        const offsetTop = targetSection.offsetTop - this.offset;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  }
}

// ========================================
// 4. АКТИВНАЯ НАВИГАЦИЯ ПРИ СКРОЛЛЕ
// ========================================
class ActiveNavigation {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
  }

  handleScroll() {
    const sections = selectElements('section[id], [id]');
    const navLinks = selectElements('nav a');
    let current = '';

    sections.forEach(section => {
      if (window.pageYOffset >= (section.offsetTop - CONFIG.activeSectionOffset)) {
        current = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }
}

// ========================================
// 5. КАРТА ЯНДЕКС
// ========================================
class YandexMap {
  constructor(containerId, center = CONFIG.map.center, zoom = CONFIG.map.zoom) {
    this.containerId = containerId;
    this.center = center;
    this.zoom = zoom;
    this.init();
  }

  init() {
    if (typeof ymaps === 'undefined') {
      console.warn('Yandex Maps API не загружен');
      return;
    }

    ymaps.ready(() => this.createMap());
  }

  createMap() {
    const myMap = new ymaps.Map(this.containerId, {
      center: this.center,
      zoom: this.zoom,
      controls: ['zoomControl', 'fullscreenControl']
    });

    const myPlacemark = new ymaps.Placemark(this.center, {
      hintContent: 'Колбасoff',
      balloonContent: 'г. Екатеринбург, ул. Вайнера, 24<br>Ресторан Данилы Колбасенко'
    }, {
      preset: 'islands#icon',
      iconColor: '#b84a2c'
    });

    myMap.geoObjects.add(myPlacemark);
  }
}

// ========================================
// 6. МОДАЛЬНОЕ ОКНО БРОНИРОВАНИЯ
// ========================================
class BookingModal {
  constructor() {
    this.modal = selectElement('#successModal');
    this.closeBtn = selectElement('#closeModal');
    this.form = selectElement('.booking-form');
    
    if (this.form && this.modal) {
      this.init();
    }
  }

  init() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.closeBtn.addEventListener('click', () => this.closeModal());
    
    // Закрытие по клику на overlay
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    
    if (this.validateForm()) {
      // Имитация отправки
      setTimeout(() => {
        this.showModal();
        this.form.reset();
      }, 800);
    }
  }

  validateForm() {
    const requiredFields = this.form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        isValid = false;
        setTimeout(() => field.style.borderColor = '', 2000);
      }
    });
    
    return isValid;
  }

  showModal() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ========================================
// 7. МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
// ========================================
class MobileMenu {
  constructor() {
    this.toggle = selectElement('.mobile-menu-toggle');
    this.nav = selectElement('.nav');
    
    if (this.toggle) {
      this.init();
    }
  }

  init() {
    this.toggle.addEventListener('click', () => {
      this.nav.classList.toggle('mobile-active');
      this.toggle.classList.toggle('active');
    });

    // Закрытие при клике на ссылку
    selectElements('nav a').forEach(link => {
      link.addEventListener('click', () => {
        this.nav.classList.remove('mobile-active');
        this.toggle.classList.remove('active');
      });
    });
  }
}

// ========================================
// 8. ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  // Основные модули
  new SmoothScroll();
  new ActiveNavigation();
  new YandexMap('map');
  new BookingModal();
  new MobileMenu();
  
  console.log('Колбасoff: Все модули инициализированы ✅');
});

// ========================================
// 9. ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ (для будущего)
// ========================================
const Utils = {
  // Маска телефона
  initPhoneMask: () => {
    // Inputmask({ mask: "+7 (999) 999-99-99" }).mask('input[type="tel"]');
  },
  
  // Анимация при скролле (Intersection Observer)
  initScrollAnimations: () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    });
    
    selectElements('.animate-on-scroll').forEach(el => observer.observe(el));
  }
};
