I think [Draft](https://draftin.com/) is cool. &nbsp;To describe what Draft is to the uninitiated in as few words as possible: It's a minimalist, collaborative, cloud-based text editor with [git-like version control features](https://draftin.com/images/diff_view2.png).

I haven't had much reason to use Draft. &nbsp;I write a lot for work but unfortunately, for draft's sake and my sanity, everyone in my office is addicted to Microsoft Word. &nbsp;They're also generally distrustful of free web services, regardless of their usefulness. &nbsp;This is true not just for my office, but [the Federal Government as a whole](http://readwrite.com/2012/05/31/government-market-drags-microsoft-deeper-into-the-cloud#awesm=~obA3HoQ6Kx7h7O).

[Draft's creator](https://twitter.com/natekontny) just announced a webhook feature, so my personal use may be rising. &nbsp;A webhook gives me the ability to publish a blog post with one click from Draft.

If you don't use a popular blogging service, which is true in my case, a Draft webhook isn't an out-of-the-box type thing. &nbsp;You have to build it yourself. &nbsp;Frankly, I like building software, so this an incentive more so than an impediment.

### In the rest of this post, I'll lay out in detail how I built my webhook.

I have a pretty unusual [blog setup](https://github.com/eblahm/eblahg). &nbsp;Its entirely custom made using Google App Engine platform and the Python API (think Django for Google servers). &nbsp;I learned to code via App Engine's documentation, and hosting a custom blog there seemed to make sense. Casual bloggers would definitely find my blog setup a pain in the ass. &nbsp;Most web programmers would find it generally unnecessary, given all the blogging tools already out there (Don't worry, someday I'll start using [jekyll](http://jekyllrb.com/)).

But anyways, its what I use. &nbsp;So for you .00000000000000000000001% like me, blogging on App Engine, here's the primary components for building a blog-style webhook between Draft and Google App Engine:

#### 1. a data model that mirrors the [Draft payload](https://draftin.com/documents/69898?token=5fjKKlZ0-AeBzqj_RAftAGdzRzl9VBfBHj5wpSWm_gU)

```python
from google.appengine.ext import db

class Article(db.Model):
	title = db.StringProperty()
	content = db.TextProperty()
	content_html = db.TextProperty()
	pub_date = db.DateTimeProperty(auto_now_add=True)
```

#### 2. a means of generating your secret url &nbsp;(Copy and paste url into Draft settings)&nbsp; 

```python
import hashlib 
import webapp2 
from google.appengine.ext import db

class WebHook(db.Model):
	secret = db.StringProperty()

class print_secret(webapp2.RequestHandler):
	def get(self):
 &nbsp;wh = WebHook.get_by_key_name('draft_webhook')
 &nbsp;if wh == None:
 &nbsp;	wh = WebHook(key_name='draft_webhook')
 &nbsp;	wh.secret = hashlib.md5(str(wh.key())).hexdigest()
 &nbsp;	wh.put()
 &nbsp;secret_url = self.request.host_url + "/publish/" + wh.secret
 &nbsp;self.response.out.write(secret_url)

app = webapp2.WSGIApplication([('/print_secret_url', print_secret)])
```


#### 3. a handler to process the Draft payload

```python
import webapp2
import json

class draft(webapp2.RequestHandler):
	def post(self, secret):
 &nbsp;if secret == WebHook.get_by_key_name("draft_webhook").secret:
 &nbsp;	d = json.loads(self.request.get('payload'))
 &nbsp;	article = models.Article.get_by_key_name(str(d['id']))
 &nbsp;	if article == None:
 &nbsp; &nbsp;article = models.Article(key_name=str(d['id']))
 &nbsp; &nbsp;article.put()
 &nbsp;	article.title=d['name']
 &nbsp;	article.content=d['content']
 &nbsp;	article.content_html=d['content_html']
 &nbsp;	article.put()
 &nbsp;	self.response.out.write('published!')
 &nbsp;else:
 &nbsp;	self.response.out.write('not authorized')

app = webapp2.WSGIApplication([('/publish/(.*)', draft)])
	```

