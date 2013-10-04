var v1 = '/api/v1',
        utils = require('../../lib/utils'),
        Relationship = require('../models/relationship'),
        Node = require('../models/node'),
        _ = require('underscore'),
        NotFound = utils.NotFound,
        checkErr = utils.checkErr,
        log = console.log,
        RelationshipsController;

RelationshipsController = function(app, config) {

    // recupera keys de attributos de un tipo de relación en particular
    app.post('/relationship/getAttributesLikeRelationshipType', function getAttributesLikeRelationshipType(req, res, next) {
        Relationship.getAttributesLikeRelationshipType(req.param('relationshipType', null), function(err, keys) {
            if (!err)
                res.send(keys, 201);
            else {
                console.log("getAttributesLikeRelationshipType Sale con error %s", err);
                log(err);
                res.json(err, 404);
            }
        });
    });

    // recupera todos los tipos de relaciones
    app.post('/relationship/getRelationshipTypes', function getRelationshipTypes(req, res, next) {
        Relationship.getRelationshipTypes(function(err, types) {
            if (!err)
                res.send(types, 201);
            else {
                console.log("getRelationshipTypes Sale con error %s", err);
                log(err);
                res.json(err, 404);
            }
        });
    });

    // recupera colección de relaciónes
    app.get(v1 + '/relationships', function index(req, res, next) {
        //console.log('app.get V1/relationships 1');
        //relationship = new Relationship();
        Relationship.getAll(function(err, relationships) {
            checkErr(
                    next,
                    [{cond: err}],
            function() {
                // TODO: finish etag support here, check for If-None-Match
                res.header('ETag', utils.etag(relationships));
                res.json(relationships);
            }
            );
        });
    });

    // recupera la relaciónes de un nodo en particular
    app.get(v1 + '/relationships/node/:id', function show(req, res, next) {
        //console.log('Entra en V1/relationships/:id');
        Relationship.getRelationshipFromNode(req.params.id, function(err, relationship) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !relationship, err: new NotFound('json')}],
            function() {
                // TODO: finish etag support here, check for If-None-Match
                res.header('ETag', utils.etag(relationship));
                //console.log(JSON.stringify(relationship));
                res.json(relationship);
            }
            );
        });
    });

    // recupera un relación en particular
    app.get(v1 + '/relationships/:id', function show(req, res, next) {
        //console.log('Entra en V1/relationships/:id');
        Relationship.get(req.params.id, function(err, relationship) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !relationship, err: new NotFound('json')}],
            function() {
                // TODO: finish etag support here, check for If-None-Match
                res.header('ETag', utils.etag(relationship));
                //console.log(JSON.stringify(relationship));
                res.json(relationship);
            }
            );
        });
    });

    // crea una nueva relación en la base
    app.post(v1 + '/relationships', function create(req, res, next) {

        var code = 404;
        //console.log(req.body.data);
        var newData = JSON.parse(req.body.data);
        var fromNodeName = newData.fromNode;
        var toNodeName = newData.toNode;
        var relType = newData.relType;

        // busco a traves de los nombre los nodos de origen y destino
        Node.getNodeByName(fromNodeName, function(err, fromNode) {
            //console.log("paso 1");
            if (!err) {
                //console.log("paso 2 %s",JSON.stringify(fromNode._data));
                Node.getNodeByName(toNodeName, function(err, toNode) {
                    if (!err) {
                        //console.log("paso 3 %s",JSON.stringify(toNode._data));
                        Relationship.create(fromNode, relType, toNode, function(err, relationship) {
                            if (!err) {
                                //console.log("relación creada exitosamente %s",relationship._id);
                                res.json(relationship, 200);
                            } else {
                                //console.log("paso 4.err %s",err);
                                console.log("Create relationship Sale con error %s", err);
                                log(err);
                                res.json(err, code);
                            }
                        });
                    } else {
                        //console.log("paso 3.err %s",err);
                        console.log("getNodeByName toNode sale con error %s", err);
                        log(err);
                        res.json(err, code);
                    }
                });
            } else {
                //console.log("paso 2.err %s",err);
                console.log("getNodeByName fromNode sale con error %s", err);
                log(err);
                res.json(err, code);
            }
        });
    });

    // actualiza relación existente
    app.put(v1 + '/relationships/:id', function update(req, res, next) {
        Relationship.get(req.params.id, function(err, relationship) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !relationship, err: new NotFound('json')}],
            function() {
                // modify resource with allowed attributes
                relationship._relationship._data.data = JSON.parse(req.body.data);

                relationship.save(function(err) {
                    var code = 200;

                    if (!err) {
                        // send 204 No Content
                        //console.log('Nodo guardado exitosamente');
                        //console.log("\n nuevo relación --> %s\n", JSON.stringify(relationshipUpdated));
                        res.send();
                    } else {
                        console.log("Save relationship Sale con error %s", err);
                        log(err);
                        res.json(err, code);
                    }
                });
            }
            );
        });
    });

    // elimina relación
    app.del(v1 + '/relationships/:id', function destroy(req, res, next) {
        Relationship.get(req.params.id, function(err, relationship) {
            checkErr(
                    next,
                    [{cond: err}, {cond: !relationship, err: new NotFound('json')}],
            function() {
                relationship.del(function(err) {
                    var code = 200;

                    if (!err) {
                        // send 204 No Content
                        //console.log('Nodo eliminado exitosamente');
                        //console.log("\n nuevo relación --> %s\n", JSON.stringify(relationshipUpdated));
                        res.send();
                    } else {
                        console.log("Del relationship Sale con error %s", err);
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

module.exports = RelationshipsController;
