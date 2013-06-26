var utils = require('../../lib/utils'),
        _ = require('underscore'),
        NotFound = utils.NotFound,
        checkErr = utils.checkErr,
        log = console.log,
        AccountsController;

AccountsController = function(app, mongoose, config) {
    app.post('/login', function(req, res) {
        console.log('login request');
        var username = req.param('username', null);
        var password = req.param('password', null);

        if (null === username || username.length < 1
                || null === password || password.length < 1) {
            res.send(400);
            return;
        }

        Account.login(email, password, function(success) {
            if (!success) {
                res.send(401);
                return;
            }
            console.log('login was successful');
            req.session.loggedIn = true;
            res.send(200);
        });
    });
};

module.exports = AccountsController;
