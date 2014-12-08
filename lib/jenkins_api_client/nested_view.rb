module JenkinsApi
  class Client
    # TODO: Try to reduce calls to the Jenkins API by invoking calls and
    # TODO: checking the HTTP status code instead of duplicating each API call
    # TODO: to confirm existence.
    class NestedView
      include JenkinsApi::UriHelper

      def initialize(client)
        @client = client
        @logger = @client.logger
      end

      def list_nested_views(view_name)
        @logger.info "Obtaining the nested views in #{view_name}"
        nested_views = []
        response_json = @client.api_get_request("/view/#{path_encode view_name}")
        response_json["views"].each do |job|
          nested_views << job["name"]
        end
        nested_views
      end

      def list_jobs(view_name)
        @logger.info "Obtaining the jobs in #{view_name}"

        job_names = []

        list_nested_views(view_name).each do |nested_view|
          response_json = @client.api_get_request("/view/#{path_encode view_name}/view/#{path_encode nested_view}")
          response_json["jobs"].each do |job|
            job_names << job["name"]
          end
        end
        job_names
      end

      def list_nested_jobs(view_name, nested_view_name)
        @logger.info "Obtaining the jobs in #{view_name}"

        job_names = []

        response_json = @client.api_get_request("/view/#{path_encode view_name}/view/#{path_encode nested_view_name}")
        response_json["jobs"].each do |job|
          job_names << job["name"]
        end
        job_names
      end
    end
  end
end
