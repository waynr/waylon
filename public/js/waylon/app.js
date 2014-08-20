var Waylon = Waylon || {};

Waylon.App = function(options) {
    this.initialize.apply(this, [options]);
};

_.extend(Waylon.App.prototype, {

    initialize: function(options) {
        this.options  = options || {};

        this.radiator = new Waylon.RadiatorView({view: this.options.view});
        this.rollup   = new Waylon.StatsRollupView({});
        this.nirvana  = new Waylon.NirvanaView({radiator: this.radiator});
    },

    run: function() {
        Waylon.JobCollection.url = '/api/view/' + this.options.view + '/jobs.json';
        Waylon.JobCollection.fetch({
            context: this,
            success: function(model, response, options) {
                var radiator = options.context.radiator;
                radiator.doneLoading();
            },
        });
    },
});
