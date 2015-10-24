#### _Version controlled, database-less blogging with on the fly markdown compilation_

Static site generators like [Jekyll](https://github.com/jekyll/jekyll) are great because they use version controlled flat files.  However, updating content is a three step process of, editing markdown, yml or json (in an editor of your choice), compiling those files to html and then updating the server.  

I find this process to be a hassle.  I'd much rather have an admin ui in the browser to update the content. Also, why should updating version controlled content be more complex than database driven content? I'd like to have a website that is version controlled but still knows how to update itself.

#### _Intended Audience_
This project is mainly intended for my personal usage on [halbe.works](https://halbe.works).  If you find it interesting or useful, feel free to fork.

#### Prerequisites
- lastest version of iojs
- redis

#### Configuration
In the config directory create a config file that is namespaced by the NODE_ENV environmental variable.  So for example if you are running via `NODE_ENV=production node ...`, create a config/production.toml file.
```toml
# default config
project_name = 'coy'
port = 5001

repo = 'eblahm/coy' # your forked github repo
repo_url = 'https://github.com/eblahm/coy' # full url to your forkd github repo

# configurable via env var SESSION_SECRET='foo'
session_secret = '(((((((((( 0-0~ ))))))))))'

[github]
  api_url = 'https://api.github.com'
  
  # these two are also configurable via evn var eg GITHUB_CLIENT_ID=123
  client_id = 'your github app id'
  client_secret = 'your github app id'
  
  # make sure this next property is the same in github admin and below
  # replace 127.0.0.1:5001 with your domain if necessary
  redirect_uri = 'http://127.0.0.1:5001/github/callback'
  scope = 'repo,user'

[redis]
  port = 6379
  url = '127.0.0.1'
  
[blog]
  categories=['fragments','articles','other']
  [rss]
    included_categories=['fragments', 'articles']
    title='the works of Matthew Halbe'
    description='New content is not frequent'
    language='en'
    image_url='http://www.gravatar.com/avatar/6af8e2870fd7c4a74b8692f0c997522e'

```

#### Usage
```bash
# local development
gulp start

# production 
npm install
npm start

# navigate to /admin to edit content
```
