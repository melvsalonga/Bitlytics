const { testDatabaseConnection } = require('./src/lib/db-test.ts');

async function main() {
  console.log('Testing database connection...\n');
  const result = await testDatabaseConnection();
  
  if (result.success) {
    console.log('\n🎉 Database setup completed successfully!');
  } else {
    console.log('\n💥 Database setup failed!');
    process.exit(1);
  }
}

main();
