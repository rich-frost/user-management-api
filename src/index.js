/*
TODO

GraphQL?
Tests
Clean code
Commit to git
README

*/

const hapi = require("hapi");
const mongoose = require("mongoose");

const routes = require("./routes/routes");

/* swagger section */
const Inert = require("inert");
const Vision = require("vision");
const HapiSwagger = require("hapi-swagger");
const Pack = require("../package");

const server = hapi.server({
    port: 4000,
    host: "localhost"
});

mongoose.connect(
    "mongodb://localhost:27017/UsersDB",
    { useNewUrlParser: true }
);

mongoose.connection.once("open", () => {
    console.log("connected to database");
});

const init = async () => {
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: "Users API Documentation",
                    version: Pack.version
                }
            }
        }
    ]);

    server.route(routes);

    await server.start();
    console.log("Server running at: " + server.info.uri);
};

process.on("unHandledRejection", err => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
});

init();
