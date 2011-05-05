require 'rubygems'
require 'sinatra'
require 'haml'
require 'sass'
require 'coffee-script'
require 'json'

set :haml, :format => :html5

get '/' do
  haml :index
end

post '/' do
  content_type :json
  { :everything => 'ok' }.to_json
end

get '/status/:filename' do
  File.stat("uploads/#{params[:filename]}").size.to_s
end

get '/stylesheets/application.css' do
  sass :'sass_sheets/application'
end

get '/javascripts/application.js' do
  coffee :'coffeescripts/application'
end
