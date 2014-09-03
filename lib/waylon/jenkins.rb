require 'waylon/jenkins/rest/server'
class Waylon
  module Jenkins
    require 'waylon/jenkins/view'
    require 'waylon/jenkins/server'
    def self.build(root_config)
      views = root_config.views.map do |vc|
        servers = vc.servers.map do |sc|
          Waylon::Jenkins::Server.new(Waylon::Jenkins::REST::Server.new(sc))
        end
        Waylon::Jenkins::View.new(vc).tap { |o| o.servers = servers }
      end

      views
    end

    def self.view(root_config, name)
      self.build(root_config).find { |view| view.name == name }.tap do |x|
        raise Waylon::Errors::NotFound, "Cannot find view named #{name}" if x.nil?
      end
    end
  end
end
