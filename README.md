# Записки из города вечной весны 昆明

Авторский гид по Куньмину: иммерсивная лента мест, трекер посещений,
отзывы и добавление мест читателями. Стек: HTML/CSS/JS + Supabase + GitHub Pages.

## Запуск с нуля — 4 шага

### 1. База данных
Supabase → проект `myjjctbfcqlxtplwcfre` → **SQL Editor** → вставить
целиком файл `supabase-setup.sql` → **Run**.
Скрипт создаёт таблицы, права доступа (RLS), хранилище фото
и 6 стартовых мест автора.

### 2. Отключить подтверждение почты (для простоты старта)
Supabase → **Authentication → Sign In / Up → Email** →
выключить **Confirm email**. Иначе каждому пользователю придётся
подтверждать регистрацию письмом.

### 3. Выложить на GitHub Pages
1. github.com → **New repository** → имя например `kunming` → Public → Create
2. **uploading an existing file** → перетащить всё содержимое этой папки
   (index.html, css/, js/, supabase-setup.sql можно не выкладывать) → Commit
3. **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `/ (root)` → Save
4. Через пару минут сайт живёт на `https://ТВОЙ_ЛОГИН.github.io/kunming/`

### 4. Сделать себя админом
Зарегистрируйся в приложении, затем в Supabase → SQL Editor:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'ТВОЙ@EMAIL');
```

Админ видит в профиле раздел «модерация» и подтверждает места читателей.

## Структура

```
index.html      — каркас и все шторки
css/app.css     — дизайн-система (liquid glass, темы)
js/scenes.js    — SVG-заглушки для мест без фото
js/db.js        — работа с Supabase (auth, данные, загрузка фото)
js/app.js       — экраны и логика
supabase-setup.sql — установка базы (запускается один раз)
```

## Как это устроено

- Гости видят всё; вход нужен для лайков, отзывов, трекера и добавления мест
- Места читателей получают статус `pending` и ждут модерации автора
- Фото сжимаются в браузере до ~1280px/200КБ перед загрузкой в Storage
- Тема (тёмная «чернила» / светлая «туман») запоминается в localStorage
