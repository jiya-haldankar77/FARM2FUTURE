========================================
🌱 FARM2FUTURE DASHBOARD
========================================

A fully functional farmer dashboard with real-time activity tracking,
crop management, task management, analytics, and AI chatbot assistance.

🚀 QUICK START:
--------------

1. Setup Database:
   - Run task.sql in MySQL Workbench
   - Run sample_data.sql for test data

2. Install Dependencies:
   npm install

3. Update Database Password:
   - Edit server.js line 34
   - Change password: '' to your MySQL password

4. Start Server:
   npm start

5. Open Browser:
   http://localhost:5000/login.html

6. Login:
   Email: farmer@test.com
   Password: password123

✨ FEATURES:
-----------

✅ User Authentication (Login/Logout)
✅ Add New Crops (with auto-logging)
✅ View & Manage Tasks
✅ Analytics Dashboard (Charts)
✅ AI Chatbot Assistant
✅ Real-time Activity Feed
✅ Responsive Design
✅ MySQL Database Integration
✅ RESTful API Backend

📁 FILES:
--------

Backend:
- server.js (Node.js + Express + MySQL)
- package.json (Dependencies)

Frontend:
- login.html (Login page)
- dashboard.html (Main dashboard)
- dashboard.js (Dashboard logic)
- login-handler.js (Login logic)
- style.css (Styling)

Database:
- task.sql (Database schema)
- sample_data.sql (Test data)

Documentation:
- SETUP_GUIDE.txt (Detailed setup)
- README.txt (This file)

🔧 TECH STACK:
-------------

Backend: Node.js, Express, MySQL2
Frontend: HTML5, CSS3, JavaScript
Database: MySQL
Session: express-session
Styling: Modern CSS with animations

📊 DATABASE TABLES:
------------------

- farmer (user accounts)
- crops (crop records)
- tasks (farming tasks)
- analytics (sensor data)
- activity_log (recent activities)

🎯 API ENDPOINTS:
----------------

Auth: /api/login, /api/logout, /api/check-session
Crops: /api/crops (GET, POST)
Tasks: /api/tasks (GET, POST, PUT)
Analytics: /api/analytics (GET, POST)
Activities: /api/activities (GET, POST)

💡 TIPS:
-------

- Activities refresh every 30 seconds
- Click "Add Sample Data" if no activities
- Use chatbot for farming advice
- All actions are logged automatically
- Session expires after 24 hours

🐛 COMMON ISSUES:
----------------

Issue: Database connection failed
Fix: Check MySQL is running and password is correct

Issue: Port 5000 in use
Fix: Change PORT in server.js

Issue: Unauthorized error
Fix: Clear cookies and login again

📞 NEED HELP?
------------

Check SETUP_GUIDE.txt for detailed instructions
Check browser console (F12) for errors
Check server terminal for error messages

========================================
Built with ❤️ for Farmers
========================================
