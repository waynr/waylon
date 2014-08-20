var Notochord = Notochord || {};

Notochord.RadiatorView = Backbone.View.extend({
    el: '#radiator',

    template: [
        '<div id="loading">',
            '<span class="glyphicon glyphicon-refresh loadingIndicator"></span>',
            '<p>Getting the latest data, just for you.</p>',
        '</div>',
        '<table id="jobs">',
            '<tbody>',
            '</tbody>',
        '</table>',
    ].join(""),

    initialize: function(options) {
        this.options = options || {};
        this.view = options.view;

        this.tbody   = this.$("#jobs tbody");

        this.listenTo(Notochord.JobCollection, 'change:status', _.debounce(this.render, 500));
    },

    doneLoading: function() {
        this.$("#loading").hide();
        this.render();
    },

    render: function() {
        var jobs = Notochord.JobCollection.map(function(model) {
            var view = new Notochord.JobView({model: model});
            return view.render().el;
        });

        this.tbody.html(jobs);
        return this;
    },

    show: function() {
        this.$("#jobs").show();
    },

    hide: function() {
        this.$("#jobs").hide();
    },
});
