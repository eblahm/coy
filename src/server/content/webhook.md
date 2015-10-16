I think [Draft](https://draftin.com/) is cool. To describe what Draft is to the
uninitiated in as few words as possible: It's a minimalist, collaborative,
cloud-based text editor with [git-like version control
features](https://draftin.com/images/diff_view2.png).

I haven't had much reason to use Draft. &nbsp;I write a lot for work but
unfortunately, for draft's sake and my sanity, everyone in my office is
addicted to Microsoft Word. &nbsp;They're also generally distrustful of free web
services, regardless of their usefulness. &nbsp;This is true not just for my office,
but [the Federal Government as a whole](http://readwrite.com/2012/05/31/government-market-drags-microsoft-deeper-into-the-cloud#awesm=~obA3HoQ6Kx7h7O).

[Draft's creator](https://twitter.com/natekontny) just announced a webhook
feature, so my personal use may be rising. &nbsp;A webhook gives me the ability to
publish a blog post with one click from Draft.

If you don't use a popular blogging service, which is true in my case, a Draft
webhook isn't an out-of-the-box type thing. &nbsp;You have to build it yourself.
Frankly, I like building software, so this an incentive more so than an
impediment.

### In the rest of this post, I'll lay out in detail how I built my webhook.

I have a pretty unusual [blog setup](https://github.com/eblahm/eblahg). &nbsp;Its
entirely custom made using Google App Engine platform and the Python API (think
Django for Google servers). &nbsp;I learned to code via App Engine's documentation,
and hosting a custom blog there seemed to make sense. Casual bloggers would
definitely find my blog setup a pain in the ass. &nbsp;Most web programmers would
find it generally unnecessary, given all the blogging tools already out there
(Don't worry, someday I'll start using [jekyll](http://jekyllrb.com/)).

But anyways, its what I use. &nbsp;So for you .00000000000000000000001% like me,
blogging on App Engine, here's the primary components for building a blog-style
webhook between Draft and Google App Engine:

#### 1. a data model that mirrors the [Draft payload](https://draftin.com/documents/69898?token=5fjKKlZ0-AeBzqj_RAftAGdzRzl9VBfBHj5wpSWm_gU)

```python
from google.appengine.ext import db

class Article(db.Model):
 &nbsp;title = db.StringProperty()
 &nbsp;content = db.TextProperty()
 &nbsp;content_html = db.TextProperty()
 &nbsp;pub_date = db.DateTimeProperty(auto_now_add=True)
```

#### 2. a means of generating your secret url 
(Copy and paste url into Draft settings)
```python
import hashlib
import webapp2
from google.appengine.ext import db

class WebHook(db.Model):
 &nbsp;secret = db.StringProperty()

class print_secret(webapp2.RequestHandler):
 &nbsp;def get(self):
 &nbsp; &nbsp;wh = WebHook.get_by_key_name('draft_webhook')
 &nbsp; &nbsp;if wh == None:
 &nbsp; &nbsp; &nbsp;wh = WebHook(key_name='draft_webhook')
 &nbsp; &nbsp; &nbsp;wh.secret = hashlib.md5(str(wh.key())).hexdigest()
 &nbsp; &nbsp; &nbsp;wh.put()
 &nbsp; &nbsp;secret_url = self.request.host_url + "/publish/" + wh.secret
 &nbsp; &nbsp;self.response.out.write(secret_url)

app = webapp2.WSGIApplication([('/print_secret_url', print_secret)])
```


#### 3. a handler to process the Draft payload

```python
import webapp2
import json

class draft(webapp2.RequestHandler):
 &nbsp;def post(self, secret):
 &nbsp; &nbsp;if secret != WebHook.get_by_key_name("draft_webhook").secret:
 &nbsp; &nbsp; &nbsp;return self.response.out.write('not authorized')

 &nbsp; &nbsp;data = json.loads(self.request.get('payload'))
 &nbsp; &nbsp;article = models.Article.get_by_key_name(str(data['id']))
 &nbsp; &nbsp;if article == None:
 &nbsp; &nbsp; &nbsp;article = models.Article(key_name=str(data['id']))
 &nbsp; &nbsp; &nbsp;article.put()

 &nbsp; &nbsp;article.title=d['name']
 &nbsp; &nbsp;article.content=d['content']
 &nbsp; &nbsp;article.content_html=d['content_html']
 &nbsp; &nbsp;article.put()
 &nbsp; &nbsp;self.response.out.write('published!')

app = webapp2.WSGIApplication([('/publish/(.*)', draft)])
```
