/* =============================================================
   DentAyos — Clinic Portal JavaScript
   js/clinic.js
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ── DATA ──────────────────────────────────────────────────

  const patients = [
    { name: 'Maria Santos', age: 32, concern: 'Dental Cleaning', lastVisit: 'Mar 1, 2026', next: 'Mar 17, 2026', status: 'active', note: 'Routine cleaning. Mild tartar buildup on lower molars. Advised to floss daily. Next cleaning in 3 months.' },
    { name: 'Jose Dela Cruz', age: 45, concern: 'Braces Consultation', lastVisit: 'Feb 20, 2026', next: 'Mar 20, 2026', status: 'pending', note: 'Initial braces consultation. Mild crowding on upper arch. X-rays taken. Treatment plan: 18-month braces. Awaiting confirmation.' },
    { name: 'Ana Reyes', age: 28, concern: 'Veneers', lastVisit: 'Mar 5, 2026', next: 'Mar 22, 2026', status: 'active', note: 'Veneer consultation completed. 4 upper front teeth. Shade selected: BL2. Temporaries placed. Final fitting on Mar 22.' },
    { name: 'Carlos Mendoza', age: 37, concern: 'Tooth Extraction', lastVisit: 'Feb 10, 2026', next: 'Mar 18, 2026', status: 'pending', note: 'Lower right molar (#47) extracted Feb 10. Healing well. Follow-up scheduled to assess socket closure.' },
    { name: 'Liza Garcia', age: 24, concern: 'Whitening', lastVisit: '—', next: 'Mar 19, 2026', status: 'new', note: 'New patient. Walk-in whitening inquiry. Pre-whitening check required. No prior dental history on file.' },
    { name: 'Ramon Villanueva', age: 52, concern: 'Root Canal', lastVisit: 'Jan 28, 2026', next: 'Mar 21, 2026', status: 'active', note: 'Root canal treatment in progress on upper left molar (#26). Session 2 of 3. No acute pain. Crown placement planned after session 3.' },
  ];

  const appointments = [
    { hour: '9', ampm: 'AM', name: 'Maria Santos', concern: 'Dental Cleaning', type: 'Cleaning' },
    { hour: '10', ampm: 'AM', name: 'Carlos Mendoza', concern: 'Post-extraction checkup', type: 'Checkup' },
    { hour: '11', ampm: 'AM', name: 'Liza Garcia', concern: 'Whitening session 1', type: 'Aesthetic' },
    { hour: '2', ampm: 'PM', name: 'Ana Reyes', concern: 'Veneer fitting', type: 'Aesthetic' },
    { hour: '4', ampm: 'PM', name: 'Ramon Villanueva', concern: 'Root canal session 2', type: 'Procedure' },
  ];

  const reminders = [
    { name: 'Maria Santos', msg: 'Reminder: Dental cleaning tomorrow at 9AM.', time: 'Mar 15, 2026 · 6:00 PM' },
    { name: 'Carlos Mendoza', msg: 'Reminder: Post-extraction checkup tomorrow at 10AM.', time: 'Mar 15, 2026 · 6:00 PM' },
    { name: 'Liza Garcia', msg: 'Reminder: Your whitening session is tomorrow at 11AM.', time: 'Mar 15, 2026 · 6:00 PM' },
    { name: 'Ana Reyes', msg: 'Reminder: Veneer fitting tomorrow at 2PM.', time: 'Mar 15, 2026 · 6:00 PM' },
    { name: 'Ramon Villanueva', msg: 'Reminder: Root canal session 2 tomorrow at 4PM.', time: 'Mar 15, 2026 · 6:00 PM' },
    { name: 'Jose Dela Cruz', msg: 'Reminder: Braces consultation on Mar 17 at 9AM.', time: 'Mar 14, 2026 · 6:00 PM' },
  ];

  const staffAccounts = [
    { username: 'dr.reyes', password: 'reyes2026', name: 'Dr. Maria Reyes', role: 'Dentist', initials: 'MR' },
    { username: 'admin', password: 'admin2026', name: 'Ana Santos', role: 'Clinic Admin', initials: 'AS' },
    { username: 'receptionist', password: 'recep2026', name: 'Lorna Cruz', role: 'Receptionist', initials: 'LC' },
    { username: 'assistant', password: 'asst2026', name: 'Carlo Bautista', role: 'Clinic Assistant', initials: 'CB' },
  ];

  const patientUsernameMap = {
    'Maria Santos': 'maria.santos',
    'Jose Dela Cruz': 'jose.delacruz',
    'Ana Reyes': 'ana.reyes',
  };

  // ── PATIENT TABLE RENDER ──────────────────────────────────

  function patientRow(p, extra) {
    const statusLabel = p.status === 'active' ? 'Active' : p.status === 'pending' ? 'Pending' : 'New';
    const safeJSON = JSON.stringify(p).replace(/'/g, '&#39;');
    return `<tr>
      <td><div class="patient-name">${p.name}</div><div class="patient-meta">${p.concern}</div></td>
      ${extra ? `<td>${p.age}</td><td>${p.concern}</td>` : ''}
      <td>${p.lastVisit}</td>
      <td>${p.next}</td>
      <td><span class="status-badge ${p.status}">${statusLabel}</span></td>
      <td style="display:flex;gap:8px;">
        <button class="action-btn btn-view-patient" data-patient='${safeJSON}'>View</button>
        <button class="action-btn remind btn-remind-patient" data-name="${p.name}" data-next="${p.next}">Remind</button>
      </td>
    </tr>`;
  }

  const tbody = document.getElementById('patient-tbody');
  const tbodyFull = document.getElementById('patient-tbody-full');
  patients.forEach(p => {
    tbody.innerHTML += patientRow(p, false);
    tbodyFull.innerHTML += patientRow(p, true);
  });

  function updatePatientCount() {
    const count = patients.length;
    document.querySelectorAll('.patient-count').forEach(el => el.textContent = count + ' total');
    const statEl = document.getElementById('dash-stat-patients');
    if (statEl) statEl.textContent = count;
  }
  updatePatientCount();

  // ── APPOINTMENTS & REMINDERS RENDER ──────────────────────

  ['appt-list', 'appt-list-full'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    appointments.forEach(a => {
      el.innerHTML += `<div class="appt-item">
        <div class="appt-time"><div class="hour">${a.hour}</div><div class="ampm">${a.ampm}</div></div>
        <div class="appt-divider"></div>
        <div class="appt-info"><h4>${a.name}</h4><p>${a.concern}</p></div>
        <div class="appt-type">${a.type}</div>
      </div>`;
    });
  });

  const reminderList = document.getElementById('reminder-list');
  reminders.slice(0, 5).forEach(r => {
    reminderList.innerHTML += `<div class="reminder-item">
      <div class="reminder-info"><p>${r.name}</p><span>${r.time}</span></div>
      <span class="sent-badge">Sent</span>
    </div>`;
  });

  const reminderTbody = document.getElementById('reminder-tbody');
  reminders.forEach(r => {
    reminderTbody.innerHTML += `<tr>
      <td><div class="patient-name">${r.name}</div></td>
      <td style="max-width:340px;font-size:12px;color:var(--teal);">${r.msg}</td>
      <td style="font-size:12px;color:var(--teal);">${r.time}</td>
      <td><span class="sent-badge">Sent</span></td>
    </tr>`;
  });

  // ── DATE ──────────────────────────────────────────────────

  const dateStr = new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  ['today-date', 'today-date-p', 'today-date-a'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = dateStr;
  });

  // ── LOGIN / LOGOUT ────────────────────────────────────────

  function togglePassword() {
    const pw = document.getElementById('login-password');
    const btn = document.getElementById('toggle-pw-btn');
    pw.type = pw.type === 'password' ? 'text' : 'password';
    btn.textContent = pw.type === 'password' ? 'Show' : 'Hide';
  }

  function doLogin() {
    const username = document.getElementById('login-name').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    if (!username) { errorEl.textContent = 'Please enter your username.'; errorEl.style.display = 'block'; return; }
    if (!password) { errorEl.textContent = 'Please enter your password.'; errorEl.style.display = 'block'; return; }
    const account = staffAccounts.find(a => a.username === username && a.password === password);
    if (!account) { errorEl.textContent = 'Incorrect username or password. Please try again.'; errorEl.style.display = 'block'; return; }
    errorEl.style.display = 'none';
    document.getElementById('staff-avatar').textContent = account.initials;
    document.getElementById('staff-name').textContent = account.name;
    document.getElementById('staff-role').textContent = account.role;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const firstName = account.name.replace(/^Dr\.?\s*/i, '').split(' ')[0];
    document.getElementById('dashboard-greeting').textContent = greeting + ', ' + firstName + '. 🦷';
    document.getElementById('login-screen').style.display = 'none';
    showSection('dashboard');
    loadBookedAppointments();
  }

  function doLogout() {
    document.getElementById('login-name').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').style.display = 'none';
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
    const main = document.getElementById('main');
    const toggle = document.getElementById('sidebar-toggle');
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');
    toggle.classList.toggle('collapsed');
    toggle.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✕';
  }

  // ── SECTION SWITCHING ─────────────────────────────────────

  const sections = ['dashboard', 'patients', 'appointments', 'reminders'];

  function showSection(name) {
    sections.forEach(s => {
      document.getElementById('section-' + s).style.display = s === name ? 'block' : 'none';
      const nav = document.getElementById('nav-' + s);
      if (nav) nav.classList.toggle('active', s === name);
    });
    if (name === 'appointments') loadBookedAppointments();
    window.scrollTo(0, 0);
  }

  // ── BOOKED APPOINTMENTS ───────────────────────────────────

  function loadBookedAppointments() {
    const booked = JSON.parse(localStorage.getItem('dentayos_appointments') || '[]');
    const confirmed = JSON.parse(localStorage.getItem('dentayos_confirmed') || '[]');
    const tbl = document.getElementById('booked-tbody');
    const count = document.getElementById('booked-count');

    const upcomingList = document.getElementById('upcoming-list');
    upcomingList.querySelectorAll('.confirmed-item').forEach(el => el.remove());
    confirmed.forEach(appt => {
      const hour = appt.time.split(':')[0] || '—';
      const ampm = appt.time.includes('PM') ? 'PM' : 'AM';
      const div = document.createElement('div');
      div.className = 'appt-item confirmed-item';
      div.style.borderColor = 'rgba(29,158,117,0.3)';
      div.innerHTML = `
        <div class="appt-time"><div class="hour" style="color:#1D9E75;">${hour}</div><div class="ampm">${ampm}</div></div>
        <div class="appt-divider"></div>
        <div class="appt-info"><h4>${appt.patient}</h4><p>${appt.concern} · ${appt.date}</p></div>
        <div class="appt-type" style="color:#1D9E75;border-color:rgba(29,158,117,0.3);">Confirmed</div>`;
      upcomingList.appendChild(div);
    });
    document.getElementById('upcoming-count').textContent = (5 + confirmed.length) + ' total';

    if (!booked.length) {
      tbl.innerHTML = '<tr><td colspan="7" style="color:var(--teal);font-size:13px;padding:1rem 0;">No patient-booked appointments yet.</td></tr>';
      count.textContent = '0 pending';
      return;
    }
    count.textContent = booked.length + ' pending';
    tbl.innerHTML = booked.map((a, i) => `
      <tr>
        <td><div class="patient-name">${a.patient}</div></td>
        <td style="font-size:12px;color:var(--teal);">${a.concern}</td>
        <td style="font-size:12px;">${a.date}</td>
        <td style="font-size:12px;">${a.time}</td>
        <td style="font-size:11px;color:var(--teal);">${a.bookedAt}</td>
        <td><span class="status-badge pending">Pending</span></td>
        <td style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="action-btn remind btn-confirm-appt"  data-index="${i}">Confirm</button>
          <button class="action-btn btn-reschedule-appt"      data-index="${i}">Reschedule</button>
          <button class="action-btn btn-decline-appt"         data-index="${i}">Decline</button>
        </td>
      </tr>`).join('');
  }

  function confirmAppt(i) {
    const booked = JSON.parse(localStorage.getItem('dentayos_appointments') || '[]');
    const appt = booked[i];
    booked.splice(i, 1);
    localStorage.setItem('dentayos_appointments', JSON.stringify(booked));
    const confirmed = JSON.parse(localStorage.getItem('dentayos_confirmed') || '[]');
    confirmed.push(appt);
    localStorage.setItem('dentayos_confirmed', JSON.stringify(confirmed));
    const upcomingList = document.getElementById('upcoming-list');
    const hour = appt.time.split(':')[0] || '—';
    const ampm = appt.time.includes('PM') ? 'PM' : 'AM';
    upcomingList.innerHTML += `
      <div class="appt-item" style="border-color:rgba(29,158,117,0.3);">
        <div class="appt-time"><div class="hour" style="color:#1D9E75;">${hour}</div><div class="ampm">${ampm}</div></div>
        <div class="appt-divider"></div>
        <div class="appt-info"><h4>${appt.patient}</h4><p>${appt.concern} · ${appt.date}</p></div>
        <div class="appt-type" style="color:#1D9E75;border-color:rgba(29,158,117,0.3);">Confirmed</div>
      </div>`;
    const countEl = document.getElementById('upcoming-count');
    countEl.textContent = (parseInt(countEl.textContent) || 5) + 1 + ' total';
    loadBookedAppointments();
    showToast('Appointment confirmed and added to upcoming.');
  }

  function declineAppt(i) {
    const booked = JSON.parse(localStorage.getItem('dentayos_appointments') || '[]');
    booked.splice(i, 1);
    localStorage.setItem('dentayos_appointments', JSON.stringify(booked));
    loadBookedAppointments();
    showToast('Appointment declined.');
  }

  let rescheduleApptData = null;

  function rescheduleAppt(i) {
    const booked = JSON.parse(localStorage.getItem('dentayos_appointments') || '[]');
    const appt = booked[i];
    if (!appt) { showToast('Could not find appointment. Please refresh.'); return; }
    rescheduleApptData = { ...appt, index: i };
    document.getElementById('reschedule-patient-name').textContent =
      'Proposing new schedule for ' + appt.patient + ' — original: ' + appt.date + ' at ' + appt.time + '.';
    document.getElementById('reschedule-date').value = '';
    document.getElementById('reschedule-reason').value = '';
    openModal('reschedule');
  }

  function confirmReschedule() {
    const newDate = document.getElementById('reschedule-date').value.trim();
    const newTime = document.getElementById('reschedule-time').value;
    const reason = document.getElementById('reschedule-reason').value.trim();
    if (!newDate) { showToast('Please enter a new date.'); return; }
    if (!rescheduleApptData) { showToast('No appointment selected.'); return; }
    const appt = rescheduleApptData;
    const patientName = appt.patient;
    const originalDate = appt.date;
    const originalTime = appt.time;
    const booked = JSON.parse(localStorage.getItem('dentayos_appointments') || '[]');
    const idx = booked.findIndex(b => b.patient === patientName && b.date === originalDate && b.time === originalTime);
    if (idx !== -1) { booked.splice(idx, 1); localStorage.setItem('dentayos_appointments', JSON.stringify(booked)); }
    const username = appt.username || patientUsernameMap[patientName] || patientName.toLowerCase().replace(/\s+/g, '.');
    const notifKey = 'dentayos_notifications_' + username;
    const notifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
    notifs.unshift({
      read: false,
      text: 'Reschedule notice: Your appointment on ' + originalDate + ' at ' + originalTime +
        ' has been moved to ' + newDate + ' at ' + newTime + '.' +
        (reason ? ' Reason: ' + reason + '.' : '') + ' Please confirm by contacting the clinic.',
      time: new Date().toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem(notifKey, JSON.stringify(notifs));
    rescheduleApptData = null;
    closeModal('reschedule');
    loadBookedAppointments();
    showToast('Reschedule request sent to patient.');
  }

  // ── MODALS ────────────────────────────────────────────────

  function openModal(id) { document.getElementById('modal-' + id).classList.add('open'); }
  function closeModal(id) { document.getElementById('modal-' + id).classList.remove('open'); }

  let viewingPatient = null;

  function openView(p) {
    viewingPatient = p;
    const statusLabel = p.status === 'active' ? 'Active' : p.status === 'pending' ? 'Pending' : 'New';
    document.getElementById('view-patient-name').textContent = p.name;
    document.getElementById('view-patient-concern').textContent = p.concern;
    document.getElementById('view-age').textContent = p.age + ' years old';
    document.getElementById('view-status').textContent = statusLabel;
    document.getElementById('view-last').textContent = p.lastVisit;
    document.getElementById('view-next').textContent = p.next;
    document.getElementById('view-clinical-note').textContent = p.note || 'No clinical notes on file.';
    openModal('view-patient');
  }

  function openRemindFromView() {
    if (!viewingPatient) return;
    closeModal('view-patient');
    openRemind(viewingPatient.name, viewingPatient.next);
  }

  function openRemind(name, date) {
    document.getElementById('remind-patient-name').textContent = 'Sending reminder to ' + name + '.';
    document.getElementById('remind-message').value =
      'Hi ' + name.split(' ')[0] + '! This is a reminder from DentAyos Clinic. Your appointment is on ' +
      date + '. Please confirm or reply to reschedule. Thank you!';
    openModal('remind');
  }

  function savePatient() {
    const inputs = document.querySelectorAll('#modal-add-patient input, #modal-add-patient select, #modal-add-patient textarea');
    const firstName = inputs[0].value.trim();
    const lastName = inputs[1].value.trim();
    const age = inputs[2].value.trim();
    const concern = inputs[4].value;
    if (!firstName || !lastName) { showToast('Please enter the patient name.'); return; }
    const name = firstName + ' ' + lastName;
    const newPatient = { name, age: age || '—', concern, lastVisit: '—', next: 'TBD', status: 'new' };
    patients.push(newPatient);
    document.getElementById('patient-tbody').innerHTML += patientRow(newPatient, false);
    document.getElementById('patient-tbody-full').innerHTML += patientRow(newPatient, true);
    inputs.forEach(i => { if (i.tagName !== 'SELECT') i.value = ''; });
    closeModal('add-patient');
    updatePatientCount();
    showToast(name + ' added to patient records.');
  }

  function sendReminder() {
    closeModal('remind');
    showToast('Reminder sent successfully.');
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

  // ── STATIC EVENT LISTENERS ────────────────────────────────

  document.getElementById('login-name').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('toggle-pw-btn').addEventListener('click', togglePassword);
  document.getElementById('login-btn').addEventListener('click', doLogin);
  document.getElementById('back-to-website-link').addEventListener('click', () => window.location.replace('index.html?ts=' + Date.now()));

  document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
  sections.forEach(s => {
    const el = document.getElementById('nav-' + s);
    if (el) el.addEventListener('click', () => showSection(s));
  });
  document.getElementById('btn-website').addEventListener('click', goToWebsite);
  document.getElementById('btn-logout').addEventListener('click', doLogout);

  document.getElementById('btn-add-patient-dash').addEventListener('click', () => openModal('add-patient'));
  document.getElementById('btn-add-patient-patients').addEventListener('click', () => openModal('add-patient'));
  document.getElementById('btn-send-reminder-all').addEventListener('click', () => openModal('remind-all'));

  document.getElementById('btn-close-add-patient').addEventListener('click', () => closeModal('add-patient'));
  document.getElementById('btn-cancel-add-patient').addEventListener('click', () => closeModal('add-patient'));
  document.getElementById('btn-save-add-patient').addEventListener('click', savePatient);

  document.getElementById('btn-close-remind').addEventListener('click', () => closeModal('remind'));
  document.getElementById('btn-cancel-remind').addEventListener('click', () => closeModal('remind'));
  document.getElementById('btn-send-reminder').addEventListener('click', sendReminder);

  document.getElementById('btn-close-view-patient').addEventListener('click', () => closeModal('view-patient'));
  document.getElementById('btn-close-view-patient-footer').addEventListener('click', () => closeModal('view-patient'));
  document.getElementById('btn-remind-from-view').addEventListener('click', openRemindFromView);

  document.getElementById('btn-close-reschedule').addEventListener('click', () => closeModal('reschedule'));
  document.getElementById('btn-cancel-reschedule').addEventListener('click', () => closeModal('reschedule'));
  document.getElementById('btn-confirm-reschedule').addEventListener('click', confirmReschedule);

  document.getElementById('back-to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── EVENT DELEGATION — patient tables (View / Remind) ────

  function handlePatientTableClick(e) {
    const viewBtn = e.target.closest('.btn-view-patient');
    const remindBtn = e.target.closest('.btn-remind-patient');
    if (viewBtn) openView(JSON.parse(viewBtn.dataset.patient.replace(/&#39;/g, "'")));
    if (remindBtn) openRemind(remindBtn.dataset.name, remindBtn.dataset.next);
  }
  document.getElementById('patient-tbody').addEventListener('click', handlePatientTableClick);
  document.getElementById('patient-tbody-full').addEventListener('click', handlePatientTableClick);

  // ── EVENT DELEGATION — booked appointments ───────────────

  document.getElementById('booked-tbody').addEventListener('click', function (e) {
    const confirmBtn = e.target.closest('.btn-confirm-appt');
    const rescheduleBtn = e.target.closest('.btn-reschedule-appt');
    const declineBtn = e.target.closest('.btn-decline-appt');
    if (confirmBtn) confirmAppt(parseInt(confirmBtn.dataset.index));
    if (rescheduleBtn) rescheduleAppt(parseInt(rescheduleBtn.dataset.index));
    if (declineBtn) declineAppt(parseInt(declineBtn.dataset.index));
  });

});
