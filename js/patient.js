/* =============================================================
   DentAyos — Patient Portal JavaScript
   js/patient.js
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ── PATIENT DATA ──────────────────────────────────────────

  const patientAccounts = [
    {
      username: 'maria.santos', password: 'maria2026',
      name: 'Maria B. Santos', firstName: 'Maria', initials: 'MS',
      age: '32 years old', contact: '0917 123 4567',
      concern: 'Dental Cleaning', dentist: 'Dr. Reyes',
      since: 'January 2025',
      nextDate: 'March 17, 2026', nextTime: '9:00 AM · Dental Cleaning',
      notifications: [
        { read: false, text: 'Hi Maria! Reminder: your dental cleaning is tomorrow, March 17 at 9:00 AM.', time: 'Today · 6:00 PM' },
        { read: false, text: 'Your appointment has been confirmed for March 17 at 9:00 AM. Please arrive 10 minutes early.', time: 'March 14 · 10:00 AM' },
        { read: false, text: 'Thank you for your visit on March 1! Your next cleaning is on March 17. See you then! 🦷', time: 'March 1 · 11:30 AM' },
        { read: true,  text: 'Welcome to DentAyos! Your patient portal is now active.', time: 'January 10, 2025' },
      ],
      history: [
        { date: 'Mar 1, 2026',  procedure: 'Cleaning',      dentist: 'Dr. Reyes', notes: 'Routine cleaning. Mild tartar buildup. Next visit in 3 months.' },
        { date: 'Dec 5, 2025',  procedure: 'Cleaning',      dentist: 'Dr. Reyes', notes: 'Routine cleaning completed. No cavities detected.' },
        { date: 'Sep 10, 2025', procedure: 'Filling',       dentist: 'Dr. Reyes', notes: 'Composite filling on lower left molar #36. Healing well.' },
        { date: 'Jan 10, 2025', procedure: 'Consultation',  dentist: 'Dr. Reyes', notes: 'Initial consultation. Full dental X-ray taken. Treatment plan discussed.' },
      ]
    },
    {
      username: 'jose.delacruz', password: 'jose2026',
      name: 'Jose Dela Cruz', firstName: 'Jose', initials: 'JD',
      age: '45 years old', contact: '0918 234 5678',
      concern: 'Braces Consultation', dentist: 'Dr. Reyes',
      since: 'February 2026',
      nextDate: 'March 20, 2026', nextTime: '9:00 AM · Braces Consultation',
      notifications: [
        { read: false, text: 'Hi Jose! Reminder: your braces consultation is on March 20 at 9:00 AM.', time: 'Today · 6:00 PM' },
        { read: true,  text: 'Welcome to DentAyos! Your patient portal is now active.', time: 'February 20, 2026' },
      ],
      history: [
        { date: 'Feb 20, 2026', procedure: 'Consultation', dentist: 'Dr. Reyes', notes: 'Initial braces consultation. X-rays taken. Treatment plan: 18 months braces.' },
      ]
    },
    {
      username: 'ana.reyes', password: 'ana2026',
      name: 'Ana Reyes', firstName: 'Ana', initials: 'AR',
      age: '28 years old', contact: '0919 345 6789',
      concern: 'Veneers', dentist: 'Dr. Reyes',
      since: 'March 2026',
      nextDate: 'March 22, 2026', nextTime: '2:00 PM · Veneer Fitting',
      notifications: [
        { read: false, text: 'Hi Ana! Reminder: your veneer fitting is on March 22 at 2:00 PM.', time: 'Today · 6:00 PM' },
        { read: true,  text: 'Welcome to DentAyos! Your patient portal is now active.', time: 'March 5, 2026' },
      ],
      history: [
        { date: 'Mar 5, 2026', procedure: 'Consultation', dentist: 'Dr. Reyes', notes: 'Veneer consultation. 4 upper front teeth. Shade selected: BL2.' },
      ]
    },
  ];

  // Load previously registered accounts from localStorage
  const savedAccounts = JSON.parse(localStorage.getItem('dentayos_patient_accounts') || '[]');
  savedAccounts.forEach(a => {
    if (!patientAccounts.find(p => p.username === a.username)) {
      patientAccounts.push(a);
    }
  });

  let currentPatient = null;
  let notifPollInterval = null;

  // ── SCREEN SWITCHING ──────────────────────────────────────

  function showSignup() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('signup-screen').style.display = 'flex';
  }

  function showLogin() {
    document.getElementById('signup-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
  }

  // ── SIGNUP ────────────────────────────────────────────────

  function doSignup() {
    const name     = document.getElementById('signup-name').value.trim();
    const age      = document.getElementById('signup-age').value.trim();
    const contact  = document.getElementById('signup-contact').value.trim();
    const concern  = document.getElementById('signup-concern').value;
    const username = document.getElementById('signup-user').value.trim().toLowerCase();
    const password = document.getElementById('signup-pass').value;
    const err      = document.getElementById('signup-error');

    if (!name || !username || !password) { err.textContent = 'Please fill in all required fields.'; err.style.display = 'block'; return; }
    if (password.length < 8)             { err.textContent = 'Password must be at least 8 characters.'; err.style.display = 'block'; return; }
    if (password.toLowerCase() === username.toLowerCase()) { err.textContent = 'Password cannot be the same as your username.'; err.style.display = 'block'; return; }
    if (patientAccounts.find(p => p.username === username)) { err.textContent = 'Username already exists. Please choose another.'; err.style.display = 'block'; return; }

    const firstName = name.split(' ')[0];
    const initials  = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const newPatient = {
      username, password, name, firstName, initials,
      age: age ? age + ' years old' : '—',
      contact: contact || '—',
      concern,
      dentist: 'Dr. Reyes',
      since: new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }),
      nextDate: 'To be scheduled',
      nextTime: 'Please book an appointment below',
      notifications: [{ read: false, text: 'Welcome to DentAyos, ' + firstName + '! Your patient portal is now active. Book your first appointment below.', time: 'Just now' }],
      history: []
    };

    patientAccounts.push(newPatient);

    const saved = JSON.parse(localStorage.getItem('dentayos_patient_accounts') || '[]');
    saved.push(newPatient);
    localStorage.setItem('dentayos_patient_accounts', JSON.stringify(saved));

    err.style.display = 'none';
    currentPatient = newPatient;
    renderPortal(newPatient);
    document.getElementById('signup-screen').style.display = 'none';
    document.getElementById('portal').classList.add('active');
    showToast('Account created! Welcome, ' + firstName + '.');
  }

  // ── PASSWORD TOGGLES ──────────────────────────────────────

  function togglePw() {
    const pw  = document.getElementById('login-pass');
    const btn = document.getElementById('pw-toggle');
    pw.type = pw.type === 'password' ? 'text' : 'password';
    btn.textContent = pw.type === 'password' ? 'Show' : 'Hide';
  }

  function toggleSignupPw() {
    const pw  = document.getElementById('signup-pass');
    const btn = pw.parentElement.querySelector('.pw-toggle');
    pw.type = pw.type === 'password' ? 'text' : 'password';
    btn.textContent = pw.type === 'password' ? 'Show' : 'Hide';
  }

  // ── NAVIGATION ────────────────────────────────────────────

  function goToWebsite() {
    const overlay = document.getElementById('logout-overlay');
    if (overlay) overlay.classList.add('show');
    setTimeout(() => { window.location.href = 'index.html?ts=' + Date.now(); }, 600);
  }

  // ── LOGIN / LOGOUT ────────────────────────────────────────

  function doLogin() {
    const user    = document.getElementById('login-user').value.trim().toLowerCase();
    const pass    = document.getElementById('login-pass').value;
    const err     = document.getElementById('login-error');
    if (!user || !pass) { err.textContent = 'Please enter your credentials.'; err.style.display = 'block'; return; }
    const patient = patientAccounts.find(p => p.username === user && p.password === pass);
    if (!patient)  { err.textContent = 'Incorrect username or password. Please try again.'; err.style.display = 'block'; return; }
    err.style.display = 'none';
    currentPatient = patient;
    renderPortal(patient);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('portal').classList.add('active');
  }

  function doLogout() {
    currentPatient = null;
    if (notifPollInterval) { clearInterval(notifPollInterval); notifPollInterval = null; }

    document.getElementById('login-user').value = '';
    const loginPass = document.getElementById('login-pass');
    loginPass.value = '';
    loginPass.type = 'password';
    document.getElementById('pw-toggle').textContent = 'Show';
    document.getElementById('login-error').style.display = 'none';

    const signupPass = document.getElementById('signup-pass');
    if (signupPass) {
      signupPass.value = '';
      signupPass.type = 'password';
      const signupBtn = signupPass.parentElement.querySelector('.pw-toggle');
      if (signupBtn) signupBtn.textContent = 'Show';
    }

    document.getElementById('portal').classList.remove('active');
    document.getElementById('signup-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
  }

  // ── PORTAL RENDER ─────────────────────────────────────────

  function renderPortal(p) {
    document.getElementById('nav-avatar').textContent = p.initials;
    document.getElementById('nav-name').textContent   = p.name;
    document.getElementById('hero-greeting').innerHTML = 'Welcome back, <em>' + p.firstName + '.</em>';
    document.getElementById('next-date').textContent   = p.nextDate;
    document.getElementById('next-time').textContent   = p.nextTime;
    document.getElementById('record-body').innerHTML = `
      <div class="record-row"><div><div class="record-label">Full Name</div><div class="record-value">${p.name}</div></div><span class="record-badge">Active</span></div>
      <div class="record-row"><div><div class="record-label">Age</div><div class="record-value">${p.age}</div></div></div>
      <div class="record-row"><div><div class="record-label">Contact</div><div class="record-value">${p.contact}</div></div></div>
      <div class="record-row"><div><div class="record-label">Primary Concern</div><div class="record-value">${p.concern}</div></div></div>
      <div class="record-row"><div><div class="record-label">Attending Dentist</div><div class="record-value">${p.dentist}</div></div></div>
      <div class="record-row"><div><div class="record-label">Patient Since</div><div class="record-value">${p.since}</div></div></div>`;

    const notifKey    = 'dentayos_notifications_' + p.username.toLowerCase().replace(/\s+/g, '.');
    const storedNotifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
    const allNotifs    = [...storedNotifs, ...p.notifications];
    const unread       = allNotifs.filter(n => !n.read).length;
    document.getElementById('notif-count').textContent = unread + ' unread';
    document.getElementById('notif-list').innerHTML = allNotifs.map(n =>
      `<div class="notif-item"><div class="notif-dot ${n.read ? 'read' : ''}"></div><div class="notif-text"><p>${n.text}</p><span>${n.time}</span></div></div>`
    ).join('');

    startNotifPolling(p);

    document.getElementById('history-count').textContent = p.history.length + ' visit' + (p.history.length !== 1 ? 's' : '');
    const icons = { 'Cleaning': '🦷', 'Filling': '🔩', 'Consultation': '📋', 'Extraction': '⚙️', 'Root Canal': '🔬', 'Veneers': '✨', 'Whitening': '⭐' };
    document.getElementById('history-timeline').innerHTML = p.history.length
      ? p.history.map(h => `
          <div class="tl-item">
            <div class="tl-dot">${icons[h.procedure] || '🦷'}</div>
            <div class="tl-card">
              <div class="tl-card-top">
                <span class="procedure-tag">${h.procedure}</span>
                <span class="tl-date">${h.date}</span>
              </div>
              <div style="font-size:13px;color:var(--cream);font-weight:500;margin-bottom:.25rem;">${h.dentist}</div>
              <div class="tl-note">${h.notes}</div>
            </div>
          </div>`).join('')
      : '<p style="font-size:13px;color:var(--teal);">No treatment history yet. Your visits will appear here.</p>';

    buildDateGrid();
  }

  // ── NOTIFICATION POLLING ──────────────────────────────────

  function startNotifPolling(p) {
    if (notifPollInterval) clearInterval(notifPollInterval);
    const notifKey  = 'dentayos_notifications_' + p.username.toLowerCase().replace(/\s+/g, '.');
    let lastCount   = JSON.parse(localStorage.getItem(notifKey) || '[]').length;

    notifPollInterval = setInterval(() => {
      if (!currentPatient) { clearInterval(notifPollInterval); return; }
      const stored = JSON.parse(localStorage.getItem(notifKey) || '[]');
      if (stored.length !== lastCount) {
        lastCount = stored.length;
        const allNotifs = [...stored, ...p.notifications];
        const unread    = allNotifs.filter(n => !n.read).length;
        document.getElementById('notif-count').textContent = unread + ' unread';
        document.getElementById('notif-list').innerHTML = allNotifs.map(n =>
          `<div class="notif-item"><div class="notif-dot ${n.read ? 'read' : ''}"></div><div class="notif-text"><p>${n.text}</p><span>${n.time}</span></div></div>`
        ).join('');
        const countEl = document.getElementById('notif-count');
        countEl.style.color = 'var(--gold)';
        setTimeout(() => { countEl.style.color = ''; }, 2000);
      }
    }, 2000);
  }

  // ── CALENDAR ──────────────────────────────────────────────

  function buildDateGrid() {
    const grid      = document.getElementById('date-grid');
    grid.innerHTML  = '';
    const startDay  = 0;   // March 1, 2026 is Sunday
    const totalDays = 31;
    const today     = 17;  // March 17, 2026

    for (let e = 0; e < startDay; e++) {
      const empty = document.createElement('div');
      empty.className = 'date-cell empty';
      grid.appendChild(empty);
    }

    for (let i = 1; i <= totalDays; i++) {
      const d       = document.createElement('div');
      const isPast  = i < today;
      const isToday = i === today;
      d.className   = 'date-cell' + (isPast ? ' past' : '') + (isToday ? ' today' : '');
      d.textContent = i;
      if (!isPast) d.addEventListener('click', function () { selectDate(this); });
      grid.appendChild(d);
    }
  }

  function updateBookingSummary() {
    const date    = document.querySelector('.date-cell.selected');
    const time    = document.querySelector('.time-slot.selected');
    const concern = document.querySelector('.concern-select') ? document.querySelector('.concern-select').value : '';
    const box     = document.getElementById('booking-summary');
    if (!box) return;
    if (date && time) {
      box.style.display = 'block';
      box.innerHTML = `<span style="color:var(--cream);">📅 March ${date.textContent.trim()}, 2026 &nbsp;·&nbsp; ${time.textContent}</span>${concern ? ` &nbsp;·&nbsp; <span style="color:var(--gold);">${concern}</span>` : ''}`;
    } else if (date) {
      box.style.display = 'block';
      box.innerHTML = `<span style="color:var(--cream);">📅 March ${date.textContent.trim()}, 2026</span> &nbsp;·&nbsp; <span style="color:var(--teal);">Select a time slot</span>`;
    } else {
      box.style.display = 'none';
    }
  }

  function selectDate(el) {
    document.querySelectorAll('.date-cell').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    updateBookingSummary();
  }

  // ── TIME SLOTS ────────────────────────────────────────────

  function selectTime(el) {
    document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');
    updateBookingSummary();
  }

  // Attach listeners to available (non-taken) time slots
  document.querySelectorAll('.time-slot:not(.taken)').forEach(slot => {
    slot.addEventListener('click', function () { selectTime(this); });
  });

  // ── BOOKING ───────────────────────────────────────────────

  function bookAppointment() {
    const date    = document.querySelector('.date-cell.selected');
    const time    = document.querySelector('.time-slot.selected');
    const concern = document.querySelector('.concern-select').value;
    if (!date || !time) { showToast('Please select a date and time.'); return; }

    const appt = {
      patient:  currentPatient.name,
      username: currentPatient.username,
      concern,
      date:     'March ' + date.textContent.trim() + ', 2026',
      time:     time.textContent,
      status:   'pending',
      bookedAt: new Date().toLocaleString('en-PH')
    };

    const existing = JSON.parse(localStorage.getItem('dentayos_appointments') || '[]');
    existing.push(appt);
    localStorage.setItem('dentayos_appointments', JSON.stringify(existing));

    document.querySelectorAll('.date-cell').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
    document.getElementById('booking-summary').style.display = 'none';

    showToast('✓ Appointment booked for ' + appt.date + ' at ' + appt.time + '. ' + currentPatient.dentist + ' will confirm shortly.');
  }

  // ── TOAST ─────────────────────────────────────────────────

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
  }

  // ── BACK TO TOP ───────────────────────────────────────────

  window.addEventListener('scroll', function () {
    const btn = document.getElementById('back-to-top');
    if (btn) btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });

  // ── EVENT LISTENERS ───────────────────────────────────────

  // Login screen
  document.getElementById('login-user').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
  document.getElementById('login-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
  document.getElementById('pw-toggle').addEventListener('click', togglePw);
  document.getElementById('login-btn').addEventListener('click', doLogin);
  document.getElementById('btn-goto-website-login').addEventListener('click', goToWebsite);
  document.getElementById('btn-show-signup').addEventListener('click', showSignup);

  // Signup screen
  document.getElementById('signup-pw-toggle').addEventListener('click', toggleSignupPw);
  document.getElementById('signup-btn').addEventListener('click', doSignup);
  document.getElementById('btn-goto-website-signup').addEventListener('click', goToWebsite);
  document.getElementById('btn-back-to-login').addEventListener('click', showLogin);

  // Portal nav
  document.getElementById('logout-btn').addEventListener('click', doLogout);

  // Booking
  document.getElementById('book-btn').addEventListener('click', bookAppointment);

  // Back to top
  document.getElementById('back-to-top').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
