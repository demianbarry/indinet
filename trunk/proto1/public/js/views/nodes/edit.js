define('NodeEditView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/nodes/edit.html',
    'NodeModel'
], function($, _, Backbone, moment, tpl, Node) {
    var NodeEditView;

    NodeEditView = Backbone.View.extend({
        initialize: function() {
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
            this.attrTempl = '<div class="row show-grid" id="rowabcdefg">';
            this.attrTempl += '<div class="span4 input-append">';
            this.attrTempl += '<input type="text" class="span3 input-xlarge" id="attribute-inputabcdefg" data-provide="typeahead" value="attrxyz" />';
            this.attrTempl += '<button class="btn"><i class="icon-plus-sign"></i></button>';
            this.attrTempl += '<button class="btn"><i class="icon-search"></i></button>';
            this.attrTempl += '</div>';
            this.attrTempl += '<div class="span4">';
            this.attrTempl += '<input type="text" class="input-xlarge" id="value-inputabcdefg" value="valxyz" />';
            this.attrTempl += '</div>'
            this.attrTempl += '<div class="span1">';
            this.attrTempl += '<button id="deleteButtonabcdefg" class="btn btn-danger del-btn" type="button" name="abcdefg">-</button>';
            this.attrTempl += '</div>'
            this.attrTempl += '</div>';

            // inicializa la lista de valores del typeahead de los atributos
            this.attrList = ["val1", "val2", "val3"];
            this.attrKeys = [];
        },
        events: {
            "focus .input-prepend input": "removeErrMsg",
            "click #addButton": "addAttributeRec",
            "click .del-btn": "deleteAttributeRec",
            "click .save-btn": "saveNode",
            "click .back-btn": "goBack"
        },
        render: function() {
            var tmpl;
            var that = this;
            var node = this.model.toJSON();
            tmpl = this.template({node: this.model.toJSON()});
            $(this.el).html(tmpl);
            _.each(_.keys(node._node._data.data), function(attributeName) {
                that.next = that.next + 1;
                var attrTemp = that.attrTempl;
                attrTemp = attrTemp.replace(/abcdefg/g, that.next.toString());
                attrTemp = attrTemp.replace(/attrxyz/g, attributeName);
                attrTemp = attrTemp.replace(/valxyz/g, node._node._data.data[attributeName]);
                $(that.el).find("#afterRow").before(attrTemp);
                var element = '#attribute-input' + that.next.toString();
                $($(this.el).find(element)).typeahead({source: that.attrList});
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

            // recupera lista de keys de attributos de nodos similares
            var nodeType = 'PERSONA';
            getAttrKeys(nodeType, that.attrKeys);

            that.next = that.next + 1;
            var attrTemp = that.attrTempl.replace(/abcdefg/g, that.next.toString());
            attrTemp = attrTemp.replace(/attrxyz/g, "");
            attrTemp = attrTemp.replace(/valxyz/g, "");
            //console.log('addAttributeRec --> %s',addto);
            $(this.el).find("#afterRow").before(attrTemp);
            var element = '#attribute-input' + that.next.toString();
            $($(this.el).find(element)).typeahead({source: that.attrList});
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
            var node = this.model.toJSON();
            var dataNode = "{";
            //TODO hay que recorrer todos los elementos de la página e ir al ramdo JSON
            $(this.el).find(".show-grid").each(function(index, element) {
                var elementAttr = $($(element).children()[0]).children()[0];
                var elementVal = $($(element).children()[1]).children()[0];
                var attr = elementAttr.value;
                var val = elementVal.value;
                if (attr.length !== 0) {
                    if (dataNode !== '{') {
                        dataNode += ',';
                    }
                    dataNode += '"' + attr + '": ';
                    dataNode += '"' + val + '"';
                }
            });

            dataNode += '}';
            console.log('dataNode --> %s', JSON.stringify(dataNode));
            console.log('dataNode --> %s', JSON.stringify(dataNode.toJSON));

            this.model.save({data: dataNode},
            {
                silent: false,
                sync: true,
                success: function(model, res) {
                    if (res && _.keys(res.errors).length) {
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
        }
    });

    // recuepra vía ajax la lista de keys de nodos del mismo tipo
    function getAttrKeys(nodeType, dataKeys) {
        $.post('/node/getAttributesLikeNodeType', {nodeType: nodeType}, function(data) {
            console.log('keys recuperadas para %s --> %s', nodeType, JSON.stringify(data));
            dataKeys = data;
        }).error(function() {
            console.log('imposible recuperar keys: %s', 'TODO');
        });
    }
    ;

    return NodeEditView;
});
