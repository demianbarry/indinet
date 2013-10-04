define('RelationshipEditView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/relationships/edit.html',
    'text!templates/errTmpl.html',
    'text!templates/addAttrTmpl.html',
    'text!templates/attrTmpl.html',
    'RelationshipModel',
    'AttributeTypeCollection',
    'NodeCollection',
    'NodeContainerView'
], function($, _, Backbone, moment, tpl, errTmpl, addAttrTmpl, attrTmpl, Relationship, AttributeTypeCollection, NodeCollection, NodeContainerView) {
    var RelationshipEditView;

    RelationshipEditView = Backbone.View.extend({
        initialize: function() {
            //console.log('initialize');
            //setea that por cuestiones de visibilidad en callbacks
            that = this;

            // recupera los atributos
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

            // recupera los nodos para búsqueda
            this.nodeCollection = new NodeCollection();
            this.nodeCollection.fetch({
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

            // observer para cambiso en las colecciones
            this.attributeTypeCollection.bind("reset", this.render, this);
            this.attributeTypeCollection.bind("sync", this.render, this);
            this.nodeCollection.bind("reset", this.render, this);
            this.nodeCollection.bind("sync", this.render, this);


            this.template = _.template(tpl);
            this.errTmpl = _.template(errTmpl);
            this.addAttrTmpl = _.template(addAttrTmpl);

            // Configura template para agregar un registro de atributo
            this.next = 0;
            this.attrTmpl = _.template(attrTmpl);
            //console.log(this.attrTmpl);

            // inicializa la lista de valores de los typeahead
            this.attrKeys = [];
            this.relTypes = [];

            // guarda quien llamó a la modal, si fromNode o toNode
            this.triggerNode = null;

            // inicializa las modal de búsqueda
            if (!this.viewNodes) {
                this.viewNodes = new NodeContainerView(function(_nodeName) {
                    //console.log('nodo recuperado del modal --> %s', JSON.stringify(_nodeName));
                    // setea el nombre de nodo en quien lo disparó
                    $(that.triggerNode).val(_nodeName);
                });
            }
        },
        events: {
            "focus .input-prepend input": "removeErrMsg",
            "click #addButton": "addAttributeRec",
            "click .del-btn": "deleteAttributeRec",
            "click .save-btn": "saveRelationship",
            "click .back-btn": "goBack",
            "click #searchNode": "nodesModal",
            "change input.attribute-name": "showInputs",
            "click #_addAttr": "addAttr"
        },
        render: function() {
            //console.log('render');
            var tmpl;
            var that = this;
            var relationship = this.model.toJSON();
            tmpl = this.template({relationship: relationship});
            $(this.el).html(tmpl);

            // setea el typeahead para los tipos de realciones
            getTypes(function(err, types) {

                if (err) {
                    console.log('imposible recuperar tipos de relaciones: %s', err);
                    that.relTypes = [];
                } else {
                    that.relTypes = types;
                }

                if (relationship._id) {
                    // recorre lista de atributos y los muestra para editar
                    // asocia las listas de typeahead
                    _.each(_.keys(relationship._relationship._data.data), function(attributeName) {
                        that.next = that.next + 1;
                        var attributeType = that.attributeTypeCollection.where({name: attributeName})[0];
                        var type = "string";
                        if (attributeType) {
                            type = attributeType.get("dataType");
                        }
                        var attributeValue = relationship._data[attributeName], val = "", val2 = "";
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
                        $($(that.el).find(valTipo)).typeahead({source: that.relTypes});
                        showDataType(type, that.next.toString());
                    });
                } else {
                    // setea los typeahead del input de nueva relación
                    $(that.el).append(that.viewNodes.el);
                    var _element = $($(that.el).find('#_relType-input'))
                    _element.typeahead({source: that.relTypes});
                    var _nodesInput = $($(that.el).find('#_node-input'));
                    _.each(_nodesInput, function(_node) {
                        $(_node).typeahead({
                            source: function(query, process) {
                                //console.log('nodeCollection --> %s', JSON.stringify(that.nodeCollection));
                                var nodes = that.nodeCollection.pluck('_data');
                                var results = _.pluck(nodes, 'nombre');
                                //console.log('results typeahead --> %s', JSON.stringify(results));
                                process(results);
                            }
                        });

                    });

                }
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

            // recupera el tipo de relación si existe
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
                $(that.el).find("#afterRow").before(that.attrTmpl({attr: that.next.toString(), attrValue: '', value: '', value2: ''}));
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

            var that = this, dataRelationship;
            // si es actualización de relación recorre atributos y actualiza
            // sino arma nueva relación

            if (!this.model.isNew()) {
                // existe la relación, actualiza los atributos
                dataRelationship = "{";
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
                        if (dataRelationship !== '{') {
                            dataRelationship += ',';
                        }
                        dataRelationship += '"' + attr + '": ';
                        dataRelationship += '"' + elementVal + '"';
                    }
                });

                dataRelationship += '}';
            } else {
                //es nueva relación arma los datos con from, tipo y to
                var element = $(this.el).find(".new-relationship")
                var fromNode = $($($(element).children()[0]).children()[1]).val();
                var relType = $($($(element).children()[1]).children()[1]).val();
                var toNode = $($($(element).children()[2]).children()[1]).val();
                dataRelationship = '{"fromNode":"' + fromNode + '", "relType":"' + relType + '", "toNode":"' + toNode + '"}';
            }
            console.log('dataRelationship --> %s', JSON.stringify(dataRelationship));
            //console.log('dataRelationship --> %s', JSON.stringify(dataRelationship.toJSON));

            this.model.save({data: dataRelationship},
            {
                silent: false,
                sync: true,
                success: function(model, res) {
                    if (res && res.errors) {
                        //console.log('/js/views/relationships/edit.js saveRelationship 4 %s', JSON.stringify(res));
                        that.renderErrMsg(res.errors);
                    } else {
                        that.model = model;
                        var _id = model.get('_id');
                        //console.log("relación guardada exitosamente: %s",_id);
                        model.trigger('save-success', _id);
                        //that.render();
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
        nodesModal: function(ev) {
            var _parent = $($(ev.target).parent().get(0)).parent().get(0);
            var _nodoObjetivo = $(_parent).find('#_node-input').get(0)
            this.triggerNode = _nodoObjetivo;
            this.viewNodes.render();
            $('#nodesContainerModal').modal('show');
        },
        addAttr: function(ev) {
            // TODO: Implementar modal de alta de atributo - Refrescar valores de atributos de la colección
            indinet.navigate('#/indinet/attributeTypes/new', {trigger: true, replace: false});
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
    }
    ;

    // recuepra vía ajax la lista de todos los tipos de nodos
    function getTypes(callback) {
        $.post('/relationship/getRelationshipTypes', function(data) {
            //console.log('keys recuperadas para %s --> %s', relationshipType, JSON.stringify(data));
            callback(null, data);
        }).error(function() {
            callback('TODO');
        });
    }

// muestra el tipo de atributo que corresponde según el data type
    function showDataType(type, attrId) {
        $('#row' + attrId).find('input.attribute-value').hide();
        $('#row' + attrId).find('#value-input' + attrId + '-' + type).show();
    }


    return RelationshipEditView;
});
