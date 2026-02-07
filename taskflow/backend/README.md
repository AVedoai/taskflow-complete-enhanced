# TaskFlow Backend API

Production-grade REST API built with Node.js, TypeScript, Express, and Prisma.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (Access + Refresh Tokens)
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── routes/                # API routes
│   ├── middleware/            # Auth, validation, error handling
│   ├── schemas/               # Zod validation schemas
│   ├── utils/                 # Helper functions (JWT, hashing, errors)
│   ├── lib/                   # Third-party integrations (Prisma client)
│   ├── app.ts                 # Express app configuration
│   └── server.ts              # Server entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
DATABASE_URL="postgresql://user:password@host:5432/taskflow?sslmode=require"
ACCESS_TOKEN_SECRET="your-secret-key"
REFRESH_TOKEN_SECRET="your-refresh-secret-key"
PORT=5000
```

3. **Generate Prisma Client**:
```bash
npm run prisma:generate
```

4. **Run database migrations**:
```bash
npm run prisma:migrate
```

5. **Start development server**:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout user | No |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks (paginated, filtered) | Yes |
| GET | `/api/tasks/stats` | Get task statistics | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PATCH | `/api/tasks/:id` | Update task | Yes |
| PATCH | `/api/tasks/:id/toggle` | Toggle task status | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## 🔐 Authentication Flow

1. **Register**: User creates account with email and password
2. **Login**: Returns `accessToken` (15m) and `refreshToken` (7d)
3. **API Requests**: Include `Authorization: Bearer <accessToken>` header
4. **Token Refresh**: When access token expires, use refresh token to get new one
5. **Logout**: Invalidates refresh token

## 🎯 Task Management Features

- ✅ Create, read, update, delete tasks
- ✅ Toggle task status (Pending ↔ Completed)
- ✅ Search tasks by title
- ✅ Filter by status
- ✅ Pagination support
- ✅ Task ownership validation
- ✅ Get task statistics

## 📝 Example Requests

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Create Task
```bash
POST /api/tasks
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for TaskFlow"
}
```

### Get Tasks (with filters)
```bash
GET /api/tasks?page=1&limit=10&status=PENDING&search=project
Authorization: Bearer <accessToken>
```

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## 🏗️ Database Schema

### User
- `id` - Unique identifier
- `email` - Unique email address
- `password` - Hashed password
- `name` - Optional user name
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Task
- `id` - Unique identifier
- `title` - Task title (required)
- `description` - Task description (optional)
- `status` - PENDING or COMPLETED
- `userId` - Owner reference
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### RefreshToken
- `id` - Unique identifier
- `token` - JWT refresh token
- `userId` - Owner reference
- `expiresAt` - Expiration timestamp
- `createdAt` - Creation timestamp

## 🛡️ Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Refresh token rotation
- ✅ CORS protection
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ✅ Task ownership validation
- ✅ Centralized error handling

## 🚀 Deployment

### Environment Variables (Production)

Ensure these are set in your production environment:

```env
DATABASE_URL="your-production-database-url"
ACCESS_TOKEN_SECRET="strong-random-secret"
REFRESH_TOKEN_SECRET="another-strong-secret"
NODE_ENV="production"
PORT=5000
ALLOWED_ORIGINS="https://yourdomain.com"
```

### Build and Deploy

```bash
npm run build
npm start
```

## 📊 Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [/* validation errors if applicable */]
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## 🤝 Contributing

This is a project template. Feel free to customize and extend as needed!

## 📄 License

MIT
