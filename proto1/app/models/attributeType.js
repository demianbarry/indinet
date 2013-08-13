çmodule.exports = function(mongoose) {
    var validator = require('../../lib/validator'),
            Schema = mongoose.Schema,
            AttributeType;

    var dataTypes = 'string number date geopoint numberRange dateRange stringList numberList poligon'.split(' ');
    var mandatoryObjects = 'nodo relación ambos opcional'.split(' ');

    AttributeType = new Schema({
        name: {
            type: String,
            validate: [validator({
                    length: {
                        min: 2,
                        max: 100
                    }
                }), "name"],
            unique: true,
            required: true
        },
        dataType: {
            type: String,
            enum: dataTypes,
            default: 'string',
            required: true
        },
        mandatory: {
            type: String,
            enum: mandatoryObjects,
            default: 'opcional',
            required: true
        },
        validator: {
            type: String,
            required: false
        }
    });

    // similar to SQL's like
    function like(query, field, val) {
        return (field) ? query.regex(field, new RegExp(val, 'i')) : query;
    }

    AttributeType.statics.search = function search(params, callback) {
        var Model = mongoose.model('AttributeType'),
                query = Model.find();


        like(query, 'name', params.name);
        like(query, 'dataType', params.dataType);

        query.exec(callback);
    };

    AttributeType.statics.findById = function findById(id, callback) {
        var Model = mongoose.model('AttributeType'),
                query = Model.find();

        if (id.length !== 24) {
            callback(null, null);
        } else {
            Model.findOne().where('_id', id).exec(callback);
        }
    };

    return mongoose.model('AttributeType', AttributeType);
}
