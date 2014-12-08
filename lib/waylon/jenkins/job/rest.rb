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
        end

        def job_details
          @job_details ||= query!
        end

        def status
          if disabled?
            "disabled"
          else
            @client.job.color_to_status(job_details['color'])
          end
        end

        def est_duration
          # estimatedDuration is returned in ms; here we convert it to seconds
          client.api_get_request("/job/#{@name}/lastBuild", nil, '/api/json?depth=1&tree=estimatedDuration')['estimatedDuration'] / 1000
        end

        def progress_pct
          # Note that 'timestamp' available the Jenkins API is returned in ms
          start_time   = client.api_get_request("/job/#{@name}/lastBuild", nil, '/api/json?depth = 1&tree = timestamp')['timestamp'] / 1000.0
          progress_pct = ((Time.now.to_i - start_time) / est_duration) * 100

          # The above math isn't perfect, and Jenkins is probably a bit janky.
          # Sometimes, we'll get numbers like -3 or 106. This corrects that.
          case
          when progress_pct < 0
            progress_pct = 0
          when progress_pct > 100
            progress_pct = 100
          end

          return progress_pct.floor
        rescue JenkinsApi::Exceptions::InternalServerError,
          JenkinsApi::Exceptions::ApiException
          # With the math / percentage corrections above, we'll
          # know that something truly went wrong if we return -1.
          -1
        end

        def eta
          # A build's 'duration' in the Jenkins API is only available
          # after it has completed. Using estimatedDuration and the
          # executor progress (in percentage), we can calculate the ETA.
          if progress_pct != -1 then
            t      = (est_duration - (est_duration * (progress_pct / 100.0)))
            mm, ss = t.divmod(60)
            return "#{mm}m #{ss.floor}s"
          else
            'unknown'
          end
        end

        def investigating?
          # Assume the job is in the failed state.
          !!(description =~ /marked as/i)
        end

        def description
          @client.job.get_build_details(@name, last_build_num)['description']
        end

        def last_build_display_name
          f = @client.job.get_build_details(@name, last_build_num)['fullDisplayName']
          return "##{f.split('#')[-1]}"
        end


        # Has this job ever been built?
        # @return [Boolean]
        def built?
          !!(job_details['firstBuild'])
        end

        # Is this job disabled?
        # @return [Boolean]
        def disabled?
          @disabled = job_details['color'] == "disabled"
        end

        def last_build_num
          job_details['lastBuild']['number']
        end

        def health
          reports = job_details['healthReport']
          if (reports && !reports.empty?)
            reports[0]['score']
          else
            100
          end
        end

        def display_name
          job_details['displayName']
        end

        def url
          job_details['url']
        end

        def to_hash
          h = {
            'name'         => @name,
            'display_name' => display_name,
            'url'          => url,
            'built'        => built?,
            'status'       => status,
          }

          if built?
            h.merge!({
              'last_build_num'          => last_build_num,
              'investigating'           => investigating?,
              'description'             => description,
              'last_build_display_name' => last_build_display_name,
              'health'                  => health,
            })
          end

          if status == 'running'
            h.merge!({
              'progress_pct' => progress_pct,
              'eta'          => eta,
            })
          else
            h.merge!({
              'progress_pct' => nil,
              'eta'          => nil,
            })
          end

          h
        end

        def describe_build!(msg, build = nil)
          build  ||= last_build_num
          esc_name = URI.escape(@name)
          prefix   = "/job/#{esc_name}/#{build}"
          postdata = { 'description' => msg }

          client.api_post_request("#{prefix}/submitDescription", postdata)

          {"description" => msg}
        end

        private

        def query!
          client.job.list_details(@name)
        rescue JenkinsApi::Exceptions::NotFound
          raise Waylon::Errors::NotFound
        end

      end
    end
  end
end
