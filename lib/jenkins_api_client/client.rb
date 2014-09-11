module JenkinsApi
  class Client
    def nested_view
      JenkinsApi::Client::NestedView.new(self)
    end
  end
end
