/* ============================================
   LOS ALGORÍTMICOS — script.js
   Charts, animations, interactions
   ============================================ */

// ---- DATA ----
const DATA = {
  generoMusical: {
    labels: ['Pop', 'Rock', 'Electrónica', 'Reggaeton', 'Clásica', 'Alternativa', 'Jazz'],
    values: [5, 5, 4, 4, 4, 2, 1]
  },
  genero: {
    labels: ['Femenino', 'Masculino'],
    values: [13, 12]
  },
  edad: {
    labels: ['18 años', '19 años', '20 años', '21 años'],
    values: [3, 17, 4, 1]
  },
  canciones: {
    labels: [
      'Canción 01', 'Canción 02', 'Canción 03', 'Canción 04', 'Canción 05',
      'Canción 06 (Pop)', 'Canción 07 (Pop)', 'Canción 08', 'Canción 09 (Pop)', 'Canción 10',
      'Canción 11 (Rock)', 'Canción 12', 'Canción 13', 'Canción 14 (Rock)', 'Canción 15',
      'Canción 16 (Elec)', 'Canción 17 (Elec)', 'Canción 18', 'Canción 19 (Elec)', 'Canción 20 (Elec)',
      'Canción 21 (Clás)', 'Canción 22 (Clás)', 'Canción 23 (Clás)', 'Canción 24 (Clás)', 'Canción 25 (Clás)',
      'Canción 26', 'Canción 27', 'Canción 28', 'Canción 29', 'Canción 30'
    ],
    values: [
      3.08, 3.36, 3.96, 2.96, 3.24,
      3.80, 4.04, 3.52, 4.00, 3.72,
      3.40, 3.20, 3.52, 3.32, 3.04,
      3.12, 3.40, 2.84, 3.28, 3.28,
      2.52, 2.28, 2.60, 2.72, 2.92,
      2.04, 2.04, 2.00, 2.52, 2.16
    ]
  },
  similitud: {
    labels: ['Billie Jean', 'Smells Like\nTeen Spirit', 'One More Time', 'Levels', 'Canción 03', 'Canción 09'],
    values: [4.8, 4.6, 4.2, 4.0, 3.96, 4.0]
  },
  radar: {
    labels: ['Pop', 'Rock', 'Electrónica', 'Reggaeton', 'Clásica', 'Alternativa'],
    femenino: [4.1, 3.6, 3.8, 3.5, 3.9, 3.7],
    masculino: [3.8, 4.0, 3.6, 4.1, 3.7, 3.4]
  },
  dispersion: {
    evaluated: 620,
    empty: 130
  }
};

// ---- PALETTE ----
const C = {
  accent:  '#c8f135',
  accentD: '#8aaa1f',
  blue:    '#4fa8ff',
  coral:   '#ff6b5b',
  purple:  '#a78bfa',
  amber:   '#f59e0b',
  teal:    '#34d399',
  text:    '#f0ede8',
  text2:   '#9b9890',
  text3:   '#3c3a36',
  border:  'rgba(255,255,255,0.07)'
};

const GENRE_COLORS = [C.accent, C.coral, C.blue, C.amber, C.purple, C.teal, '#f472b6'];

// ---- CHART DEFAULTS ----
Chart.defaults.color = C.text2;
Chart.defaults.font.family = "'Space Grotesk', sans-serif";
Chart.defaults.font.size = 12;

const gridCfg = {
  color: 'rgba(255,255,255,0.06)',
  lineWidth: 1
};

// ---- HELPERS ----
function buildLegend(containerId, labels, colors) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = labels.map((lbl, i) => `
    <span class="chart-legend-item">
      <span class="chart-legend-dot" style="background:${colors[i]}"></span>
      ${lbl}
    </span>
  `).join('');
}

function songColor(val) {
  if (val >= 3.8) return C.accent;
  if (val >= 3.4) return C.blue;
  if (val >= 3.0) return C.purple;
  if (val >= 2.5) return C.amber;
  return C.coral;
}

// ---- NAV SCROLL EFFECT ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  highlightActiveNav();
}, { passive: true });

// ---- HAMBURGER ----
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ---- ACTIVE NAV HIGHLIGHT ----
function highlightActiveNav() {
  const sections = document.querySelectorAll('.section, header.hero');
  const links = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY + 120 >= sec.offsetTop) current = sec.id;
  });
  links.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

// ---- ANIMATED COUNTER ----
function animateCounter(el, target, duration = 1200) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    el.textContent = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---- HERO WAVEFORM ----
function drawWaveform() {
  const container = document.getElementById('heroWave');
  const w = window.innerWidth, h = 120;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', h);
  svg.style.display = 'block';

  const bars = 120;
  const gap  = 2;
  const bw   = (w / bars) - gap;

  for (let i = 0; i < bars; i++) {
    const r    = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const ht   = 8 + Math.random() * 80;
    const x    = i * (bw + gap);
    const y    = (h - ht) / 2;
    r.setAttribute('x', x);
    r.setAttribute('y', y);
    r.setAttribute('width', bw);
    r.setAttribute('height', ht);
    r.setAttribute('rx', 2);
    r.setAttribute('fill', `rgba(200,241,53,${0.05 + Math.random() * 0.18})`);
    svg.appendChild(r);
  }
  container.appendChild(svg);
}

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// ---- COUNTER TRIGGER ----
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num[data-target]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

// ---- CHART: GENRE MUSICAL (horizontal bar) ----
function initGeneroMusical() {
  const ctx = document.getElementById('cGenMusical');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.generoMusical.labels,
      datasets: [{
        label: 'Participantes',
        data: DATA.generoMusical.values,
        backgroundColor: GENRE_COLORS,
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#1c1c24',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f0ede8',
        bodyColor: '#9b9890',
        padding: 12,
        callbacks: { label: ctx => `  ${ctx.raw} participantes` }
      }},
      scales: {
        y: { beginAtZero: true, max: 7, ticks: { stepSize: 1, color: C.text2 }, grid: gridCfg },
        x: { grid: { display: false }, ticks: { color: C.text2, font: { size: 12 } } }
      },
      animation: { delay: (ctx) => ctx.dataIndex * 80 }
    }
  });
  buildLegend('legendGenMusical', DATA.generoMusical.labels, GENRE_COLORS);
}

// ---- CHART: GENDER PIE ----
function initGenero() {
  const ctx = document.getElementById('cGenero');
  if (!ctx) return;
  const colors = [C.purple, C.blue];
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: DATA.genero.labels,
      datasets: [{
        data: DATA.genero.values,
        backgroundColor: colors,
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: '#0a0a0c'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c1c24',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0ede8',
          bodyColor: '#9b9890',
          padding: 12,
          callbacks: { label: ctx => `  ${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw/25*100)}%)` }
        }
      }
    }
  });
  buildLegend('legendGenero', DATA.genero.labels, colors);
}

// ---- CHART: AGE ----
function initEdad() {
  const ctx = document.getElementById('cEdad');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.edad.labels,
      datasets: [{
        label: 'Participantes',
        data: DATA.edad.values,
        backgroundColor: [C.teal, C.accent, C.coral, C.amber],
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#1c1c24',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f0ede8',
        bodyColor: '#9b9890',
        padding: 12
      }},
      scales: {
        y: { beginAtZero: true, max: 20, ticks: { stepSize: 4, color: C.text2 }, grid: gridCfg },
        x: { grid: { display: false }, ticks: { color: C.text2 } }
      },
      animation: { delay: (ctx) => ctx.dataIndex * 120 }
    }
  });
}

// ---- CHART: 30 SONGS (horizontal bar) ----
function initCanciones() {
  const ctx = document.getElementById('cCanciones');
  if (!ctx) return;
  const colors = DATA.canciones.values.map(songColor);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.canciones.labels,
      datasets: [{
        label: 'Calificación promedio',
        data: DATA.canciones.values,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c1c24',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0ede8',
          bodyColor: '#9b9890',
          padding: 12,
          callbacks: {
            label: ctx => `  Promedio: ${ctx.raw.toFixed(2)} / 5`
          }
        }
      },
      scales: {
        x: {
          min: 0, max: 5,
          ticks: { stepSize: 1, color: C.text2 },
          grid: gridCfg
        },
        y: {
          ticks: { color: C.text2, font: { size: 11 } },
          grid: { display: false }
        }
      },
      animation: { delay: (ctx) => ctx.dataIndex * 30 }
    }
  });
}

// ---- CHART: kNN SIMILARITY (bar) ----
function initSimilitud() {
  const ctx = document.getElementById('cSimilitud');
  if (!ctx) return;
  const colors = [C.accent, C.coral, C.blue, C.amber, C.purple, C.teal];
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.similitud.labels,
      datasets: [{
        label: 'Robustez de vecindad',
        data: DATA.similitud.values,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#1c1c24',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f0ede8',
        bodyColor: '#9b9890',
        padding: 12,
        callbacks: { label: ctx => `  Score: ${ctx.raw.toFixed(1)} / 5` }
      }},
      scales: {
        y: { min: 0, max: 5, ticks: { stepSize: 1, color: C.text2 }, grid: gridCfg },
        x: { grid: { display: false }, ticks: { color: C.text2, font: { size: 11 } } }
      },
      animation: { delay: (ctx) => ctx.dataIndex * 100 }
    }
  });
  buildLegend('legendSimilitud', DATA.similitud.labels, colors);
}

// ---- CHART: RADAR (gender similarity) ----
function initRadar() {
  const ctx = document.getElementById('cSimilitudRadar');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: DATA.radar.labels,
      datasets: [
        {
          label: 'Femenino',
          data: DATA.radar.femenino,
          borderColor: C.purple,
          backgroundColor: 'rgba(167,139,250,0.12)',
          borderWidth: 2,
          pointBackgroundColor: C.purple,
          pointRadius: 4
        },
        {
          label: 'Masculino',
          data: DATA.radar.masculino,
          borderColor: C.blue,
          backgroundColor: 'rgba(79,168,255,0.10)',
          borderWidth: 2,
          pointBackgroundColor: C.blue,
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#1c1c24',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f0ede8',
        bodyColor: '#9b9890',
        padding: 12
      }},
      scales: {
        r: {
          min: 0, max: 5,
          ticks: { stepSize: 1, color: C.text3, backdropColor: 'transparent', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.07)' },
          angleLines: { color: 'rgba(255,255,255,0.06)' },
          pointLabels: { color: C.text2, font: { size: 12 } }
        }
      }
    }
  });
}

// ---- CHART: DISPERSION (donut) ----
function initDispersion() {
  const ctx = document.getElementById('cDispersion');
  if (!ctx) return;
  const evaluated = DATA.dispersion.evaluated;
  const empty     = DATA.dispersion.empty;
  const total     = evaluated + empty;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [`Evaluadas (${Math.round(evaluated/total*100)}%)`, `Sin evaluar (${Math.round(empty/total*100)}%)`],
      datasets: [{
        data: [evaluated, empty],
        backgroundColor: [C.accent, C.text3],
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: '#0a0a0c'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c1c24',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0ede8',
          bodyColor: '#9b9890',
          padding: 12
        }
      },
      animation: { animateRotate: true, duration: 900 }
    }
  });
}

// ---- INIT ON LOAD ----
document.addEventListener('DOMContentLoaded', () => {
  drawWaveform();

  // Observe counter
  const hero = document.querySelector('.hero');
  if (hero) counterObserver.observe(hero);

  // Reveal elements
  document.querySelectorAll('.chart-card, .pipeline-step, .knn-step, .finding, .insight-item, .var-group, .bayesian-card, .sparsity-note').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Add staggered delays
  document.querySelectorAll('.knn-steps .knn-step').forEach((el, i) => {
    el.style.transitionDelay = `${i * 60}ms`;
  });
  document.querySelectorAll('.findings-grid .finding').forEach((el, i) => {
    el.style.transitionDelay = `${i * 80}ms`;
  });

  // Charts - lazy init on first visibility
  const chartMap = {
    'cGenMusical':     initGeneroMusical,
    'cGenero':         initGenero,
    'cEdad':           initEdad,
    'cCanciones':      initCanciones,
    'cSimilitud':      initSimilitud,
    'cSimilitudRadar': initRadar,
    'cDispersion':     initDispersion
  };

  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fn = chartMap[entry.target.id];
        if (fn) { fn(); delete chartMap[entry.target.id]; }
        chartObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  Object.keys(chartMap).forEach(id => {
    const el = document.getElementById(id);
    if (el) chartObserver.observe(el);
  });
});