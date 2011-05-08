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
  if params[:file][:tempfile] && params[:file][:filename]
    tmpfile = params[:file][:tempfile]
    name = params[:file][:filename]
    File.copy(tmpfile.path, "uploads/#{name}")
    return {}.to_json
  else
    return {:error => 'No file selected'}.to_json
  end
end

get '/status/:filename' do
  File.stat("uploads/#{params[:filename]}").size.to_s
end

get '/stylesheets/application.css' do
  sass :'sass_sheets/application'
end

