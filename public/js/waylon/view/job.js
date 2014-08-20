var Notochord = Notochord || {};

Notochord.JobView = Backbone.View.extend({
    tagName: 'tr',

    template: Handlebars.compile([
        '<td class=jobinfo>',
            '<img class="weather"></img>',
            '<a href="{{url}}">{{name}}</a>',
            '<div class="job_action">',
            '</div>',
            '{{#if progress_pct}}',
                '<div class="progress">',
                    '<div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="{{progress_pct}}" aria-valuemin="0" aria-valuemax="100" style="width: {{progress_pct}}%" />',
                '</div>',
            '{{/if}}',
        '</td>',
    ].join("")),

    initialize: function(options) {
        this.options = options || {};
        if (this.model) {
            this.model.on('change', this.render, this);
        }
        this.weatherView         = new Notochord.WeatherView({model: this.model});
        this.jobProgressView     = new Notochord.JobProgressView({model: this.model});
        this.investigateMenuView = new Notochord.InvestigateMenuView({model: this.model});
    },

    render: function() {
        var newstyle = this.statToStyle(this.model.get('status'));
        this.$el.removeClass();
        this.$el.addClass(newstyle);

        this.$el.html(this.template(this.model.attributes));

        this.weatherView.setElement(this.$('img.weather')).render();

        switch (this.model.get('status')) {
            case 'running':
                this.jobProgressView.setElement(this.$('div.job_action')).render();
                break;
            case 'failure':
                this.investigateMenuView.setElement(this.$('div.job_action')).render();
                break;
        }
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

