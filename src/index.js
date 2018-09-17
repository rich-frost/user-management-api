const hapi = require('hapi');
const config = require('config');

const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const database = require('./utils/database');
const routes = require('./routes/routes');
const Pack = require('../package');

// Create db connection
database(config.MongoURL);

const server = hapi.server({
    port: config.Port,
    host: 'localhost',
});

const init = async () => {
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'Users API Documentation',
                    version: Pack.version,
                },
            },
        },
    ]);

    server.route(routes);

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

init();
