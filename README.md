![Collektr](http://collektr15.s3.amazonaws.com/assets/collektr_logo-12bc3d328311e37f84e314c2102539fa.png)'s jquery plugin
========
With this **easy-to-use** jquery plugin you will be able to **implement in your site** the deck view of your favourite collection in a matter of seconds. The best part is that it is easly **customizable**. Obviously you **need an account** to use this plugin. If you do not know what is Collektr or you do not have an account, click [here](http://app.collektr.com/users/sign_in) to learn more.

# Basic usage
### HTML
```html
<div id="placeholder"></div>
<script src="path/to/jquery.collektr.min.js"></script>
```

### JQuery
```javascript
$("#placeholder").Collektr({
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

By using only this code you will get somethig like [this](http://niccolomarcon.github.io/jquery-collektr)

# Options

### Main options
If you do not set this options the plugin will not be able to load the content of your board
* ```token: string``` This is your API authentication token. You can find it [here](http://app.collektr.com/users/edit)
* ```selector: string``` This is the slug or the id of your board. If you open the page to manage the board you want to use you can see the slug in the URL of the page: app.collektr.com/boards/**slug**

### Customization options
* ```columnNumber: integer //default is 5``` How many cards per row you want. Try to keep this between 1 and 10
* ```fullScreen: boolean //default is true``` If you do not want to allow the plugin to use all the page you need to turn this option false. Look [here](#contain-the-plugin) to learn how to do this properly.
* ```range: int_array //default is [0, 29]``` The range of cards the plugin will load the first time. Because of the way [Endless Scroll](https://github.com/fredwu/jquery-endless-scroll) works this range should be big enough to make the page(or the div) scrollable
* ```offset: integer //default is 20``` The number of cards the plugin has to load every time the user scrolls till the end of the page
* ```callback: function //default is null``` The function called after every fetch of data

### Template options
* ```templateURL: string //default is "path/to/template.html"``` The path to the [Handlebars.js](https://github.com/wycats/handlebars.js/) template you want to use. See the [documentation](#custom-template) to create a template readable by the plugin.
* ```customHelpers: function //default is null``` Probably if you use a custom template you want to register some helper to make it works properly. See the [documentation](#custom-helpers) to learn more.

# How-Tos
### Contain the plugin
[DEMO](http://niccolomarcon.github.io/jquery-collektr/contain.html)

Sometimes you may want to contain the board in a little div instead of let the plugin use all the page. Here's what you have to do. It is very easy. In fact, all you have to do is change the dimension of the div where you apply the plugin.
```html
<div id="placeholder" style="width: 50%; height: 500px; overflow-y: scroll;"></div>
```
**NOTE** If you change the height of the div you need to set the ```fullScreen``` option to false. By doing this the plugin will know that he will have to track the scroll of the div. Also set ```overflow-y``` to ```scroll``` in the style.

### Custom template
[DEMO](http://niccolomarcon.github.io/jquery-collektr/custom.html)

Probably you have developed an awesome design for your site and you want to use the same style for your board. First you have to create a [Handlebars.js](https://github.com/wycats/handlebars.js/) template in a separate page. Here is the boilerplate:
```html
{{#each this}}
  <div class="new collektr-entry">
  <!-- here you can design your card -->
  </div>
{{/each}}
```
The properties of every card that you can use are:
* ```{{id}}``` The id of the card
* ```{{provider_name}}``` The name of the social from where the card was catched
* ```{{content}}``` The text of the post
* ```{{content_type}}``` Says whether the post is only text, an image or something else
* ```{{content_source}}``` If the content is from an external source, this will tell you where is from(default is null)
* ```{{from}}``` Username of the user who made the post
* ```{{media_url}}``` The url of the media attached to the post
* ```{{original_content_url}}``` The url to the original post
* ```{{media_tag}}``` If the media is from an external source, you can find here the tag to embed it
* ```{{tags}}``` A list of the tags contained in the post
* ```{{profile_url}}``` The link to the user that wrote the post
* ```{{profile_img_url}}``` The url of the profile image of the user
* ```{{likes_count}}``` The number of "likes" of that post
* ```{{shares_count}}``` How many times the post has been shared
* ```{{created_at}}``` The date(in ISO format) of the creation of the post

If you do not know how Handlebars.js works, please look his documentation.

After you have design your card, write in the ```templateURL```option the path of your template
```javascript
$("#placeholder").Collektr({
  token: "your_API_token",
  selector: "slug_or_id_of_your_board",
  templateURL: "path/to/your/customTemplate.html"
});
```

### Custom helpers
Helpers are an awesome feature of Handlebars.js, and we have wrote some helpers for our template:
* ```{{#switchMedia this}}{{/switch}}``` With this switch the template insert some tag to render the media only if there is a media in the card
* ```{{#ifContent content}}<!--stuff-->{{/ifContent}}``` Render the text inside the ifContent only if there is content
* ```{{#parseLinks content}}{{/parseLinks}}```Instead of writing plain text, with this helpers urls inside the content will be changed in links
* ```{{#parseDate created_at}}{{/parseDate}}``` Change the date from ISO format to MMM d, y h:mm:ss a
* ```{{#ifImg content_type}}<!--stuff-->{{/ifImg}}``` The content inside ifImg is written only if content_type is 'image'

But if you have created your own template, probably you will want to register some helpers. To accomplish this simply pass to ```customHelpers``` a function with the registation of the helpers (look in the documentation of handlebars.js if you do not know how to register an helper)

```javascript
$("#placeholder").Collektr({
  token: "your_API_token",
  selector: "slug_or_id_of_your_board",
  templateURL: "path/to/my/customTemplate.html",
  customHelpers: function(){

    Handlebars.registerHelper('myAwesomeHelper', function(options) {
      return options.fn(this);
    });

  }
});
```
You can also rewrite our helpers if you want.

# How it was developed
Collektr's jquery plugin has been developed mainly using [CoffeeScript](https://github.com/jashkenas/coffeescript) after creating a boilerplate with [Yeoman](https://github.com/yeoman/yeoman) and [Jquery Generator](https://github.com/jquery-boilerplate/generator-jquery-boilerplate). The plugin uses 4 external libraries:
* [Endless Scroll](https://github.com/fredwu/jquery-endless-scroll)
* [Masonry](https://github.com/desandro/masonry)
* [imagesLoaded](https://github.com/desandro/imagesloaded)
* [Handlebars.js](https://github.com/wycats/handlebars.js/)

You do not need to import them because the plugin imports them by itself if they are not present in the page. Only **Endless Scroll** has been modified(only a little) in order to write less code in the main plugin.

# TODO
The plugin is ready but it can be better. These are some things to do:
* [ ] Complete the implementation of the share-menu in the built-in template
* [ ] Performance could be **realy** better (the scroll in the first place)
