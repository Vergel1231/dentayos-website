/* =============================================================
   DentAyos — Architecture Page JavaScript
   js/architecture.js
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ── NAVIGATION ────────────────────────────────────────────

  function goToWebsite() {
    const overlay = document.getElementById('logout-overlay');
    if (overlay) overlay.classList.add('show');
    setTimeout(() => { window.location.href = 'index.html?ts=' + Date.now(); }, 600);
  }

  // ── PHASE TABS ────────────────────────────────────────────

  function showPhase(name) {
    document.querySelectorAll('.phase-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.phase-panel').forEach(p => p.classList.remove('active'));
    const tab = document.querySelector(`.phase-tab[data-phase="${name}"]`);
    if (tab) tab.classList.add('active');
    const panel = document.getElementById('phase-' + name);
    if (panel) panel.classList.add('active');
  }

  // ── SCROLL REVEAL ─────────────────────────────────────────

  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => io.observe(el));

  // ── BACK TO TOP ───────────────────────────────────────────

  window.addEventListener('scroll', () => {
    const b = document.getElementById('back-to-top');
    if (b) b.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });

  // ── EVENT LISTENERS ───────────────────────────────────────

  // Header nav links → goToWebsite
  document.getElementById('nav-logo-link').addEventListener('click', goToWebsite);
  document.getElementById('nav-back-link').addEventListener('click', goToWebsite);

  // Phase tabs — each button carries data-phase attribute
  document.querySelectorAll('.phase-tab').forEach(btn => {
    btn.addEventListener('click', function () { showPhase(this.dataset.phase); });
  });

  // Back to top
  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
