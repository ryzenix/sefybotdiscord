const express = require('express');

module.exports = {
    init: (client) => {
        client.webapp.use(express.json());
        client.webapp.use(`/assets`, express.static(__basedir + '/html/assets/'));
        client.webapp.get('/', (_, res) => res.sendFile(__basedir + '/html/landing.html'));
        client.webapp.get('/404', function(req, res) {
            res.sendFile(__basedir + '/html/404.html');
        });
        client.webapp.get('*', function(req, res) {
            res.status(301).redirect(`${__baseURL}404`);
            res.end();
        });
        client.webapp.listen(_port);
        console.log(`[WEB] Listening at port ${_port}`);
    }
}