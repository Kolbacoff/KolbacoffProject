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
    this.form = document.querySelector('.booking-form');
    if (!this.form) return;
    
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    
    this.form.onsubmit = (e) => {
      e.preventDefault();
      this.#checkForm();
    };
    
    this.#initPhoneMask();
    this.#initValidation();
    this.#setDateLimits();

// 🔥 СОХРАНИМ ССЫЛКУ НА ЭКЗЕМПЛЯР
  window.bookingFormInstance = this;
    
    // 🔥 ПРОВЕРЯЕМ СОСТОЯНИЕ ФОРМЫ ПРИ ЗАГРУЗКЕ
    this.#updateButton();
  }
  
  #setDateLimits() {
    const dateInput = document.getElementById('date');
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    
    const maxDate = new Date(today.getTime() + (183 * 24 * 60 * 60 * 1000));
    const maxDateStr = maxDate.toISOString().split('T')[0];
    
    dateInput.min = minDate;
    dateInput.max = maxDateStr;
  }
  
  #initPhoneMask() {
    const phone = document.getElementById('phone');
    phone.oninput = (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (!val.startsWith('7')) val = '7' + val;
      val = val.slice(0, 11);
      
      e.target.value = val ? `+7 (${val.slice(1,4)}) ${val.slice(4,7)}-${val.slice(7,9)}-${val.slice(9,11)}` : '';
      this.#validate(phone);
    };
  }
  
  #initValidation() {
  const fields = this.form.querySelectorAll('[required]');
  fields.forEach(field => {
    field.oninput = () => this.#validate(field);
    field.onblur = () => this.#validate(field);
  });

  // 🔥 ИМЯ — автокапитализация + ТОЛЬКО РУССКИЕ БУКВЫ
const nameField = document.getElementById('name');
if (nameField) {
  nameField.oninput = () => {
    // ✅ Запрещаем английские буквы
    this.#filterRussianOnly(nameField);
    // ✅ Капитализируем
    this.#capitalizeName(nameField);
    // ✅ Валидируем
    this.#validate(nameField);
  };
  nameField.onblur = () => {
    this.#capitalizeName(nameField);
    this.#validate(nameField);
  };
}

  // 🔥 ДОПОЛНИТЕЛЬНО — автокапитализация  
  const notesField = document.getElementById('notes');
  if (notesField) {
    notesField.oninput = () => {
      this.#capitalizeNotes(notesField);
    };
    notesField.onblur = () => {
      this.#capitalizeNotes(notesField);
    };
  }
}

  #capitalizeName(field) {
    let val = field.value.trim();
    if (val) {
      val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
      field.value = val;
    }
  }

// 🔥 ФИЛЬТР: ТОЛЬКО РУССКИЕ БУКВЫ + цифры + пробелы
#filterRussianOnly(field) {
  let val = field.value;
  // Разрешаем: русские буквы (а-яА-Я), пробелы, дефисы, апострофы
  const russianPattern = /[^а-яА-ЯёЁ\s\-']/g;
  val = val.replace(russianPattern, ''); // Удаляем всё остальное
  field.value = val;
}

// 🔥 АВТОЗАГЛАВНАЯ БУКВА ДЛЯ ПОЛЯ "ДОПОЛНИТЕЛЬНО"
#capitalizeNotes(field) {
  let val = field.value;
  if (val.length > 0) {
    val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    field.value = val;
  }
}
  
  // 🔥 ОСНОВНАЯ ВАЛИДАЦИЯ — проверяет ВСЕ правила
  #isFieldValid(field) {
    const val = field.value.trim();
    
    if (field.id === 'name') {
  // ✅ Проверка: ≥2 символа + заглавная + ТОЛЬКО русские
  const russianPattern = /^[а-яА-ЯёЁ\s\-']+$/;
  return val.length >= 2 && 
         val[0] === val[0].toUpperCase() && 
         russianPattern.test(val);
}

    
    if (field.id === 'phone') {
      const clean = val.replace(/[\s\-\+\(\)]/g, '');
      return clean.length === 11 && (clean.startsWith('7') || clean.startsWith('8'));
    }
    
    if (field.tagName === 'SELECT') {
      return field.value !== '';
    }
    
    if (field.id === 'date') {
      const selectedDate = new Date(field.value + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }
    
    return !!val;
  }
  
  // 🔥 ГЛОБАЛЬНАЯ ПРОВЕРКА (время + лимит 6 месяцев)
  #isFormGloballyValid() {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    
    if (!date || !time) return false;
    
    const bookingDateTime = new Date(`${date}T${time}:00`);
    
    // Минимум +2 часа
    const nowPlusTwoHour = new Date();
    nowPlusTwoHour.setMinutes(nowPlusTwoHour.getMinutes() + 120);
    
    // Максимум +6 месяцев
    const maxBookingDate = new Date();
    maxBookingDate.setMonth(maxBookingDate.getMonth() + 6);
    
    return bookingDateTime >= nowPlusTwoHour && bookingDateTime <= maxBookingDate;
  }
  
  #validate(field) {
    const isValid = this.#isFieldValid(field);
    field.classList.toggle('error', !isValid);
    
    // 🔥 ОБНОВЛЯЕМ КНОПКУ ПРИ КАЖДОМ ИЗМЕНЕНИИ
    this.#updateButton();
  }
  
  // 🔥 ГЛАВНЫЙ МЕТОД — проверяет ВСЁ
  #updateButton() {
    const fields = this.form.querySelectorAll('[required]');
    
    // 1. Проверяем все поля
    const allFieldsValid = Array.from(fields).every(field => this.#isFieldValid(field));
    
    // 2. Проверяем глобальные ограничения даты/времени
    const globalValid = this.#isFormGloballyValid();
    
    // 3. Кнопка активна ТОЛЬКО если ВСЁ ✓
    const isFullyValid = allFieldsValid && globalValid;
    
    this.submitBtn.disabled = !isFullyValid;
    this.submitBtn.style.opacity = isFullyValid ? '1' : '0.6';
    this.submitBtn.style.cursor = isFullyValid ? 'pointer' : 'not-allowed';
    
    // 🔥 ВИЗУАЛЬНАЯ ОБРАТНАЯ СВЯЗЬ
    if (!isFullyValid) {
      this.submitBtn.textContent = 'Заполните все поля';
    } else {
      this.submitBtn.textContent = 'Забронировать стол';
    }
  }
  
  #checkForm() {
    // Финальная проверка (дублирует #updateButton)
    if (!this.#isFormFullyValid()) {
      alert('Проверьте правильность заполнения формы');
      return;
    }
    
    this.#showModal();
  }
  
  #isFormFullyValid() {
    const fields = this.form.querySelectorAll('[required]');
    const allFieldsValid = Array.from(fields).every(field => this.#isFieldValid(field));
    return allFieldsValid && this.#isFormGloballyValid();
  }
  
  #showModal() {
    document.getElementById('dataName').textContent = document.getElementById('name').value;
  document.getElementById('dataPhone').textContent = document.getElementById('phone').value;
  document.getElementById('dataGuests').textContent = document.getElementById('guests').value;
  
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  document.getElementById('dataDateTime').textContent = 
    `${new Date(date).toLocaleDateString('ru-RU')} ${time}`;
  
  document.getElementById('confirmModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  }
}

// Глобальные обработчики модалки
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cancelBtn').onclick = () => {
    document.getElementById('confirmModal').classList.remove('active');
  };
  
  document.getElementById('okBtn').onclick = () => {
    document.getElementById('confirmModal').classList.remove('active');
    alert('✅ Стол забронирован! Ждем вас в Колбасoff!');
    document.querySelector('.booking-form').reset();
  };
});

// ПРОСТЫЕ ОБРАБОТЧИКИ МОДАЛКИ
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.booking-form');
  const modal = document.getElementById('confirmModal');
  
  if (!form || !modal) return;
  
  // Блокируем отправку формы
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Проверяем ошибки
    const hasError = form.querySelector('.error');
    if (hasError) return;
    
    showConfirmModal();
  });
  
  function showConfirmModal() {
    // Заполняем данные
    document.getElementById('dataName').textContent = document.getElementById('name').value || '—';
    document.getElementById('dataPhone').textContent = document.getElementById('phone').value || '—';
    document.getElementById('dataGuests').textContent = document.getElementById('guests').value || '—';
    
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    document.getElementById('dataDateTime').textContent = 
      date ? `${new Date(date).toLocaleDateString('ru-RU')} ${time}` : 'Не выбрано';
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Кнопки модалки
  document.getElementById('backBtn').onclick = closeModal;
  document.getElementById('confirmBtn').onclick = confirmBooking;
  document.querySelector('.popup-close').onclick = closeModal;
  
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  function confirmBooking() {
    closeModal();
    
    // Имитация отправки
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Отправляем...';
    btn.disabled = true;
    
    setTimeout(() => {
      alert('Стол успешно забронирован!\nЖдем вас в Колбасoff!');
      window.location.reload();
    }, 500);
  }
  
  // Закрытие по Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
});


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

