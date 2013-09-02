// node.js
// Node model logic.

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');
var validator = require('../../lib/validator');
var _ = require('underscore');

// constants:

var INDEX_NAME = 'nodes';

// private constructor:
var Node = module.exports = function Node(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
    this._data = _node.data;
    this._id = _node.id;
};

// public instance properties:

Object.defineProperty(Node.prototype, 'id', {
    get: function() {
        return this._id;
    }
});


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
    console.log(typeof id);
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
            //var nodo = new Node(node);
            //console.log('\n\n***************Nodo completo:\n%s', JSON.stringify(nodo) );
            //console.log('\n--------------- Sólo parte data:\n%s',JSON.stringify(nodo.data));
            //console.log('\n--------------- Sólo parte id:\n%s',JSON.stringify(nodo._id));
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
        /*
         * TODO: Falta implementar índice en nodos
        node.index(INDEX_NAME, INDEX_KEY, INDEX_VAL, function(err) {
            if (err)
                return callback(err);
            callback(null, node);
        });
        */
    });
};


Node.getAttributesLikeNodeType = function getAttributesLikeNodeType(nodeType, callback) {
    var query = [
        'START n=node(*)',
        'WHERE n.tipo = {tipo}',
        'RETURN n'
    ].join('\n');

    var params = {
        tipo: nodeType
    };
    
    console.log('getAttributesLikeNodeType: params --> %s', JSON.stringify(params));

    db.query(query, params, function(err, nodes) {
        if (err)
            return callback(err, []);
        var attributeValues = nodes.map(function(node) {
            //console.log('getAttributesLikeNodeType: node del map --> \n%s', JSON.stringify(node));
            //console.log('getAttributesLikeNodeType: node.data del map --> \n%s', JSON.stringify(node.n.data));
            return _.keys(node.n.data);
        });
        //console.log('lista de atributos recuperada para %s --> %s', nodeType.toString(), JSON.stringify(attributeValues));
        // compacta la lista de atributos elimunando valores duplicados
        //console.log('lista con flatten --> %s', JSON.stringify(_.flatten(attributeValues)));
        var attrNoDup = _.union(_.flatten(attributeValues));

        callback(null, attrNoDup);
    });
};

Node.getNodeTypes = function getNodeTypes(callback) {
    var query = [
        'START n=node(*)',
        'RETURN collect(distinct n.tipo) AS res'
    ].join('\n');

    db.query(query, function(err, types) {
        if (err)
            return callback(err, []);

        var values = _.first(_.values(_.first(types)));
        //console.log("Resultado consulta de tipos de nodos --> %s",JSON.stringify(types));
        //console.log("tipos de nodos --> %s",JSON.stringify(values));
        callback(null, values);
    });
};
