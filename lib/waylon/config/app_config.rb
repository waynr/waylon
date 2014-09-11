class Waylon
  module Config
    # This class represents the configuration for the Waylon web app.
    #
    # @api private
    class AppConfig

      attr_accessor :refresh_interval
      attr_accessor :rebuild_interval
      attr_accessor :memcached_server

      def self.from_hash(hash)
        new.tap do |x|
          x.refresh_interval = (hash['refresh_interval'] || 60)
          x.rebuild_interval = (hash['rebuild_interval'] || 3600)
          x.memcached_server  = hash['memcached_server']
        end
      end
    end
  end
end
