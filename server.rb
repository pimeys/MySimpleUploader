require 'rubygems'
require 'sinatra'
require 'haml'
require 'sass'
require 'therubyracer'
require 'coffee-script'

set :haml, :format => :html5

get '/' do
  haml :index
end

get '/stylesheets/application.css' do
  sass :'stylesheets/application'
end

get '/javascripts/application.js' do
  coffee :'javascripts/application'
end
