var Notochord = Notochord || {};

var jobCollection = Backbone.Collection.extend({
    model: Notochord.JobModel,
    comparator: function(job) {
        return job.get('status');
    }
});

Notochord.JobCollection = new jobCollection();
