
const search_btn = document.getElementById('searchBtn');
const search_input = document.getElementById('searchInput');
const cartCount = document.getElementById('count');

search_btn.addEventListener('click', function(){
search_input.style.display = "flex";
search_btn.style.backgroundColor = 'rgb(10, 172, 10)';
search_btn.style.padding = '4px';
search_btn.style.borderRadius = '4px';
search_input.style.transform = 'translateX(-10px)';
});

 const ADMIN_KEY = 'AGRICOM2025';
  let otpCode = '';
  let resetEmail = '';
  let users = JSON.parse(localStorage.getItem('agricom_admins') || '{}');
 
  function saveUsers() {
    localStorage.setItem('agricom_admins', JSON.stringify(users));
  }
 
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    clearAlerts();
  }
 
  function clearAlerts() {
    document.querySelectorAll('.alert').forEach(a => a.classList.remove('show'));
    document.querySelectorAll('.field-error').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('input').forEach(i => i.classList.remove('error'));
  }
 
  function showAlert(id, msg) {
    const el = document.getElementById(id);
    const msgEl = document.getElementById(id + '-msg');
    if (msgEl && msg) msgEl.textContent = msg;
    if (el) el.classList.add('show');
  }
 
  function fieldError(id, errId) {
    const field = document.getElementById(id);
    const err   = document.getElementById(errId);
    if (field) field.classList.add('error');
    if (err)   err.classList.add('show');
  }
 
  function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = 'Hide';
    } else {
      input.type = 'password';
      btn.textContent = 'Show';
    }
  }
 
  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }
 
  function checkStrength(pw) {
    const wrap  = document.getElementById('pw-strength-wrap') || document.getElementById('pw-strength-wrap2');
    const fill  = document.getElementById('strength-fill')    || document.getElementById('strength-fill2');
    const label = document.getElementById('strength-label')   || document.getElementById('strength-label2');
 
    if (!fill || !label) return;
    const w1 = document.getElementById('pw-strength-wrap');
    const w2 = document.getElementById('pw-strength-wrap2');
 
    let score = 0;
    if (pw.length >= 8)              score++;
    if (/[A-Z]/.test(pw))            score++;
    if (/[0-9]/.test(pw))            score++;
    if (/[^A-Za-z0-9]/.test(pw))     score++;
 
    const colors = ['#e24b4a','#ef9f27','#639922','#27500A'];
    const labels = ['Weak','Fair','Good','Strong'];
    const widths = ['25%','50%','75%','100%'];
 
    const idx = Math.max(0, score - 1);
    const activeScore = pw.length > 0 ? score : 0;
 
    [w1, w2].forEach(w => { if (w) w.classList.toggle('show', pw.length > 0); });
 
    const f1 = document.getElementById('strength-fill');
    const f2 = document.getElementById('strength-fill2');
    const l1 = document.getElementById('strength-label');
    const l2 = document.getElementById('strength-label2');
 
    [f1, f2].forEach(f => { if (f && pw.length > 0) { f.style.width = widths[idx]; f.style.background = colors[idx]; } else if (f) { f.style.width = '0'; } });
    [l1, l2].forEach(l => { if (l && pw.length > 0) l.textContent = 'Strength: ' + labels[idx]; else if (l) l.textContent = ''; });
  }
 
function handleLogin() {
  clearAlerts();
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-pw').value;
  let valid = true;

  if (!isValidEmail(email)) { fieldError('login-email','login-email-err'); valid = false; }
  if (!pw) { fieldError('login-pw','login-pw-err'); valid = false; }
  if (!valid) return;

  const user = users[email.toLowerCase()];
  if (!user || user.password !== pw) {
    showAlert('login-alert', 'Incorrect email or password.');
    return;
  }

  persistLogin(user);
  launchDashboard(user.name);
}
 
  function handleRegister() {
    clearAlerts();
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pw    = document.getElementById('reg-pw').value;
    const pw2   = document.getElementById('reg-pw2').value;
    const key   = document.getElementById('reg-key').value.trim();
    let valid = true;
 
    if (!name)                { fieldError('reg-name','reg-name-err'); valid = false; }
    if (!isValidEmail(email)) { fieldError('reg-email','reg-email-err'); valid = false; }
    if (pw.length < 8)        { fieldError('reg-pw','reg-pw-err'); valid = false; }
    if (pw !== pw2)           { fieldError('reg-pw2','reg-pw2-err'); valid = false; }
    if (key !== ADMIN_KEY)    { fieldError('reg-key','reg-key-err'); valid = false; }
    if (!valid) return;
 
    if (users[email.toLowerCase()]) {
      showAlert('reg-alert', 'This email is already registered.');
      return;
    }
 
    users[email.toLowerCase()] = { name, email, password: pw };
    saveUsers();
    launchDashboard(name);
  }
 
  function handleForgotStep1() {
    clearAlerts();
    const email = document.getElementById('forgot-email').value.trim();
    if (!isValidEmail(email)) { fieldError('forgot-email','forgot-email-err'); return; }
 
    if (!users[email.toLowerCase()]) {
      showAlert('forgot-alert', 'No account found with this email.');
      return;
    }
 
    resetEmail = email.toLowerCase();
    otpCode = String(Math.floor(100000 + Math.random() * 900000));
    document.getElementById('otp-display').textContent = otpCode;
    showScreen('screen-forgot2');
  }
 
  function handleForgotStep2() {
    clearAlerts();
    const entered = document.getElementById('otp-input').value.trim();
    if (entered !== otpCode) {
      fieldError('otp-input','otp-err');
      return;
    }
    showScreen('screen-forgot3');
  }
 
  function handleResetPassword() {
    clearAlerts();
    const pw  = document.getElementById('reset-pw').value;
    const pw2 = document.getElementById('reset-pw2').value;
    if (pw.length < 8) { fieldError('reset-pw','reset-pw-err'); return; }
    if (pw !== pw2)    { fieldError('reset-pw2','reset-pw2-err'); return; }
 
    users[resetEmail].password = pw;
    saveUsers();
    showScreen('screen-success');
  }
 
function launchDashboard(name) {
  // Login page → redirect to dashboard
  if (window.location.pathname.includes('login.html')) {
    persistLogin({name, email: 'admin@agricom.com'}); // Store for dashboard
    window.location.href = 'agricom-dashboard.html';
    return;
  }
  // Dashboard page - already redirected, just log
  console.log('✅ Dashboard launched for:', name);
}
 
  function handleLogout() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('authWrapper').style.display = 'flex';
    document.getElementById('login-email').value = '';
    document.getElementById('login-pw').value = '';
    showScreen('screen-login');
  }
 
// Pre-seed demo admin user if not exists
function seedDemoUser() {
  if (Object.keys(users).length === 0) {
    users['admin@agricom.com'] = {
      name: 'Admin User',
      email: 'admin@agricom.com',
      password: 'admin123'
    };
    saveUsers();
    console.log('Demo admin created: admin@agricom.com / admin123');
  }
}

// Check auth state
function checkAuth() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser && document.getElementById('dashboard')) {
    launchDashboard(JSON.parse(currentUser).name);
  }
}

// Persist login
function persistLogin(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Logout clears session
function fullLogout() {
  localStorage.removeItem('currentUser');
  handleLogout();
}

// Init
seedDemoUser();
checkAuth();

// Allow Enter key on login
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  const active = document.querySelector('.screen.active');
  if (!active) return;
  const id = active.id;
  if (id === 'screen-login')   handleLogin();
  if (id === 'screen-register') handleRegister();
  if (id === 'screen-forgot')  handleForgotStep1();
  if (id === 'screen-forgot2') handleForgotStep2();
  if (id === 'screen-forgot3') handleResetPassword();
});



const navLinks = document.querySelectorAll('.navlink_item');

navLinks.forEach(navLinks => {
navLinks.addEventListener('click', () =>{
    document.querySelector('.active').classList.remove('active');
navLinks.classList.add('active');
});
});

const signBtn = document.getElementById('sign_btn');
const signPopup = document.getElementById('sign_up_modal');
const close_pop = document.getElementById('close_popup');

signBtn.addEventListener('click', function(){
signPopup.style.display = "block";
});

close_pop.addEventListener('click', function(){
signPopup.style.display = "none";
});


var i = 0;
var time = 3000;
var images = [];

images[0] = 'assets/images/homebg1.jpg';
images[1] = 'assets/images/home3.jpg';
images[2] = 'assets/images/home2.jpg';

function changeImg(){
    document.slide.src = images[i];

    if(i < images.length - 1){
        i++;
    }else{
        i  = 0;
    }

    setTimeout("changeImg()", time);
}

window.onload = changeImg;


function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
  }


  document.querySelectorAll('.bottom-nav__item').forEach(link => {
    link.addEventListener('click', function () {
      document.querySelectorAll('.bottom-nav__item').forEach(item => item.classList.remove('active'));
      this.classList.add('active');
    });
  });
  