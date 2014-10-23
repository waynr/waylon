# Waylon
Waylon is a dashboard to display the status of your Jenkins builds.

  * Project page: http://rogerignazio.com/projects/waylon
  * Source code: https://github.com/rji/waylon

## Overview
  * Displays individual jobs, or all of the jobs in a view (or nested view)
  for one or more Jenkins instances
  * Displays build stability for each job (sunny, cloudy, raining)
  * Groups jobs by building, failed, and successful, and displays job counts for each
  * Mark a failed build as 'under investigation' (requires the
  [description-setter](https://wiki.jenkins-ci.org/display/JENKINS/Description+Setter+Plugin)
  plugin)
  * Multiple views allows for multiple teams to utilize a single Waylon install
  * Nirvana mode displays a calming image of Oregon if all your jobs are green
  * Trouble mode displays an image of a forest fire if more than
  `trouble_threshold` jobs are red (default is disabled)

## Setup
_Waylon is not currently distributed via Rubygems, but we hope to do so in the
future._

The easiest way to get up and running with Waylon is to clone the repo from
GitHub:

```
git clone https://github.com/rji/waylon
```

Generally, the master branch should work, but it's also where we do most of our
development. If you want to check out a specific release, try:

```
git clone https://github.com/rji/waylon -b v1.2.0
```

Modify `config/waylon.yml` to point to your Jenkins install, and enter any job
names or Jenkins views that you wish to display. For the most part, it's
self-explanatory, but here's an example for a few of
[Puppet Labs](http://www.puppetlabs.com)' FOSS projects:

```yaml
---
config:
  refresh_interval: 120
views:
  'Puppet Labs - FOSS':
    'pl-jenkins':
      url: 'https://jenkins.puppetlabs.com'
      jobs:
        - 'Puppet-Specs-master'
        - 'Facter-Specs-master'
        - 'Hiera-Specs-master'
```

## Deploy
You can deploy locally, on your LAN, or push the whole thing to Heroku if you
have a public Jenkins instance.

For development, running `rackup` will launch the app with WEBrick on port 9292:

```
$ bundle exec rackup
[2014-05-15 10:36:33] INFO  WEBrick 1.3.1
[2014-05-15 10:36:33] INFO  ruby 2.1.1 (2014-02-24) [x86_64-darwin13.0]
[2014-05-15 10:36:33] INFO  WEBrick::HTTPServer#start: pid=41331 port=9292
```

For deploying the app, you might consider Unicorn, modifying
`config/unicorn.rb` as needed. In it's absolute simplest form, this is:

```
$ bundle exec unicorn -c config/unicorn.rb
I, [2014-05-15T10:38:08.425598 #41334]  INFO -- : listening on addr=0.0.0.0:8080 fd=9
I, [2014-05-15T10:38:08.425707 #41334]  INFO -- : worker=0 spawning...
I, [2014-05-15T10:38:08.426279 #41334]  INFO -- : worker=1 spawning...
```

## Memcached
Waylon can use memcached to reduce the number of requests against Jenkins.
Environments where many users are using Waylon or many jobs are displayed
should use this caching to deduplicate requests made against the Jenkins API.

To enable memcached, add the `memcached_server` setting to the `config` section
of waylon.yml:

```yaml
---
config:
  refresh_interval: 120
  memcached_server: './tmp/memcached.sock'
```

The default Procfile will start memcached to listen on the Unix socket
`./tmp/memcached.sock` for connections from Waylon. When run locally, you
should use Foreman to start up both Waylon and memcached.

```
$ bundle exec foreman start
12:52:56 web.1      | started with pid 9032
12:52:56 memcache.1 | started with pid 9033
12:52:56 web.1      | [2014-09-04 12:52:56] INFO  WEBrick 1.3.1
12:52:56 web.1      | [2014-09-04 12:52:56] INFO  ruby 2.1.1 (2014-02-24) [x86_64-linux]
12:52:56 web.1      | [2014-09-04 12:52:56] INFO  WEBrick::HTTPServer#start: pid=9032 port=5000
```

## Screenshots
![Waylon radiator screenshot (builds)](http://rogerignazio.com/projects/waylon/waylon-screenshot-builds.png)
![Waylon radiator screenshot (nirvana)](http://rogerignazio.com/projects/waylon/waylon-screenshot-nirvana.png)
![Waylon radiator screenshot (trouble)](http://rogerignazio.com/projects/waylon/waylon-screenshot-trouble.png)

## Credits
This application makes use of and/or re-distributes the following open source
software:
  * [Backbone.js](http://backbonejs.org/)
  * [Bootstrap](http://getbootstrap.com)
  * [Handlebars.js](http://handlebarsjs.com)
  * [jenkins_api_client](https://github.com/arangamani/jenkins_api_client)
  * [jQuery](http://jquery.com)
  * [Sinatra](http://www.sinatrarb.com)

This application also includes the following content that was released under the
[Creative Commons Attribution (CC BY)](http://creativecommons.org/licenses/)
license. Images were cropped to 1920px by 1080px.
  * [Central Oregon Landscape](https://www.flickr.com/photos/ex_magician/3196286183) by Michael McCullough
  * [Day 105: Oregon Coast Range](https://www.flickr.com/photos/lorenkerns/8651732785) by Loren Kerns
  * [Oregon Coastline -4](https://www.flickr.com/photos/intherough/5397108428) by Wendell
  * [Mt. Hood, Oregon](https://www.flickr.com/photos/tsaiproject/9943809254) by tsaiproject
  * [Astoria, Oregon](https://www.flickr.com/photos/goingslo/11522920406) by Linda Tanner
  * [Oregon Autumn Part 4](https://www.flickr.com/photos/31246066@N04/4030400633) by Ian Sane
  * [Multnomah Falls](https://www.flickr.com/photos/johnniewalker/12660211844) by John Tregoning
  * [20130817-FS-UNK-0069](https://www.flickr.com/photos/usdagov/9773088691) by U.S. Department of Agriculture
  * [Wildfire in the Pacific Northwest](https://www.flickr.com/photos/blmoregon/8776249150) by Bureau of Land Management Oregon / Washington
  * [Wildfire](https://www.flickr.com/photos/npsclimatechange/14503287131) by NPS Climate Change Response
  * [20130817-FS-UNK-0059](https://www.flickr.com/photos/usdagov/9707378699) by U.S. Department of Agriculture
  * [20130817-FS-UNK-0027](https://www.flickr.com/photos/usdagov/9626930351) by U.S. Department of Agriculture
  * [20130701-FS-UNK-0018](https://www.flickr.com/photos/usdagov/9294755604) by U.S. Department of Agriculture
  * [20130816-FS-UNK-0007](https://www.flickr.com/photos/usdagov/9623969360/) by U.S. Department of Agriculture
