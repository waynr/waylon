require 'waylon/errors'
require 'waylon/job'

class Waylon
  module Config
    # A server represents the configuration of a Jenkins server, and lists the
    # jobs and views that should be displayed from this server. It may include
    # user credentials to allow end users to update the most recent job
    # description.
    #
    # @api private
    class Server

      attr_reader :name
      attr_reader :url
      attr_reader :username
      attr_reader :password

      attr_reader :job_names
      attr_reader :view_names
      attr_reader :nested_view_names

      def self.from_hash(name, values)
        o = new(name, values['url'], values['username'], values['password'])
        (values['jobs'] || []).each do |job|
          o.add_job(job)
        end
        (values['views'] || []).each do |view|
          o.add_view(view)
        end
        (values['nested_views'] || {}).each_pair do |view, nested|
          o.add_nested_view(view, nested)
        end
        o
      end

      def initialize(name, url, username, password)
        @name = name
        @url = url
        @username = username
        @password = password

        @job_names = []
        @view_names = []
        @nested_view_names = {}
      end

      def add_job(name)
        @job_names << name
      end

      def add_view(name)
        @view_names << name
      end

      def add_nested_view(name, nested)
        @nested_view_names[name] = nested
      end
    end
  end
end
