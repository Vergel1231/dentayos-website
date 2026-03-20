/* =============================================================
   DentAyos — Landing Page JavaScript
   js/index.js
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

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
    if (b) b.style.display = window.scrollY > 400 ? 'flex' : 'none';
  });

  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── DEMO TABS ─────────────────────────────────────────────

  function switchTab(name) {
    document.querySelectorAll('.demo-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.demo-panel').forEach(p => p.classList.remove('active'));
    const tab = document.querySelector(`.demo-tab[data-tab="${name}"]`);
    if (tab) { tab.classList.add('active'); tab.setAttribute('aria-selected', 'true'); }
    const panel = document.getElementById('tab-' + name);
    if (panel) panel.classList.add('active');
  }

  document.querySelectorAll('.demo-tab').forEach(btn => {
    btn.addEventListener('click', function () { switchTab(this.dataset.tab); });
  });

});
