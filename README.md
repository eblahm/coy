#### _Version controlled, database-less blogging with on the fly markdown compilation_

Static site generators like [Jekyll](https://github.com/jekyll/jekyll) are great because they use version controlled flat files.  However, updating content is a three step process of, editing markdown, yml or json (in an editor of your choice), compiling those files to html and then updating the server.  

I find this process to be a hassle.  I'd much rather have an admin ui in the browser to update the markdown. Also, why should updating version controlled content be more complex than database driven content? I'd like to have a website that is version controlled but still knows how to update itself.

#### Intended Audience
This project is mainly intended for my personal usage on [halbe.works](https://halbe.works).  If you find it interesting or useful, feel free to fork.

#### Prerequisites
- node
- redis

#### Configuration
In the config directory create a config file that is namespaced by the NODE_ENV environmental variable. So for example if you are running via `NODE_ENV=production node ...`, create a config/production.toml file.   The key value pairs that you specify in this environment based config file will override the [defaults values](https://github.com/eblahm/coy/blob/master/config/default.toml)  Sensitive values can be passed via Environmental variables.

#### Usage
```bash
# local development
gulp start

# production 
export NODE_ENV='production'
export GITHUB_CLIENT_ID='asdf'
export GITHUB_CLIENT_SECRET='asdf'
export GITHUB_REDIRECT_URL='http://example.com/github/callback'
export SESSION_SECRET='asdf'
export GOOGLE_ANALYTICS_ID='UA-asdf-1'
npm install
npm start

# navigate to /admin to edit content
```
