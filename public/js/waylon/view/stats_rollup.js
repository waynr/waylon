var Notochord = Notochord || {};

Notochord.StatsRollupView = Backbone.View.extend({

    el: '#stats-rollup',

    className: "container stats-rollup",

    template: Handlebars.compile([
        '<h3>Successful <span id="successful-jobs" class="label label-success">{{successful}}</span></h3>',
        '<h3>Building   <span id="building-jobs" class="label label-warning">{{building}}</span></h3>',
        '<h3>Unknown    <span id="unknown-jobs" class="label label-info">{{unknown}}</span></h3>',
        '<h3>Failed     <span id="failed-jobs" class="label label-danger">{{failed}}</span></h3>',
        '<h3>Total      <span id="total-jobs" class="label label-primary">{{total}}</span></h3>',
    ].join("")),

    initialize: function(options) {
        this.options = options || {};
        this.listenTo(Notochord.JobCollection, 'remove', this.render);
        this.listenTo(Notochord.JobCollection, 'change:status', this.render);
    },

    render: function() {
        var attrs = {
            successful: Notochord.JobCollection.count('success'),
            building: Notochord.JobCollection.count('running'),
            unknown: Notochord.JobCollection.count('unknown'),
            failed: Notochord.JobCollection.count('failure'),
            total: Notochord.JobCollection.size(),
        };

        this.$el.html(this.template(attrs));

        return this;
    },
});
