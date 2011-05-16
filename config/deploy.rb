set :user, "pimeys"
set :application, "MySimpleUploader"
set :domain, "avaruuslenski.org"
set :deploy_to, "/var/www/#{application}"
set :repository, "git@github.com:pimeys/#{application}.git"

namespace :vlad do
  # overrides
  set :shared_paths, { }
  set :mkdirs, []
  
  desc 'Start the app'
  remote_task :start_app, :roles => :app do
    run "/etc/init.d/express_app #{application} start"
  end
  
  desc 'Stop the app'
  remote_task :stop_app, :roles => :app do
    run "/etc/init.d/express_app #{application} stop"
  end
  
  desc 'Restart the app'
  remote_task :restart_app, :roles => :app do
    %w(stop_app start_app).each { |task| Rake::Task["vlad:#{task}"].invoke }
  end
  
  desc "Full deployment cycle: Update, ndistro:install_deps, restart, cleanup"
  remote_task :deploy, :roles => :app do
    %w(update cleanup).each do |task|
      Rake::Task["vlad:#{task}"].invoke
    end
  end
end
