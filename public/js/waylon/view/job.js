var Waylon = Waylon || {};
Waylon.Views = Waylon.Views || {};

Waylon.Views.Job = Backbone.View.extend({
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
        this.weather         = new Waylon.Views.Weather({model: this.model});
        this.progress        = new Waylon.Views.JobProgress({model: this.model});
        this.investigateMenu = new Waylon.Views.InvestigateMenu({model: this.model});
    },

    render: function() {
        this.$el.addClass(this.style());
        this.$el.html(this.template(this.model.attributes));
        this.weather.setElement(this.$('img.weather')).render();

        switch (this.model.get('status')) {
            case 'running':
                this.progress.setElement(this.$('div.job_action')).render();
                break;
            case 'failure':
                this.investigateMenu.setElement(this.$('div.job_action')).render();
                break;
        }
        return this;
    },

    style: function() {
        switch (this.model.get('status')) {
            case "running":
                return "building-job";
            case "failure":
                return "failed-job";
            case "success":
                return "successful-job";
            case "disabled":
                return "disabled-job";
            case "not_run":
                return "disabled-job";
            default:
                return "unknown-job";
        }
    },
});

