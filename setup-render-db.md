# Setting up Database on Render

## Steps to fix your database connection:

### 1. Create a PostgreSQL Database on Render
1. Go to your Render dashboard
2. Click "New" → "PostgreSQL"
3. Choose a name like "farm2future-db"
4. Select the free plan
5. Click "Create Database"

### 2. Get Database Connection Details
After creation, you'll get:
- Host: `dpg-xxxxx-a.oregon-postgres.render.com`
- Database: `farm2future_db_xxxx`
- Username: `farm2future_db_xxxx_user`
- Password: `[generated password]`
- Port: `5432`

### 3. Update Environment Variables on Render
In your Render service dashboard:
1. Go to "Environment" tab
2. Add these variables:
   ```
   DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
   DB_PORT=5432
   DB_USER=farm2future_db_xxxx_user
   DB_PASSWORD=[your generated password]
   DB_NAME=farm2future_db_xxxx
   STORE_DB_NAME=farm2future_db_xxxx
   GOV_DB_NAME=farm2future_db_xxxx
   SESSION_SECRET=your-super-secure-secret-key-here
   NODE_ENV=production
   ```

### 4. Update Code for PostgreSQL
Since Render's free database is PostgreSQL, you'll need to:
1. Change from mysql2 to pg (PostgreSQL)
2. Update SQL syntax
3. Recreate your tables

### Alternative: Use MySQL on Railway/PlanetScale
If you prefer to keep MySQL:
1. Create account on Railway.app or PlanetScale
2. Create MySQL database
3. Update environment variables with their connection details
