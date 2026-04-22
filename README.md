# GWG Webapp - Choir Management System

A modern web application for managing choir members, events, sessions, and musical scores. Built with Next.js, TypeScript, Prisma, and PostgreSQL/SQLite.

## 🎯 Features

- **Member Management** - Manage choir member information and profiles
- **Events & Sessions** - Organize choir events and practice sessions
- **Partitur/Scores** - Store and manage musical sheet scores
- **Attendance Tracking** - Track member attendance and participation
- **User Authentication** - Secure login with NextAuth.js
- **Dashboard** - Comprehensive admin dashboard
- **Responsive Design** - Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** Prisma ORM with PostgreSQL/SQLite support
- **Authentication:** NextAuth.js
- **UI Components:** Shadcn/ui
- **Styling:** Tailwind CSS, PostCSS

## 📋 Prerequisites

- Node.js 18+ or higher
- npm, yarn, pnpm, or bun
- PostgreSQL (or SQLite for development)
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/fazagi29/gwg-webapp.git
cd gwg-webapp
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gwg_webapp"
# or for SQLite:
# DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Other configurations
# Add other env variables as needed
```

### 4. Setup Database
```bash
# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
gwg-webapp/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── actions/           # Server actions
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── auth/              # Auth components
│   ├── dashboard/         # Dashboard components
│   └── ui/                # UI component library
├── lib/                   # Utilities and helpers
├── prisma/                # Database schema & migrations
├── public/                # Static assets
├── types/                 # TypeScript type definitions
└── scripts/               # Utility scripts
```

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start development server

# Production
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio      # Open Prisma Studio GUI
npx prisma migrate dev # Run migrations
npx prisma db seed     # Seed database

# Linting & Type Checking
npm run lint            # Run ESLint
npm run type-check      # Type check with TypeScript
```

## 📊 Database Schema

The project uses Prisma ORM with the following main entities:
- **Users** - User accounts and authentication
- **Anggota** - Choir members
- **Events** - Choir events
- **Sesi** - Practice sessions
- **Partitur** - Musical scores
- **Presensi** - Attendance records

See `prisma/schema.prisma` for complete schema details.

## 🔐 Authentication

This project uses **NextAuth.js** for authentication. Update credentials in `auth.config.ts` and the authentication API route.

## 📝 Environment Variables

Required environment variables for different services:
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth session encryption
- `NEXTAUTH_URL` - Application URL for NextAuth

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL service is running
- Check database credentials

### Migration Issues
```bash
# Reset database (⚠️ Clears all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Shadcn/ui Components](https://ui.shadcn.com/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- Your Name/Team

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.
