
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

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

Notochord.JobView = Backbone.View.extend({
    tagName: 'tr',

    template: Handlebars.compile([
        '<td class=jobinfo>',
            '<img class="weather" />',
            '<a href="{{url}}">{{name}}</a>',
            '<div class="job_action">',
            '</div>',
        '</td>',
    ].join("")),

    initialize: function(options) {
        this.options = options || {};
        if (this.model) {
            this.model.on('change', this.render, this);
        }
        this.weatherView = new Notochord.WeatherView({model: this.model});
        this.investigateMenuView = new Notochord.InvestigateMenuView({model: this.model});
    },

    render: function() {
        var newstyle = this.statToStyle(this.model.get('status'));
        this.$el.removeClass();
        this.$el.addClass(newstyle);

        this.$el.html(this.template(this.model.attributes));

        this.weatherView.setElement(this.$('img.weather')).render();
        this.investigateMenuView.setElement(this.$('div.job_action')).render();
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
            default:
                state.src   = "/img/umbrella.png",
                state.alt   = "[umbrella]",
                state.title = "2 or more of the last 5 builds failed";
                break;
        }
        return state;
    },
});

Notochord.InvestigateMenuView = Backbone.View.extend({
    el: 'div',

    events: {
        'click [action]': 'setDesc',
    },

    initialize: function(options) {
        this.options = options || {};
    },

    template: Handlebars.compile([
        '{{#if failure}}',
        '<div class="dropdown pull-right">',
            '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">',
                '{{#if investigating}}',
                    'Under investigation',
                '{{else}}',
                    'Investigate',
                '{{/if}}',
                '&nbsp;<span class="caret"></span>',
            '</button>',
            '<ul class="dropdown-menu" role="menu">',
                '<span>',
                    '{{#if description}}',
                        '{{description}}',
                    '{{else}}',
                        'Not yet investigated',
                    '{{/if}}',
                '</span>',
                '<li class="divider" />',
                '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" action="investigate">Mark as under investigation</a></li>',
                '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" action="infra">Mark as infrastructure issue</a></li>',
                '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" action="legit">Mark as legitimate failure</a></li>',
                '<li class="divider" />',
                '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" action="uninvestigate">Mark as not under investigation</a></li>',
            '</ul>',
        '</div>',
        '{{/if}}',
    ].join("")),

    render: function() {
        var attributes = $.extend({}, this.model.attributes);
        if (this.model.get('status') === 'failure') {
            attributes.failure = true;
        }

        this.$el.html(this.template(attributes));
        return this;
    },

    setDesc: function(event) {
        var action = $(event.target).attr('action');

        var message;

        switch(action) {
            case 'investigate':
                message = "Under investigation";
                break;
            case 'uninvestigate':
                message = "";
                break;
            case 'infra':
                message = "Marked as infrastructure";
                break;
            case 'legit':
                message = "Marked as legitimate failure";
                break;
        }

        this.model.describe(message);
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
