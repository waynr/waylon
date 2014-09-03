require 'jenkins_api_client'
require 'jenkins_api_client/core_ext'
require 'waylon/errors'

class Waylon
  module Jenkins
    module REST
      class Server

        attr_reader :client
        attr_reader :config

        def initialize(config)
          @config = config
          @client = JenkinsApi::Client.new(
            :server_url => @config.url,
            :username   => @config.username,
            :password   => @config.password
          )
        end

        def name
          @config.name
        end

        def url
          @config.url
        end

        def jobs
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

          names.map { |view_name| Waylon::Job.new(view_name, @client) }
        end

        def verify_client!
          @client.get_root  # Attempt a connection to `server`
        end
      end
    end
  end
end
