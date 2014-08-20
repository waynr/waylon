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

        this.listenTo(Notochord.JobCollection, 'add', this.addJob);
    },

    doneLoading: function() {
        this.$("#loading").hide();
    },

    addJob: function(job) {
        var view = new Notochord.JobView({model: job});
        this.tbody.append(view.render().el);
    },
});

