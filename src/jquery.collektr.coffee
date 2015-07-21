do ($ = jQuery, window, document) ->

	# Create the defaults once
	pluginName = "collektr"

	# The actual plugin constructor
	class Plugin
		@next : 0 # id in case you want to use more then one placeholder in the page
		@fancybox_initialized : false # Trying to avoid fancybox to be initialized twice.

		defaults =
			handlebarURL:              "http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/3.0.3/handlebars.min.js"
			templateURL:               null
			masonryURL:                "http://cdnjs.cloudflare.com/ajax/libs/masonry/3.3.0/masonry.pkgd.min.js"
			imgLoadedURL:              "http://cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/3.1.8/imagesloaded.pkgd.min.js"
			fancyURL:                  "http://cdn.jsdelivr.net/fancybox/2.1.5/jquery.fancybox.min.js"
			fancyCssURL:               "http://cdn.jsdelivr.net/fancybox/2.1.5/jquery.fancybox.min.css"
			customHelpers:             null
			range:                     null
			offset:                    20
			fullScreen:                yes
			columnNumber:              5
			containerID:               "#collektr" + @next # In this way we will get unique identifiers.
			container:                 "collektr" + @next
			noScroll:                  false
			builtInTemplate:         """{{#each this}}
																	  <div class="{{label}} new collektr-entry" id="{{id}}" data-external-id="{{external_id}}">
																	    <div class="panel panel-default">
																	      <div class="panel-heading">
																	        <img src="{{profile_image_url}}" class="img-profile" style="max-height: 48px; max-width: 48px;">
																	        <span class="small">
																	          <a href="{{profile_url}}" target="_blank">{{from}}</a>
																	        </span>
																	      </div>
																	      <div class="media-wrapper" align="center">
																	        {{#switchMedia this}}{{/switchMedia}}
																	      </div>
																	      <div class="panel-body">
																	        {{#ifContent content}}
																	          <p style="word-wrap: break-word;">{{#parseLinks content}}{{/parseLinks}}</p>
																	        {{/ifContent}}
																	      </div>
																	      <div class="panel-footer">
																	        <a href="{{original_content_url}}" target="_blank">
																	          <i class="fa img-provider fa-{{provider_name}}"></i>
																	        </a>
																	        <span class="small">{{#parseDate created_at}}{{/parseDate}}</span>
																	        <div class="btn-group pull-right dropdown">
																	          <button type="button" class="btn btn-xs dropdown-toggle" id="dropdownMenu{{id}}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
																	            <i class="fa fa-share"></i>
																	          </button>
																	          <ul class="dropdown-menu" aria-labelledby="dropdownMenu{{id}}">
																	            <li><div class="fb-like" data-href="{{original_content_url}}" data-width="200" data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div></li>
																	            <li><div class="g-plusone" data-annotation="inline" data-width="300" data-href="{{original_content_url}}"></div></li>
																	            <li><a href="https://twitter.com/share" class="twitter-share-button" data-url="{{original_content_url}}" data-text="{{content}}">Tweet</a></li>
																	            {{#ifImg content_type}}<li><div class="share" pin-it="{{content}}" pin-it-url="{{original_content_url}}" pin-it-image="{{media_url}}"></div></li>{{/ifImg}}
																	          </ul>
																	        </div>
																	        <div class="clearfix"></div>
																	      </div>
																	    </div>
																	  </div>
																	{{/each}}"""
			urlCard: (selector, token) -> "http://api.collektr.com/boards/#{selector}/cards.json?user_token=#{token}"
			callback:                  -> false

		constructor: (@element, options) ->
			@settings  = $.extend {}, defaults, options
			@_defaults = defaults
			@_name     = pluginName
			@init()
			@next++

		init: ->
			# Controls
			console.log "token is missing" unless @settings.token?
			console.log "selector is missing" unless @settings.selector?
			console.log "columnNumber should be between 1 and 10" unless 1 <= @settings.columnNumber <= 10

			# Setup
			@wrap()
			@masonrySetup()
			@handlebarsSetup()
			@styleSetup()

			@fancySetup() if not Plugin.fancybox_initialized
			Plugin.fancybox_initialized = true
			
			@settings.range = [0, 29] unless @settings.range? # why i need this?

			# First print
			@fetch()

		# Make an ajax request to fetch the data
		fetch: () ->
			$.ajax {
				url:     @settings.urlCard(@settings.selector, @settings.token)
				data:    "data"
				success: (cards) => @render cards
				headers: {
					"Range-Unit" : "items"
					"Range" : "#{@settings.range[0]}-#{@settings.range[1]}"
				},
				crossDomain: true,
			}

		# Insert the new cards in the page, then call mesonry to arrange them
		# Finally call scroll to listen for the next scroll
		render: (cards)->
			_render = (data) =>
				template = Handlebars.compile data
				$(@element).find(@settings.containerID).append(template cards)
				$(".new").css("display", "none")

				@masonry()
				@upgradeRange()
				@scroll() unless @settings.noScroll
				@fireCallback()

			if @settings.templateURL?
				$.get @settings.templateURL, (data) => _render(data)
			else
				_render(@settings.builtInTemplate)

		# Increase the range for the next fetch
		upgradeRange: ->
			@settings.range[0] = @settings.range[1] + 1
			@settings.range[1] += @settings.offset

		# Using the modded endless-scroll library listen for the next scroll to fetch new data
		scroll: () ->
			selector = if @settings.fullScreen then window else $(@element)
			$(selector).endlessScroll {
				fireDelay: 100
				callback: (f, p, s) => @fetch()
				}

		# Arrange with masonry the new entries
		masonry: () ->
			$(@element).find(@settings.containerID).masonry('appended', $('.new'), true)
			$.get @settings.imgLoadedURL, () => imagesLoaded $(@element).find(@settings.containerID), () =>
				$(@element).find(@settings.containerID).masonry()
				$(".new").css("display", "block")
			$('.new').removeClass('new')

		# Setup methods
		wrap: () -> $(@element).append "<div id='#{@settings.container}' />"
		masonrySetup: () ->
			setup = () =>
				$(@element).find(@settings.containerID).masonry {
					itemSelector: '.collektr-entry'
					percentPosition: true
					}

			if masonry?
				setup()
			else
				$.get @settings.masonryURL, () => setup()
		handlebarsSetup: () ->
			setup = () =>
				Handlebars.registerHelper 'parseLinks', (text, options) ->
					LINK_DETECTION_REGEX = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi

					text.replace LINK_DETECTION_REGEX, (url) ->
						address = if /[a-z]+:\/\//.test url then url else "http://#{url}"
						url = url.replace /^https?:\/\//, ''
						"<a href='#{address}' target='_blank'>#{url}</a>"

				Handlebars.registerHelper 'parseDate', (_date, options) ->
					months = [
						"Jan"
		        "Feb"
		        "Mar"
		        "Apr"
		        "May"
		        "Jun"
		        "Jul"
		        "Aug"
		        "Oct"
		        "Nov"
		        "Dec"
						]
					date = new Date _date
					"#{months[date.getMonth()]} #{date.getDate()}, #{date.getFullYear()} #{date.toLocaleTimeString "en-US" }"

				Handlebars.registerHelper 'ifContent', (content, options) ->
					if content? and content.length > 0
						options.fn @

				Handlebars.registerHelper 'ifImg', (type, options) ->
					if type is 'image'
						options.fn @

				Handlebars.registerHelper 'switchMedia', (card, options) -> #cursed switch
					if card.content_type is "text" then return '<div></div>'
					if card.content_type is "image" then return'<a href="' + card.media_url + '" class="fancybox" target="_blank"><img src="' + card.media_url + '" class="img-responsive" style="width: 100%"></a>'
					else
						if card.provider_name is "facebook" or card.provider_name is "instagram"
							src = if card.provider_name is "facebook" then card.media_tag.match(/src="(.+)"/)[1] else card.media_url
							return "<a href='" + src + "' class='fancybox' data-fancybox-type='iframe'><img src='" + card.thumbnail_image_url + "' class='img-responsive' style='width: 100%'></a>"
						else
						  return '<div class="embed-responsive embed-responsive-4by3">' + card.media_tag + '</div>'

				@settings.customHelpers() if @settings.customHelpers?

			if Handlebars?
				setup()
			else
				$.get @settings.handlebarURL, () => setup()
		styleSetup: () ->
			# Create the style for the columns.
			$("head").append () =>
				wide = 100 / @settings.columnNumber - 2
				selector = if @element.id isnt "" then "##{@element.id}" else ".#{@element.className}"
				"<style>#{selector} .collektr-entry { width: #{wide}%; margin: 0% 1% 0% 1%; }</style><link rel='stylesheet' href='#{@settings.fancyCssURL}' type='text/css' 'media=screen' />"
		fancySetup: () ->
			setup=() =>
				$(".fancybox").fancybox( {
				}
				);

			if fancybox?
				setup()
			else
				$.get @settings.fancyURL, () => setup()

		# Fire the callback
		fireCallback: () ->
			@settings.callback()

	### Start of EndlessScroll ###
	class EndlessScroll
	  defaults =
	    pagesToKeep:       null
	    inflowPixels:      0        #50
	    fireOnce:          false    #true
	    fireDelay:         150
	    loader:            ''       #Loading...
	    content:           ''
	    insertBefore:      null
	    insertAfter:       null
	    intervalFrequency: 250
	    ceaseFireOnEmpty:  true
	    resetCounter:      -> false
	    callback:          -> true
	    ceaseFire:         -> false

	  constructor: (scope, options) ->
	    @options         = $.extend({}, defaults, options)
	    @pagesStack      = [0]
	    @scrollDirection = 'next'
	    @firing          = true
	    @fired           = false
	    @fireSequence    = 0
	    @pageSequence    = 0
	    @nextSequence    = 1
	    @prevSequence    = -1
	    @lastScrollTop   = 0
	    @insertLocation  = @options.insertAfter
	    @didScroll       = false
	    @isScrollable    = true
	    @target          = scope
	    @targetId        = ''
	    @content         = ''
	    @lastContent     = 'dummy'
	    @innerWrap       = $('.endless_scroll_inner_wrap', @target)

	    @handleDeprecatedOptions()
	    @setInsertPositionsWhenNecessary()

	    $(scope).scroll =>
	      @detectTarget(scope)
	      @detectScrollDirection()

	  run: ->
	    setInterval (=>
	      return unless @shouldTryFiring()
	      return if @ceaseFireWhenNecessary()
	      return unless @shouldBeFiring()

	      @resetFireSequenceWhenNecessary()
	      @acknowledgeFiring()
	      #@insertLoader()

	      if @hasContent()
	        #@showContent()
	        @fireCallback()
	        @cleanUpPagesWhenNecessary()
	        @delayFiringWhenNecessary()

	      #@removeLoader()
	      @lastContent = @content
	    ), @options.intervalFrequency

	  handleDeprecatedOptions: ->
	    @options.content      = @options.data         if @options.data
	    @options.inflowPixels = @options.bottomPixels if @options.bottomPixels

	  setInsertPositionsWhenNecessary: ->
	    container = "#{@target.selector} div.endless_scroll_inner_wrap"

	    @options.insertBefore = "#{container} div:first" if defaults.insertBefore is null
	    @options.insertAfter  = "#{container} div:last"  if defaults.insertAfter is null

	  detectTarget: (scope) ->
	    @target   = scope
	    @targetId = $(@target).attr('id')

	  detectScrollDirection: ->
	    @didScroll = true
	    currentScrollTop = $(@target).scrollTop()

	    if currentScrollTop > @lastScrollTop
	      @scrollDirection = 'next'
	    else
	      #@scrollDirection = 'prev'

	    @lastScrollTop = currentScrollTop

	  shouldTryFiring: ->
	    shouldTryOrNot = @didScroll and @firing is true
	    @didScroll = false if shouldTryOrNot
	    shouldTryOrNot

	  ceaseFireWhenNecessary: ->
	    if @options.ceaseFireOnEmpty is true and @lastContent is '' or
	    @options.ceaseFire.apply(@target, [@fireSequence, @pageSequence, @scrollDirection])
	      @firing = false
	      true
	    else
	      false

	  wrapContainer: (target) ->
	    @innerWrap = $(target).find('#collektr')
	    ###if @innerWrap.length is 0
	      @innerWrap = $(target).wrapInner('<div class="endless_scroll_content" data-page="0" />')
	                             .wrapInner('<div class="endless_scroll_inner_wrap" />')
	                             .find('.endless_scroll_inner_wrap')###

	  scrollableAreaMargin: (innerWrap, target) ->
	    switch @scrollDirection
	      when 'next'
	        margin = innerWrap.height() - $(target).height() <= $(target).scrollTop() + @options.inflowPixels
	        target.scrollTop(innerWrap.height() - $(target).height() - @options.inflowPixels) if margin
	      when 'prev'
	        margin = $(target).scrollTop() <= @options.inflowPixels
	        target.scrollTop(@options.inflowPixels) if margin

	    margin

	  calculateScrollableCanvas: ->
	    if @target[0] is document or @target[0] is window
	      #@wrapContainer("body")
	      @isScrollable = @scrollableAreaMargin($(document), $(window))
	    else
	      @wrapContainer(@target)
	      @isScrollable = @innerWrap.length > 0 and @scrollableAreaMargin(@innerWrap, @target)

	  shouldBeFiring: ->
	    @calculateScrollableCanvas()

	    @isScrollable and (
	      @options.fireOnce is false or (
	        @options.fireOnce is true and @fired isnt true
	      )
	    )

	  resetFireSequenceWhenNecessary: ->
	    @fireSequence = 0 if @options.resetCounter.apply(@target) is true

	  acknowledgeFiring: ->
	    @fired = true
	    @fireSequence++

	    switch @scrollDirection
	      when 'next' then @pageSequence = @nextSequence++
	      when 'prev' then @pageSequence = @prevSequence--

	  insertContent: (content) ->
	    switch @scrollDirection
	      when 'next' then $(@options.insertAfter).after(content)
	      when 'prev' then $(@options.insertBefore).before(content)

	  insertLoader: ->
	    @insertContent(
	      "<div class=\"endless_scroll_loader_#{@targetId}
	      endless_scroll_loader\">#{@options.loader}</div>"
	    )

	  removeLoader: ->
	    $('.endless_scroll_loader_' + @targetId).fadeOut ->
	      $(this).remove()

	  hasContent: ->
	    if typeof @options.content is 'function'
	      @content = @options.content.apply(@target, [@fireSequence, @pageSequence, @scrollDirection])
	    else
	      @content = @options.content

	    @content isnt false

	  showContent: ->
	    $('#endless_scroll_content_current').removeAttr 'id'
	    @insertContent(
	      "<div id=\"endless_scroll_content_current\"
	      class=\"endless_scroll_content\" data-page=\"#{@pageSequence}\">#{@content}</div>"
	    )

	  fireCallback: ->
	    @options.callback.apply @target, [@fireSequence, @pageSequence, @scrollDirection]

	  cleanUpPagesWhenNecessary: ->
	    return unless @options.pagesToKeep >= 1

	    switch @scrollDirection
	      when 'next' then @pagesStack.push(@pageSequence)
	      when 'prev' then @pagesStack.unshift(@pageSequence)

	    if @pagesStack.length > @options.pagesToKeep
	      switch @scrollDirection
	        when 'next' then pageToRemove = @prevSequence = @pagesStack.shift()
	        when 'prev' then pageToRemove = @nextSequence = @pagesStack.pop()

	    @removePage(pageToRemove)
	    @calculateScrollableCanvas()

	  removePage: (page) ->
	    $(".endless_scroll_content[data-page='#{page}']", @target).remove()

	  delayFiringWhenNecessary: ->
	    if @options.fireDelay > 0
	      $('body').after '<div id="endless_scroll_marker"></div>'
	      $('#endless_scroll_marker').fadeTo @options.fireDelay, 1, =>
	        $('#endless_scroll_marker').remove()
	        @fired = false
	    else
	      @fired = false

	$.fn.endlessScroll = (options) ->
	  new EndlessScroll(this, options).run()

	# Wrapper
	$.fn[pluginName] = (options) ->
		@each ->
			unless $.data @, "plugin_#{pluginName}"
				$.data @, "plugin_#{pluginName}", new Plugin @, options
