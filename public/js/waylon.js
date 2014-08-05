/* waylon.js
 * Implements the JS, jQuery, and AJAX necessary for the radiator view pages.
 *
 * Usage:
 *      var settings = {
 *          refresh_interval: 30,
 *          rebuild_interval: 60,
 *          view:             'foo',
 *      };
 *      waylon.init(settings);
 */

var waylon = {
    // Ideally, this should be in waylon.yml, but here are a few sane defaults
    config: {
        rebuild_interval: 3600, // rebuild the page every 60 min
        refresh_interval: 60,   // poll the Waylon API every 60 seconds
        view: null,
    },

    // Allow configuration to be passed-in from the page.
    init: function (settings) {
        'use strict';
        $.extend(waylon.config, settings);
        waylon.view.init({});
        $(document).ready(waylon.setup());
    },

    // Setup the Waylon routine once the document is ready.
    // Repeat every 'refresh_interval' seconds.
    setup: function () {
        'use strict';

        waylon.view.setup();
        waylon.view.rebuild();

        setInterval(waylon.view.rebuild, waylon.config.rebuild_interval * 1000);
        setInterval(waylon.view.refresh, waylon.config.refresh_interval * 1000);
    },

    view: {
        config: { tbody: null },

        init: function(settings) {
            'use strict';
            $.extend(waylon.view.config, settings);
        },

        setup: function() {
            waylon.view.config.tbody = $("#jobs tbody");
            $(document).ajaxStop(function() {
                waylon.view.checkNirvana();
                $('[data-toggle="tooltip"]').tooltip({'placement': 'bottom'});
            });
        },

        rebuild: function() {
            console.log("Redrawing view " + waylon.config.view);

            var viewname = waylon.config.view;
            var tbody = waylon.view.config.tbody;
            tbody.empty();

            $.ajax({
                url: waylon.view.serversUrl(viewname),
                type: "GET",
                dataType: "json",

                send: function() {
                    $('#loading').show();
                },

                success: function(json) {
                    $.each(json, function(i, servername) {
                        waylon.server.populate(viewname, servername, tbody);
                    });
                },

                complete: function() {
                    $('#loading').hide();

                },

            });
        },

        refresh: function() {
            console.log("Refreshing view " + waylon.config.view);
            waylon.view.eachJob(function(tr) {
                waylon.job.updateStatus($(tr));
            });

            waylon.view.checkNirvana();
        },

        checkNirvana: function() {
          'use strict';

            // Nirvana mode
            var isNirvana = waylon.nirvanaCheck();
            if (isNirvana) {
                console.log("Entering nirvana mode");
                waylon.nirvanaBegin();
            }
            else {
                console.log("Leaving nirvana mode");
                waylon.nirvanaEnd();
            }
        },

        updateStatsRollup: function() {
            'use strict';
            var failed = 0, building = 0, successful = 0;

            waylon.view.eachJob(function(tr) {
                switch($(tr).attr("status")) {
                    case "failed-job":
                        failed += 1;
                        break;
                    case "building-job":
                        building += 1;
                        break;
                    case "successful-job":
                        successful += 1;
                        break;
                }
            });

            $("#successful-jobs").text(successful);
            $("#building-jobs").text(building);
            $("#failed-jobs").text(failed);
            $("#total-jobs").text(failed + building + successful);
        },

        sort: function() {
            var tbody = waylon.view.config.tbody;
            var children = tbody.children();

            children.sort(function(a, b) {
                var as = waylon.job.sortValue($(a).attr("status"));
                var bs = waylon.job.sortValue($(b).attr("status"));

                var at = $(a).attr("id");
                var bt = $(b).attr("id");

                if (as > bs) {
                    return -1;
                } else if (as < bs) {
                    return 1;
                } else if (at > bt) { // sort values are equivalent, sort by ID
                    return 1;
                } else if (at < bt) {
                    return -1;
                } else {
                    return 0;
                }
            });

            children.detach().appendTo(tbody);
        },

        eachJob: function(callback) {
            'use strict';
            var children = waylon.view.config.tbody.children();

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
                        var tr= waylon.job.prepopulate(viewname, servername, elem, tbody);
                        waylon.job.updateStatus(tr);
                    });
                },

                complete: function() {
                    $('#loading').hide();
                },
            });
        },
    },

    job: {
        prepopulate: function(viewname, servername, jobname, tbody) {
            'use strict';

            var buildStatus = "unknown-job";

            var tr = $("<tr>").html($("<td>").text(jobname));

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
            var url = waylon.job.queryUrl(
                    tr.attr("viewname"),
                    tr.attr("servername"),
                    tr.attr("id")
                    );

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function(json) {
                    waylon.job.redraw(json, tr);
                },
            });
        },

        // Redraw the given job tr with the updated build status
        redraw: function(json, tr) {
            'use strict';

            var jobinfo = waylon.job.jobInfo(json, tr);

            tr.empty();
            tr.html(jobinfo);

            var stat = waylon.job.buildCSS(json["status"]);
            if(stat) {
                tr.removeClass("unknown-job");
                tr.addClass(stat);
                tr.attr("status", stat);
            }

            waylon.view.updateStatsRollup();
            waylon.view.sort();
        },

        jobInfo: function(json, tr) {
            'use strict';

            var td   = $("<td>").attr("class", "jobinfo");
            var img  = waylon.job.jobWeather(json["weather"]);
            var link = $("<a>").attr("href", json["url"]).text(tr.attr("id"));

            td.append(img, link);

            if (json["status"] == "running") {
                waylon.job.progressBar(td, json["progress_pct"]);
            }

            waylon.job.investigateButton(tr, td, json);

            return td;
        },

        jobWeather: function(json) {
            'use strict';

            var img = $("<img>")
                .attr("class", "weather")
                .attr("src", json["src"])
                .attr("alt", json["alt"])
                .attr("title", json["title"]);

            return img;
        },

        buildCSS: function(stat) {
            'use strict';

            var stat;
            switch(stat) {
                case "running":
                    stat = "building-job";
                    break;
                case "failure":
                    stat = "failed-job";
                    break;
                case "success":
                    stat = "successful-job";
                    break;
                default:
                    stat = "unknown-job";
                    break;
            }
            return stat;
        },

        progressBar: function(td, progress) {
            var div = $("<div>").attr("class", "progress")
                .append(
                    $("<div>")
                        .attr("class", "progress-bar progress-bar-info")
                        .attr("role", "progressbar")
                        .attr("aria-valuenow", progress)
                        .attr("aria-valuemin", "0")
                        .attr("aria-valuemax", "100")
                        .attr("style", "width:" + progress + "%")
                    );
            td.append(div);
        },

        investigateButton: function(tr, td, json) {
            'use strict';

            if (json["status"] == "failure") {
                var btn = $("<a>").attr("role", "button");
                btn.addClass("btn");
                btn.addClass("btn-default");

                if (json["investigating"]) {
                    btn.addClass("disabled");
                    btn.text("Under investigation");
                    btn.attr("href", "#");
                } else {
                    btn.text("Investigate");
                    btn.attr("href", "#");

                    var url = "/view/" + tr.attr("viewname")
                                 + "/" + tr.attr("servername")
                                 + "/" + tr.attr("id")
                                 + "/" + json["last_build_num"]
                                 + "/investigate";

                    btn.attr("href", url);
                    btn.attr("target", "_blank");
                }

                var div = $("<div>").addClass("job_action").html(btn);
                td.append(div);
            }
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

    // Nirvana mode routines
    // Return the image of the day for nirvana mode
    imageOfTheDay: function () {
        'use strict';
        var date = new Date(),
            day = date.getDay(),
            result = "/img/img0" + day + ".png";
        return result;
    },

    // Nirvana mode enablement. Checks for the number of elements on the
    // page belonging to any of the classes listed in elems[]. If any are
    // found, returns false.
    nirvanaCheck: function () {
        'use strict';
        var bad_elems  = ['.building-job', '.failed-job', '.alert-danger', '.alert-warning'],
            good_elems = [ '.successful-job' ],
            bad_count  = 0,
            good_count = 0;

        $.each(bad_elems, function (i, elem) {
            bad_count += $(elem).length;
        });

        $.each(good_elems, function (i, elem) {
            good_count += $(elem).length;
        });

        if ((bad_count === 0) && (good_count >= 1)) {
            return true;
        }
        else {
            return false;
        }
    },

    // Enter nirvana mode
    nirvanaBegin: function () {
        'use strict';
        $('body').addClass('nirvana');
        $('body').css('background-image', 'url(' + waylon.imageOfTheDay() + ')');
        $('#jobs').hide();
    },

    // Exit nirvana mode
    nirvanaEnd: function () {
        'use strict';
        $('body').removeClass('nirvana');
        $('body').css('background-image', 'none');
        $('#jobs').show();
    },
};
