require 'jenkins_api_client'
require 'jenkins_api_client/core_ext'
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

      attr_reader :client

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
        @client   = JenkinsApi::Client.new(:server_url => @url,
                                           :username   => @username,
                                           :password   => @password,
                                           :server_port => 443,
                                           :ssl => true)

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

      def jobs
        if !@cached_jobs
          names = []
          names += @job_names

          @view_names.each do |view_name|
            names += @client.view.list_jobs(view_name)
          end

          @nested_view_names.each_pair do |view_name, nested|
            nested.each do |nested_name|
              names += @client.nested_view.list_nested_jobs(view_name, nested_name)
            end
          end

          @cached_jobs = names.map { |view_name| Waylon::Job.new(view_name, @client) }
        end
        @cached_jobs
      end

      def verify_client!
        @client.get_root  # Attempt a connection to `server`
      end

      def to_config
        {
          'name' => @name,
          'url'  => @url,
          'jobs' => @job_names.map(&:name)
        }
      end

      def job(name)
        jobs.find { |job| job.name == name }.tap do |x|
          raise Waylon::Errors::NotFound, "Cannot find job named #{name}" if x.nil?
        end
      end
    end
  end
end
