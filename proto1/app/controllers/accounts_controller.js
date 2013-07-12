var v1 = '/api/v1',
        utils = require('../../lib/utils'),
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
        Account.login(username, password, function(success,account) {
            if (!success) {
                res.send(401);
                return;
            }
            //console.log('login was successful');
            req.session.loggedIn = true;
            req.session.accountSession = account;
            res.json(account, 200);
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
            //console.log('controllers/accounts_controller.js /account/authenticated usuario logeado: %s', req.session.accountSession.username);
            res.json(req.session.accountSession);
        } else {
            //console.log('controllers/accounts_controller.js /account/authenticated usuario no logeado');
            res.json({});
        }
    });

    app.post('/account/register', function login(req, res, next) {

        var username = req.param('username', null);
        var password = req.param('password', null);
        var firstname = req.param('firstname', null);
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
                        console.log(JSON.stringify(err));
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

    app.get(v1 + '/accounts', function index(req, res, next) {
        Account.search(req.query, function(err, account) {
            checkErr(
                    next,
                    [{cond: err}],
            function() {
                // TODO: finish etag support here, check for If-None-Match
                res.header('ETag', utils.etag(account));
                res.json(account);
            }
            );
        });
    });

    app.get(v1 + '/accounts/:id', function show(req, res, next) {
        Account.findById(req.params.id, function(err, account) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !account, err: new NotFound('json')}],
            function() {
                // TODO: finish etag support here, check for If-None-Match
                res.header('ETag', utils.etag(account));
                res.json(account);
            }
            );
        });
    });

    app.post(v1 + '/accounts', function create(req, res, next) {
        var newAccount;

        //console.log('app/controllers/accounts_controller.js app.post(accounts 1');
        // disallow other fields besides those listed below
        newAccount = new Account(_.pick(req.body, 'username', 'name', 'email', 'cvUrl', 'biography', 'roles'));
        newAccount.save(function(err) {
            var errors, code = 200, loc;

            //console.log('app/controllers/accounts_controller.js newAccount.save 2 %s', err);

            if (!err) {
                loc = config.site_url + v1 + '/accounts/' + newAccount._id;
                res.setHeader('Location', loc);
                res.json(newAccount, 201);
            } else {
                errors = utils.parseDbErrors(err, config.error_messages);
                if (errors.code) {
                    code = errors.code;
                    delete errors.code;
                    // TODO: better better logging system
                    log(err);
                }
                res.json(errors, code);
            }
        });
    });

    app.put(v1 + '/accounts/:id', function update(req, res, next) {
        Account.findById(req.params.id, function(err, account) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !account, err: new NotFound('json')}],
            function() {
                var newAttributes;

                // modify resource with allowed attributes
                newAttributes = _.pick(req.body, 'username', 'name', 'email', 'cvUrl', 'biography', 'roles');
                account = _.extend(account, newAttributes);

                account.save(function(err) {
                    var errors, code = 200;

                    if (!err) {
                        // send 204 No Content
                        res.send();
                    } else {
                        errors = utils.parseDbErrors(err, config.error_messages);
                        if (errors.code) {
                            code = errors.code;
                            delete errors.code;
                            log(err);
                        }
                        res.json(errors, code);
                    }
                });
            }
            );
        });
    });

    app.del(v1 + '/accounts/:id', function destroy(req, res, next) {
        Account.findById(req.params.id, function(err, account) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !account, err: new NotFound('json')}],
            function() {
                account.remove();
                res.json({});
            }
            );
        });
    });

};

module.exports = AccountsController;
