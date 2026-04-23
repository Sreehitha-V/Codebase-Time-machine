# 🕰️ Codebase Time Machine

> See how code evolves. Understand why it changes.

An AI-powered platform that visualizes the evolution of any GitHub codebase.

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd codebase-time-machine
npm install
```

### 2. Setup environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Setup database
```bash
npm run db:generate
npm run db:push
```

### 4. Run
```bash
npm run dev
```

Open http://localhost:3000  |
  Final Project https://codebase-time-machine-um83.vercel.app

## 📋 Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Any long random string |
| `GITHUB_TOKEN` | ✅ | GitHub Personal Access Token |
| `GROQ_API_KEY` | Optional | Groq API key for AI (free at console.groq.com) |
| `OPENAI_API_KEY` | Optional | OpenAI API key for AI |

## 🗄️ Database Options (Free)

- **Neon**: neon.tech
- **Supabase**: supabase.com  
- **Local**: `createdb codebase_time_machine`

## Common Issues

**Rate limit on GitHub**: Add GITHUB_TOKEN to .env

**No AI explanations**: Add GROQ_API_KEY (free at console.groq.com) — mock responses work without it

**Database error**: Make sure DATABASE_URL is correct and run `npm run db:push`
