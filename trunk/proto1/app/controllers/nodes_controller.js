var v1 = '/api/v1',
        utils = require('../../lib/utils'),
        Node = require('../models/node'),
        _ = require('underscore'),
        NotFound = utils.NotFound,
        checkErr = utils.checkErr,
        log = console.log,
        NodesController;

NodesController = function(app, config) {

    app.get(v1 + '/nodes', function index(req, res, next) {
        console.log('app.get V1/nodes 1');
        //node = new Node();
        Node.getAll(function(err, nodes) {
            checkErr(
                    next,
                    [{cond: err}],
            function() {
                // TODO: finish etag support here, check for If-None-Match
                res.header('ETag', utils.etag(nodes));
                res.json(nodes);
            }
            );
        });
    });

    app.get(v1 + '/nodes/:id', function show(req, res, next) {
        console.log('Entra en V1/nodes/:id');
        Node.get(req.params.id, function(err, node) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !node, err: new NotFound('json')}],
            function() {
                // TODO: finish etag support here, check for If-None-Match
                res.header('ETag', utils.etag(node));
                console.log(JSON.stringify(node));
                res.json(node);
            }
            );
        });
    });

    app.post(v1 + '/nodes', function create(req, res, next) {
        var newNode;

        //console.log('app/controllers/nodes_controller.js app.post(nodes 1');
        // disallow other fields besides those listed below
        newNode = new Node(_.pick(req.body, 'name', 'dataType', 'mandatory', 'validator'));
        newNode.save(function(err) {
            var errors, code = 200, loc;

            //console.log('app/controllers/nodes_controller.js newNode.save 2 %s', err);

            if (!err) {
                loc = config.site_url + v1 + '/nodes/' + newNode._id;
                res.setHeader('Location', loc);
                res.json(newNode, 201);
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

    app.put(v1 + '/nodes/:id', function update(req, res, next) {
        Node.get(req.params.id, function(err, node) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !node, err: new NotFound('json')}],
            function() {
                var newAttributes;

                // modify resource with allowed attributes
                newAttributes = _.pick(req.body, 'name', 'dataType', 'mandatory', 'validator');
                node = _.extend(node, newAttributes);

                node.save(function(err) {
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

    app.del(v1 + '/nodes/:id', function destroy(req, res, next) {
        Node.findById(req.params.id, function(err, node) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !node, err: new NotFound('json')}],
            function() {
                node.remove();
                res.json({});
            }
            );
        });
    });
};

module.exports = NodesController;
