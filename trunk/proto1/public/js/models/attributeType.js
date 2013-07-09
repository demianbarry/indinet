define('AttributeTypeModel', [
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var AttributeType;

    AttributeType = Backbone.Model.extend({
        idAttribute: "_id",
        urlRoot: "/api/v1/attributeTypes",
        // set defaults for checking existance in the template for the new model
        defaults: {
            name: '',
            dataType: 'string',
            mandatory: 'opcional',
            validator: ''
        },
        validate: function(attrs) {
            var fields, i, len, nameLen, compLen, errors = {};

            /**
             * HACK: don't validate when silent is passed as an attribute
             * Useful when fetching model from server only by id
             */
            if (!attrs._silent) {
                // check required fields
                fields = ['name', 'dataType', 'mandatory'];
                for (i = 0, len = fields.length; i < len; i++) {
                    if (!attrs[fields[i]]) {
                        errors[fields[i]] = fields[i] + ' required';
                    }
                }

                // check valid name
                nameLen = (attrs.name) ? attrs.name.length : null;
                if (nameLen < 2 || nameLen > 100) {
                    errors.name = "nombre inválido. Debe tener un logitud de entre 2 y 100 caracteres";
                }

                // check valid dataType
                if ('string number geopoint stringList stringNumber poligon'.indexOf(attrs.dataType) === -1) {
                    errors.dataType = "tipo de dato incorrecto";
                }

                // check valid mandatory
                if ('nodo relación ambos opcional'.indexOf(attrs.mandatory) === -1) {
                    errors.mandatory = "tipo de dato incorrecto";
                }

                //console.log('js/models/attributeType.js validate 2 %s %d', JSON.stringify(errors),_.keys(errors).length);
                if (_.keys(errors).length) {
                    //console.log('js/models/attributeType.js validate 1');
                    return {
                        errors: errors
                    };
                }
            }

        }
    });

    return AttributeType;
});
