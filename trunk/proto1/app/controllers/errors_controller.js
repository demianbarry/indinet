var utils = require('../../lib/utils'),
        NotFound = utils.NotFound,
        log = require('../../lib/logger'),
        ErrorsController;

ErrorsController = function(app, mongoose) {

    // only for test environment
    utils.ifEnv('test', function() {
        app.get('/test_500_page', function(req, res, next) {
            next(new Error('test'));
        });
    });

    app.all('*', function(req, res, next) {
        console.log(req);
        throw new NotFound();
    });

};

module.exports = ErrorsController;
