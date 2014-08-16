var Notochord = Notochord || {};

Notochord.JobModel = Backbone.Model.extend({
    defaults: {
        status: "unknown-job",
        investigating: false,
    },

    initialize: function(attrs) {
        this.query();
    },

    query: function() {
        $.ajax({
            context: this,
            url: this.url(),
            dataType: "json",
            success: function(json) {
                this._reset(json);
            },
        });
    },

    url: function() {
        return "/api/view/" + this.get('view') + "/server/" + this.get('server') + "/job/" + this.get('name') + ".json";
    },

    _reset: function(json) {
        var iter = function(value, key) {
              this.set(key, value);
        };

        _.each(json, iter, this);
    },
});

Notochord.JobView = Backbone.View.extend({
    tagName: 'tr',

    template: Handlebars.compile([
        '<td class=jobinfo>',
            '<img class="weather" />',
            '<a href="{{url}}">{{name}}</a>',
            '{{#if investigating}}',
                '<div class="job_action">',
                '</div>',
            '{{/if}}',
        '</td>',
    ].join("")),

    initialize: function(options) {
        this.options = options || {};
        if (this.model) {
            this.model.on('change', this.render, this);
        }
    },

    render: function() {
        this.$el.html(
            this.template(
                this.model.attributes
            )
        );
        this.$el.removeClass();
        var newstyle = this.statToStyle(this.model.get('status'));
        this.$el.addClass(newstyle);
        return this;
    },

    statToStyle: function(status) {
        var newStyle;
        switch (status) {
            case "running":
                newStyle = "building-job";
                break;
            case "failure":
                newStyle = "failed-job";
                break;
            case "success":
                newStyle = "successful-job";
                break;
            default:
                newStyle = "unknown-job";
                break;
        }
        return newStyle;
    },
});

var jobCollection = Backbone.Collection.extend({
    model: Notochord.JobModel,
    comparator: function(job) {
        return job.get('status');
    }
});

Notochord.JobCollection = new jobCollection();

Notochord.AppView = Backbone.View.extend({
    el: '#jobs',

    template: [
        '<tbody>',
        '</tbody>',
    ].join(""),

    initialize: function(options) {
        this.options = options || {};
        this.view = options.view;

        this.tbody = this.$("tbody");
        this.tbody.html('<tr><td>WOO</td></tr>');

        this.listenTo(Notochord.JobCollection, 'add', this.addJob);
    },

    run: function() {
        Notochord.JobCollection.url = '/api/view/' + this.view + '/jobs.json';
        Notochord.JobCollection.fetch();
    },

    addJob: function(job) {
        var view = new Notochord.JobView({model: job});
        this.tbody.append(view.render().el);
    },
});
