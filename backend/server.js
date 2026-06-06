const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  }

  let port = Number(PORT) || 5000;
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const server = app.listen(port);

      // Wait for either listening or immediate error
      await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
      });

      console.log(`Server running on port ${port}`);
      return;
    } catch (err) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying port ${port + 1}...`);
        port += 1;
        // small delay before retrying
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }

      console.error('Failed to start server', err);
      process.exit(1);
    }
  }

  console.error(`Could not bind to a port after ${maxAttempts} attempts. Exiting.`);
  process.exit(1);
};

startServer();
