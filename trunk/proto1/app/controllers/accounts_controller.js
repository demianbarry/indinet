var utils = require('../../lib/utils'),
        _ = require('underscore'),
        NotFound = utils.NotFound,
        checkErr = utils.checkErr,
        log = console.log,
        AccountsController;

AccountsController = function(app, mongoose, config) {
    var Account = mongoose.model('Account');

    app.post('/account/login', function login(req, res, next) {

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
            //console.log('login was successful');
            req.session.loggedIn = true;
            req.session.username = username;
            res.send('{"username": "' + username + '"}', 200);
            return;
        });
    });

    app.get('/account/logout', function logout(req, res, next) {
        //console.log('arranca logout');
        req.session.destroy();
        //req.logout();
        //console.log('logout was successful');
        res.send('logout succefull', 200);
        return;
    });

    app.get('/account/authenticated', function isAuthenticated(req, res, next) {
        if (req.session && req.session.loggedIn) {
            //console.log('controllers/accounts_controller.js /account/authenticated usuario logeado: %s', req.session.username);
            res.send(req.session.username);
        } else {
            //console.log('controllers/accounts_controller.js /account/authenticated usuario no logeado');
            res.send('null');
        }
    });

    app.post('/account/register', function login(req, res, next) {

        var username = req.param('username', null);
        var password = req.param('password', null);
        var firstname = req.param('fisrtname', null);
        var lastname = req.param('lastname', null);
        var email = req.param('email', null);

        if (null === username || username.length < 1
                || null === password || password.length < 1) {
            res.send(400);
            return;
        }

        // valida si ya existe
        Account.search({'username': username}, function(err, accountRetrieval) {
            if (err) {
                console.log('usuario ya existe %s', username);
                res.send('usuario ya existe', 402);
            } else {
                //console.log('account type: %s, login type: ', typeof Account, typeof new Account().login);
                Account.register(username, password, firstname, lastname, email, function(err) {
                    //console.log('success: %s', JSON.stringify(err))
                    if (err) {
                        res.send(401);
                        return;
                    }
                    //console.log('register of %s was successful', username);
                    req.session.loggedIn = false;
                    res.send('{"username": "' + username + '"}', 200);
                    return;
                });
            }
        });
    });

};

module.exports = AccountsController;
