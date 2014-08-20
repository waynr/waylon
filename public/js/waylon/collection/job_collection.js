var Notochord = Notochord || {};

var jobCollection = Backbone.Collection.extend({
    model: Notochord.JobModel,

    count: function(status) {
        var matching = this.filter(function(job) {
            return job.get('status') === status;
        });

        return _.size(matching);
    },
});

Notochord.JobCollection = new jobCollection();
