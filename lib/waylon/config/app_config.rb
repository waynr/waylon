class Waylon
  module Config
    # This class represents the configuration for the Waylon web app.
    #
    # @api private
    class AppConfig

      attr_accessor :refresh_interval
      attr_accessor :trouble_threshold
      attr_accessor :memcached_server

      def self.from_hash(hash)
        new.tap do |x|
          x.refresh_interval = (hash['refresh_interval'] || 60)
          x.trouble_threshold = (hash['trouble_threshold'] || 0)
          x.memcached_server  = hash['memcached_server']
        end
      end
    end
  end
end
