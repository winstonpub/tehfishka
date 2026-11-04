# Техфишка Камины (`tehfishka`)

Сайт для печати техфишек: лист A4 «Обрамление + Очаг», лист A5 «Каминокомплект» / «Все товары» и таблица совместимости.

Данные подтягиваются из [Google Таблицы](https://docs.google.com/spreadsheets/d/1uvInhWEbw8OypBD3KExdZu1fWyfkKFeS7KiJi7TvJRE/edit?usp=sharing) (листы «Обрамление + Очаг» и «Каминокомплект»). Если таблица недоступна, используется сохранённая копия.

## Запуск локально

```bash
npm install
npm run dev
```

Сборка:

```bash
npm run build
npm run preview
```

## Фотографии товаров

Положите PNG-файлы в `public/images/` с именем **артикул.png** (без кавычек и пробелов), например `18831911.png`.

Полный список имён — в [`public/images/README.md`](public/images/README.md).

## Публикация на GitHub Pages

1. Создайте репозиторий **tehfishka** и загрузите проект:
   ```bash
   git init
   git add .
   git commit -m "Техфишка Камины"
   git branch -M main
   git remote add origin https://github.com/<ваш-аккаунт>/tehfishka.git
   git push -u origin main
   ```
2. В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. После пуша в `main` workflow соберёт сайт с базовым путём `/tehfishka/` и опубликует его по адресу:
   `https://<ваш-аккаунт>.github.io/tehfishka/`

Таблица должна быть открыта «всем, у кого есть ссылка», иначе сайт покажет сохранённую копию.

Если репозиторий называется иначе или используется свой домен, измените `BASE_PATH` в `.github/workflows/pages.yml` (для корня сайта поставьте `/`).
