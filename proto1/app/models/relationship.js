// relationship.js
// Relationship model logic.

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');
var validator = require('../../lib/validator');
var _ = require('underscore');

// constants:
var INDEX_NAME = 'relationship';

// private constructor:
var Relationship = module.exports = function Relationship(_relationship, _fromNode, _toNode) {
    // all we'll really store is the relationship; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    //console.log('\n--------------- Relación Completa:\n%s',JSON.stringify(_relationship));
    var that = this;

    this._relationship = _relationship;
    this._data = _relationship['data'];
    this._type = _relationship['type'];
    this._id = _relationship.id;

    this.fromNodeId = _relationship.start.id;
    this.toNodeId = _relationship.end.id;
    if (_fromNode) {
        this.fromNodeType = _fromNode.data.tipo;
        this.fromNodeName = _fromNode.data.nombre;
    } else {
        this.fromNodeType = "";
        this.fromNodeName = "";
    }

    if (_toNode) {
        this.toNodeType = _toNode.data.tipo;
        this.toNodeName = _toNode.data.nombre;
    } else {
        this.toNodeType = "";
        this.toNodeName = "";
    }

};

// public instance properties:

Object.defineProperty(Relationship.prototype, 'id', {
    get: function() {
        return this._id;
    }
});


Object.defineProperty(Relationship.prototype, 'exists', {
    get: function() {
        return this._relationship.exists;
    }
});

Object.defineProperty(Relationship.prototype, 'attribute', {
    get: function(attribute) {
        return this._relationship.data[attribute];
    },
    set: function(attribute, value) {
        this._relationship.data[attribute] = value;
    }
});


// private instance methods:

// public instance methods:

Relationship.prototype.save = function save(callback) {
    this._relationship.save(function(err, relationship) {
        callback(err, relationship);
    });
};

Relationship.prototype.del = function del(callback) {
    this._relationship.del(function(err) {
        callback(err);
    }, true);   // true = yes, force it (delete all relationships)
};

// static methods:

Relationship.get = function get(id, callback) {
    Relationship.getQuery('ID(r) = {relId}', '{"relId":' + id + '}', function(err, relationships) {
        if (err) {
            //console.log("error en getQuety --> %s",err)
            return callback(err);
        }
        //console.log("resultado getQuery -->\n%s",JSON.stringify(relationship));
        callback(null, relationships[0]);
    });

    /*
     db.getRelationshipById(id, function(err, relationship) {
     if (err)
     return callback(err);
     callback(null, new Relationship(relationship));
     });
     */

};

Relationship.getAll = function getAll(callback) {
    var query = [
        'START o=node(*)',
        'MATCH o -[r]-> d',
        'RETURN o,r,d'
    ].join('\n');

    db.query(query, function(err, relationships) {
        if (err)
            return callback(err, []);
        var relationships = relationships.map(function(relationship) {
            return new Relationship(relationship['r'], relationship['o'], relationship['d']);
        });
        //console.log('\n\n***************TODOS los nodos:\n%s', JSON.stringify(relationships));
        callback(null, relationships);
    });
};

Relationship.getRelationshipFromNode = function getRelationshipFromNode(fromNode, callback) {
    var query = [
        'START o=node({node})',
        'MATCH o -[r]-> d',
        'RETURN o,r,d'
    ].join('\n');

    var params = {
        node: fromNode
    };

    db.query(query, params, function(err, relationships) {
        if (err)
            return callback(err, []);
        var relationships = relationships.map(function(relationship) {
            return new Relationship(relationship['r'], relationship['o'], relationship['d']);
        });
        callback(null, relationships);
    });
};

//TODO --> en vías de desarrollo
Relationship.getQuery = function getQuery(where, params, callback) {
    var query = [
        'START o=node(*)',
        'MATCH o-[r]->d',
        'WHERE ', where,
        ' RETURN o,r,d'
    ].join('\n');

    db.query(query, JSON.parse(params), function(err, rels) {
        if (err)
            return callback(err, []);
        var relationships = rels.map(function(relationship) {
            return new Relationship(relationship['r'], relationship['o'], relationship['d']);
        });
        callback(null, relationships);
    });
};

// creates the relationship and persists (saves) it to the db, incl. indexing it:
Relationship.create = function create(fromNode, relType, toNode, callback) {
    //console.log('create relationship relType: %s',relType);
    fromNode._node.createRelationshipTo(toNode._node, relType, {}, function(err, rel) {
        var relationship;
        if (!err) {
            //console.log("rel --> %s", JSON.stringify(rel));
            relationship = new Relationship(rel, fromNode._node, toNode._node);
            callback(null, relationship);
        } else {
            //console.log("err x create --> %s", err);
            callback(err, null);
        }
    });
};


Relationship.getAttributesLikeRelationshipType = function getAttributesLikeRelationshipType(relationshipType, callback) {
    var query = [
        'START o=node(*)',
        'MATCH (o)-[r]->(d)',
        'WHERE TYPE(r) = {tipo}',
        'RETURN r'
    ].join('\n');

    var params = {
        tipo: relationshipType
    };

    //console.log('getAttributesLikeRelationshipType: params --> %s', JSON.stringify(params));

    db.query(query, params, function(err, relationships) {
        if (err)
            return callback(err, []);
        var attributeValues = relationships.map(function(relationship) {
            return _.keys(relationship['r'].data);
        });
        var attrNoDup = _.union(_.flatten(attributeValues));

        callback(null, attrNoDup);
    });
};

Relationship.getRelationshipTypes = function getRelationshipTypes(callback) {
    var query = [
        'START o=node(*)',
        'MATCH (o)-[r]->(d)',
        'RETURN collect(distinct TYPE(r)) AS res'
    ].join('\n');

    db.query(query, function(err, types) {
        if (err)
            return callback(err, []);

        var values = _.first(_.values(_.first(types)));
        //console.log("Resultado consulta de tipos de relaciones --> %s",JSON.stringify(types));
        //console.log("tipos de relaciones --> %s",JSON.stringify(values));
        callback(null, values);
    });
};