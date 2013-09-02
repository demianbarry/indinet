var connect = require('connect'),
        MemoryStore = connect.session.MemoryStore,
        express = require('express'),
        nodemailer = require('nodemailer'),
        connectTimeout = require('connect-timeout'),
        mongoose = require('mongoose'),
        gzippo = require('gzippo'),
        utils = require('./lib/utils'),
        EventEmitter = require('events').EventEmitter,
        AppEmitter = new EventEmitter(),
        app = express(),
        ENV = process.env.NODE_ENV || 'development',
        log = console.log,
        dbPath;

utils.loadConfig(__dirname + '/config', function(config) {
    app.use(function(req, res, next) {
        res.removeHeader("X-Powered-By");
        next();
    });
    app.configure(function() {
        utils.ifEnv('production', function() {
            // enable gzip compression
            app.use(gzippo.compress());
        });
        app.use(express.favicon());
        app.use(express['static'](__dirname + '/public'));
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({secret: "indinet secret key", key: 'express.sid', store: new MemoryStore()}));
        //app.use(express.methodOverride());
        /*app.use(function(req, res, next) {
         console.log('--- EXPRESS: ', req);
         next();
         });*/
        // nuevo manejo de errores express mediante middleware
        /*
        app.use(function(err, req, res, next) {
            if (err instanceof NotFound) {
                if (err.msg && err.msg === 'json') {
                    res.json(null, 404);
                } else {
                    res.send('404 - Page Not Found', 404);
                }
            } else {
                log.err(err);
                res.send('500 - Internal Server Error', 500);
            }
        });
        */

        utils.ifEnv('production', function() {
            app.use(connectTimeout({
                time: parseInt(config[ENV].REQ_TIMEOUT, 10)
            }));
        });
    });
    mongoose = utils.connectToDatabase(mongoose, config.db[ENV].main);

    // register models
    //require('./app/models/client')(mongoose);
    require('./app/models/account')(mongoose);
    require('./app/models/attributeType')(mongoose);

    // register controllers
    ['accounts', 'attributeTypes', 'nodes', 'relationships', 'errors'].forEach(function(controller) {
        require('./app/controllers/' + controller + '_controller')(app, mongoose, config);
    });

    app.on('error', function(e) {
        console.log('Error: ', e);
        if (e.code == 'EADDRINUSE') {
            log('Address in use, retrying...');
            setTimeout(function() {
                app.close();
                app.listen(config[ENV].PORT, function() {
                    app.serverUp = true;
                });
            }, 1000);
        }
    });

    if (!module.parent) {
        app.listen(config[ENV].PORT, function() {
            app.serverUp = true;
        });
        log('Express server listening on port %d, environment: %s', config[ENV].PORT, app.settings.env);
    }

    AppEmitter.on('checkApp', function() {
        AppEmitter.emit('getApp', app);
    });
});
/**
 * export AppEmitter for external services so that the callback can execute
 * when the app has finished loading the configuration
 */
module.exports = AppEmitter;
