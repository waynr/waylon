class Waylon
  module Jenkins
    class Server

      def initialize(impl)
        @impl = impl
      end

      def name
        @impl.name
      end

      # @return [Array<Waylon::Jenkins::Job>]
      def jobs
        @impl.jobs
      end

      def verify_client!
        @impl.verify_client!
      end

      def to_config
          {
            'name' => @impl.name,
            'url'  => @impl.url,
            'jobs' => jobs.map(&:name)
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
