require 'waylon/errors'
class Waylon
  module Jenkins
    class Job
      class Memcached < REST

        include Waylon::Jenkins::Memcached

        attr_reader :name
        attr_reader :client

        def initialize(name, server)
          super
          @memcache = @server.memcache
        end

        def job_details
          cache("job-#{name}-details") { super }
        end

        def est_duration
          cache("job-#{name}-est-duration") { super }
        end

        def progress_pct
          cache("job-#{name}-progress-pct") { super }
        end

        def description
          cache("job-#{name}-description") { super }
        end
      end
    end
  end
end
