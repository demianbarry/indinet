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
        //console.log('app.get V1/nodes 1');
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
        //console.log('Entra en V1/nodes/:id');
        Node.get(req.params.id, function(err, node) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !node, err: new NotFound('json')}],
            function() {
                // TODO: finish etag support here, check for If-None-Match
                res.header('ETag', utils.etag(node));
                //console.log(JSON.stringify(node));
                res.json(node);
            }
            );
        });
    });

    app.post(v1 + '/nodes', function create(req, res, next) {

        var newData = JSON.parse(req.body.data);
        Node.create(newData, function(err, node) {
            var code = 200;

            if (!err) {
                res.send(node, 201);
            } else {
                console.log("Create node Sale con error %s", err);
                log(err);
                res.json(err, code);
            }

        });
    });

    app.put(v1 + '/nodes/:id', function update(req, res, next) {
        Node.get(req.params.id, function(err, node) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !node, err: new NotFound('json')}],
            function() {
                // modify resource with allowed attributes
                node._node._data.data = JSON.parse(req.body.data);

                node.save(function(err) {
                    var code = 200;

                    if (!err) {
                        // send 204 No Content
                        //console.log('Nodo guardado exitosamente');
                        //console.log("\n nuevo nodo --> %s\n", JSON.stringify(nodeUpdated));
                        res.send();
                    } else {
                        console.log("Save node Sale con error %s", err);
                        log(err);
                        res.json(err, code);
                    }
                });
            }
            );
        });
    });

    app.del(v1 + '/nodes/:id', function destroy(req, res, next) {
        Node.get(req.params.id, function(err, node) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !node, err: new NotFound('json')}],
            function() {
                node.del(function(err) {
                    var code = 200;

                    if (!err) {
                        // send 204 No Content
                        //console.log('Nodo eliminado exitosamente');
                        //console.log("\n nuevo nodo --> %s\n", JSON.stringify(nodeUpdated));
                        res.send();
                    } else {
                        console.log("Del node Sale con error %s", err);
                        log(err);
                        res.json(err, code);
                    }
                });
                res.json({});
            }
            );
        });
    });
};

module.exports = NodesController;