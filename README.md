![Collektr](http://collektr15.s3.amazonaws.com/assets/collektr_logo-12bc3d328311e37f84e314c2102539fa.png)'s jquery plugin
========
[Collektr](http://collektr.com) is a platform that allow you to collect, moderate and display posts from various social-network. It is a really awesome tool and with this **easy-to-use** jquery plugin you will be able to **implement in your site** the deck view of your favourite collection in a matter of seconds. The best part is that it is easly **customizable**. Obviously you **need an account** to use this plugin. If you do not have an account, click [here](http://app.collektr.com/users/sign_in) to get one.

# Basic usage
### HTML
```html
<div id="placeholder"></div>
<script src="path/to/jquery.collektr.min.js"></script>
```

### JQuery
```javascript
$("#placeholder").collektr({
  token: "your_API_token",
  selector: "slug_or_id_of_your_board"
  //other options
});
```

If you want to use the built-in template used to display the cards you will also need this:
```html
<!-- Bootstrap -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
<!-- Our .css -->
<link rel="stylesheet" href="http://assets.collektr.com/assets/deck/application.css">
```
By using only this code you will get somethig like [this](http://niccolomarcon.github.io/jquery-collektr).

# How it was developed
Collektr's jquery plugin has been developed mainly using [CoffeeScript](https://github.com/jashkenas/coffeescript) after creating a boilerplate with [Yeoman](https://github.com/yeoman/yeoman) and [Jquery Generator](https://github.com/jquery-boilerplate/generator-jquery-boilerplate). The plugin uses 4 external libraries:
* [Endless Scroll](https://github.com/fredwu/jquery-endless-scroll)
* [Masonry](https://github.com/desandro/masonry)
* [imagesLoaded](https://github.com/desandro/imagesloaded)
* [Handlebars.js](https://github.com/wycats/handlebars.js/)
* [fancyBox](https://github.com/fancyapps/fancyBox)

You do not need to import them because the plugin imports them by itself if they are not present in the page. Only **Endless Scroll** has been modified(only a little) in order to write less code in the main plugin.

If you want to take part in this project, remember to launch a ```npm install``` to get all the dependencies you need.
Launch ```grunt -f``` to build everything. To run the demo you need a webserver like [XAMPP](https://www.apachefriends.org/it/index.html) or [MAMP](https://www.mamp.info/en/).

# TODO
The plugin is ready but it can be better. These are some things to do:
* [ ] Complete the implementation of the share-menu in the built-in template
* [ ] Performance could be **really** better (the scroll in the first place)
