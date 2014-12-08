var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.Alert = Backbone.View.extend({

    tagName: 'div',

    className: "row",

    template: Handlebars.compile([
        '<div class="alert {{alertClass}}">',
            '<strong>{{title}}&nbsp;</strong>',
            '{{content}}',
            '<a href="#" class="close" data-dismiss="alert">&times;</a>',
        '</div>',
    ].join("")),

    initialize: function(options) {
        this.options = options || {};
        this.model = options.model;
    },

    render: function() {
        var alertClass = "alert-" + this.model.get('level');
        var attrs = {'title': this.title(), 'content': this.model.get('content'), "alertClass": alertClass};
        this.$el.html(this.template(attrs));
        return this;
    },

    title: function() {
        if (this.model.get('title')) {
            return this.model.get('title');
        } else {
            var level = this.model.get('level');
            return level.charAt(0).toUpperCase() + level.substring(1).toLowerCase();
        }
    }
});
