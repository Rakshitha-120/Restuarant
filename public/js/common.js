// Shared helper functions used by all pages

async function api(url, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

function showMsg(id, text, type = 'ok') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'msg ' + type;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function formatTime(t) { // "19:00:00" -> "7:00 PM"
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ap}`;
}

// Build the navbar and show Login/Logout properly
async function loadNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let me = { customer: null, isStaff: false };
  try { me = await api('/api/auth/me'); } catch (e) {}
  let links = '<a href="/">Home</a><a href="/book.html">Book a Table</a>';
  if (me.customer) {
    links += `<a href="/my-reservations.html">My Reservations</a><a href="#" id="logoutBtn">Logout (${escapeHtml(me.customer.name)})</a>`;
  } else if (me.isStaff) {
    links += '<a href="/admin.html">Staff Panel</a><a href="#" id="logoutBtn">Staff Logout</a>';
  } else {
    links += '<a href="/login.html">Login</a><a href="/register.html">Register</a><a href="/admin.html">Staff</a>';
  }
  nav.innerHTML = `<span class="logo">🍽️ Spice Garden</span><div>${links}</div>`;
  const out = document.getElementById('logoutBtn');
  if (out) out.addEventListener('click', async e => {
    e.preventDefault();
    await api('/api/auth/logout', 'POST');
    window.location.href = '/';
  });
  return me;
}
