define('AttributeTypeEditView', [
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'text!templates/attributeTypes/edit.html',
    'AttributeTypeModel'
], function($, _, Backbone, moment, tpl, AttributeType) {
    var AttributeTypeEditView;

    AttributeTypeEditView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(tpl);

            this.errTmpl = '<div class="span4">';
            this.errTmpl += '<div class="alert alert-error">';
            this.errTmpl += '<button type="button" class="close" data-dismiss="alert">x</button>';
            this.errTmpl += '<%- msg %>';
            this.errTmpl += '</div>';
            this.errTmpl += '</div>';
            this.errTmpl = _.template(this.errTmpl);
        },
        events: {
            "focus .input-prepend input": "removeErrMsg",
            "click .save-btn": "saveAttributeType",
            "click .back-btn": "goBack"
        },
        render: function() {
            var tmpl;
            //, formattedDate = ' ', bornAttr;

            //bornAttr = this.model.get('born');
            //formattedDate = moment(new Date(bornAttr)).format("MM/DD/YYYY");

            //tmpl = this.template({ client: this.model.toJSON(), formattedDate: formattedDate });
            tmpl = this.template({attributeType: this.model.toJSON()});

            $(this.el).html(tmpl);

            return this;
        },
        goBack: function(e) {
            //console.log('/js/views/attributeTypes/edit.js goBack 2');
            e.preventDefault();
            this.trigger('back');
        },
        saveAttributeType: function(e) {
            //console.log('/js/views/attributeTypes/edit.js saveAttributeType 1');
            var name, dataType, mandatory, validator, that;

            e.preventDefault();

            that = this;
            name = $.trim($('#name-input').val());
            dataType = $.trim($('#dataType-input').val());
            mandatory = $.trim($('#mandatory-input').val());
            validator = $.trim($('#validator-input').val());

            this.model.save({
                name: name,
                dataType: dataType,
                mandatory: mandatory,
                validator: validator
            }, {
                silent: false,
                sync: true,
                success: function(model, res) {
                    if (res && _.keys(res.errors).length) {
                        //console.log('/js/views/attributeTypes/edit.js saveAttributeType 4 %s', JSON.stringify(res));
                        that.renderErrMsg(res.errors);
                    } else {
                        model.trigger('save-success', model.get('_id'));
                    }
                },
                error: function(model, res) {
                    //console.log('/js/views/attributeTypes/edit.js saveAttributeType 2 %s', JSON.stringify(res));
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
            //console.log('/js/views/attributeTypes/edit.js saveAttributeType 3 %s', JSON.stringify(err));
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

    return AttributeTypeEditView;
});
