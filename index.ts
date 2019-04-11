import * as config from '@/config'; // loads config
import start_server from '@/server';
import connect_mongo from '@/database';

let database;
let server;

(async () => {
  if (config.NODE_ENV !== 'production') {
    console.log(config);
    // other config
  }

  try {
    database = await connect_mongo();
    server = await start_server();
  } catch (err) {
    // handle err
    console.log(`${err}`);
    process.exit(1);
  }
})();

// handling CTRL+C / SIGINT / SIGTERM
const onShutdown = async () => {
  console.log('Shutdown received');
  console.log('Closing down server');
  await server.close();
  console.log('Server closed');
  console.log('Disconnecting database');
  await database.disconnect();
  console.log('Database disconnected');
};

process.on('SIGINT', onShutdown);
process.on('SIGTERM', onShutdown);
