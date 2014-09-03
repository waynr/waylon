class Waylon
  module Jenkins
    class Server
      require 'waylon/jenkins/server/rest'
      require 'waylon/jenkins/server/memcached'

      attr_reader :config

      def initialize(config)
        @config = config
      end

      def name
        @config.name
      end

      def url
        @config.url
      end

      def to_config
          {
            'name' => name,
            'url'  => url,
            'jobs' => job_names,
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
