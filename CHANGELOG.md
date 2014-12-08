# CHANGELOG

## 2.0.0 (2014/12/08)
There were a lot of changes for this release. The largest have been summarized
here. Otherwise, check out the compare on GitHub.

Breaking changes:
  - Config file modifications; changes to the YAML structure.
  - API changes.
  - Upgraded to jQuery 2.1.1; older browsers, IE impacted.

Non-breaking changes:
  - The "display name" for a job is now used if it is set in Jenkins.
  - The build number is displayed alongside the job's display name. If using
    the [Build Name Setter](https://wiki.jenkins-ci.org/display/JENKINS/Build+Name+Setter+Plugin)
    plugin, this means you could display the Git SHA next to the job's name.
  - Implemented memcached for reducing the API hits to a Jenkins instance.
  - Added failure reasons to the 'investigate' buttons.
  - Improve ETA calculation.
  - Trouble mode displays an image of a forest fire if the number of failed
    builds is greater than `trouble_threshold`. Default disabled.

A huge thanks to [Adrien Thebo](https://github.com/adrienthebo) for his work
developing a proper API and a Backbone-based JS front-end.

## 1.2.0 (2014/05/15)
  - Add config and examples for using [Unicorn](http://unicorn.bogomips.org/)
    for application deployment.
  - Move `waylon.yml` to the `config/` directory.

## 1.1.0 (2014/05/14)
  - Implement build progress indicator and calculate estimated time remaining.

## 1.0.0 (2014/05/08)
  - Initial release
