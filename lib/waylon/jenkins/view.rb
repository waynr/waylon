class Waylon
  module Jenkins
    class View
      attr_accessor :servers
      def initialize(config)
        @config = config
        @servers = []
      end

      def name
        @config.name
      end

      def server(name)
        @servers.find { |server| server.name == name }.tap do |x|
          raise Waylon::Errors::NotFound, "Cannot find server named #{name}" if x.nil?
        end
      end

      def jobs
        @servers.map do |server|
          server.jobs.map do |job|
            {'name' => job.name, 'server' => server.name, 'view' => self.name}
          end
        end.flatten
      end

      def to_config
        {
          'name' => name,
          'servers' => @servers.map(&:url)
        }
      end
    end
  end
end
