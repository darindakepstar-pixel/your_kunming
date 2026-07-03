// ======================================================
// app.js — экраны и логика
// ======================================================

/* ---------------- state ---------------- */
const S = {
  user: null,          // supabase user
  profile: null,       // profiles row
  places: [],          // все видимые места
  visits: new Set(),   // мои посещения
  cat: 'all',
  ints: new Set(),
  q: '',
  theme: 'dark',
  addFiles: []         // фото для нового места
};

const $ = s => document.querySelector(s);
const feed = $('#feed');

/* ---------------- helpers ---------------- */
function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function ratingOf(p) {
  if (!p.reviews?.length) return null;
  return (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length);
}
function stars(r) { const f = Math.round(r); return '★'.repeat(f) + '☆'.repeat(5 - f); }
function likedByMe(p) { return !!(S.user && p.likes?.some(l => l.user_id === S.user.id)); }
function bgOf(p) {
  if (p.place_photos?.length) return `<img src="${DB.photoUrl(p.place_photos[0].path)}" alt="" loading="lazy">`;
  return scenes[p.scene] || scenes.hills;
}
let toastTimer;
function toast(t) {
  const el = $('#toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
function needAuth() { if (S.user) return false; openSheet('auth'); return true; }

/* ---------------- sheets ---------------- */
const sheets = ['auth', 'add', 'profile', 'search'];
function openSheet(name) {
  sheets.forEach(n => $('#sh-' + n).classList.toggle('open', n === name));
  $('#scrim').classList.add('open');
  if (name === 'profile') renderProfile();
}
function closeSheets() {
  sheets.forEach(n => $('#sh-' + n).classList.remove('open'));
  $('#scrim').classList.remove('open');
}
$('#scrim').onclick = closeSheets;

/* ---------------- feed ---------------- */
function visiblePlaces() {
  return S.places.filter(p => {
    if (p.status !== 'published' &&
        !(S.user && p.author === S.user.id)) return false;
    if (S.cat !== 'all' && p.cat !== S.cat) return false;
    if (S.ints.size && ![...S.ints].some(i => (p.ints || []).includes(i))) return false;
    if (S.q) {
      const hay = (p.name + ' ' + p.note + ' ' + (p.ints || []).join(' ')).toLowerCase();
      if (!hay.includes(S.q)) return false;
    }
    return true;
  });
}

function renderFeed() {
  const list = visiblePlaces();
  const published = S.places.filter(p => p.status === 'published');
  $('#trackNum').textContent =
    [...S.visits].filter(id => published.some(p => p.id === id)).length + '/' + published.length;

  if (!list.length) {
    feed.innerHTML = `<div class="state"><div class="in">
      <h3>Пока пусто</h3>
      <p>Ничего не нашлось по этим фильтрам — попробуй другие или добавь место первым.</p>
    </div></div>`;
    return;
  }
  feed.innerHTML = list.map((p, i) => {
    const r = ratingOf(p), mine = S.user && p.author === S.user.id;
    return `
    <section class="slide" data-id="${p.id}">
      <div class="bg">${bgOf(p)}</div>
      <div class="fade"></div>
      <div class="card lg" data-open="${p.id}" role="button" tabindex="0" aria-label="Открыть: ${esc(p.name)}">
        <span class="cat-tag">${esc(p.cat)}${p.status === 'pending' && mine ? ' · на модерации' : ''}</span>
        <h2>${esc(p.name)}</h2>
        <div class="cn">${esc(p.cn)}</div>
        <p class="note">${esc(p.note)}</p>
        <div class="row">
          <button class="gbtn ${likedByMe(p) ? 'on' : ''}" data-like="${p.id}">${likedByMe(p) ? '♥' : '♡'} ${p.likes?.length || 0}</button>
          <button class="gbtn ${S.visits.has(p.id) ? 'on' : ''}" data-visit="${p.id}">${S.visits.has(p.id) ? '✓ был' : '○ отметить'}</button>
          <span class="gbtn" style="pointer-events:none"><span class="st">★</span> ${r ? r.toFixed(1) : '—'}</span>
          <button class="more" data-open="${p.id}" aria-label="Подробнее">→</button>
        </div>
      </div>
      ${i === 0 ? '<div class="swipe-hint">⌄</div>' : ''}
    </section>`;
  }).join('');
}

/* ---------------- detail ---------------- */
const detail = $('#detail');
let openId = null;

function openDetail(id) {
  const p = S.places.find(x => x.id === id);
  if (!p) return;
  openId = id;
  const r = ratingOf(p);
  const myReview = S.user && p.reviews?.find(x => x.user_id === S.user.id);
  $('#dHeroArt').innerHTML = bgOf(p);
  $('#dBody').innerHTML = `
    <div class="d-head lg">
      <span class="cat-tag">${esc(p.cat)}</span>
      <h2>${esc(p.name)}</h2>
      <div class="cn">${esc(p.cn)}</div>
      <div class="rating">${r ? stars(r) : '☆☆☆☆☆'}<span>${r ? r.toFixed(1) + ' · ' + p.reviews.length + ' оценок' : 'ещё нет оценок'}</span></div>
      <div class="d-actions">
        <button class="gbtn ${likedByMe(p) ? 'on' : ''}" data-like="${p.id}">${likedByMe(p) ? '♥' : '♡'} ${p.likes?.length || 0}</button>
        <button class="gbtn ${S.visits.has(p.id) ? 'on' : ''}" data-visit="${p.id}">${S.visits.has(p.id) ? '✓ я был здесь' : '○ отметить в трекере'}</button>
      </div>
    </div>
    ${p.place_photos?.length > 1 ? `
    <div class="d-sec lg"><h4>фото</h4><div class="gallery">
      ${p.place_photos.map(f => `<img src="${DB.photoUrl(f.path)}" alt="" loading="lazy">`).join('')}
    </div></div>` : ''}
    ${p.story ? `<div class="d-sec lg"><h4>от автора</h4><p class="story">${esc(p.story)}</p></div>` : ''}
    <div class="d-sec lg"><h4>практично</h4>
      <div class="prac">
        <div><b>адрес</b>${esc(p.addr) || '—'}</div><div><b>как добраться</b>${esc(p.metro) || '—'}</div>
        <div><b>когда идти</b>${esc(p.time_hint) || '—'}</div><div><b>деньги</b>${esc(p.price) || '—'}</div>
      </div>
    </div>
    ${p.ints?.length ? `<div class="d-sec lg"><h4>подойдёт, если любишь</h4>
      <div class="ints">${p.ints.map(i => '<span>' + esc(i) + '</span>').join('')}</div></div>` : ''}
    <div class="d-sec lg"><h4>отзывы · ${p.reviews?.length || 0}</h4>
      ${(p.reviews || []).map(rv => `
        <div class="rev"><b>${esc(rv.profiles?.name || 'читатель')}</b><span class="rst">${'★'.repeat(rv.rating)}</span>
        ${rv.body ? `<p>${esc(rv.body)}</p>` : ''}</div>`).join('')
        || '<div class="rev" style="color:var(--on-glass-muted)">Пока нет отзывов — будь первым.</div>'}
      <div class="rev-form">
        <div class="rate" id="rate">${[1,2,3,4,5].map(v =>
          `<span data-v="${v}" class="${myReview && v <= myReview.rating ? 'on' : ''}">★</span>`).join('')}</div>
        <div class="cmt-form">
          <input id="revBody" placeholder="${myReview ? 'Обновить отзыв…' : 'Поделиться впечатлением…'}"
                 value="${esc(myReview?.body || '')}" aria-label="Отзыв">
          <button class="send" id="revSend">→</button>
        </div>
      </div>
    </div>`;
  detail.classList.add('open');
  detail.scrollTop = 0;

  let newRating = myReview?.rating || 0;
  $('#rate').onclick = e => {
    const s = e.target.closest('span'); if (!s) return;
    newRating = +s.dataset.v;
    document.querySelectorAll('#rate span').forEach(x =>
      x.classList.toggle('on', +x.dataset.v <= newRating));
  };
  $('#revSend').onclick = async () => {
    if (needAuth()) return;
    if (!newRating) { toast('Поставь оценку звёздами'); return; }
    try {
      await DB.saveReview(p.id, S.user.id, newRating, $('#revBody').value.trim());
      toast('Отзыв сохранён ✓');
      await reload(); openDetail(p.id);
    } catch (err) { toast('Не получилось: ' + err.message); }
  };
}
$('#dClose').onclick = () => { detail.classList.remove('open'); openId = null; };

/* ---------------- клики по ленте/детальной ---------------- */
document.body.addEventListener('click', async e => {
  const like = e.target.closest('[data-like]'),
        visit = e.target.closest('[data-visit]'),
        open = e.target.closest('[data-open]');
  if (like) {
    e.stopPropagation();
    if (needAuth()) return;
    const id = +like.dataset.like, p = S.places.find(x => x.id === id);
    try {
      await DB.toggleLike(id, likedByMe(p), S.user.id);
      await reload(); if (openId) openDetail(openId);
    } catch (err) { toast('Ошибка: ' + err.message); }
    return;
  }
  if (visit) {
    e.stopPropagation();
    if (needAuth()) return;
    const id = +visit.dataset.visit;
    try {
      await DB.toggleVisit(id, S.visits.has(id), S.user.id);
      S.visits.has(id) ? S.visits.delete(id) : S.visits.add(id);
      toast(S.visits.has(id) ? 'Отмечено в трекере ✓' : 'Отметка снята');
      renderFeed(); if (openId) openDetail(openId);
    } catch (err) { toast('Ошибка: ' + err.message); }
    return;
  }
  if (open) openDetail(+open.dataset.open);
});
feed.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.dataset.open) openDetail(+e.target.dataset.open);
});

/* ---------------- фильтры / поиск ---------------- */
$('#chips').addEventListener('click', e => {
  const c = e.target.closest('.chip'); if (!c) return;
  document.querySelectorAll('#chips .chip').forEach(x => x.classList.remove('on'));
  c.classList.add('on'); S.cat = c.dataset.cat;
  renderFeed(); window.scrollTo(0, 0);
});
$('#searchBtn').onclick = () => openSheet('search');
$('#qInput').addEventListener('input', e => { S.q = e.target.value.trim().toLowerCase(); renderFeed(); });
$('#intChips').addEventListener('click', e => {
  const c = e.target.closest('.int'); if (!c) return;
  c.classList.toggle('on');
  const v = c.dataset.int;
  S.ints.has(v) ? S.ints.delete(v) : S.ints.add(v);
  renderFeed();
});
$('#searchDone').onclick = () => { closeSheets(); window.scrollTo(0, 0); };

/* ---------------- тема ---------------- */
$('#themeBtn').onclick = () => {
  S.theme = S.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', S.theme);
  $('#themeBtn').textContent = S.theme === 'dark' ? '☾' : '☀';
  localStorage.setItem('theme', S.theme);
};
(function initTheme() {
  const saved = localStorage.getItem('theme');
  S.theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', S.theme);
  $('#themeBtn').textContent = S.theme === 'dark' ? '☾' : '☀';
})();

/* ---------------- auth ---------------- */
let authMode = 'in';
$('#authTabs').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  authMode = b.dataset.mode;
  document.querySelectorAll('#authTabs button').forEach(x => x.classList.toggle('on', x === b));
  $('#nameField').style.display = authMode === 'up' ? 'block' : 'none';
  $('#authGo').textContent = authMode === 'up' ? 'Создать аккаунт' : 'Войти';
});
$('#authGo').onclick = async () => {
  const email = $('#authEmail').value.trim(), pass = $('#authPass').value;
  const errEl = $('#authErr'); errEl.style.display = 'none';
  if (!email || pass.length < 6) {
    errEl.textContent = 'Нужны email и пароль от 6 символов';
    errEl.style.display = 'block'; return;
  }
  try {
    if (authMode === 'up') {
      await DB.signUp(email, pass, $('#authName').value.trim() || email.split('@')[0]);
      toast('Аккаунт создан — добро пожаловать!');
    } else {
      await DB.signIn(email, pass);
      toast('С возвращением!');
    }
    closeSheets();
  } catch (err) {
    errEl.textContent = ({'Invalid login credentials': 'Неверный email или пароль'})[err.message] || err.message;
    errEl.style.display = 'block';
  }
};
$('#profileBtn').onclick = () => S.user ? openSheet('profile') : openSheet('auth');

DB.onAuth(async session => {
  S.user = session?.user || null;
  S.profile = S.user ? await DB.myProfile() : null;
  const b = $('#profileBtn');
  b.classList.toggle('in', !!S.user);
  b.textContent = S.user ? (S.profile?.name || 'Я')[0].toUpperCase() : '⚉';
  await reload();
});

/* ---------------- профиль + модерация ---------------- */
function renderProfile() {
  const published = S.places.filter(p => p.status === 'published');
  const mine = S.places.filter(p => S.user && p.author === S.user.id);
  const myReviews = S.places.reduce((n, p) =>
    n + (p.reviews?.some(r => r.user_id === S.user?.id) ? 1 : 0), 0);
  const pending = S.profile?.is_admin
    ? S.places.filter(p => p.status === 'pending') : [];

  $('#profBody').innerHTML = `
    <h3>${esc(S.profile?.name || 'Читатель')}</h3>
    <p class="sub">${S.profile?.is_admin ? 'автор журнала' : 'читатель журнала'}</p>
    <div class="stat-row">
      <div class="stat"><div class="n">${[...S.visits].filter(id => published.some(p => p.id === id)).length}<span style="font-size:15px;color:var(--on-glass-muted)"> / ${published.length}</span></div><div class="l">мест посещено</div></div>
      <div class="stat"><div class="n">${myReviews}</div><div class="l">моих отзывов</div></div>
    </div>
    ${mine.length ? `<h4 style="font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--on-glass-muted);margin:14px 0 4px">мои места</h4>
      <div class="mini-list">${mine.map(p => `
        <div class="mini-item"><span class="grow">${esc(p.name)}</span>
        <span class="badge ${p.status}">${{pending:'на модерации',published:'опубликовано',rejected:'отклонено'}[p.status]}</span></div>`).join('')}
      </div>` : ''}
    ${pending.length ? `<h4 style="font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin:16px 0 4px">модерация · ${pending.length}</h4>
      <div class="mini-list">${pending.map(p => `
        <div class="mini-item"><span class="grow">${esc(p.name)} <span style="color:var(--on-glass-muted)">· ${esc(p.cat)}</span></span>
          <button class="mod-btn ok" data-mod-ok="${p.id}">принять</button>
          <button class="mod-btn no" data-mod-no="${p.id}">✕</button>
        </div>`).join('')}
      </div>` : ''}
    <button class="btn-ghost" id="signOut">Выйти из аккаунта</button>`;

  $('#signOut').onclick = async () => { await DB.signOut(); closeSheets(); toast('Ты вышел из аккаунта'); };
  $('#profBody').onclick = async e => {
    const ok = e.target.closest('[data-mod-ok]'), no = e.target.closest('[data-mod-no]');
    if (!ok && !no) return;
    try {
      await DB.moderate(+((ok || no).dataset.modOk || (ok || no).dataset.modNo),
                        ok ? 'published' : 'rejected');
      toast(ok ? 'Опубликовано ✓' : 'Отклонено');
      await reload(); renderProfile();
    } catch (err) { toast('Ошибка: ' + err.message); }
  };
}

/* ---------------- добавить место ---------------- */
$('#fabAdd').onclick = () => { if (needAuth()) return; openSheet('add'); };
$('#addPhotoDrop').onclick = () => $('#addPhotoInput').click();
$('#addPhotoInput').addEventListener('change', e => {
  S.addFiles = [...e.target.files].slice(0, 5);
  $('#addThumbs').innerHTML = S.addFiles.map(f =>
    `<img src="${URL.createObjectURL(f)}" alt="">`).join('');
  $('#addPhotoDrop').textContent = S.addFiles.length
    ? `Выбрано фото: ${S.addFiles.length} (до 5)` : '📷 Выбрать фото с телефона';
});
$('#addGo').onclick = async () => {
  if (needAuth()) return;
  const name = $('#addName').value.trim();
  if (!name) { toast('Дай месту название'); return; }
  const btn = $('#addGo');
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> публикуем…';
  try {
    const id = await DB.addPlace({
      name,
      cn: $('#addCn').value.trim(),
      cat: $('#addCat').value,
      note: $('#addNote').value.trim(),
      story: $('#addStory').value.trim(),
      addr: $('#addAddr').value.trim(),
      ints: [...document.querySelectorAll('#addInts .int.on')].map(b => b.dataset.int)
    });
    for (let i = 0; i < S.addFiles.length; i++) {
      btn.innerHTML = `<span class="spin"></span> фото ${i + 1}/${S.addFiles.length}…`;
      await DB.uploadPhoto(id, S.addFiles[i], i);
    }
    closeSheets();
    toast('Отправлено автору на модерацию ✓');
    ['addName','addCn','addNote','addStory','addAddr'].forEach(x => $('#' + x).value = '');
    S.addFiles = []; $('#addThumbs').innerHTML = '';
    $('#addPhotoDrop').textContent = '📷 Выбрать фото с телефона';
    document.querySelectorAll('#addInts .int').forEach(b => b.classList.remove('on'));
    await reload();
  } catch (err) { toast('Не получилось: ' + err.message); }
  btn.disabled = false; btn.textContent = 'Опубликовать место';
};
$('#addInts').addEventListener('click', e => {
  const c = e.target.closest('.int'); if (c) c.classList.toggle('on');
});

/* ---------------- загрузка данных ---------------- */
async function reload() {
  try {
    [S.places, S.visits] = await Promise.all([DB.fetchPlaces(), DB.fetchMyVisits()]);
    renderFeed();
  } catch (err) {
    feed.innerHTML = `<div class="state"><div class="in">
      <h3>Не удалось загрузить</h3><p>${esc(err.message)}. Проверь интернет и обнови страницу.</p>
    </div></div>`;
  }
}

feed.innerHTML = `<div class="state"><div class="in"><span class="spin"></span><p style="margin-top:12px">Загружаю город…</p></div></div>`;
reload();
