var v1 = '/api/v1',
        utils = require('../../lib/utils'),
        _ = require('underscore'),
        NotFound = utils.NotFound,
        checkErr = utils.checkErr,
        log = console.log,
        AccountsController;

AccountsController = function(app, mongoose, config) {

    //var Account = mongoose.model('Account');
    console.log("carga accounts Controller");
    app.get('/login', function(req, res,next) {
        console.log('login request');
        checkErr(
                next,
                [{cond: err}],
        function() {
            // TODO: finish etag support here, check for If-None-Match
            res.header('ETag', utils.etag(clients));
            res.json(clients);
        }
        );
//        var email = req.param('email', null);
//        var password = req.param('password', null);
//
//        if (null === email || email.length < 1
//                || null === password || password.length < 1) {
//            res.send(400);
//            return;
//        }
//
//        Account.login(email, password, function(success) {
//            if (!success) {
//                res.send(401);
//                return;
//            }
//            console.log('login was successful');
//            req.session.loggedIn = true;
//            res.send(200);
//        });
    });
};

module.exports = AccountsController;
