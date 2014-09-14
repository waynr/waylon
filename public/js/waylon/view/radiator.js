var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.Radiator = Backbone.View.extend({
    el: '#radiator',

    template: [
        '<div id="loading">',
            '<span class="glyphicon glyphicon-refresh loadingIndicator"></span>',
            '<p>Getting the latest data, just for you.</p>',
        '</div>',
        '<div class="container-fluid" id="jobs">',
        '</div>',
    ].join(""),

    initialize: function(options) {
        this.options = options || {};
        this.view = options.view;

        this.container = this.$("#jobs");

        this.listenTo(Waylon.JobCollection, 'change:status', _.debounce(this.render, 500));
    },

    doneLoading: function() {
        this.$("#loading").hide();
        this.render();
    },

    render: function() {
        var jobs = Waylon.JobCollection.map(function(model) {
            var view = new Waylon.Views.Job({model: model});
            return view.render().el;
        });

        this.container.html(jobs);
        return this;
    },

    show: function() {
        this.$("#jobs").show();
    },

    hide: function() {
        this.$("#jobs").hide();
    },
});
