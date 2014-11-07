var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.AlertList = Backbone.View.extend({

    el: '#global-alerts',

    initialize: function(options) {
        this.listenTo(Waylon.AlertCollection, 'add', this.render);
        this.listenTo(Waylon.AlertCollection, 'remove', this.render);
        this.$el.addClass("container");
    },

    render: function() {
        var alerts = Waylon.AlertCollection.map(function(model) {
            var view = new Waylon.Views.Alert({model: model});
            return view.render().el;
        });

        this.$el.html(alerts);
        return this;
    },
});

