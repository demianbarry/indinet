var utils = require('../../lib/utils'),
        _ = require('underscore'),
        NotFound = utils.NotFound,
        checkErr = utils.checkErr,
        log = console.log,
        AccountsController;

AccountsController = function(app, mongoose, config) {
    var Account = mongoose.model('Account');

    app.post('/login', function login(req, res, next) {

        var username = req.param('username', null);
        var password = req.param('password', null);

        if (null === username || username.length < 1
                || null === password || password.length < 1) {
            res.send(400);
            return;
        }

        //console.log('account type: %s, login type: ', typeof Account, typeof new Account().login);
        Account.login(username, password, function(success) {
            if (!success) {
                res.send(401);
                return;
            }
            console.log('login was successful');
            req.session.loggedIn = true;
            req.session.username = username;
            res.send('{"username": "' + username + '"}', 200);
            return;
        });
    });

    app.get('/logout', function logout(req, res, next) {
        //console.log('arranca logout');
        req.session.destroy();
        //req.logout();
        console.log('logout was successful');
        res.send('logout succefull', 200);
        return;
    });

    app.get('/account/authenticated', function isAuthenticated(req, res, next) {
        if (req.session && req.session.loggedIn) {
            console.log('controllers/accounts_controller.js /account/authenticated usuario logeado: %s',req.session.username);
            res.send(req.session.username);
        } else {
            console.log('controllers/accounts_controller.js /account/authenticated usuario no logeado');
            res.send('null');
        }
    });

};

module.exports = AccountsController;
