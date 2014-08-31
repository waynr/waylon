var Waylon = Waylon || {};

Waylon.App = function(options) {
    this.initialize.apply(this, [options]);
};

_.extend(Waylon.App.prototype, {

    defaults: {
        refresh_interval: 60,
    },

    initialize: function(options) {
        this.options  = options || {};
        this.refresh_interval = options.refresh_interval || this.defaults.refresh_interval;

        this.radiator = new Waylon.RadiatorView({view: this.options.view});
        this.rollup   = new Waylon.StatsRollupView({});
        this.nirvana  = new Waylon.NirvanaView({radiator: this.radiator});
    },

    run: function() {
        this.setup();
        setInterval(this.refresh, this.refresh_interval * 1000);
    },

    setup: function() {
        Waylon.JobCollection.url = '/api/view/' + this.options.view + '/jobs.json';
        Waylon.JobCollection.fetch({
            context: this,
            success: function(model, response, options) {
                var radiator = options.context.radiator;
                radiator.doneLoading();
            },
        });
    },

    refresh: function() {
        Waylon.JobCollection.each(function(job) {
            job.query();
        });
    }
});
