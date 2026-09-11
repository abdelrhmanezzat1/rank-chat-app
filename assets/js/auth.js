let mode = 'login';

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    mode = tab.dataset.mode;
    document.getElementById('auth-submit').textContent = mode === 'login' ? 'دخول' : 'إنشاء الحساب';
    document.getElementById('auth-error').textContent = '';
  });
});

document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorBox = document.getElementById('auth-error');
  errorBox.textContent = '';

  try {
    const res = await fetch(`api/${mode === 'login' ? 'login' : 'register'}.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) { errorBox.textContent = data.error || 'حصل خطأ'; return; }
    window.location.href = 'app.php';
  } catch (err) {
    errorBox.textContent = 'تعذر الاتصال بالسيرفر';
  }
});
