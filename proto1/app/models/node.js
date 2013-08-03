// node.js
// Node model logic.

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');
var validator = require('../../lib/validator');

// constants:

var INDEX_NAME = 'nodes';

// private constructor:
var Node = module.exports = function Node(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
    this._id = _node.id;
};

// public instance properties:
/*
Object.defineProperty(Node.prototype, 'id', {
    get: function() {
        return this._node.id;
    }
});
*/

Object.defineProperty(Node.prototype, 'exists', {
    get: function() {
        return this._node.exists;
    }
});

Object.defineProperty(Node.prototype, 'attribute', {
    get: function(attribute) {
        return this._node.data[attribute];
    },
    set: function(attribute, value) {
        this._node.data[attribute] = value;
    }
});


// private instance methods:

// public instance methods:

Node.prototype.save = function save(callback) {
    this._node.save(function(err, node) {
        callback(err, node);
    });
};

Node.prototype.del = function del(callback) {
    this._node.del(function(err) {
        callback(err);
    }, true);   // true = yes, force it (delete all relationships)
};

// static methods:

Node.get = function get(id, callback) {
    db.getNodeById(id, function(err, node) {
        if (err)
            return callback(err);
        callback(null, new Node(node));
    });
};

Node.getAll = function getAll(callback) {
    var query = [
        'START n=node(*)',
        'RETURN n'
    ].join('\n');

    db.query(query, function(err, nodes) {
        if (err)
            return callback(err, []);
        var nodes = nodes.map(function(node) {
            //var nodo = new Node(node['n']);
            //console.log('\n\n***************Nodo completo:\n%s', JSON.stringify(nodo) );
            //console.log('\n--------------- Sólo parte data:\n%s',JSON.stringify(nodo._node.data));
            //console.log('\n--------------- Sólo parte id:\n%s',JSON.stringify(nodo._id));
            //console.log('\n--------------- atrubuto nombre\n%s',JSON.stringify(nodo.attribute.get('nombre')));
            return new Node(node['n']);
        });
        //console.log('\n\n***************TODOS los nodos:\n%s', JSON.stringify(nodes));
        callback(null, nodes);
    });
};

//TODO --> en vías de desarrollo
Node.getQuery = function getQuery(params, callback) {
    var query = [
        'START n=node(*)',
        'RETURN n'
    ].join('\n');

    db.query(query, params, function(err, nodes) {
        if (err)
            return callback(err, []);
        var nodes = nodes.map(function(node) {
            return new Node(node);
        });
        callback(null, nodes);
    });
};

// creates the node and persists (saves) it to the db, incl. indexing it:
Node.create = function create(data, callback) {
    var node = db.createNode(data);
    var node = new Node(node);
    node.save(function(err) {
        if (err)
            return callback(err);
        node.index(INDEX_NAME, INDEX_KEY, INDEX_VAL, function(err) {
            if (err)
                return callback(err);
            callback(null, node);
        });
    });
};
    