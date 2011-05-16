set :user, "pimeys"
set :application, "MySimpleUploader"
set :domain, "avaruuslenski.org"
set :deploy_to, "/var/www/#{application}"
set :repository, "git@github.com:pimeys/#{application}.git"

namespace :vlad do
  # overrides
  set :shared_paths, { }
  set :mkdirs, []
  
  desc 'Softlink log and public dirs'
  remote_task :link_dirs, :roles => :app do
    run "sudo ln -s #{deploy_to}/shared/log #{deploy_to}/current/log"
    run "sudo ln -s #{deploy_to}/shared/uploads #{deploy_to}/current/public"
  end

  desc 'Start the app'
  remote_task :start_app, :roles => :app do
    run "sudo /etc/init.d/express_app #{application} start"
  end
  
  desc 'Stop the app'
  remote_task :stop_app, :roles => :app do
    run "sudo /etc/init.d/express_app #{application} stop"
  end
  
  desc 'Restart the app'
  remote_task :restart_app, :roles => :app do
    %w(stop_app start_app).each { |task| Rake::Task["vlad:#{task}"].invoke }
  end
  
  desc "Full deployment cycle: Update, restart, cleanup"
  remote_task :deploy, :roles => :app do
    %w(update link_dirs restart_app cleanup).each do |task|
      Rake::Task["vlad:#{task}"].invoke
    end
  end
end
