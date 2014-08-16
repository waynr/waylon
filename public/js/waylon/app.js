var Notochord = Notochord || {};

Notochord.JobModel = Backbone.Model.extend({
    defaults: {
        status: "unknown-job",
        investigating: false,
        health: null,
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
        this.weatherView = new Notochord.WeatherView({model: this.model});
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
        this.weatherView.setElement(this.$('img')).render();
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

Notochord.WeatherView = Backbone.View.extend({
    el: 'img',

    initialize: function(options) {
        this.options = options || {};
    },

    render: function() {
        var state = this.getState();

        this.$el.attr('src', state.src);
        this.$el.attr('alt', state.alt);
        this.$el.attr('title', state.title);
        return this;
    },

    getState: function() {
        var state = {};

        switch (parseInt(this.model.get('health'))) {
            case 100:
                state.src   = "/img/sun.png",
                state.alt   = "[sun]",
                state.title = "No recent builds failed";
                break;
            case 80:
                state.src   = "/img/cloud.png",
                state.alt   = "[cloud]",
                state.title = "1 of the last 5 builds failed";
                break;
            case 60:
                state.src   = "/img/umbrella.png",
                state.alt   = "[umbrella]",
                state.title = "2 or more of the last 5 builds failed";
                break;
        }
        return state;
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

    run: function() {
        Notochord.JobCollection.url = '/api/view/' + this.view + '/jobs.json';
        Notochord.JobCollection.fetch().done(function() { $("#loading").hide(); });
    },

    addJob: function(job) {
        var view = new Notochord.JobView({model: job});
        this.tbody.append(view.render().el);
    },
});
