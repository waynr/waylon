class Waylon
  module Jenkins
    require 'waylon/jenkins/view'
    require 'waylon/jenkins/server'
    require 'waylon/jenkins/job'

    def self.build(root_config)
      views = root_config.views.map do |vc|
        view = Waylon::Jenkins::View.new(vc)
        vc.servers.map do |sc|
          if root_config.app_config.memcached_server
            server = Waylon::Jenkins::Server::Memcached.new(sc, view, root_config.app_config.memcached_server)
          else
            server = Waylon::Jenkins::Server::REST.new(sc, view)
          end
          view.servers << server
        end
        view
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
