Introduction
------------

This project is my deep dive into one of the strangest problems in web: the
multipart upload. Yes, you can send a file with every browser, but there's no
unified API for getting the file progress or sending the file with AJAX.

We need to monitor the progress in the server side. There's another problem
field: web servers have a tendency to cache the upload before they send the
request for application, so if you don't want to tie yourself to a specific
server using upload progress modules, you have to think some other approach.

The client side is also quite problematic. You can't use regular AJAX requests,
but you can fake it using a hidden iframe.

Node.js
-------

This was a job for Node.js, which has grown into a valid option for simple
tasks like this. :)

I decided I should only use Node.js serving HTTP for clients. I also needed an
event based server so I could start only one process and handle all the
requests with it. 

Node.js uses JavaScript so there's a great support for events and it's 
quite easy to monitor the progress when getting the request.

Serverside libraries:

* [Express]( http://expressjs.com/ ) Sinatra inspired web development framework for node.js
* [Formidable]( https://github.com/aheckmann/node-formidable ) A node.js module for parsing form data, especially file uploads
* [EJS]( https://github.com/visionmedia/ejs ) Embedded JavaScript templates for node - Express compliant
* [Sanitizer]( https://github.com/theSmaw/Caja-HTML-Sanitizer ) Sanitizes comments
* [Hoptoad Notifier]( https://github.com/felixge/node-hoptoad-notifier ) Report exceptions to Hoptoad from node.js

Clientside libraries:

* [jQuery]( http://jquery.com/ ) Helps with cross-browser javascript

Deployment:

* [Vlad the Deployer]( http://rubyhitsquad.com/Vlad_the_Deployer.html ) Do not reinvent the wheel. Rake based Vlad just rocks.

Files
-----
    .
    (Here lies the deployment config)
    ├── config
    │   └── deploy.rb
    (Libraries for handling the uploads and responses)
    ├── lib
    │   ├── response.js
    │   └── upload.js
    (Third party modules)
    ├── node_modules
    (The front page)
    ├── public
    │   ├── index.html
    (Client side javascript)
    │   ├── javascripts
    │   │   ├── application.js
    │   │   └── jquery-1.6.min.js
    (CSS3)
    │   ├── stylesheets
    │   │   └── application.css
    (All the uploads are saved to here)
    │   └── uploads
    (The main server application)
    ├── server.js
    (Templates)
    └── views
        └── view.html.ejs

Deployment
----------

The deployment is handled in the normal Vlad way. 

You need an init.d script for handling the application start/stop/restart:

    > cat /etc/init.d/express_app 
    #!/bin/bash
    user=root
    dir=/var/www/$1/
    srv_file=server.js
    pid_file=$dir/shared/log/server.pid
    forever_bin=/usr/local/lib/node_modules/npm/node_modules/forever/bin/forever

    export HOPTOAD_API_KEY=INSERT_API_KEY_HERE

    case $2 in
    start)
        cd $dir/current ; $forever_bin start "$srv_file"
        chown "$user":"$user" "$log_file" ;;
    stop)
        $forever_bin stopall ;;
    *)  
        echo "usage: /etc/init.d/express_app {app_name} {start|stop}" ;;
    esac
    exit 0

The init script is dependable on [forever]( https://github.com/indexzero/forever ).

Usage
-----

When the application is running the index page gives a form with a file input
field. Selecting a file starts the upload, displays a comment textarea and
upload status. 

When the upload is done the progress field changes to a link to the file and
user can submit the comment. The application creates a permalink which displays
the comment and link to the file.

Process
-------

1. Initialize the transfer, server sends back an unique id
2. Send the file using the given id
3. (Optional) Add a comment to the file upload using the given id

Browser support
---------------

Tested on Google Chrome (newest stable), Mozilla Firefox (3.5+) and Internet Explorer (6+).
