const mysql = require('mysql2');
const fs = require('fs');

// Create connection without database
const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'upsc2027',
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL server');
  
  // Read and execute SQL file
  const sql = fs.readFileSync('./gov.sql', 'utf8');
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error executing SQL:', err);
      connection.end();
      process.exit(1);
    }
    
    console.log('✅ Database and tables created successfully!');
    console.log('📊 Tables created:');
    console.log('   - user_inputs (stores gov.php form submissions)');
    console.log('   - reviews (stores rev.php reviews)');
    console.log('   - govt_schemes (stores available schemes)');
    
    connection.end();
    console.log('\n🎉 Setup complete! You can now start your server.');
  });
});
