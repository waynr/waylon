require 'memcached'
require 'waylon/jenkins/memcached'

class Waylon
  module Jenkins
    class Server
      class Memcached < REST

        include Waylon::Jenkins::Memcached

        attr_reader :memcache

        def initialize(config)
          super
          @memcache = ::Memcached.new('./tmp/memcached.sock')
        end

        def job_names
          cache("server-#{name}-job-names") { super }
        end

        def jobs
          job_names.map { |name| Waylon::Jenkins::Job::Memcached.new(name, self) }
        end
      end
    end
  end
end
