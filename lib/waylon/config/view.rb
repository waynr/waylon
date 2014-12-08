require 'waylon/errors'

class Waylon
  module Config
    # This class represents the configuration for a specific Waylon view. It
    # contains a set of servers that contain Jenkins views and jobs.
    #
    # @api private
    class View
      attr_reader :name
      attr_accessor :servers

      def self.from_hash(name, servers)
        o = new(name)
        servers.each_pair do |server_name, values|
          o.servers << Waylon::Config::Server.from_hash(server_name, values)
        end
        o
      end

      def initialize(name)
        @name    = name
        @servers = []
      end
    end
  end
end
