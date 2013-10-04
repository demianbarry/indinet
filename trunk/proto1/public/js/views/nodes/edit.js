define('NodeEditView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/nodes/edit.html',
    'text!templates/errTmpl.html',
    'text!templates/addAttrTmpl.html',
    'text!templates/attrTmpl.html',
    'NodeModel',
    'AttributeTypeCollection'
], function($, _, Backbone, moment, tpl, errTmpl, addAttrTmpl, attrTmpl, Node, AttributeTypeCollection) {
    var NodeEditView;

    NodeEditView = Backbone.View.extend({
        initialize: function() {
            //console.log('initialize');
            this.attributeTypeCollection = new AttributeTypeCollection();
            this.getAttributeTypes();

            this.attributeTypeCollection.bind("reset", this.getAttributeTypes, this);
            this.attributeTypeCollection.bind("sync", this.getAttributeTypes, this);


            this.template = _.template(tpl);
            this.errTmpl = _.template(errTmpl);
            this.addAttrTmpl = _.template(addAttrTmpl);

            // Configura template para agregar un registro de atributo
            this.next = 0;
            this.attrTmpl = _.template(attrTmpl);
            //console.log(this.attrTmpl);

            //this.attributes = {};
            // string number date geopoint numberRange dateRange stringList numberList poligon
            //this.attributes.string=_.template(this.attrTmpl += '<input type="text" class="input-xlarge" id="value-input<%= attr %>" value="val<%= value %>" />');

            // inicializa la lista de valores del typeahead de los atributos
            this.attrKeys = [];
            this.nodeTypes = [];
        },
        getAttributeTypes: function() {
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
        },
        events: {
            "focus .input-prepend input": "removeErrMsg",
            "click #addButton": "addAttributeRec",
            "click .del-btn": "deleteAttributeRec",
            "click .save-btn": "saveNode",
            "click .back-btn": "goBack",
            "change input.attribute-name": "showInputs",
            "click #_addAttr": "addAttr"
        },
        render: function() {
            //console.log('render');
            var tmpl;
            var that = this;
            var node = this.model.toJSON();

            // verifica se es new o edit... sino le crea los attr obligatorios
            if (!node._node) {
                node._node = {_data: {data: {tipo: "", nombre: ""}}};
            }

            tmpl = that.template({node: node});
            $(that.el).html(tmpl);

            // recupera los tipos de nodo y setea al typeahead
            getNodeTypes(function(err, nodeTypes) {
                if (err) {
                    console.log('imposible recuperar tipos de nodo: %s', err);
                    that.nodeTypes = [];
                }
                else {
                    that.nodeTypes = nodeTypes;
                }

                _.each(_.keys(node._node._data.data), function(attributeName) {
                    that.next = that.next + 1;
                    var attributeType = that.attributeTypeCollection.where({name: attributeName})[0];
                    var type = "string";
                    if (attributeType) {
                        type = attributeType.get("dataType");
                    }
                    var attributeValue = node._node._data.data[attributeName], val = "", val2 = "";
                    attributeValue = attributeValue.replace(/'/g, '"');
                    switch (type) {
                        case 'string':
                            val = attributeValue;
                            break;
                        case 'number':
                            val = attributeValue;
                            break;
                        case 'date':
                            val = attributeValue;
                            break;
                        case 'numberRange':
                            val = JSON.parse(attributeValue).desde;
                            val2 = JSON.parse(attributeValue).hasta;
                            break;
                        case 'dateRange':
                            val = JSON.parse(attributeValue).desde;
                            val2 = JSON.parse(attributeValue).hasta;
                            break;
                        case 'geopoint':
                            val = JSON.parse(attributeValue).lat;
                            val2 = JSON.parse(attributeValue).long;
                            break;
                        default:
                            val = attributeValue;
                            break;
                    }
                    $(that.el).find("#afterRow").before(that.attrTmpl({attr: that.next.toString(), attrValue: attributeName, value: val, value2: val2}));
                    var element = '#attribute-input' + that.next.toString();
                    $($(that.el).find(element)).typeahead({source: that.attrList});
                    var valTipo = '#value-input' + that.next.toString() + "-string";
                    $($(that.el).find(valTipo)).typeahead({source: that.nodeTypes});
                    showDataType(type, that.next.toString());
                });
            });

            return this;
        },
        goBack: function(e) {
            //console.log('/js/views/nodes/edit.js goBack 2');
            e.preventDefault();
            this.trigger('back');
        },
        addAttributeRec: function(e) {
            e.preventDefault();
            var that = this;
            var nodeType = 'NO ENCUENTRA EL TIPO @@##@#';

            // recupera el tipo de nodo si existe
            if (!this.model.isNew()) {
                var node = this.model.toJSON();
                var type = _.values(_.pick(node._node._data.data, 'tipo'))[0];
                if (type)
                    nodeType = type;
            } else {
                //TODO: buscar en html el tipo 
            }

            getAttrKeys(nodeType, function(err, attrKeys) {
                if (err) {
                    console.log('imposible recuperar keys: %s', err);
                    that.attrKeys = [];
                }
                else {
                    that.attrKeys = attrKeys;
                }

                that.next = that.next + 1;
                $(that.el).find("#afterRow").before(that.attrTmpl({attr: that.next.toString(), attrValue: '', value: '', value2: ''}));
                var element = '#attribute-input' + that.next.toString();
                $($(that.el).find(element)).typeahead({source: that.attrKeys, minLength: 0, });

            });

        },
        deleteAttributeRec: function(e) {
            e.preventDefault();
            var recNumber = e.target.attributes['name'].nodeValue;
            var removeFrom = "#row" + recNumber;
            $(this.el).find(removeFrom).remove();
        },
        saveNode: function(e) {
            //console.log('/js/views/nodes/edit.js saveNode 1');
            e.preventDefault();

            var that = this;
            var dataNode = "{";
            //TODO hay que recorrer todos los elementos de la página e ir armando JSON
            $(that.el).find(".show-grid").each(function(index, element) {
                var elementAttr = $($(element).children()[0]).children()[0];
                var attr = elementAttr.value;
                var attributeType = that.attributeTypeCollection.where({name: attr})[0];
                var type = "string";
                if (attributeType) {
                    type = attributeType.get("dataType");
                }
                var elementVal = "", desde, hasta, long, lat;
                switch (type) {
                    case 'string':
                        elementVal = $($(element).children()[1]).children()[0].value;
                        break;
                    case 'number':
                        elementVal = $($(element).children()[1]).children()[1].value;
                        break;
                    case 'date':
                        elementVal = $($(element).children()[1]).children()[2].value;
                        break;
                    case 'numberRange':
                        desde = $($(element).children()[1]).children()[3].value;
                        hasta = $($(element).children()[1]).children()[4].value;
                        elementVal = "{'desde':'" + desde + "', 'hasta':'" + hasta + "'}";
                        break;
                    case 'dateRange':
                        desde = $($(element).children()[1]).children()[5].value;
                        hasta = $($(element).children()[1]).children()[6].value;
                        elementVal = "{'desde':'" + desde + "', 'hasta':'" + hasta + "'}";
                        break;
                    case 'geopoint':
                        lat = $($(element).children()[1]).children()[7].value;
                        long = $($(element).children()[1]).children()[8].value;
                        elementVal = "{'lat':'" + lat + "', 'long':'" + long + "'}";
                        break;
                    default:
                        elementVal = $($(element).children()[1]).children()[0].value;
                        break;
                }
                if (attr.length !== 0) {
                    if (dataNode !== '{') {
                        dataNode += ',';
                    }
                    dataNode += '"' + attr + '": ';
                    dataNode += '"' + elementVal + '"';
                }
            });

            dataNode += '}';
            //console.log('dataNode --> %s', JSON.stringify(dataNode));
            console.log('dataNode --> %s', JSON.stringify(dataNode.toJSON));

            that.model.save({data: dataNode},
            {
                silent: false,
                sync: true,
                success: function(model, res) {
                    if (res && res.errors) {
                        //console.log('/js/views/nodes/edit.js saveNode 4 %s', JSON.stringify(res));
                        that.renderErrMsg(res.errors);
                    } else {
                        model.trigger('save-success', model.get('_id'));
                    }
                },
                error: function(model, res) {
                    //console.log('/js/views/nodes/edit.js saveNode 2 %s', JSON.stringify(res));
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
            //console.log('/js/views/nodes/edit.js saveNode 3 %s', JSON.stringify(err));
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
        renderAttrMsg: function(attrName) {
            $(this.el).find('form').after(this.addAttrTmpl({attr: attrName}));
        },
        showInputs: function(ev) {
            //console.log($('#row' + $(ev.target).attr('id').match(/attribute-input(\d{1})/)[1]));
            var attrName = $(ev.target).val();
            Backbone.sync("read", this.attributeTypeCollection);
            var attributeType = this.attributeTypeCollection.where({name: attrName})[0];
            if (attributeType) {
                var type = attributeType.get("dataType");
                var attrId = $(ev.target).attr('id').match(/attribute-input(\d{1})/)[1];
                showDataType(type, attrId);
            } else {
                // no existe el atributo, debe crearlo
                this.renderAttrMsg(attrName);
                $(ev.target).val("");
            }
        },
        addAttr: function(ev) {
            // TODO: Implementar modal de alta de atributo - Refrescar valores de atributos de la colección
            indinet.navigate('#/indinet/attributeTypes/new', {trigger: true, replace: false});
        }
    });

    // recuepra vía ajax la lista de keys de nodos del mismo tipo
    function getAttrKeys(nodeType, callback) {
        $.post('/node/getAttributesLikeNodeType', {nodeType: nodeType}, function(data) {
            //console.log('keys recuperadas para %s --> %s', nodeType, JSON.stringify(data));
            callback(null, data);
        }).error(function() {
            callback('TODO');
        });
    }
    ;

    // recuepra vía ajax la lista de tipos de nodos
    function getNodeTypes(callback) {
        $.post('/node/getNodeTypes', function(data) {
            //console.log('keys recuperadas para %s --> %s', nodeType, JSON.stringify(data));
            callback(null, data);
        }).error(function() {
            callback('TODO');
        });
    }
    ;

    // muestra el tipo de atributo que corresponde según el data type
    function showDataType(type, attrId) {
        $('#row' + attrId).find('input.attribute-value').hide();
        $('#row' + attrId).find('#value-input' + attrId + '-' + type).show();
    }

    return NodeEditView;
});
