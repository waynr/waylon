require 'waylon/server'
require 'waylon/errors'

class Waylon
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
        o.servers << Waylon::Server.from_hash(server_name, values)
      end
      o
    end

    def initialize(name)
      @name = name
      @servers = []
    end

    def to_config
      {
        'name' => @name,
        'servers' => @servers.map(&:url)
      }
    end

    def server(name)
      @servers.find { |server| server.name == name }.tap do |x|
        raise Waylon::Errors::NotFound, "Cannot find server named #{name}" if x.nil?
      end
    end
  end
end
