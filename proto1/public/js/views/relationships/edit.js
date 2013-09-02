define('RelationshipEditView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/relationships/edit.html',
    'RelationshipModel',
    'AttributeTypeCollection'
], function($, _, Backbone, moment, tpl, Relationship, AttributeTypeCollection) {
    var RelationshipEditView;

    RelationshipEditView = Backbone.View.extend({
        initialize: function() {
            console.log('initialize');
            this.attributeTypeCollection = new AttributeTypeCollection();
            this.attributeTypeCollection.fetch({
                success: function() {
                    return true;
                },
                error: function(coll, res) {
                    if (res.status === 404) {
                        // TODO: handle 404 Not Found
                    } else if (res.status === 500) {
                        // TODO: handle 500 Internal Server Error
                    }
                }
            });
            
            this.template = _.template(tpl);

            this.errTmpl = '<div class="span4">';
            this.errTmpl += '<div class="alert alert-error">';
            this.errTmpl += '<button type="button" class="close" data-dismiss="alert">x</button>';
            this.errTmpl += '<%- msg %>';
            this.errTmpl += '</div>';
            this.errTmpl += '</div>';
            this.errTmpl = _.template(this.errTmpl);

            // Configura template para agregar un registro de atributo
            this.next = 0;
            this.attrTempl = '<div class="row show-grid" id="row<%= attr %>">';
            this.attrTempl += '<div class="span4 input-append">';
            this.attrTempl += '<input type="text" class="span3 input-xlarge attribute-name" id="attribute-input<%= attr %>" data-provide="typeahead" value="<%= attrValue %>" />';
            this.attrTempl += '<button class="btn"><i class="icon-plus-sign"></i></button>';
            this.attrTempl += '<button class="btn"><i class="icon-search"></i></button>';
            this.attrTempl += '</div>';
            this.attrTempl += '<div class="span4">';
            // string
            this.attrTempl += '<input type="text" class="input-xlarge attribute-value" id="value-input<%= attr %>-string" value="<%= value %>"/>';
            // number            
            this.attrTempl += '<input type="number" class="input-xlarge attribute-value" id="value-input<%= attr %>-number" value="<%= value %>" style="display:none" />';
            // date
            this.attrTempl += '<input type="date" class="input-xlarge attribute-value" id="value-input<%= attr %>-date" value="<%= value %>" style="display:none" />';
            // numberRange
            this.attrTempl += '<input type="number" class="input-xlarge attribute-value" id="value-input<%= attr %>-rangeNumber.from" value="<%= value %>" style="display:none" placeholder="desde"/>';
            this.attrTempl += '<input type="number" class="input-xlarge attribute-value" id="value-input<%= attr %>-rangeNumber.to" value="<%= value %>" style="display:none" placeholder="hasta"/>';
            // dateRange
            this.attrTempl += '<input type="date" class="input-xlarge attribute-value" id="value-input<%= attr %>-rangeDate.from" value="<%= value %>" style="display:none" placeholder="desde"/>';
            this.attrTempl += '<input type="date" class="input-xlarge attribute-value" id="value-input<%= attr %>-rangeDate.to" value="<%= value %>" style="display:none" placeholder="hasta"/>';
            // geopoint
            this.attrTempl += '<input type="number" class="input-xlarge attribute-value" id="value-input<%= attr %>-geopoint.lat" value="<%= value.lat ? value.lat : value %>" style="display:none" placeholder="latitud"/>';
            this.attrTempl += '<input type="number" class="input-xlarge attribute-value" id="value-input<%= attr %>-geopoint.lon" value="<%= value.lon ? value.lon : value %>" style="display:none" placeholder="longitud" />';
            this.attrTempl += '</div>';
            this.attrTempl += '<div class="span1">';
            this.attrTempl += '<button id="deleteButton<%= attr %>" class="btn btn-danger del-btn" type="button" name="<%= attr %>">-</button>';
            this.attrTempl += '</div>';
            this.attrTempl += '</div>';
            this.attrTempl = _.template(this.attrTempl);
            //console.log(this.attrTempl);

            //this.attributes = {};
            // string number date geopoint numberRange dateRange stringList numberList poligon
            //this.attributes.string=_.template(this.attrTempl += '<input type="text" class="input-xlarge" id="value-input<%= attr %>" value="val<%= value %>" />');

            // inicializa la lista de valores del typeahead de los atributos
            this.attrKeys = [];
        },
        events: {
            "focus .input-prepend input": "removeErrMsg",
            "click #addButton": "addAttributeRec",
            "click .del-btn": "deleteAttributeRec",
            "click .save-btn": "saveRelationship",
            "click .back-btn": "goBack",
            "change input.attribute-name": "showInputs"
        },
        render: function() {
            console.log('render');
            var tmpl;
            var that = this;
            var relationship = this.model.toJSON();
            tmpl = this.template({relationship: relationship});
            $(this.el).html(tmpl);
            _.each(_.keys(relationship._relationship._data.data), function(attributeName) {
                that.next = that.next + 1;
                $(that.el).find("#afterRow").before(that.attrTempl({attr: that.next.toString(), attrValue: attributeName, value: relationship._relationship._data.data[attributeName]}));
                var element = '#attribute-input' + that.next.toString();
                $($(this.el).find(element)).typeahead({source: that.attrList});
            });
            return this;
        },
        goBack: function(e) {
            //console.log('/js/views/relationships/edit.js goBack 2');
            e.preventDefault();
            this.trigger('back');
        },
        addAttributeRec: function(e) {
            e.preventDefault();
            var that = this;
            var relationshipType = 'NO ENCUENTRA EL TIPO @@##@#';
            
            // recupera el tipo de nodo si existe
            var relationship = this.model.toJSON();
            var type = relationship._type;
            if (type)
                relationshipType = type;

            // recupera lista de keys de attributos de nodos similares
            getAttrKeys(relationshipType, function(err, attrKeys) {
                if (err) {
                    console.log('imposible recuperar keys: %s', err);
                    that.attrKeys = [];
                }
                else {
                    that.attrKeys = attrKeys;
                }
                
                that.next = that.next + 1;
                $(that.el).find("#afterRow").before(that.attrTempl({attr: that.next.toString(), attrValue: '', value: ''}));
                var element = '#attribute-input' + that.next.toString();
                $($(that.el).find(element)).typeahead({source: that.attrKeys, minLength: 0, });
              
            });

        },
        deleteAttributeRec: function(e) {
            e.preventDefault();
            var recNumber = e.target.attributes['name'].relationshipValue;
            var removeFrom = "#row" + recNumber;
            $(this.el).find(removeFrom).remove();
        },
        saveRelationship: function(e) {
            //console.log('/js/views/relationships/edit.js saveRelationship 1');
            e.preventDefault();

            var that = this;
            var relationship = this.model.toJSON();
            var dataRelationship = "{";
            //TODO hay que recorrer todos los elementos de la página e ir al ramdo JSON
            $(this.el).find(".show-grid").each(function(index, element) {
                var elementAttr = $($(element).children()[0]).children()[0];
                var elementVal = $($(element).children()[1]).children()[0];
                var attr = elementAttr.value;
                var val = elementVal.value;
                if (attr.length !== 0) {
                    if (dataRelationship !== '{') {
                        dataRelationship += ',';
                    }
                    dataRelationship += '"' + attr + '": ';
                    dataRelationship += '"' + val + '"';
                }
            });

            dataRelationship += '}';
            console.log('dataRelationship --> %s', JSON.stringify(dataRelationship));
            console.log('dataRelationship --> %s', JSON.stringify(dataRelationship.toJSON));

            this.model.save({data: dataRelationship},
            {
                silent: false,
                sync: true,
                success: function(model, res) {
                    if (res && _.keys(res.errors).length) {
                        //console.log('/js/views/relationships/edit.js saveRelationship 4 %s', JSON.stringify(res));
                        that.renderErrMsg(res.errors);
                    } else {
                        model.trigger('save-success', model.get('_id'));
                    }
                },
                error: function(model, res) {
                    //console.log('/js/views/relationships/edit.js saveRelationship 2 %s', JSON.stringify(res));
                    if (res && res.errors) {
                        that.renderErrMsg(res.errors);
                    } else if (res.status === 404) {
                        // TODO: handle 404 Not Found
                    } else if (res.status === 500) {
                        // TODO: handle 500 Internal Server Error
                    }
                }
            });
        },
        renderErrMsg: function(err) {
            //console.log('/js/views/relationships/edit.js saveRelationship 3 %s', JSON.stringify(err));
            var msgs = [];

            this.removeErrMsg();

            if (_.isString(err)) {
                msgs.push(err);
            } else {
                if (err.general) {
                    msgs.push(err.general);
                    delete err.general;
                }
                if (_.keys(err).length) {
                    msgs.push(_.keys(err).join(', ') + ' field(s) are invalid');
                }
            }
            msgs = _.map(msgs, function(string) {
                // uppercase first letter
                return string.charAt(0).toUpperCase() + string.slice(1);
            }).join('.');
            $(this.el).find('form').after(this.errTmpl({msg: msgs}));
        },
        removeErrMsg: function() {
            $(this.el).find('.alert-error').remove();
        },
        showInputs: function(ev) {
            //console.log($('#row' + $(ev.target).attr('id').match(/attribute-input(\d{1})/)[1]));
            var attributeType = this.attributeTypeCollection.where({name:$(ev.target).val()})[0];
            if (attributeType) {                
                var type = attributeType.get("dataType");
                var attrId = $(ev.target).attr('id').match(/attribute-input(\d{1})/)[1];
                $('#row' + attrId).find('input.attribute-value').hide();
                $('[id^=value-input' + attrId + '-'+type+']').show();                
            }
        }
    });

    // recuepra vía ajax la lista de keys de las relaciones del mismo tipo
    function getAttrKeys(relationshipType, callback) {
        $.post('/relationship/getAttributesLikeRelationshipType', {relationshipType: relationshipType}, function(data) {
            //console.log('keys recuperadas para %s --> %s', relationshipType, JSON.stringify(data));
            callback(null, data);
        }).error(function() {
            callback('TODO');
        });
    };

    // recuepra vía ajax la lista de todos los tipos de nodos
    function getTypes(callback) {
        $.post('/relationship/getRelationshipTypes', function(data) {
            //console.log('keys recuperadas para %s --> %s', relationshipType, JSON.stringify(data));
            callback(null, data);
        }).error(function() {
            callback('TODO');
        });
    };

    return RelationshipEditView;
});
