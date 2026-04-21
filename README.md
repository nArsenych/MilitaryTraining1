# Military Training — Пошук курсів військової підготовки

Веб-застосунок для пошуку та запису на офлайн курси військової підготовки.

## Зміни відносно оригіналу

### Авторизація
- **Видалено**: `@clerk/nextjs` (Clerk)
- **Додано**: Ручна авторизація через **JWT** (`jose`) + **bcryptjs**
- Нова модель `User` в Prisma (email + passwordHash)
- Cookie-based сесії (httpOnly, 7 днів)
- Middleware перевіряє JWT токен для захищених маршрутів

### Оновлені залежності
- Видалено: `@clerk/nextjs`, `react-hook-toast`, `react-router`
- Додано: `jose` (JWT), `bcryptjs` + `@types/bcryptjs`

### Структура авторизації

```
lib/auth.ts                    — JWT sign/verify, cookie, getSession()
app/api/auth/register/route.ts — POST: реєстрація
app/api/auth/login/route.ts    — POST: вхід  
app/api/auth/logout/route.ts   — POST: вихід
app/api/auth/me/route.ts       — GET: поточний користувач
components/providers/AuthProvider.tsx — React Context (useAuth)
middleware.ts                  — JWT перевірка для захищених маршрутів
```

### Сторінки авторизації
- `/sign-in` — форма входу (email + пароль)
- `/sign-up` — форма реєстрації (ім'я, email, пароль, підтвердження)
- `/select-type` — вибір типу (організація / клієнт)

## Встановлення

```bash
# 1. Встановити залежності
npm install

# 2. Налаштувати змінні оточення
cp .env.example .env
# Відредагуйте .env — вкажіть DATABASE_URL та JWT_SECRET

# 3. Згенерувати Prisma клієнт
npx prisma generate

# 4. Створити таблиці в БД
npx prisma db push

# 5. Заповнити початковими даними
npx prisma db seed

# 6. Запустити dev сервер
npm run dev
```

## Змінні оточення (.env)

```env
DATABASE_URL="mysql://user:password@localhost:3306/military_training"
JWT_SECRET="ваш-секретний-ключ"       # openssl rand -base64 32
EMAIL_USER="email@gmail.com"          # для підтвердження записів
EMAIL_PASSWORD="app-password"
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

## Технології

- **Next.js 14** (App Router)
- **Prisma** + MySQL
- **JWT** (jose) + **bcryptjs** — авторизація
- **Tailwind CSS** + shadcn/ui
- **UploadThing** — завантаження файлів
- **React Hook Form** + **Zod** — валідація форм
- **Nodemailer** — email повідомлення
