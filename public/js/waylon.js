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

    // Base configuration
    // Ideally, this should be in waylon.yml, but here are a few sane defaults
    config: {
        rebuild_interval: 3600, // rebuild the page every 60 min
        refresh_interval: 60,   // poll the Waylon API every 60 seconds
        view: null
    },

    // Extend configuration from values passed-in from the page.
    init: function (settings) {
        'use strict';
        $.extend(waylon.config, settings);
        waylon.view.init({});
        $(document).ready(waylon.setup());
    },

    // Setup the Waylon rebuild and refresh routines once the document is ready.
    // Repeat every 'refresh_interval' and 'rebuild_interval' seconds.
    setup: function () {
        'use strict';

        waylon.view.setup();
        waylon.view.rebuild();

        setInterval(waylon.view.rebuild, waylon.config.rebuild_interval * 1000);
        setInterval(waylon.view.refresh, waylon.config.refresh_interval * 1000);
    },

    // Set up each of the individual views (tabs) based on values in the
    // configuration file.
    view: {
        config: { tbody: null },

        init: function (settings) {
            'use strict';
            $.extend(waylon.view.config, settings);
        },

        setup: function () {
            'use strict';
            waylon.view.config.tbody = $("#jobs tbody");
            $(document).ajaxStop(function () {
                waylon.view.checkNirvana();
                $('[data-toggle="tooltip"]').tooltip({'placement': 'bottom'});
            });
        },

        // redraw the view
        rebuild: function () {
            'use strict';
            console.log("Redrawing view " + waylon.config.view);

            var viewname = waylon.config.view,
                tbody = waylon.view.config.tbody;
            tbody.empty();

            $.ajax({
                url: waylon.view.serversUrl(viewname),
                type: "GET",
                dataType: "json",

                send: function () {
                    $('#loading').show();
                },

                success: function (json) {
                    $.each(json, function (i, servername) {
                        waylon.server.populate(viewname, servername, tbody);
                    });
                },

                complete: function () {
                    $('#loading').hide();
                }
            });
        },

        // refresh the data presented in the current view
        refresh: function () {
            'use strict';
            console.log("Refreshing view " + waylon.config.view);
            waylon.view.eachJob(function (tr) {
                waylon.job.updateStatus($(tr));
            });

            waylon.view.checkNirvana();
        },

        // a simple function to check if we're entering or exiting nirvana mode.
        checkNirvana: function () {
            'use strict';

            // Nirvana mode
            var isNirvana = waylon.nirvanaCheck();
            if (isNirvana) {
                console.log("Entering nirvana mode");
                waylon.nirvanaBegin();
            } else {
                console.log("Leaving nirvana mode");
                waylon.nirvanaEnd();
            }
        },

        // update the job counts / statistics at the top of the page
        updateStatsRollup: function () {
            'use strict';
            var failed = 0, building = 0, successful = 0;

            waylon.view.eachJob(function (tr) {
                switch ($(tr).attr("status")) {
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

        // sorts jobs based on status, then alphanumerically
        sort: function () {
            'use strict';
            var tbody = waylon.view.config.tbody,
                children = tbody.children();

            children.sort(function (a, b) {
                var as = waylon.job.sortValue($(a).attr("status")),
                    bs = waylon.job.sortValue($(b).attr("status")),
                    at = $(a).attr("id"),
                    bt = $(b).attr("id");

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

        eachJob: function (callback) {
            'use strict';
            var children = waylon.view.config.tbody.children();

            $.each(children, function (i, elem) {
                callback(elem);
            });
        },

        // build the servers url based on the passed-in view name
        serversUrl: function (viewname) {
            'use strict';
            return "/api/view/" + viewname + "/servers.json";
        }
    },

    server: {
        // api call to get the list of jobs for a given server
        populate: function (viewname, servername, tbody) {
            'use strict';
            var url = "/api/view/" + viewname + "/server/" + servername + "/jobs.json";

            $('#loading').show();
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",

                success: function (json) {
                    $.each(json, function (i, elem) {
                        var tr = waylon.job.prepopulate(viewname, servername, elem, tbody);
                        waylon.job.updateStatus(tr);
                    });
                },

                complete: function () {
                    $('#loading').hide();
                }
            });
        }
    },

    // job-related functions
    job: {
        // pre-populate the list of jobs, starting with an 'unknown' status
        prepopulate: function (viewname, servername, jobname, tbody) {
            'use strict';

            var buildStatus = "unknown-job",
                tr = $("<tr>").html($("<td>").text(jobname));

            tr.addClass(buildStatus);
            tr.attr("id", jobname);
            tr.attr("status", buildStatus);
            tr.attr("viewname", viewname);
            tr.attr("servername", servername);

            tbody.append(tr);
            return tr;
        },

        // update the status for the jobs, redrawing on success
        updateStatus: function (tr) {
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
                success: function (json) {
                    waylon.job.redraw(json, tr);
                }
            });
        },

        // Redraw the given job tr with the updated build status
        redraw: function (json, tr) {
            'use strict';

            var jobinfo = waylon.job.jobInfo(json, tr),
                stat = waylon.job.buildCSS(json.status);

            tr.empty();
            tr.html(jobinfo);

            if (stat) {
                tr.removeClass("unknown-job");
                tr.addClass(stat);
                tr.attr("status", stat);
            }

            waylon.view.updateStatsRollup();
            waylon.view.sort();
        },

        // Based on the job status, display additional info including build
        // stability, progress, and ETA.
        jobInfo: function (json, tr) {
            'use strict';

            var td   = $("<td>").attr("class", "jobinfo"),
                img  = waylon.job.jobWeather(json.health),
                link = $("<a>").attr("href", json.url).text(tr.attr("id"));

            td.append(img, link);

            if (json.status === "running") {
                waylon.job.eta(td, json.eta);
                waylon.job.progressBar(td, json.progress_pct);
            }

            waylon.job.investigateButton(tr, td, json);

            return td;
        },

        // Display build stability as the weather, similar to Jenkins.
        jobWeather: function (health) {
            'use strict';

            switch (parseInt(health, 10)) {
                case 100:
                    var img_src   = "/img/sun.png",
                        img_alt   = "[sun]",
                        img_title = "No recent builds failed";
                    break;
                case 80:
                    var img_src   = "/img/cloud.png",
                        img_alt   = "[cloud]",
                        img_title = "1 of the last 5 builds failed";
                    break;
                default:
                    var img_src   = "/img/umbrella.png",
                        img_alt   = "[umbrella]",
                        img_title = "2 or more of the last 5 builds failed";
                    break;
            }

            var img = $("<img>")
                .attr("class", "weather")
                .attr("data-toggle", "tooltip")
                .attr("src", img_src)
                .attr("alt", img_alt)
                .attr("title", img_title);

            return img;
        },

        // CSS classes based on job status
        buildCSS: function (stat) {
            'use strict';

            var stat;
            switch (stat) {
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

        // Display a simple progress bar below the job name if it's building
        progressBar: function (td, progress) {
            'use strict';
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

        // Add an "investigate" button to failed jobs, allowing the user to
        // mark the failed build as "under investigation".
        investigateButton: function (tr, td, json) {
            'use strict';

            if (json.status === "failure") {
                var btn = $("<a>").attr("role", "button");
                btn.addClass("btn");
                btn.addClass("btn-default");

                if (json.investigating) {
                    btn.addClass("disabled");
                    btn.text("Under investigation");
                    btn.attr("href", "#");
                } else {
                    btn.text("Investigate");
                    btn.attr("href", "#");

                    var url = "/view/" + tr.attr("viewname")
                                 + "/" + tr.attr("servername")
                                 + "/" + tr.attr("id")
                                 + "/" + json.last_build_num
                                 + "/investigate";

                    btn.attr("href", url);
                    btn.attr("target", "_blank");
                }

                var div = $("<div>").addClass("job_action").html(btn);
                td.append(div);
            }
        },

        // Display the ETA for a job, along with a fancy glyphicon.
        eta: function (td, data) {
            'use strict';
            var icon = $("<span>");
            icon.addClass("glyphicon glyphicon-time");
            icon.attr("data-toggle", "tooltip");
            icon.attr("title", "Estimated time remaining");

            var div = $("<div>").addClass("job_action");
            div.append(icon, "&nbsp;", data);

            td.append(div);
        },

        // Build the query URL for a given job
        queryUrl: function (viewname, servername, jobname) {
            'use strict';
            return "/api/view/" + viewname + "/server/" + servername + "/job/" + jobname + ".json";
        },

        // Job status sorting (failed, building, etc)
        sortValue: function (stat) {
            switch (stat) {
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
        }
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
        } else {
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
    }
};
