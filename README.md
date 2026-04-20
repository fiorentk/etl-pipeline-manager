# ETL Pipeline Manager

A full-stack application to manage data pipelines (Datasource, Dataflow, Destination).

## Prerequisites

- Node.js (v18 or higher)
- SQL Server (RDS or local SQL Server instance)

## Setting Up

### 1. Backend (`/be`)
The backend is built with Node.js, Express, and Prisma ORM connecting to SQL Server.

1. Navigate to the backend directory:
   ```bash
   cd be
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the `be` folder:
   ```env
   DATABASE_URL="sqlserver://<HOST>:<PORT>;database=<DB_NAME>;user=<USER>;password=<PASSWORD>;encrypt=true"
   JWT_SECRET="your_secret_key"
   PORT=5000
   ```
4. Run migrations and seed the database:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

**Default Admin User (Created during seed):**
- **Username:** `admin`
- **Password:** `admin123`

5. Start the backend:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend (`/fe`)
The frontend is built with Next.js (App Router) and TailwindCSS.

1. Navigate to the frontend directory:
   ```bash
   cd fe
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env.local` file in the `fe` folder:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`.

## Architecture
- **Frameworks:** Next.js (FE), Node.js/Express (BE)
- **Database:** SQL Server
- **ORM:** Prisma
- **Styling:** Tailwind CSS
