require 'rubygems'
require 'sinatra'
require 'haml'
require 'sass'
require 'coffee-script'

set :haml, :format => :html5

get '/' do
  haml :index
end

get '/stylesheets/application.css' do
  sass :'sass_sheets/application'
end

get '/javascripts/application.js' do
  coffee :'coffeescripts/application'
end
