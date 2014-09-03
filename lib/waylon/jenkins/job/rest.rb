require 'waylon/errors'
class Waylon
  module Jenkins
    class Job
      class REST < Job

        attr_reader :name
        attr_reader :client

        def initialize(name, server)
          super
          @client = @server.client

          @job_details = {}
        end

        def job_details
          query! if @job_details.empty?
          @job_details
        end

        def query!
          @job_details = client.job.list_details(@name)
          self
        rescue JenkinsApi::Exceptions::NotFound
          raise Waylon::Errors::NotFound
        end

        def status
          @client.job.color_to_status(@job_details['color'])
        end

        def est_duration
          # estimatedDuration is returned in ms and here we convert it to seconds
          client.api_get_request("/job/#{@name}/lastBuild", nil, '/api/json?depth=1&tree=estimatedDuration')['estimatedDuration'] / 1000
        end

        def progress_pct
          # Note that 'timestamp' available the Jenkins API is returned in ms
          start_time = client.api_get_request("/job/#{@name}/lastBuild", nil, '/api/json?depth=1&tree=timestamp')['timestamp'] / 1000.0
          progress_pct = ((Time.now.to_i - start_time) / est_duration) * 100
          return progress_pct.floor
        rescue JenkinsApi::Exceptions::InternalServerError
          -1
        end

        def eta
          # A build's 'duration' in the Jenkins API is only available
          # after it has completed. Using estimatedDuration and the
          # executor progress (in percentage), we can calculate the ETA.
          if progress_pct != -1 then
            t = (est_duration - (est_duration * (progress_pct / 100.0)))
            mm, ss = t.divmod(60)
            return "#{mm}m #{ss.floor}s"
          else
            -1
          end
        end

        def investigating?
          # Assume the job is in the failed state.
          !!(description =~ /under investigation/i)
        end

        def description
          # Assume the job is in the failed state.
          @client.job.get_build_details(@name, last_build_num)['description']
        end

        def last_build_num
          job_details['lastBuild']['number']
        end

        def to_hash
          {
            'name'           => @name,
            'url'            => job_details['url'],
            'status'         => status,
            'progress_pct'   => (progress_pct if status == 'running'),
            'eta'            => (eta if status == 'running'),
            'health'         => job_details['healthReport'][0]['score'],
            'last_build_num' => last_build_num,
            'investigating'  => investigating?,
            'description'    => description,
          }.reject{ |k, v| v.nil? }
        end

        def investigate_build!(build = nil)
          describe_build!("Under investigation", build)
        end

        def describe_build!(msg, build = nil)
          build  ||= last_build_num
          prefix   = "/job/#{@name}/#{build}"
          postdata = { 'description' => msg }

          client.api_post_request("#{prefix}/submitDescription", postdata)

          {"description" => msg}
        end
      end
    end
  end
end
