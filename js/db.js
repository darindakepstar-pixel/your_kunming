// ======================================================
// db.js — вся работа с Supabase
// ======================================================
const SUPA_URL = 'https://myjjctbfcqlxtplwcfre.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ampjdGJmY3FseHRwbHdjZnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzA4MDksImV4cCI6MjA5ODU0NjgwOX0.nN28KHd-7V1j2w2y7WALhxswxbX0vHgdCNzejVWO5cw';

const sb = window.supabase.createClient(SUPA_URL, SUPA_KEY);

const DB = {

  /* ---------- auth ---------- */
  async session() {
    const { data } = await sb.auth.getSession();
    return data.session;
  },
  onAuth(cb) { sb.auth.onAuthStateChange((_e, s) => cb(s)); },

  async signUp(email, password, name) {
    const { data, error } = await sb.auth.signUp({
      email, password, options: { data: { name } }
    });
    if (error) throw error;
    return data;
  },
  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut() { await sb.auth.signOut(); },

  async myProfile() {
    const s = await this.session();
    if (!s) return null;
    const { data } = await sb.from('profiles').select('*').eq('id', s.user.id).single();
    return data;
  },

  /* ---------- чтение ---------- */
  async fetchPlaces() {
    const { data, error } = await sb.from('places')
      .select(`*,
        place_photos ( path, sort ),
        reviews ( rating, body, user_id, created_at, profiles ( name ) ),
        likes ( user_id )`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    (data || []).forEach(p => p.place_photos?.sort((a, b) => a.sort - b.sort));
    return data || [];
  },

  async fetchMyVisits() {
    const s = await this.session();
    if (!s) return new Set();
    const { data } = await sb.from('visits').select('place_id');
    return new Set((data || []).map(v => v.place_id));
  },

  photoUrl(path) {
    return `${SUPA_URL}/storage/v1/object/public/photos/${path}`;
  },

  /* ---------- действия ---------- */
  async toggleLike(placeId, isLiked, userId) {
    if (isLiked) {
      const { error } = await sb.from('likes').delete()
        .eq('place_id', placeId).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await sb.from('likes').insert({ place_id: placeId, user_id: userId });
      if (error) throw error;
    }
  },

  async toggleVisit(placeId, isVisited, userId) {
    if (isVisited) {
      const { error } = await sb.from('visits').delete()
        .eq('place_id', placeId).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await sb.from('visits').insert({ place_id: placeId, user_id: userId });
      if (error) throw error;
    }
  },

  async saveReview(placeId, userId, rating, body) {
    const { error } = await sb.from('reviews').upsert(
      { place_id: placeId, user_id: userId, rating, body },
      { onConflict: 'place_id,user_id' }
    );
    if (error) throw error;
  },

  /* ---------- добавление места ---------- */
  async addPlace(fields) {
    const s = await this.session();
    const { data, error } = await sb.from('places')
      .insert({ ...fields, author: s.user.id })
      .select('id').single();
    if (error) throw error;
    return data.id;
  },

  // сжатие фото на клиенте до ~200 КБ и загрузка в Storage
  compressPhoto(file, maxSide = 1280, quality = 0.72) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(b => b ? resolve(b) : reject(new Error('compress failed')),
                 'image/jpeg', quality);
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  async uploadPhoto(placeId, file, sort) {
    const blob = await this.compressPhoto(file);
    const path = `place_${placeId}/${Date.now()}_${sort}.jpg`;
    const { error } = await sb.storage.from('photos')
      .upload(path, blob, { contentType: 'image/jpeg' });
    if (error) throw error;
    const { error: e2 } = await sb.from('place_photos')
      .insert({ place_id: placeId, path, sort });
    if (e2) throw e2;
    return path;
  },

  /* ---------- модерация (админ) ---------- */
  async moderate(placeId, status) {
    const { error } = await sb.from('places').update({ status }).eq('id', placeId);
    if (error) throw error;
  }
};

window.DB = DB;
