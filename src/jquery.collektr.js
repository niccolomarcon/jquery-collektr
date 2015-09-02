(function() {
  (function($, window, document) {
    var EndlessScroll, Plugin, pluginName;
    pluginName = "collektr";
    Plugin = (function() {
      var defaults;

      Plugin.next = 0;

      Plugin.fancybox_initialized = false;

      defaults = {
        handlebarURL: "http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/3.0.3/handlebars.min.js",
        templateURL: null,
        masonryURL: "http://cdnjs.cloudflare.com/ajax/libs/masonry/3.3.0/masonry.pkgd.min.js",
        imgLoadedURL: "http://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/3.1.8/imagesloaded.pkgd.min.js",
        fancyURL: "http://cdn.jsdelivr.net/fancybox/2.1.5/jquery.fancybox.min.js",
        fancyCssURL: "http://cdn.jsdelivr.net/fancybox/2.1.5/jquery.fancybox.min.css",
        customHelpers: null,
        range: null,
        offset: 20,
        fullScreen: true,
        columnNumber: 5,
        containerID: "#collektr" + Plugin.next,
        container: "collektr" + Plugin.next,
        noScroll: false,
        builtInTemplate: "{{#each this}}\n  <div class=\"{{label}} new collektr-entry\" id=\"{{id}}\" data-external-id=\"{{external_id}}\">\n    <div class=\"panel panel-default\">\n      <div class=\"panel-heading\">\n        <img src=\"{{profile_image_url}}\" class=\"img-profile\" style=\"max-height: 48px; max-width: 48px;\">\n        <span class=\"small\">\n          <a href=\"{{profile_url}}\" target=\"_blank\">{{from}}</a>\n        </span>\n      </div>\n      <div class=\"media-wrapper\" align=\"center\">\n        {{#switchMedia this}}{{/switchMedia}}\n      </div>\n      <div class=\"panel-body\">\n        {{#ifContent content}}\n          <p style=\"word-wrap: break-word;\">{{#parseLinks content}}{{/parseLinks}}</p>\n        {{/ifContent}}\n      </div>\n      <div class=\"panel-footer\">\n        <a href=\"{{original_content_url}}\" target=\"_blank\">\n          <i class=\"fa img-provider fa-{{provider_name}}\"></i>\n        </a>\n        <span class=\"small\">{{#parseDate created_at}}{{/parseDate}}</span>\n        <div class=\"btn-group pull-right dropdown\">\n          <button type=\"button\" class=\"btn btn-xs dropdown-toggle\" id=\"dropdownMenu{{id}}\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\">\n            <i class=\"fa fa-share\"></i>\n          </button>\n          <ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu{{id}}\">\n            <li><div class=\"fb-like\" data-href=\"{{original_content_url}}\" data-width=\"200\" data-layout=\"button_count\" data-action=\"like\" data-show-faces=\"false\" data-share=\"true\"></div></li>\n            <li><div class=\"g-plusone\" data-annotation=\"inline\" data-width=\"300\" data-href=\"{{original_content_url}}\"></div></li>\n            <li><a href=\"https://twitter.com/share\" class=\"twitter-share-button\" data-url=\"{{original_content_url}}\" data-text=\"{{content}}\">Tweet</a></li>\n            {{#ifImg content_type}}<li><div class=\"share\" pin-it=\"{{content}}\" pin-it-url=\"{{original_content_url}}\" pin-it-image=\"{{media_url}}\"></div></li>{{/ifImg}}\n          </ul>\n        </div>\n        <div class=\"clearfix\"></div>\n      </div>\n    </div>\n  </div>\n{{/each}}",
        urlCard: function(selector, token) {
          return "http://api.collektr.com/boards/" + selector + "/cards.json?user_token=" + token;
        },
        callback: function() {
          return false;
        }
      };

      function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
        this.next++;
      }

      Plugin.prototype.init = function() {
        var _ref;
        if (this.settings.token == null) {
          console.log("token is missing");
        }
        if (this.settings.selector == null) {
          console.log("selector is missing");
        }
        if (!((1 <= (_ref = this.settings.columnNumber) && _ref <= 10))) {
          console.log("columnNumber should be between 1 and 10");
        }
        this.wrap();
        this.masonrySetup();
        this.handlebarsSetup();
        this.styleSetup();
        if (!Plugin.fancybox_initialized) {
          this.fancySetup();
        }
        Plugin.fancybox_initialized = true;
        if (this.settings.range == null) {
          this.settings.range = [0, 29];
        }
        return this.fetch();
      };

      Plugin.prototype.fetch = function() {
        return $.ajax({
          url: this.settings.urlCard(this.settings.selector, this.settings.token),
          data: "data",
          success: (function(_this) {
            return function(cards) {
              return _this.render(cards);
            };
          })(this),
          headers: {
            "Range-Unit": "items",
            "Range": "" + this.settings.range[0] + "-" + this.settings.range[1]
          },
          crossDomain: true
        });
      };

      Plugin.prototype.render = function(cards) {
        var _render;
        _render = (function(_this) {
          return function(data) {
            var template;
            template = Handlebars.compile(data);
            $(_this.element).find(_this.settings.containerID).append(template(cards));
            $(".new").css("display", "none");
            _this.masonry();
            _this.upgradeRange();
            if (!_this.settings.noScroll) {
              _this.scroll();
            }
            return _this.fireCallback();
          };
        })(this);
        if (this.settings.templateURL != null) {
          return $.get(this.settings.templateURL, (function(_this) {
            return function(data) {
              return _render(data);
            };
          })(this));
        } else {
          return _render(this.settings.builtInTemplate);
        }
      };

      Plugin.prototype.upgradeRange = function() {
        this.settings.range[0] = this.settings.range[1] + 1;
        return this.settings.range[1] += this.settings.offset;
      };

      Plugin.prototype.scroll = function() {
        var selector;
        selector = this.settings.fullScreen ? window : $(this.element);
        return $(selector).endlessScroll({
          fireDelay: 100,
          callback: (function(_this) {
            return function(f, p, s) {
              return _this.fetch();
            };
          })(this)
        });
      };

      Plugin.prototype.masonry = function() {
        $(this.element).find(this.settings.containerID).masonry('appended', $('.new'), true);
        $.get(this.settings.imgLoadedURL, (function(_this) {
          return function() {
            return imagesLoaded($(_this.element).find(_this.settings.containerID), function() {
              $(_this.element).find(_this.settings.containerID).masonry();
              return $(".new").css("display", "block");
            });
          };
        })(this));
        return $('.new').removeClass('new');
      };

      Plugin.prototype.wrap = function() {
        return $(this.element).append("<div id='" + this.settings.container + "' />");
      };

      Plugin.prototype.masonrySetup = function() {
        var setup;
        setup = (function(_this) {
          return function() {
            return $(_this.element).find(_this.settings.containerID).masonry({
              itemSelector: '.collektr-entry',
              percentPosition: true
            });
          };
        })(this);
        if (typeof masonry !== "undefined" && masonry !== null) {
          return setup();
        } else {
          return $.get(this.settings.masonryURL, (function(_this) {
            return function() {
              return setup();
            };
          })(this));
        }
      };

      Plugin.prototype.handlebarsSetup = function() {
        var setup;
        setup = (function(_this) {
          return function() {
            Handlebars.registerHelper('parseLinks', function(text, options) {
              var LINK_DETECTION_REGEX;
              LINK_DETECTION_REGEX = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi;
              return text.replace(LINK_DETECTION_REGEX, function(url) {
                var address;
                address = /[a-z]+:\/\//.test(url) ? url : "http://" + url;
                url = url.replace(/^https?:\/\//, '');
                return "<a href='" + address + "' target='_blank'>" + url + "</a>";
              });
            });
            Handlebars.registerHelper('parseDate', function(_date, options) {
              var date, months;
              months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              date = new Date(_date);
              return "" + months[date.getMonth()] + " " + (date.getDate()) + ", " + (date.getFullYear()) + " " + (date.toLocaleTimeString("en-US"));
            });
            Handlebars.registerHelper('ifContent', function(content, options) {
              if ((content != null) && content.length > 0) {
                return options.fn(this);
              }
            });
            Handlebars.registerHelper('ifImg', function(type, options) {
              if (type === 'image') {
                return options.fn(this);
              }
            });
            Handlebars.registerHelper('switchMedia', function(card, options) {
              var src;
              if (card.content_type === "text") {
                return '<div></div>';
              }
              if (card.content_type === "image") {
                return '<a href="' + card.media_url + '" class="fancybox" target="_blank"><img src="' + card.media_url + '" class="img-responsive" style="width: 100%"></a>';
              } else {
                if (card.provider_name === "facebook" || card.provider_name === "instagram") {
                  src = card.provider_name === "facebook" ? card.media_tag.match(/src="(.+)"/)[1] : card.media_url;
                  return "<a href='" + src + "' class='fancybox' data-fancybox-type='iframe'><img src='" + card.thumbnail_image_url + "' class='img-responsive' style='width: 100%'></a>";
                } else {
                  return '<div class="embed-responsive embed-responsive-4by3">' + card.media_tag + '</div>';
                }
              }
            });
            if (_this.settings.customHelpers != null) {
              return _this.settings.customHelpers();
            }
          };
        })(this);
        if (typeof Handlebars !== "undefined" && Handlebars !== null) {
          return setup();
        } else {
          return $.get(this.settings.handlebarURL, (function(_this) {
            return function() {
              return setup();
            };
          })(this));
        }
      };

      Plugin.prototype.styleSetup = function() {
        return $("head").append((function(_this) {
          return function() {
            var selector, wide;
            wide = 100 / _this.settings.columnNumber - 2;
            selector = _this.element.id !== "" ? "#" + _this.element.id : "." + _this.element.className;
            return "<style>" + selector + " .collektr-entry { width: " + wide + "%; margin: 0% 1% 0% 1%; }</style><link rel='stylesheet' href='" + _this.settings.fancyCssURL + "' type='text/css' 'media=screen' />";
          };
        })(this));
      };

      Plugin.prototype.fancySetup = function() {
        var setup;
        setup = (function(_this) {
          return function() {
            return $(".fancybox").fancybox({});
          };
        })(this);
        if (typeof fancybox !== "undefined" && fancybox !== null) {
          return setup();
        } else {
          return $.get(this.settings.fancyURL, (function(_this) {
            return function() {
              return setup();
            };
          })(this));
        }
      };

      Plugin.prototype.fireCallback = function() {
        return this.settings.callback();
      };

      return Plugin;

    })();

    /* Start of EndlessScroll */
    EndlessScroll = (function() {
      var defaults;

      defaults = {
        pagesToKeep: null,
        inflowPixels: 0,
        fireOnce: false,
        fireDelay: 150,
        loader: '',
        content: '',
        insertBefore: null,
        insertAfter: null,
        intervalFrequency: 250,
        ceaseFireOnEmpty: true,
        resetCounter: function() {
          return false;
        },
        callback: function() {
          return true;
        },
        ceaseFire: function() {
          return false;
        }
      };

      function EndlessScroll(scope, options) {
        this.options = $.extend({}, defaults, options);
        this.pagesStack = [0];
        this.scrollDirection = 'next';
        this.firing = true;
        this.fired = false;
        this.fireSequence = 0;
        this.pageSequence = 0;
        this.nextSequence = 1;
        this.prevSequence = -1;
        this.lastScrollTop = 0;
        this.insertLocation = this.options.insertAfter;
        this.didScroll = false;
        this.isScrollable = true;
        this.target = scope;
        this.targetId = '';
        this.content = '';
        this.lastContent = 'dummy';
        this.innerWrap = $('.endless_scroll_inner_wrap', this.target);
        this.handleDeprecatedOptions();
        this.setInsertPositionsWhenNecessary();
        $(scope).scroll((function(_this) {
          return function() {
            _this.detectTarget(scope);
            return _this.detectScrollDirection();
          };
        })(this));
      }

      EndlessScroll.prototype.run = function() {
        return setInterval(((function(_this) {
          return function() {
            if (!_this.shouldTryFiring()) {
              return;
            }
            if (_this.ceaseFireWhenNecessary()) {
              return;
            }
            if (!_this.shouldBeFiring()) {
              return;
            }
            _this.resetFireSequenceWhenNecessary();
            _this.acknowledgeFiring();
            if (_this.hasContent()) {
              _this.fireCallback();
              _this.cleanUpPagesWhenNecessary();
              _this.delayFiringWhenNecessary();
            }
            return _this.lastContent = _this.content;
          };
        })(this)), this.options.intervalFrequency);
      };

      EndlessScroll.prototype.handleDeprecatedOptions = function() {
        if (this.options.data) {
          this.options.content = this.options.data;
        }
        if (this.options.bottomPixels) {
          return this.options.inflowPixels = this.options.bottomPixels;
        }
      };

      EndlessScroll.prototype.setInsertPositionsWhenNecessary = function() {
        var container;
        container = "" + this.target.selector + " div.endless_scroll_inner_wrap";
        if (defaults.insertBefore === null) {
          this.options.insertBefore = "" + container + " div:first";
        }
        if (defaults.insertAfter === null) {
          return this.options.insertAfter = "" + container + " div:last";
        }
      };

      EndlessScroll.prototype.detectTarget = function(scope) {
        this.target = scope;
        return this.targetId = $(this.target).attr('id');
      };

      EndlessScroll.prototype.detectScrollDirection = function() {
        var currentScrollTop;
        this.didScroll = true;
        currentScrollTop = $(this.target).scrollTop();
        if (currentScrollTop > this.lastScrollTop) {
          this.scrollDirection = 'next';
        } else {

        }
        return this.lastScrollTop = currentScrollTop;
      };

      EndlessScroll.prototype.shouldTryFiring = function() {
        var shouldTryOrNot;
        shouldTryOrNot = this.didScroll && this.firing === true;
        if (shouldTryOrNot) {
          this.didScroll = false;
        }
        return shouldTryOrNot;
      };

      EndlessScroll.prototype.ceaseFireWhenNecessary = function() {
        if (this.options.ceaseFireOnEmpty === true && this.lastContent === '' || this.options.ceaseFire.apply(this.target, [this.fireSequence, this.pageSequence, this.scrollDirection])) {
          this.firing = false;
          return true;
        } else {
          return false;
        }
      };

      EndlessScroll.prototype.wrapContainer = function(target) {
        return this.innerWrap = $(target).find('#collektr');

        /*if @innerWrap.length is 0
        	      @innerWrap = $(target).wrapInner('<div class="endless_scroll_content" data-page="0" />')
        	                             .wrapInner('<div class="endless_scroll_inner_wrap" />')
        	                             .find('.endless_scroll_inner_wrap')
         */
      };

      EndlessScroll.prototype.scrollableAreaMargin = function(innerWrap, target) {
        var margin;
        switch (this.scrollDirection) {
          case 'next':
            margin = innerWrap.height() - $(target).height() <= $(target).scrollTop() + this.options.inflowPixels;
            if (margin) {
              target.scrollTop(innerWrap.height() - $(target).height() - this.options.inflowPixels);
            }
            break;
          case 'prev':
            margin = $(target).scrollTop() <= this.options.inflowPixels;
            if (margin) {
              target.scrollTop(this.options.inflowPixels);
            }
        }
        return margin;
      };

      EndlessScroll.prototype.calculateScrollableCanvas = function() {
        if (this.target[0] === document || this.target[0] === window) {
          return this.isScrollable = this.scrollableAreaMargin($(document), $(window));
        } else {
          this.wrapContainer(this.target);
          return this.isScrollable = this.innerWrap.length > 0 && this.scrollableAreaMargin(this.innerWrap, this.target);
        }
      };

      EndlessScroll.prototype.shouldBeFiring = function() {
        this.calculateScrollableCanvas();
        return this.isScrollable && (this.options.fireOnce === false || (this.options.fireOnce === true && this.fired !== true));
      };

      EndlessScroll.prototype.resetFireSequenceWhenNecessary = function() {
        if (this.options.resetCounter.apply(this.target) === true) {
          return this.fireSequence = 0;
        }
      };

      EndlessScroll.prototype.acknowledgeFiring = function() {
        this.fired = true;
        this.fireSequence++;
        switch (this.scrollDirection) {
          case 'next':
            return this.pageSequence = this.nextSequence++;
          case 'prev':
            return this.pageSequence = this.prevSequence--;
        }
      };

      EndlessScroll.prototype.insertContent = function(content) {
        switch (this.scrollDirection) {
          case 'next':
            return $(this.options.insertAfter).after(content);
          case 'prev':
            return $(this.options.insertBefore).before(content);
        }
      };

      EndlessScroll.prototype.insertLoader = function() {
        return this.insertContent("<div class=\"endless_scroll_loader_" + this.targetId + " endless_scroll_loader\">" + this.options.loader + "</div>");
      };

      EndlessScroll.prototype.removeLoader = function() {
        return $('.endless_scroll_loader_' + this.targetId).fadeOut(function() {
          return $(this).remove();
        });
      };

      EndlessScroll.prototype.hasContent = function() {
        if (typeof this.options.content === 'function') {
          this.content = this.options.content.apply(this.target, [this.fireSequence, this.pageSequence, this.scrollDirection]);
        } else {
          this.content = this.options.content;
        }
        return this.content !== false;
      };

      EndlessScroll.prototype.showContent = function() {
        $('#endless_scroll_content_current').removeAttr('id');
        return this.insertContent("<div id=\"endless_scroll_content_current\" class=\"endless_scroll_content\" data-page=\"" + this.pageSequence + "\">" + this.content + "</div>");
      };

      EndlessScroll.prototype.fireCallback = function() {
        return this.options.callback.apply(this.target, [this.fireSequence, this.pageSequence, this.scrollDirection]);
      };

      EndlessScroll.prototype.cleanUpPagesWhenNecessary = function() {
        var pageToRemove;
        if (!(this.options.pagesToKeep >= 1)) {
          return;
        }
        switch (this.scrollDirection) {
          case 'next':
            this.pagesStack.push(this.pageSequence);
            break;
          case 'prev':
            this.pagesStack.unshift(this.pageSequence);
        }
        if (this.pagesStack.length > this.options.pagesToKeep) {
          switch (this.scrollDirection) {
            case 'next':
              pageToRemove = this.prevSequence = this.pagesStack.shift();
              break;
            case 'prev':
              pageToRemove = this.nextSequence = this.pagesStack.pop();
          }
        }
        this.removePage(pageToRemove);
        return this.calculateScrollableCanvas();
      };

      EndlessScroll.prototype.removePage = function(page) {
        return $(".endless_scroll_content[data-page='" + page + "']", this.target).remove();
      };

      EndlessScroll.prototype.delayFiringWhenNecessary = function() {
        if (this.options.fireDelay > 0) {
          $('body').after('<div id="endless_scroll_marker"></div>');
          return $('#endless_scroll_marker').fadeTo(this.options.fireDelay, 1, (function(_this) {
            return function() {
              $('#endless_scroll_marker').remove();
              return _this.fired = false;
            };
          })(this));
        } else {
          return this.fired = false;
        }
      };

      return EndlessScroll;

    })();
    $.fn.endlessScroll = function(options) {
      return new EndlessScroll(this, options).run();
    };
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        if (!$.data(this, "plugin_" + pluginName)) {
          return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        }
      });
    };
  })(jQuery, window, document);

}).call(this);
