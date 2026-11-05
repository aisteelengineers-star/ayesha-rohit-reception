/**
 * Rohit & Ayesha Wedding Invitation
 * Pure Vanilla HTML5 / CSS3 / ES6 JavaScript
 */

(function () {
  'use strict';

  // --- Target Event Date (21 November 2026, 5:00 PM IST) ---
  const TARGET_DATE = new Date('2026-11-21T17:00:00+05:30');

  // --- Events Data ---
  const EVENTS_DATA = [
    {
      chapter: 'The Wedding Reception',
      code: '2',
      date: 'Monday, 23 November 2026',
      items: [
        {
          time: '7:00 PM onwards',
          subtime: 'Followed by<br>Cocktails &amp; Dinner',
          hall: 'Margosa Lawn,',
          venue: 'India Habitat Centre, New Delhi',
          location: 'Lodhi Road, Near Air Force Bal Bharati School, New Delhi',
          map: 'https://maps.google.com/?q=India+Habitat+Centre+Lodhi+Road+New+Delhi',
          artwork: 'assets/royal-crimson-hero.jpg'
        }
      ]
    }
  ];

  const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV'];

  // Share Picker Metadata
  const SHARE_EVENTS = [
    { code: '1', name: 'The Wedding Ceremony & Dinner', date: '21 November 2026', artwork: 'assets/crimson-floral-candles.png' },
    { code: '2', name: 'The Wedding Reception', date: '23 November 2026', artwork: 'assets/royal-crimson-hero.jpg' }
  ];

  // --- URL Query Parameter Parser ---
  function getInviteFilter() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('b')) {
      return { custom: true, codes: params.get('b') || '' };
    }
    return { custom: false, codes: (params.get('e') || '').toUpperCase() };
  }

  function isSharePage() {
    return /\/share\/?$/.test(window.location.pathname) || new URLSearchParams(window.location.search).has('share');
  }

  // --- Render Filtered Chapters ---
  function renderEvents() {
    const filter = getInviteFilter();
    const hasAll = filter.codes.includes('A');

    // Filter chapters based on URL codes
    const activeChapters = EVENTS_DATA.filter(event => {
      if (filter.custom) {
        return filter.codes.includes(event.code);
      }
      return !event.optionalCode || hasAll || filter.codes.includes(event.optionalCode);
    }).map((event, idx) => ({
      ...event,
      index: ROMAN_NUMERALS[idx] || (idx + 1).toString()
    }));

    const eventsWrap = document.getElementById('eventsWrap');
    if (!eventsWrap) return;
    eventsWrap.innerHTML = '';

    activeChapters.forEach(chapter => {
      const section = document.createElement('section');
      section.className = 'event-chapter';

      const isSingle = chapter.items.length === 1;

      let itemsHtml = '';
      chapter.items.forEach(item => {
        const bgArt = item.backgroundArtwork
          ? `<img class="event-card-background" src="${item.backgroundArtwork}" alt="" aria-hidden="true" loading="lazy" decoding="async" />`
          : '';
        const art = item.artwork
          ? `<img class="event-card-art ${item.artworkVariant ? 'event-card-art--' + item.artworkVariant : ''}" src="${item.artwork}" alt="" aria-hidden="true" loading="lazy" decoding="async" />`
          : '';
        const loc = item.location ? `<span>${item.location}</span>` : '';
        const hall = item.hall ? `<span class="event-hall">${item.hall}</span>` : '';
        const label = item.label ? `<p class="event-label">${item.label}</p>` : '';
        const subtime = item.subtime
          ? `<p class="event-subtime"><span>${item.subtime}</span></p>`
          : '';
        const timeMatch = item.time.match(/^(\S+)\s+(.*)$/);
        const timeHtml = timeMatch
          ? `<span class="event-time-main">${timeMatch[1]}</span> <span class="event-time-meta">${timeMatch[2]}</span>`
          : item.time;

        itemsHtml += `
          <div class="event-card" data-animate="card">
            ${bgArt}
            ${art}
            ${label}
            <h3>${timeHtml}</h3>
            ${subtime}
            <address>
              ${hall}
              <strong>${item.venue}</strong>
              ${loc}
            </address>
            <a href="${item.map}" target="_blank" rel="noreferrer">
              <span>View directions</span>
              <b aria-hidden="true">↗</b>
            </a>
          </div>
        `;
      });

      section.innerHTML = `
        <div class="chapter-watermark" aria-hidden="true">${chapter.index}</div>
        <div class="chapter-heading" data-animate="soft">
          <h2>${chapter.chapter}</h2>
          <time>${chapter.date}</time>
          <span class="ornament" aria-hidden="true">
            <i></i><b>◆</b><i></i>
          </span>
        </div>
        <div class="event-grid ${isSingle ? 'event-grid--single' : ''}">
          ${itemsHtml}
        </div>
      `;

      eventsWrap.appendChild(section);
    });
  }

  // --- Countdown Timer ---
  function updateCountdown() {
    const now = Date.now();
    const diff = Math.max(0, TARGET_DATE.getTime() - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const elDays = document.getElementById('cdDays');
    const elHours = document.getElementById('cdHours');
    const elMin = document.getElementById('cdMinutes');
    const elSec = document.getElementById('cdSeconds');

    if (elDays) elDays.textContent = String(days).padStart(2, '0');
    if (elHours) elHours.textContent = String(hours).padStart(2, '0');
    if (elMin) elMin.textContent = String(minutes).padStart(2, '0');
    if (elSec) elSec.textContent = String(seconds).padStart(2, '0');
  }

  // --- Audio Player Controller ---
  const audio = document.getElementById('weddingAudio');
  const musicControl = document.getElementById('musicControl');
  let isPlaying = false;

  function playAudio() {
    if (!audio) return;
    audio.volume = 0.58;
    const promise = audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          if (document.hidden) {
            audio.pause();
            updateMusicUI(false);
            return;
          }
          updateMusicUI(true);
        })
        .catch(() => {
          updateMusicUI(false);
        });
    }
  }

  function pauseAudio() {
    if (!audio) return;
    audio.pause();
    updateMusicUI(false);
  }

  function toggleAudio() {
    if (!audio) return;
    if (audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  }

  function updateMusicUI(playing) {
    isPlaying = playing;
    if (!musicControl) return;
    if (playing) {
      musicControl.classList.add('is-playing');
      musicControl.setAttribute('aria-pressed', 'true');
      musicControl.setAttribute('aria-label', 'Pause background music');
      musicControl.title = 'Pause background music';
    } else {
      musicControl.classList.remove('is-playing');
      musicControl.setAttribute('aria-pressed', 'false');
      musicControl.setAttribute('aria-label', 'Play background music');
      musicControl.title = 'Play background music';
    }
  }

  if (musicControl) {
    musicControl.addEventListener('click', toggleAudio);
  }

  // Handle tab visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isPlaying) {
      pauseAudio();
    }
  });
  window.addEventListener('pagehide', () => {
    if (isPlaying) pauseAudio();
  });
  window.addEventListener('blur', () => {
    if (isPlaying) pauseAudio();
  });

  // --- Gate Experience ---
  const gate = document.getElementById('invitationGate');
  const openBtn = document.getElementById('openInvitationBtn');
  const mainApp = document.getElementById('mainApp');

  // Prevent scroll while gate is visible
  document.body.style.overflow = 'hidden';

  if (openBtn && gate) {
    openBtn.addEventListener('click', () => {
      openBtn.disabled = true;
      gate.classList.remove('is-idle');
      gate.classList.add('is-opening');

      // Start music
      playAudio();

      // Show floating music toggle
      if (musicControl) {
        musicControl.style.display = 'flex';
      }

      // Smooth reveal trigger
      setTimeout(() => {
        gate.classList.add('is-fading');
        if (mainApp) {
          mainApp.classList.add('is-entered');
        }
        document.body.style.overflow = '';
        initScrollObservers();
      }, 240);

      // Gate fully dismissed
      setTimeout(() => {
        gate.style.display = 'none';
      }, 900);
    });
  }

  // --- Scroll Progress Bar & Sparkle Tracker ---
  const progressBar = document.getElementById('globalProgressBar');
  const progressSparkle = document.getElementById('globalProgressSparkle');

  function updateScrollProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const progress = Math.min(1, Math.max(0, window.scrollY / docHeight));
    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress})`;
    }
    if (progressSparkle) {
      progressSparkle.style.left = `${progress * 100}%`;
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  // --- Global Scroll Down Hint ---
  const scrollHint = document.getElementById('globalScrollHint');
  const scrollHintBtn = document.getElementById('scrollHintBtn');
  let scrollHintTimer = null;

  function checkScrollHint() {
    clearTimeout(scrollHintTimer);
    if (!scrollHint) return;

    const isNearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 120;
    if (isNearBottom) {
      scrollHint.style.opacity = '0';
      scrollHint.style.pointerEvents = 'none';
      return;
    }

    scrollHint.style.opacity = '0';
    scrollHint.style.pointerEvents = 'none';

    scrollHintTimer = setTimeout(() => {
      const nearBottomCheck = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 120;
      if (!nearBottomCheck && mainApp && mainApp.classList.contains('is-entered')) {
        scrollHint.style.display = 'flex';
        scrollHint.style.opacity = '1';
        scrollHint.style.pointerEvents = 'auto';
      }
    }, 1400);
  }

  if (scrollHintBtn) {
    scrollHintBtn.addEventListener('click', () => {
      if (scrollHint) {
        scrollHint.style.opacity = '0';
        scrollHint.style.pointerEvents = 'none';
      }
      window.scrollBy({
        top: Math.min(window.innerHeight * 0.72, 560),
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('scroll', checkScrollHint, { passive: true });

  // Initial scroll hint trigger
  setTimeout(() => {
    checkScrollHint();
  }, 1800);

  // --- Intersection Observer for In-View Scroll Animations ---
  function initScrollObservers() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.12
    };

    const inViewObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all animated cards, headings, and sections
    document.querySelectorAll('[data-animate]').forEach(el => inViewObserver.observe(el));
    const countdown = document.getElementById('countdownGrid');
    if (countdown) inViewObserver.observe(countdown);
    const storyBreak = document.querySelector('.story-break');
    if (storyBreak) inViewObserver.observe(storyBreak);
  }

  // --- Share / Guest Link Page Handler ---
  function initSharePage() {
    const sharePage = document.getElementById('sharePage');
    if (!sharePage) return;

    // Show share page, hide main app & gate
    sharePage.style.display = 'grid';
    if (mainApp) mainApp.style.display = 'none';
    if (gate) gate.style.display = 'none';
    document.body.style.overflow = '';

    let selectedCodes = ['1', '2'];
    const pickerList = document.getElementById('sharePickerList');
    const countText = document.getElementById('shareCountText');
    const summaryText = document.getElementById('shareSummaryText');
    const generatedLinkEl = document.getElementById('shareGeneratedLink');
    const copyBtn = document.getElementById('copyShareLinkBtn');
    const previewBtn = document.getElementById('previewShareLinkBtn');

    function buildShareUrl(codes) {
      const url = new URL(window.location.href);
      url.pathname = url.pathname.replace(/\/share\/?$/, '') || '/';
      url.search = `?b=${codes.join('')}`;
      url.hash = '';
      return url.toString();
    }

    function renderShareUI() {
      if (!pickerList) return;
      pickerList.innerHTML = '';

      SHARE_EVENTS.forEach((item, idx) => {
        const isChecked = selectedCodes.includes(item.code);
        const card = document.createElement('label');
        card.className = `share-card share-picker-card ${isChecked ? 'is-selected' : ''}`;
        card.innerHTML = `
          <input type="checkbox" ${isChecked ? 'checked' : ''} />
          <img class="share-card-art" src="${item.artwork}" alt="" aria-hidden="true" />
          <span class="share-card-number">${String(idx + 1).padStart(2, '0')}</span>
          <span class="share-card-content">
            <span class="share-picker-title">${item.name}</span>
            <span class="share-picker-date">${item.date}</span>
          </span>
          <span class="share-check" aria-hidden="true">${isChecked ? '✓' : '+'}</span>
        `;

        const checkbox = card.querySelector('input');
        checkbox.addEventListener('change', () => {
          if (selectedCodes.includes(item.code)) {
            selectedCodes = selectedCodes.filter(c => c !== item.code);
          } else {
            selectedCodes.push(item.code);
          }
          // Sort according to original order
          selectedCodes.sort();
          renderShareUI();
        });

        pickerList.appendChild(card);
      });

      // Update Summary & Link
      const count = selectedCodes.length;
      if (countText) {
        countText.textContent = `${count} ${count === 1 ? 'event' : 'events'} selected`;
      }

      const activeEventObjects = SHARE_EVENTS.filter(e => selectedCodes.includes(e.code));
      if (summaryText) {
        summaryText.textContent = activeEventObjects.length
          ? activeEventObjects.map(e => e.name.replace('The ', '')).join(' · ')
          : 'Select at least one event';
      }

      const shareUrl = buildShareUrl(selectedCodes);
      if (generatedLinkEl) {
        generatedLinkEl.textContent = count ? shareUrl : 'Your custom invitation link will appear here';
      }

      if (copyBtn) {
        copyBtn.disabled = count === 0;
      }
      if (previewBtn) {
        previewBtn.href = shareUrl;
        previewBtn.style.display = count > 0 ? 'inline-flex' : 'none';
      }
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const urlToCopy = buildShareUrl(selectedCodes);
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(urlToCopy);
          } else {
            const ta = document.createElement('textarea');
            ta.value = urlToCopy;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
          copyBtn.textContent = 'Link copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy custom link';
          }, 1800);
        } catch (e) {
          console.error(e);
        }
      });
    }

    renderShareUI();
  }

  // --- App Initialization ---
  function init() {
    if (isSharePage()) {
      initSharePage();
    } else {
      renderEvents();
      updateCountdown();
      setInterval(updateCountdown, 1000);
      initScrollObservers();
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
