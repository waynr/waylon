require 'jenkins_api_client'
require 'jenkins_api_client/core_ext'
require 'waylon/errors'

class Waylon
  module Jenkins
    class Server
      class REST < Server

        attr_reader :client

        def initialize(config)
          super
          @client = JenkinsApi::Client.new(
            :server_url => @config.url,
            :username   => @config.username,
            :password   => @config.password
          )
        end

        def job_names
          names = []
          names += config.job_names

          config.view_names.each do |view_name|
            names += @client.view.list_jobs(view_name)
          end

          config.nested_view_names.each_pair do |view_name, nested|
            nested.each do |nested_name|
              names += @client.nested_view.list_nested_jobs(view_name, nested_name)
            end
          end

          names
        end

        def jobs
          job_names.map { |view_name| Waylon::Jenkins::Job::REST.new(view_name, self) }
        end

        def verify_client!
          @client.get_root  # Attempt a connection to `server`
        end
      end
    end
  end
end
