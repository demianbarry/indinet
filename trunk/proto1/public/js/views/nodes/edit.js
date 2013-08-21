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
            console.log('initialize');
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
            this.attrTempl += '<input type="range" class="input-xlarge attribute-value" id="value-input<%= attr %>-numberRange" value="<%= value %>" style="display:none"/>';
            // dateRange
            this.attrTempl += '<input type="range" class="input-xlarge attribute-value" id="value-input<%= attr %>-dateRange" value="<%= value %>" style="display:none" />';
            // geopoint
            this.attrTempl += '<input type="number" class="input-xlarge attribute-value" id="value-input<%= attr %>-geopointlat" value="<%= value.lat %>" style="display:none" />';
            this.attrTempl += '<input type="number" class="input-xlarge attribute-value" id="value-input<%= attr %>-geopoint.lon" value="<%= value.lon %>" style="display:none" />';
            this.attrTempl += '</div>';
            this.attrTempl += '<div class="span1">';
            this.attrTempl += '<button id="deleteButton<%= attr %>" class="btn btn-danger del-btn" type="button" name="<%= attr %>">-</button>';
            this.attrTempl += '</div>';
            this.attrTempl += '</div>';
            this.attrTempl = _.template(this.attrTempl);
            console.log(this.attrTempl);

            //this.attributes = {};
            // string number date geopoint numberRange dateRange stringList numberList poligon
            //this.attributes.string=_.template(this.attrTempl += '<input type="text" class="input-xlarge" id="value-input<%= attr %>" value="val<%= value %>" />');

            // inicializa la lista de valores del typeahead de los atributos
            this.attrList = {'tipo': 'string'};
            this.attrKeys = [];
        },
        events: {
            "focus .input-prepend input": "removeErrMsg",
            "click #addButton": "addAttributeRec",
            "click .del-btn": "deleteAttributeRec",
            "click .save-btn": "saveNode",
            "click .back-btn": "goBack",
            "change input.attribute-name": "showInputs"
        },
        render: function() {
            console.log('render');
            var tmpl;
            var that = this;
            var node = this.model.toJSON();
            tmpl = this.template({node: this.model.toJSON()});
            $(this.el).html(tmpl);
            _.each(_.keys(node._node._data.data), function(attributeName) {
                that.next = that.next + 1;
                /*var attrTemp = that.attrTempl;
                 attrTemp = attrTemp.replace(/abcdefg/g, that.next.toString());
                 attrTemp = attrTemp.replace(/attr<%= value %>/g, attributeName);
                 attrTemp = attrTemp.replace(/val<%= value %>/g, node._node._data.data[attributeName]);
                 $(that.el).find("#afterRow").before(attrTemp);*/
                $(that.el).find("#afterRow").before(that.attrTempl({attr: that.next.toString(), attrValue: attributeName, value: node._node._data.data[attributeName]}));
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
            /*var attrTemp = that.attrTempl.replace(/abcdefg/g, that.next.toString());
             attrTemp = attrTemp.replace(/attr<%= value %>/g, "");
             attrTemp = attrTemp.replace(/val<%= value %>/g, "");
             //console.log('addAttributeRec --> %s',addto);
             $(this.el).find("#afterRow").before(attrTemp);*/
            $(that.el).find("#afterRow").before(that.attrTempl({attr: that.next.toString(), attrValue: '', value: ''}));
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
        },
        showInputs: function(ev) {
            //console.log($('#row' + $(ev.target).attr('id').match(/attribute-input(\d{1})/)[1]));
            if (this.attrList[$(ev.target).val()]) {
                var type = this.attrList[$(ev.target).val()];
                var attrId = $(ev.target).attr('id').match(/attribute-input(\d{1})/)[1];
                $('#row' + attrId).find('input.attribute-value').hide();
                $('#value-input' + attrId + '-'+type).show();                
            }
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
