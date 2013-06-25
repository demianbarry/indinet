var v1 = '/api/v1',
        utils = require('../../lib/utils'),
        _ = require('underscore'),
        NotFound = utils.NotFound,
        checkErr = utils.checkErr,
        log = console.log,
        AccountsController;

AccountsController = function(app, mongoose, config) {
    app.get(v1 + '/login', function(req, res, next) {
        console.log('login request');
        res.end('pepe');
    });
};

module.exports = AccountsController;
