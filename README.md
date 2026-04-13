# Love Quiz — Узнай себя в отношениях

18 вопросов → нейросеть составит профиль + гайд для партнёра.

## Деплой на Vercel (5 минут)

### 1. Создай репу на GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create love-quiz --public --push
```

### 2. Подключи к Vercel
- Зайди на [vercel.com](https://vercel.com)
- Import Git Repository → выбери `love-quiz`
- Framework Preset: **Vite**
- В Environment Variables добавь:
  - `ANTHROPIC_API_KEY` = твой ключ от [console.anthropic.com](https://console.anthropic.com)
- Deploy

### 3. Готово
Vercel выдаст ссылку вида `love-quiz-xxx.vercel.app`. Кидай кому хочешь.

### Кастомный домен
В Vercel Dashboard → Settings → Domains → добавь свой домен.

## Локальная разработка
```bash
npm install
cp .env.example .env.local  # вставь свой ANTHROPIC_API_KEY
npm run dev
```

## Стек
- Vite + React
- Vercel Serverless Functions (проксирует запросы к Claude API)
- Claude Sonnet 4
