var v1 = '/api/v1',
        utils = require('../../lib/utils'),
        _ = require('underscore'),
        NotFound = utils.NotFound,
        checkErr = utils.checkErr,
        log = console.log,
        AttributeTypesController;

AttributeTypesController = function(app, mongoose, config) {

    var AttributeType = mongoose.model('AttributeType');

    app.get(v1 + '/attributeTypes', function index(req, res, next) {
        AttributeType.search(req.query, function(err, attributeType) {
            checkErr(
                    next,
                    [{cond: err}],
            function() {
                // TODO: finish etag support here, check for If-None-Match
                res.header('ETag', utils.etag(attributeType));
                res.json(attributeType);
            }
            );
        });
    });

    app.get(v1 + '/attributeTypes/:id', function show(req, res, next) {
        AttributeType.findById(req.params.id, function(err, attributeType) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !attributeType, err: new NotFound('json')}],
            function() {
                // TODO: finish etag support here, check for If-None-Match
                res.header('ETag', utils.etag(attributeType));
                res.json(attributeType);
            }
            );
        });
    });

    app.post(v1 + '/attributeTypes', function create(req, res, next) {
        var newAttributeType;

        //console.log('app/controllers/attributeTypes_controller.js app.post(attributeTypes 1');
        // disallow other fields besides those listed below
        newAttributeType = new AttributeType(_.pick(req.body, 'name', 'dataType', 'mandatory', 'validator'));
        newAttributeType.save(function(err) {
            var errors, code = 200, loc;

            //console.log('app/controllers/attributeTypes_controller.js newAttributeType.save 2 %s', err);

            if (!err) {
                loc = config.site_url + v1 + '/attributeTypes/' + newAttributeType._id;
                res.setHeader('Location', loc);
                res.json(newAttributeType, 201);
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

    app.put(v1 + '/attributeTypes/:id', function update(req, res, next) {
        AttributeType.findById(req.params.id, function(err, attributeType) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !attributeType, err: new NotFound('json')}],
            function() {
                var newAttributes;

                // modify resource with allowed attributes
                newAttributes = _.pick(req.body, 'name', 'dataType', 'mandatory', 'validator');
                attributeType = _.extend(attributeType, newAttributes);

                attributeType.save(function(err) {
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

    app.del(v1 + '/attributeTypes/:id', function destroy(req, res, next) {
        AttributeType.findById(req.params.id, function(err, attributeType) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !attributeType, err: new NotFound('json')}],
            function() {
                attributeType.remove();
                res.json({});
            }
            );
        });
    });
};

module.exports = AttributeTypesController;
