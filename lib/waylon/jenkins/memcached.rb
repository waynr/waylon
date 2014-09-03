class Waylon
  module Jenkins
    module Memcached
      def cache(memcache_key, ttl: 60, &block)
        raise ArgumentError, "##{__method__} requires a block" unless block_given?
        @memcache.get(memcache_key).tap do
          puts "cache hit on #{memcache_key.inspect}"
        end
      rescue ::Memcached::NotFound
        puts "cache miss on #{memcache_key.inspect}"
        block.call().tap do |result|
          @memcache.set(memcache_key, result, ttl)
        end
      end
    end
  end
end
