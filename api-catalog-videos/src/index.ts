import {RestServer} from '@loopback/rest';
import 'dotenv/config';
import {ApplicationConfig, MicroCatalogApplication} from './application';
import './bootstrap';
'use strict'
export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new MicroCatalogApplication(options);
  await app.boot();
  await app.start();

  const restServer = app.getSync<RestServer>('servers.RestServer')
  const url = restServer.url;
  console.log(`Server is running at a ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      node: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
    rabbitmq:{
      uri: process.env.RABBITMQ_URI,
      defaultHandlerError: Number(process.env.RABBITMQ_HANDLER_ERROR),
      exchanges: [
        {name: 'test1', type: 'direct'},
        {name: 'test2', type: 'direct'}
      ]
    }
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}