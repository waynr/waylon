class Waylon
  module Jenkins
    require 'waylon/jenkins/view'
    require 'waylon/jenkins/server'
    require 'waylon/jenkins/job'

    def self.build(root_config)
      views = root_config.views.map do |vc|
        servers = vc.servers.map do |sc|
          if root_config.app_config.memcached_server
            Waylon::Jenkins::Server::Memcached.new(sc, root_config.app_config.memcached_server)
          else
            Waylon::Jenkins::Server::REST.new(sc)
          end
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
