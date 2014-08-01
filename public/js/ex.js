var ex = {
    config: {
        rebuild_interval: 600,
        refresh_interval: 10,
        view: null,
    },

    // Allow configuration to be passed-in from the erb template.
    init: function (settings) {
        'use strict';
        $.extend(ex.config, settings);

        ex.view.init({});

        $(document).ready(ex.setup);
    },

    setup: function() {
        'use strict';

        ex.view.setup();
        ex.view.rebuild();

        setInterval(ex.view.rebuild, ex.config.rebuild_interval * 1000);
        setInterval(ex.view.refresh, ex.config.refresh_interval * 1000);
    },

    view: {
        config: { tbody: null },

        init: function(settings) {
            'use strict';
            $.extend(ex.view.config, settings);
        },

        setup: function() {
            ex.view.config.tbody = $("#jobs tbody");
        },

        rebuild: function() {
            console.log("Redrawing view " + ex.config.view);

            var viewname = ex.config.view;
            var tbody = ex.view.config.tbody;
            tbody.empty();

            $.ajax({
                url: ex.view.serversUrl(viewname),
                type: "GET",
                dataType: "json",
                success: function(json) {
                    $.each(json, function(i, servername) {
                        ex.server.populate(viewname, servername, tbody);
                    });
                },
            });
        },

        refresh: function() {
            console.log("Refreshing view " + ex.config.view);
            ex.view.eachJob(function(tr) {
                ex.job.updateStatus($(tr));
            });
        },

        updateStatsRollup: function() {
            'use strict';

            var failed = 0, building = 0, unknown = 0, successful = 0;

            ex.view.eachJob(function(tr) {
                switch($(tr).attr("status")) {
                    case "failed-job":
                        failed += 1;
                        break;
                    case "building-job":
                        building += 1;
                        break;
                    case "unknown-job":
                        unknown += 1;
                        break;
                    case "successful-job":
                        successful += 1;
                        break;
                }
            });

            $("#successful-jobs").text(successful);
            $("#unknown-jobs").text(unknown);
            $("#building-jobs").text(building);
            $("#failed-jobs").text(failed);
            $("#total-jobs").text(failed + building + unknown + successful);
        },

        sort: function() {
            var tbody = ex.view.config.tbody;
            var children = tbody.children();

            children.sort(function(a, b) {
                var as = ex.job.sortValue($(a).attr("status"));
                var bs = ex.job.sortValue($(b).attr("status"));

                if (as > bs) {
                    return -1;
                } else if (as < bs) {
                    return 1;
                } else {
                    return 0;
                }
            });

            children.detach().appendTo(tbody);
        },

        eachJob: function(callback) {
            'use strict';

            var children = ex.view.config.tbody.children();

            $.each(children, function(i, elem) {
                callback(elem);
            });
        },

        serversUrl: function(viewname) {
            return "/api/view/" + viewname + "/servers.json";
        },
    },

    server: {
        populate: function(viewname, servername, tbody) {

            var url = "/api/view/" + viewname + "/server/" + servername + "/jobs.json";

            $('#loading').show();
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",

                success: function(json) {
                    $.each(json, function(i, elem) {
                        var tr= ex.job.prepopulate(viewname, servername, elem, tbody);
                        ex.job.updateStatus(tr);
                    });
                },

                complete: function() {
                    // This needs to be done after the elements have already loaded.
                    // Therefore, it's safe to put it in ajaxComplete
                    // ???
                    $('[data-toggle="tooltip"]').tooltip({'placement': 'bottom'});
                    $('#loading').hide();
                },
            });
        },
    },

    job: {
        prepopulate: function(viewname, servername, jobname, tbody) {
            'use strict';

            var buildStatus = "unknown-job";

            var tr = $("<tr>").append(
                $("<td>").text(jobname),
                $("<td>").text(buildStatus)
            );

            tr.addClass(buildStatus);
            tr.attr("id", jobname);
            tr.attr("status", buildStatus);
            tr.attr("viewname", viewname);
            tr.attr("servername", servername);

            tbody.append(tr);
            return tr;
        },

        updateStatus: function(tr) {
            'use strict';
            var url = ex.job.queryUrl(
                    tr.attr("viewname"),
                    tr.attr("servername"),
                    tr.attr("id")
                    );

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function(json) {
                    ex.job.redraw(json, tr);
                },
            });
        },

        redraw: function(json, tr) {
            'use strict';

            var img = $("<img>");
            img.attr("class", "weather");
            img.attr("src", json["weather"]["src"]);
            img.attr("alt", json["weather"]["alt"]);
            img.attr("title", json["weather"]["title"]);

            var link = $("<a>").attr("href", json["url"]).text(tr.attr("id"));

            var stat;
            switch(json["status"]) {
                case "running":
                    stat = "building-job";
                    break;
                case "failure":
                    stat = "failed-job";
                    break;
                case "success":
                    stat = "successful-job";
            }

            tr.empty();
            tr.append(
                $("<td>").append(img, link),
                $("<td>").text(json["status"])
            );

            if(stat) {
                tr.removeClass("unknown-job");
                tr.addClass(stat);
                tr.attr("status", stat);
            }

            ex.view.updateStatsRollup();
            ex.view.sort();
        },

        queryUrl: function(viewname, servername, jobname) {
            return "/api/view/" + viewname + "/server/" + servername + "/job/" + jobname + ".json";
        },

        sortValue: function(stat) {
            switch(stat) {
                case "failed-job":
                    return 3;
                case "building-job":
                    return 2;
                case "unknown-job":
                    return 1;
                case "successful-job":
                    return 0;
                default:
                    return -1;
            }
        },
    },
};
