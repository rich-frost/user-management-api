const mongoose = require('mongoose');

const options = { useNewUrlParser: true };

const init = (url) => {
    mongoose.connect(
        url,
        options,
    );

    const db = mongoose.connection;

    db.once('open', () => {
        console.log('connected to database');
    });

    db.on('error', console.error.bind(console, 'connection error:'));
};

module.exports = init;
