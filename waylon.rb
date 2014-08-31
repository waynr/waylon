require 'sinatra'
require 'cgi'
require 'date'
require 'jenkins_api_client'
require 'yaml'
require 'deterministic'
require 'resolv'

$LOAD_PATH << File.join(File.dirname(__FILE__), 'lib')


class Waylon < Sinatra::Application
  require 'waylon/root_config'
  include Deterministic

  helpers do
    # Read configuration in from YAML
    def gen_config
      root = File.dirname(__FILE__)
      config = YAML.load_file(File.join(root, 'config/waylon.yml'))
      Waylon::RootConfig.from_hash(config)
    end

    # Generate a list of views
    def get_views()
      gen_config.views.map(&:name)
    end

    def manadic(monad)
      if monad.success?
        status 200
        body(JSON.pretty_generate(monad.value))
      elsif monad.value.is_a? Waylon::Errors::NotFound
        status 404
        body(JSON.pretty_generate({"errors" => [monad.value.message]}))
      else
        raise monad.value
      end
    end
  end

  # Print a list of views available on this Waylon instance.
  get '/' do
    @view_name = 'index'

    erb :base do
      erb :index
    end
  end

  # Displays the jobs configured for a particular view.
  get '/view/:name' do
    @view_name = CGI.unescape(params[:name])
    erb :base do
      erb :view
    end
  end

  # API: the name and server URLs of a particular view
  get '/api/view/:view.json' do
    view_name = CGI.unescape(params[:view])

    manadic(Either.attempt_all(self) do
      try { gen_config.view(view_name) }
      try { |view| view.to_config }
    end)
  end

  # API: "friendly" names of servers for a particular view
  get '/api/view/:view/servers.json' do
    view_name = CGI.unescape(params[:view])

    manadic(Either.attempt_all(self) do
      try { gen_config.view(view_name) }
      try { |view| view.servers.map(&:name) }
    end)
  end

  # API: using the "friendly" name of the server, returns the name,
  # URL, and jobs associated with that server
  get '/api/view/:view/server/:server.json' do
    view_name = CGI.unescape(params[:view])
    server_name = CGI.unescape(params[:server])

    manadic(Either.attempt_all(self) do
      try { gen_config.view(view_name) }
      try { |view| view.server(server_name) }
      try { |server| server.to_config }
    end)
  end

  # API: like the above, but returns only a list of jobs
  get '/api/view/:view/server/:server/jobs.json' do
    view_name = CGI.unescape(params[:view])
    server_name = CGI.unescape(params[:server])

    manadic(Either.attempt_all(self) do
      try { gen_config.view(view_name) }
      try { |view| view.server(server_name) }
      try { |server| server.jobs.map(&:name) }
    end)
  end

  get '/api/view/:view/jobs.json' do
    view_name = CGI.unescape(params[:view])

    manadic(Either.attempt_all(self) do
      try { gen_config.view(view_name) }
      try do |view|
        view.servers.inject([]) do |jobs, server|
          server.jobs.each do |job|
            jobs << {'name' => job.name, 'server' => server.name, 'view' => view.name}
          end
          jobs
        end
      end
    end)
  end

  # API: gets job details for a particular job on a particular server
  get '/api/view/:view/server/:server/job/:job.json' do
    view_name   = CGI.unescape(params[:view])
    server_name = CGI.unescape(params[:server])
    job_name    = CGI.unescape(params[:job])

    manadic(Either.attempt_all(self) do
      try { gen_config.view(view_name) }
      try { |view| view.server(server_name) }
      try { |server| server.job(job_name) }
      try { |job| job.query!.to_hash }
    end)
  end


  post '/api/view/:view/server/:server/job/:job/describe' do
    view_name   = CGI.unescape(params[:view])
    server_name = CGI.unescape(params[:server])
    job_name    = CGI.unescape(params[:job])
    desc        = CGI.unescape(params[:desc])

    if !(desc.nil? or desc.empty?)
      submitter = begin
                    Resolv.getname(request.ip)
                  rescue Resolv::ResolvError
                    request.ip
                  end

      desc << " by #{submitter}"
    end

    manadic(Either.attempt_all(self) do
      try { gen_config.view(view_name) }
      try { |view| view.server(server_name) }
      try { |server| server.job(job_name) }
      try { |job| job.describe_build!(desc) }
    end)
  end

  # Investigate a failed build
  get '/view/:view/:server/:job/:build/investigate' do
    view_name   = CGI.unescape(params[:view])
    server_name = CGI.unescape(params[:server])
    job         = CGI.unescape(params[:job])
    build       = CGI.unescape(params[:build])
    postdata    = { 'description' => 'Under investigation' }
    prefix      = "/job/#{job}/#{build}"

    manadic(Either.attempt_all(self) do
      try { gen_config.view(view_name) }
      try { |view| view.server(server_name) }
      try { |server|
        server.to_config['url']
        server.client.api_post_request("#{prefix}/submitDescription", postdata)
        redirect "#{server.to_config['url']}/#{prefix}/"
      }
    end)

    @errors = []
    @errors << "We couldn't find a server in our config for #{server}!"

    @view_name = 'index'

    erb :base do
      erb :index
    end
  end
end
