/* =============================================================
   DentAyos — Owner Portal JavaScript
   js/owner.js
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ── DATA ──────────────────────────────────────────────────

  const OWNER = { username: 'ver', password: 'dentayos2026' };

  const clinics = [
    { name: 'Smile Dental Clinic',   owner: 'Dr. Ana Santos',  location: 'Makati',      plan: 'Standard', fee: 3000, patients: 24, since: 'Jan 2026', status: 'active' },
    { name: 'BrightSmile Aesthetics', owner: 'Dr. Carlo Reyes', location: 'BGC',         plan: 'Standard', fee: 3000, patients: 31, since: 'Feb 2026', status: 'active' },
    { name: 'PearlWhite Dental',      owner: 'Dr. Liza Cruz',   location: 'Quezon City', plan: 'Pilot',    fee: 1500, patients: 17, since: 'Mar 2026', status: 'trial'  },
  ];

  const activities = [
    { type: 'new',     text: 'PearlWhite Dental joined as a pilot clinic.',          time: 'Mar 16, 2026 · 9:00 AM'  },
    { type: 'payment', text: 'BrightSmile Aesthetics paid ₱3,000 for March.',        time: 'Mar 15, 2026 · 2:30 PM'  },
    { type: 'payment', text: 'Smile Dental Clinic paid ₱3,000 for March.',           time: 'Mar 14, 2026 · 11:00 AM' },
    { type: 'alert',   text: 'PearlWhite Dental payment due in 15 days.',            time: 'Mar 13, 2026 · 8:00 AM'  },
    { type: 'info',    text: 'BrightSmile Aesthetics added 5 new patients.',         time: 'Mar 12, 2026 · 4:00 PM'  },
    { type: 'info',    text: 'Smile Dental Clinic sent 18 reminders this week.',     time: 'Mar 11, 2026 · 10:00 AM' },
    { type: 'new',     text: 'BrightSmile Aesthetics joined on Standard plan.',      time: 'Feb 1, 2026 · 9:00 AM'   },
    { type: 'new',     text: 'Smile Dental Clinic joined on Standard plan.',         time: 'Jan 5, 2026 · 9:00 AM'   },
  ];

  // ── RENDER HELPERS ────────────────────────────────────────

  function clinicRow(c, full) {
    const statusClass = c.status === 'active' ? 'active' : c.status === 'trial' ? 'trial' : 'overdue';
    const statusLabel = c.status === 'active' ? 'Active' : c.status === 'trial' ? 'Trial' : 'Overdue';
    return `<tr>
      <td><div class="clinic-name">${c.name}</div><div class="clinic-meta">${c.location}</div></td>
      ${full ? `<td style="font-size:12px;color:var(--teal);">${c.owner}</td>` : ''}
      <td style="font-size:12px;">${c.plan}</td>
      <td style="font-family:'DM Serif Display',serif;font-size:16px;color:var(--gold);">₱${c.fee.toLocaleString()}</td>
      <td>${c.patients}</td>
      <td style="font-size:12px;color:var(--teal);">${c.since}</td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
      <td>
        <button class="action-btn">View</button>
        <button class="action-btn danger">Remove</button>
      </td>
    </tr>`;
  }

  function revenueRow(c) {
    const paid = c.status !== 'overdue';
    return `<div class="revenue-row">
      <div><div class="revenue-clinic">${c.name}</div><div class="revenue-plan">${c.plan} Plan · ${c.location}</div></div>
      <div style="text-align:right;">
        <div class="revenue-amount">₱${c.fee.toLocaleString()}</div>
        <div class="revenue-status" style="color:${paid ? 'var(--success)' : '#E24B4A'}">${paid ? 'Paid' : 'Overdue'}</div>
      </div>
    </div>`;
  }

  function activityItem(a) {
    return `<div class="activity-item">
      <div class="activity-dot ${a.type}"></div>
      <div class="activity-text"><p>${a.text}</p><span>${a.time}</span></div>
    </div>`;
  }

  function renderAll() {
    ['clinic-tbody-dash', 'clinic-tbody-full'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.innerHTML = ''; clinics.forEach(c => { el.innerHTML += clinicRow(c, id === 'clinic-tbody-full'); }); }
    });
    ['revenue-breakdown', 'revenue-full'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.innerHTML = ''; clinics.forEach(c => { el.innerHTML += revenueRow(c); }); }
    });
    ['activity-dash', 'activity-full'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = '';
        const items = id === 'activity-dash' ? activities.slice(0, 4) : activities;
        items.forEach(a => { el.innerHTML += activityItem(a); });
      }
    });
    updateCounts();
  }

  function updateCounts() {
    const count      = clinics.length;
    const total      = clinics.reduce((sum, c) => sum + c.fee, 0);
    const overdue    = clinics.filter(c => c.status === 'overdue');
    const paid       = clinics.filter(c => c.status !== 'overdue');
    const overdueTotal = overdue.reduce((sum, c) => sum + c.fee, 0);
    const paidTotal    = paid.reduce((sum, c) => sum + c.fee, 0);
    const setupTotal   = clinics.reduce((sum, c) => sum + (c.plan === 'Standard' ? 6500 : 0), 0);

    document.querySelectorAll('#clinic-count, #clinic-count-full').forEach(el => el.textContent = count + ' total');
    document.getElementById('stat-clinics').textContent = count;
    document.getElementById('stat-revenue').textContent = '₱' + total.toLocaleString();

    const revTotal     = document.getElementById('rev-total');
    const revCollected = document.getElementById('rev-collected');
    const revPending   = document.getElementById('rev-pending');
    const revSetup     = document.getElementById('rev-setup');
    if (revTotal)     { revTotal.textContent = '₱' + total.toLocaleString(); document.getElementById('rev-total-sub').textContent = count + ' active subscription' + (count !== 1 ? 's' : ''); }
    if (revCollected) { revCollected.textContent = '₱' + paidTotal.toLocaleString(); document.getElementById('rev-collected-sub').textContent = paid.length + ' clinic' + (paid.length !== 1 ? 's' : '') + ' paid'; }
    if (revPending)   { revPending.textContent = '₱' + overdueTotal.toLocaleString(); document.getElementById('rev-pending-sub').textContent = overdue.length + ' clinic' + (overdue.length !== 1 ? 's' : '') + ' overdue'; }
    if (revSetup)     revSetup.textContent = '₱' + setupTotal.toLocaleString();
  }

  // ── DATE ──────────────────────────────────────────────────

  const dateStr = new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  ['today-date', 'today-date-c', 'today-date-r', 'today-date-a'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = dateStr;
  });

  // ── LOGIN / LOGOUT ────────────────────────────────────────

  function togglePw() {
    const pw  = document.getElementById('login-pass');
    const btn = document.getElementById('toggle-pw');
    pw.type = pw.type === 'password' ? 'text' : 'password';
    btn.textContent = pw.type === 'password' ? 'Show' : 'Hide';
  }

  function doLogin() {
    const user = document.getElementById('login-user').value.trim().toLowerCase();
    const pass = document.getElementById('login-pass').value;
    const err  = document.getElementById('login-error');
    if (!user || !pass) { err.textContent = 'Please enter your credentials.'; err.style.display = 'block'; return; }
    if (user !== OWNER.username || pass !== OWNER.password) { err.textContent = 'Incorrect username or password.'; err.style.display = 'block'; return; }
    err.style.display = 'none';
    const hour     = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    document.getElementById('owner-greeting').textContent = greeting + ', Ver. 👑';
    document.getElementById('login-screen').style.display = 'none';
    renderAll();
  }

  function doLogout() {
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('owner-greeting').textContent = 'Good morning, Ver. 👑';
    document.getElementById('login-screen').style.display = 'flex';
  }

  function goToWebsite() {
    const overlay = document.getElementById('logout-overlay');
    if (overlay) overlay.classList.add('show');
    setTimeout(() => { window.location.href = 'index.html?ts=' + Date.now(); }, 600);
  }

  // ── SIDEBAR ───────────────────────────────────────────────

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main    = document.getElementById('main');
    const toggle  = document.getElementById('sidebar-toggle');
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');
    toggle.classList.toggle('collapsed');
    toggle.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✕';
  }

  // ── SECTION SWITCHING ─────────────────────────────────────

  const sections = ['dashboard', 'clinics', 'revenue', 'activity'];

  function showSection(name) {
    sections.forEach(s => {
      const sec = document.getElementById('section-' + s);
      const nav = document.getElementById('nav-' + s);
      if (sec) sec.className = 'section-content' + (s === name ? ' active' : '');
      if (nav) nav.classList.toggle('active', s === name);
    });
    window.scrollTo(0, 0);
  }

  // ── MODALS ────────────────────────────────────────────────

  function openModal(id)  { document.getElementById('modal-' + id).classList.add('open'); }
  function closeModal(id) { document.getElementById('modal-' + id).classList.remove('open'); }

  // ── ADD CLINIC ────────────────────────────────────────────

  function addClinic() {
    const name     = document.getElementById('new-clinic-name').value.trim();
    const owner    = document.getElementById('new-clinic-owner').value.trim();
    const location = document.getElementById('new-clinic-location').value.trim();
    const planEl   = document.getElementById('new-clinic-plan');
    const plan     = planEl.options[planEl.selectedIndex].text.split(' ')[0];
    const fee      = plan === 'Pilot' ? 1500 : 3000;
    if (!name) { showToast('Please enter the clinic name.'); return; }
    clinics.push({
      name, owner: owner || '—', location: location || '—', plan, fee, patients: 0,
      since: new Date().toLocaleDateString('en-PH', { month: 'short', year: 'numeric' }),
      status: plan === 'Pilot' ? 'trial' : 'active'
    });
    activities.unshift({
      type: 'new',
      text: name + ' was added to DentAyos.',
      time: new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · Just now'
    });
    renderAll();
    closeModal('add-clinic');
    ['new-clinic-name', 'new-clinic-owner', 'new-clinic-location', 'new-clinic-contact'].forEach(id => {
      document.getElementById(id).value = '';
    });
    showToast(name + ' added successfully.');
  }

  // ── TOAST ─────────────────────────────────────────────────

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = '✓  ' + msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ── BACK TO TOP ───────────────────────────────────────────

  window.addEventListener('scroll', function () {
    const btn = document.getElementById('back-to-top');
    if (btn) btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });

  // ── EVENT LISTENERS ───────────────────────────────────────

  // Login form — Enter key on inputs
  document.getElementById('login-user').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
  document.getElementById('login-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });

  // Login buttons
  document.getElementById('toggle-pw').addEventListener('click', togglePw);
  document.getElementById('login-btn').addEventListener('click', doLogin);

  // Back to website (login screen)
  document.getElementById('back-to-website').addEventListener('click', function () {
    window.location.href = 'index.html?ts=' + Date.now();
  });

  // Sidebar toggle
  document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);

  // Sidebar nav items
  sections.forEach(s => {
    const el = document.getElementById('nav-' + s);
    if (el) el.addEventListener('click', function () { showSection(s); });
  });

  // Website and logout buttons in sidebar
  document.getElementById('btn-website').addEventListener('click', goToWebsite);
  document.getElementById('btn-logout').addEventListener('click', doLogout);

  // Dashboard — Add Clinic button
  document.getElementById('btn-add-clinic-dash').addEventListener('click', function () { openModal('add-clinic'); });

  // Clinics section — Add Clinic button
  document.getElementById('btn-add-clinic-clinics').addEventListener('click', function () { openModal('add-clinic'); });

  // Modal close buttons
  document.getElementById('btn-close-add-clinic').addEventListener('click', function () { closeModal('add-clinic'); });
  document.getElementById('btn-cancel-add-clinic').addEventListener('click', function () { closeModal('add-clinic'); });
  document.getElementById('btn-save-add-clinic').addEventListener('click', addClinic);

  // Back to top
  document.getElementById('back-to-top').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
