# 🧩 TaskFlow - Production-Grade Task Management System

A full-stack task management platform built with modern technologies and best practices.


## ✨ Features

### Authentication & Security
- 🔐 JWT-based authentication with refresh tokens
- 🔄 Automatic token refresh on expiry
- 🛡️ Password hashing with bcrypt
- 🚪 Secure logout with token invalidation
- 📍 Protected routes and API endpoints

### Task Management
- ✅ Create, read, update, delete tasks
- 🔄 Toggle task status (Pending ↔ Completed)
- 🔍 Search tasks by title
- 🎯 Filter by status
- 📄 Pagination support
- 📊 Task statistics dashboard
- 👤 User-specific task isolation

### User Experience
- 🎨 Modern, elegant UI with shadcn/ui
- ✨ Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🌓 Light/dark mode support
- 🎭 Glassmorphism effects
- 🎪 Custom gradient backgrounds
- ⚡ Optimistic UI updates

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + TypeScript | Runtime & Language |
| Express.js | Web framework |
| Prisma | ORM |
| PostgreSQL (Neon) | Database |
| JWT | Authentication |
| Zod | Validation |
| bcryptjs | Password hashing |

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Base components |
| Framer Motion | Animations |
| Zustand | State management |
| Axios | HTTP client |
| Lucide React | Icons |

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── lib/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── lib/
    │   ├── services/
    │   └── store/
    ├── package.json
    └── next.config.js
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (Neon recommended)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd taskflow/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@host:5432/taskflow?sslmode=require"
ACCESS_TOKEN_SECRET="your-secret-key-here"
REFRESH_TOKEN_SECRET="your-refresh-secret-here"
PORT=5000
```

5. Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

6. Start development server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd taskflow/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
POST /api/auth/refresh     - Refresh access token
POST /api/auth/logout      - Logout user
```

### Tasks (Protected)
```
GET    /api/tasks          - Get all tasks (with filters)
GET    /api/tasks/stats    - Get task statistics
GET    /api/tasks/:id      - Get single task
POST   /api/tasks          - Create new task
PATCH  /api/tasks/:id      - Update task
PATCH  /api/tasks/:id/toggle - Toggle task status
DELETE /api/tasks/:id      - Delete task
```

## 🎯 Usage Examples

### Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create a Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Complete documentation",
    "description": "Write comprehensive README"
  }'
```

## 🗄️ Database Schema

### User Table
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tasks         Task[]
  refreshTokens RefreshToken[]
}
```

### Task Table
```prisma
model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  userId      String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}

enum TaskStatus {
  PENDING
  COMPLETED
}
```

## 🔒 Security Features

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT tokens with short expiry (15 minutes)
- ✅ Refresh token rotation
- ✅ CORS protection
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ Task ownership validation

## 🎨 UI Components

Built with shadcn/ui and enhanced with:
- Custom gradient backgrounds
- Glassmorphism effects
- Smooth page transitions
- Loading skeletons
- Toast notifications
- Modal dialogs
- Animated cards

## 📱 Responsive Design

Fully responsive for:
- 📱 Mobile (320px+)
- 📲 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🚀 Deployment

### Backend Deployment (Railway/Render/Fly.io)

1. Set environment variables in your platform
2. Connect your Git repository
3. Deploy with build command: `npm run build`
4. Start command: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. Connect your Git repository
2. Set environment variable: `NEXT_PUBLIC_API_URL`
3. Deploy (automatic build detection)

### Database (Neon)

1. Create a new Neon project
2. Copy connection string
3. Update `DATABASE_URL` in backend `.env`
4. Run migrations: `npx prisma migrate deploy`

## 🧪 Testing

### Manual Testing
1. Start both backend and frontend servers
2. Register a new account at `/register`
3. Login at `/login`
4. Navigate to dashboard at `/dashboard`
5. Create, edit, delete, and toggle tasks
6. Test search and filter functionality
7. Verify pagination works
8. Test logout functionality

### API Testing (Postman/Insomnia)
Import the API endpoints and test each route with proper authentication headers.

## 📈 Performance Optimizations

- ✅ Database query optimization with Prisma
- ✅ Indexed database fields
- ✅ Pagination for large datasets
- ✅ Token caching in localStorage
- ✅ Optimistic UI updates
- ✅ Debounced search
- ✅ Lazy loading components

## 🤝 Contributing

This is a template project. Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🐛 Troubleshooting

### Backend won't start
- Check if PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Ensure migrations have run: `npx prisma migrate dev`
- Check if port 5000 is available

### Frontend can't connect to API
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Clear browser cache and localStorage

### Token errors
- Clear localStorage
- Re-login
- Check if `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are set

### Database errors
- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to apply migrations
- Check database connection string

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [JWT Best Practices](https://jwt.io/introduction)

## 🎯 Roadmap

Future enhancements:
- [ ] Task categories/tags
- [ ] Due dates and reminders
- [ ] Task priority levels
- [ ] Collaboration features
- [ ] File attachments
- [ ] Activity timeline
- [ ] Export to CSV/PDF
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Social authentication (Google, GitHub)

## 💬 Support

For questions or issues:
1. Check the troubleshooting section
2. Review the documentation
3. Open an issue on GitHub

## ⭐ Acknowledgments

Built with amazing open-source technologies:
- Next.js team
- Prisma team
- shadcn for the component library
- Vercel for deployment platform
- Neon for PostgreSQL hosting

---

Made with ❤️ for learning and production use
