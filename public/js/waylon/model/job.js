var Notochord = Notochord || {};

Notochord.JobModel = Backbone.Model.extend({
    defaults: {
        status: "unknown",
        investigating: false,
        health: null,
    },

    initialize: function(attrs) {
        this.query();
    },

    query: function() {
        $.ajax({
            context: this,
            url: this.baseurl() + ".json",
            dataType: "json",
            success: function(json) {
                this._reset(json);
            },
        });
    },

    baseurl: function() {
        return _.template('/api/view/{{view}}/server/{{server}}/job/{{name}}', this.attributes);
    },

    _reset: function(json) {
        var iter = function(value, key) {
              this.set(key, value);
        };

        _.each(json, iter, this);
    },

    describe: function(desc) {
        $.ajax({
            context: this,
            type: 'POST',
            url: this.baseurl() + '/describe',
            dataType: "json",
            data: {"desc": desc},
        });

    },
});
