//playblack - sticky html5 player
//tb/1809

"use strict";

//how to create a playblack instance: var pb=$("body").playblack();
//=============================================================================
$(document).ready(function(e)
{
$.fn.playblack=function(id)
{
	var pb_console_log=false;

	var _clog=function(msg)
	{
		if(pb_console_log) {console.log(msg);}
	}

	_clog("adding playblack function");

	//the layout is largely based on PB_BLOCK_SIZE
	//see set_block_size() to dynamically change it
	var PB_DEFAULT_BLOCK_SIZE=80;
	var block_size=PB_DEFAULT_BLOCK_SIZE;
	var load_region_height=7;

	// /!\ utf-8 char
	var HTML_WARN_PREFIX="&#9888;&nbsp;";

	//seek types
	var SEEK_SET=0;
	var SEEK_CUR=1;
	var SEEK_END=2;

	//callback types
	var CB_LOADED=0;
	var CB_ERROR=1;
	var CB_END=2;

	//registered callbacks will survive load()
	var callbacks=[];

	//used in load()
	var default_params={
		"audio":          null  //url to audio file
		, "title":        null  //text or html (artist, song title, ...)
		, "cover":        null  //url to cover image
		, "cover_link":   null  //href for cover image (best displayed if image has quadratic dimensions)
		, "waveform":     null  //url to waveform image (a wide image, for instance 1000x200, transparent background, bright waveform)
		, "repeat":       false //bool: if true, repeat track play
		, "autoplay":     true  //bool: if true, start playback when ready
		, "navplay":      true  //bool: if true, start playback on clicks and drags even if paused
		, "seek":         0     //initial seek in seconds
		, "volume":       1     //0..1: initial volume (0=mute, 1=100%)
		, "rate":         1     //0.5..4: initial playback rate (same pitch, different speed)
		, "show_url":     false //bool: if true, add audio url as <a> link to title 
		, "bufreg":       true  //bool: if true, show buffered (loaded) regions
		, "hidden":       false //bool: if true, hide player
	};

	//filled and merged with user params in load()
	var params={};

	var player_id;
	if(id != undefined && id != null) {player_id=id; /*function arg*/}
	else {player_id="pb_"+new Date().getTime();}

	_clog("player_id: "+player_id);

	//reference to the return object, used in callbacks
	var thispb;

	//the generated html will be added to container
	var container=$(this);

	//elements
	var player_div;
	var title_div;
	var left_section_div;
	var cover_div;
	var cover_img;
	var cover_a;
	var button_div;
	var button_play_img;
	var button_pause_img;
	var busy_img;
	var time_and_status_div;
	var time_mousepos_div;
	var progress_container_div;
	var progress_div;
	var nav_div;
	var wave_img;
	var info_div;
	var mouse_nav_div;
	var load_region_container_1_div;
	var load_region_container_2_div;
	var delay_page_end_div;
	var em_pixel_div;
	var em_pixel_time_div;

	//player element
	var audio_ctx;

	//mouse status
	var mouse_button_down;
	var mouse_drag;
	var mouse_inside;

	//time related (unit: seconds)
	var duration;
	var current_time;
	var mouse_position_s;

	//play / status related
	var track_loaded;
	var can_play;
	var can_play_through;
	var is_playing;
	var is_seeking;

	var full_buffer_drawn; //once drawn, don't redraw buffer load regions
	var load_region_container_toggle=0; //alternate div to prevent flicker (draw to n%2 then remove n+1%2)

	var last_clientx; //mouse X position relative to browser window
	var last_touch_clientx; //touch X position relative to browser window

	var em_pixel; //height in px of title font
	var em_pixel_time; //height in px of time font

	var last_error;

//=============================================================================
	var init_variables=function()
	{
		_clog("initializing variables");

		mouse_button_down=false;
		mouse_drag=false;
		mouse_inside=false;

		duration=0;
		current_time=0;
		mouse_position_s=0;

		track_loaded=false;
		can_play=false;
		can_play_through=false;
		is_playing=false;
		is_seeking=false;

		full_buffer_drawn=false;
		load_region_container_toggle=0;

		last_clientx=0;
		last_touch_clientx=0;

		em_pixel=16;
		em_pixel_time=12;

		last_error="none";

		//"normal" javascript element, non-jquery 
		audio_ctx=document.createElement("audio");
		audio_ctx.setAttribute("id", player_id+"_audio");

		//link variables to DOM elements
		player_div=             $("#"+player_id);
		title_div=              player_div.find(".pb_title");

		left_section_div=       player_div.find(".pb_left_section");
		cover_div=              player_div.find(".pb_cover_container");
		cover_img=              player_div.find(".pb_cover_image");
		cover_a=                player_div.find(".pb_cover_link");
		button_div=             player_div.find(".pb_button_container");
		button_play_img=        player_div.find(".pb_button_play");
		button_pause_img=       player_div.find(".pb_button_pause");
		busy_img=               player_div.find(".pb_status_busy");

		time_and_status_div=    player_div.find(".pb_time_and_status");
		time_mousepos_div=      player_div.find(".pb_time_mouse_position");

		progress_container_div= player_div.find(".pb_progress_container");

		progress_div=           player_div.find(".pb_progress_over");
		nav_div=                player_div.find(".pb_navigate_over");
		wave_img=               player_div.find(".pb_wave_image");
		info_div=               player_div.find(".pb_info_over");
		mouse_nav_div=          player_div.find(".pb_mouse_nav_area");
		load_region_container_1_div=player_div.find(".pb_load_region_container_1");
		load_region_container_2_div=player_div.find(".pb_load_region_container_2");

		em_pixel_div=           player_div.find(".pb_em_pixel");
		em_pixel_time_div=      player_div.find(".pb_em_pixel_time");

		delay_page_end_div=     $("#"+player_id+"_page_end");

		em_pixel_div.height("1.0em"); //depends on fontsize .pb_title_fs
		em_pixel=em_pixel_div.height();
		_clog("1.0em: "+em_pixel);

		em_pixel_time_div.height("1.0em"); //depends on fontsize .pb_time_fs
		em_pixel_time=em_pixel_time_div.height();
		_clog("TITLE 1.0em: "+em_pixel);
		_clog("TIME 1.0em: "+em_pixel_time);

		em_pixel_div.remove();
		em_pixel_time_div.remove();
	}; /*end init_variables()*/

//=============================================================================
	var attach_listeners=function()
	{
		_clog("attaching listeners");

		//disable drag on certain elements
		cover_a.on("dragstart", function(event) {event.preventDefault(); });
		button_play_img.on("dragstart", function(event) {event.preventDefault();});
		button_pause_img.on("dragstart", function(event) {event.preventDefault();});
		busy_img.on("dragstart", function(event) {event.preventDefault();});
		wave_img.on("dragstart", function(event) {event.preventDefault();});

		//mouse_nav_div is the main area of the player capturing mouse events
		mouse_nav_div.on("mouseenter", function(event)
		{
			_clog("mouseenter");
			mouse_inside=true;
			last_clientx=event.clientX;
			if(!can_play){return;}
			if(audio_ctx.duration=="Infinity"){return;}
			//set_mouse_cursor(); in mousemove
		});

		mouse_nav_div.on("mouseleave", function(event)
		{
			_clog("mouseleave");
			mouse_inside=false;
			last_clientx=0;
			//hide mouse navigation cursor
			nav_div.css({"display":"none"});
			time_mousepos_div.css({"display":"none"});
			//abort any ongoing drag or button press
			mouse_button_down=false;
			mouse_drag=false;
		});

		var mousemove_action_delay_function;
		mouse_nav_div.on("mousemove", function(event)
		{
			if(mouse_button_down) {mouse_drag=true;}
			last_clientx=event.clientX;
			if(!can_play){return;}
			if(audio_ctx.duration=="Infinity"){return;}
			nav_div.css({"display":"inline-block"});
			time_mousepos_div.css({"display":"inline-block"});
			set_mouse_cursor();

			//throttle possible drag seek if can not play through
			var wait_ms=0;
			if(!can_play_through){wait_ms=100;}
			clearTimeout(mousemove_action_delay_function);
			mousemove_action_delay_function=setTimeout(function()
			{
				if(mouse_drag)
				{
					//seek to dragged mouse position
					audio_ctx.currentTime=mouse_position_s;
					if(params.navplay) {play();}
				}
			}, wait_ms); //ms
		});

		mouse_nav_div.on("mousedown", function(event)
		{
			_clog("mousedown");
			mouse_drag=false;
			mouse_button_down=true;
			if(!can_play){return;}
			//possibly a live stream
			if(audio_ctx.duration=="Infinity"){return;}
			audio_ctx.currentTime=mouse_position_s;
			if(params.navplay) {play();}
		});

		mouse_nav_div.on("mouseup", function(event)
		{
			mouse_button_down=false;
			if(!mouse_drag)
			{
				_clog("mouseup (without move)");
			}
			else
			{
				_clog("mouseup (end of drag)");
				mouse_drag=false;
			}
		});

		button_play_img.on("mousedown", function(event)
		{
			_clog("play clicked");
			play();
		});

		button_pause_img.on("mousedown", function(event)
		{
			_clog("pause clicked");
			pause();
		});

		//touch events
		mouse_nav_div.on("touchstart", function(event)
		{
			_clog("touchstart");
			last_touch_clientx=event.originalEvent.touches[0].clientX;
			mouse_inside=true;
			mouse_drag=false;
			mouse_button_down=true;
			if(!can_play){return;}
			if(audio_ctx.duration=="Infinity"){return;}
			set_mouse_cursor();
			audio_ctx.currentTime=mouse_position_s;
			if(params.navplay) {play();}
			return false;
		});

		mouse_nav_div.on("touchmove", function(event)
		{
			_clog("touchmove");
			last_touch_clientx=event.originalEvent.touches[0].clientX;
			//"simulate" mouse
			mouse_nav_div.trigger("mousemove");
			//don't scroll page when dragging on player progress agrea
			return false;
		});

		mouse_nav_div.on("touchend", function(event)
		{
			_clog("touchend");
			last_touch_clientx=0;
			mouse_button_down=false;
			mouse_drag=false;
			mouse_inside=false;
			//hide mouse navigation cursor
			nav_div.css({"display":"none"});
			time_mousepos_div.css({"display":"none"});
			return false;
		});

		//don't scroll page when dragging on player cover, play/pause button
		left_section_div.on("touchmove", function(event)
		{
			//Returning false from an event handler will automatically 
			//call event.stopPropagation() and event.preventDefault()
			return false;
		});
	}; /*end attach_listeners()*/
/*
	<audio> Events:
	https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
	During the loading process of an audio/video, the following events occur, in this order:

	loadstart
	durationchange
	loadedmetadata
	loadeddata
	progress
	canplay
	canplaythrough
*/
//=============================================================================
	var init_audio_context=function()
	{
		_clog("initializing audio context");

		audio_ctx.addEventListener("loadstart", function()
		{
			_clog("loadstart");
			time_and_status_div.html("Loading...");

			//minimal reset if src is set on audio_ctx directly
			duration=0;
			current_time=0;
			track_loaded=false;
			can_play=false;
			can_play_through=false;
			is_playing=false;
			is_seeking=false;
			full_buffer_drawn=false;
		});

		audio_ctx.addEventListener("durationchange", function()
		{
			_clog("durationchange");
			update_display();
		});

		audio_ctx.addEventListener("loadedmetadata", function()
		{
			_clog("loadedmetadata");
		});

		audio_ctx.addEventListener("loadeddata", function()
		{
			_clog("loadedata");
			track_loaded=true;
			if(params.seek>0){seek(params.seek);}
			volume(params.volume);
			rate(params.rate);
			if(mouse_inside)
			{
				nav_div.css({"display":"inline-block"});
				time_mousepos_div.css({"display":"inline-block"});
			}
			set_mouse_cursor();

			if(callbacks[CB_LOADED]!=undefined)
			{
				callbacks[CB_LOADED](thispb);
				return;///
			}

			if(params.autoplay){play();}
		});

		audio_ctx.addEventListener("progress", function()
		{
			display_load_regions();
		});

		audio_ctx.addEventListener("canplay", function()
		{
			_clog("canplay");
			can_play=true;
			update_display();
			button_play_img.css({"display":"inline-block"});
			button_pause_img.css({"display":"none"});
			busy_img.css({"display":"none"});
		});

		audio_ctx.addEventListener("canplaythrough", function()
		{
			_clog("canplaythrough");
			display_load_regions();
		});

		audio_ctx.addEventListener("playing", function()
		{
			_clog("playing");
			is_playing=true;

			button_play_img.css({"display":"none"});
			button_pause_img.css({"display":"inline-block"});
			busy_img.css({"display":"none"});
		});

		audio_ctx.addEventListener("seeking", function()
		{
			_clog("seeking");
			is_seeking=true;
///			is_playing=false;
			time_and_status_div.html("Seeking...");
		});

		audio_ctx.addEventListener("seeked", function()
		{
			_clog("seeked");
			is_seeking=false;
			update_display();
		});

		audio_ctx.addEventListener("pause", function()
		{
			_clog("paused");
			is_playing=false;
			//make sure to get the last bit of time
			update_display();
			if(can_play) {button_play_img.css({"display":"inline-block"});}
			button_pause_img.css({"display":"none"});
			busy_img.css({"display":"none"});
		});

		audio_ctx.addEventListener("volumechange", function()
		{
			_clog("volume change: "+audio_ctx.volume);
			params.volume=audio_ctx.volume;
		});

		audio_ctx.addEventListener("ended", function()
		{
			_clog("track end reached");

			if(callbacks[CB_END]!=undefined)
			{
				callbacks[CB_END](thispb);
				return;///
			}

			if(params.repeat)
			{
				_clog("repeat");
				play();
			}
			else
			{
				stop();
			}
		});

		audio_ctx.addEventListener("timeupdate", function(){
			_clog("timeupdate");
			update_display();
		});

		audio_ctx.addEventListener("error", function failed(e)
		{
			nav_div.css({"display":"none"});
			time_mousepos_div.css({"display":"none"});

			track_loaded=false;
			can_play=false;
			can_play_through=false;
			is_playing=false;
			is_seeking=false;
			full_buffer_drawn=false;

			var msg="An unknown error occurred.";

			switch (e.target.error.code)
			{
				case e.target.error.MEDIA_ERR_ABORTED:
					msg="MEDIA_ERR_ABORTED: Something went wrong.";
					break;
				case e.target.error.MEDIA_ERR_NETWORK:
					msg="MEDIA_ERR_NETWORK: Most likely a network error caused the audio download to fail.";
					break;
				case e.target.error.MEDIA_ERR_DECODE:
					msg="MEDIA_ERR_DECODE: Something went wrong. Check that your browser can play audio at all (is the audio device busy?).";
					break;
				case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
					msg="MEDIA_ERR_SRC_NOT_SUPPORTED: Most likely the audio format is not supported, the file was not found or there was a network error.";
					break;
				default:
					break;
			}
			last_error=msg;
			display_error(msg);
		}, true);

		if(callbacks[CB_ERROR]!=undefined) {callbacks[CB_ERROR](thispb);}
	}; /*end init_audio_context()*/

//=============================================================================
	var reset_elements=function()
	{
		button_play_img.css({"display":"none"});
		button_pause_img.css({"display":"none"});
		busy_img.css({"display":"inline-block"});
		info_div.css({"display":"none"});
		cover_div.css({"display":"none"});
		wave_img.css({"display":"none"});
		nav_div.css({"display":"none"});
		time_mousepos_div.css({"display":"none"});
		delay_page_end_div.css({"display":"none"});

		progress_div.width(0);
		load_region_container_1_div.remove();
		load_region_container_2_div.remove();

		title_div.html("");
	};

//=============================================================================
	var init=function()
	{
		create_html();
		init_variables();
		set_block_size(block_size);
		attach_listeners();
		reset_elements();
		init_audio_context();
	};

	var load=function(playitem)
	{
		if(audio_ctx==undefined || audio_ctx==null)
		{
			console.log("playblack.js not initialized!");
			return;
		}

		pause();

		track_loaded=false;
		can_play=false;
		can_play_through=false;
		is_playing=false;
		is_seeking=false;
		full_buffer_drawn=false;

		duration=0;
		current_time=0;
		reset_elements();
		time_and_status_div.html("Loading...");

		//clear
		params={};
		//fill with default values
		params=$.extend(true, {}, default_params);
		//merge with playitem (function arg)
		params=$.extend(true, params, playitem);

		if(params.hidden){hide();}

		if(!playitem.audio || playitem.audio==undefined)
		{
			display_error("Error in load(): 'audio' property was undefined.");
			if(!params.hidden){show();}
			return;
		}

		set_title();
		set_cover();
		set_waveform_image();

		cover_div.css({"display":"inline-block"});
		wave_img.css({"display":"inline-block"});

		audio_ctx.setAttribute("src", params.audio);
		audio_ctx.load();

		if(!params.hidden){show();}
	}; /*end load()*/

	var set_title=function()
	{
		var t;

		if(params.title == null) {t=get_filename_from_url(params.audio);}
		else {t=params.title;}

		if(params.show_url) {t+=' <a href="'+params.audio+'" target="_blank">'+params.audio+'</a>';}
		title_div.html("<span>"+t+"</span>");
	};

	var update_display=function()
	{
//		_clog("udpate");
		if(audio_ctx==undefined || audio_ctx==null){return;}
		duration=audio_ctx.duration;
		current_time=audio_ctx.currentTime;
		set_time_info();
		set_play_progress();
		set_mouse_cursor();
		if(params.bufreg)
		{
			var b=audio_ctx.buffered;
			if(
				b.length==1
				&& b.end(0)==duration
				&& b.start(0)==0
			) {display_load_regions();}
		}
	};

	var buffered_duration=function()
	{
		if(audio_ctx==undefined || audio_ctx==null){return 0;}
		var r=audio_ctx.buffered;
		var s=0;
		for(var i=0;i<r.length;i++) {s+=r.end(i)-r.start(i);}
		return s;
	};

	var played_duration=function()
	{
		if(audio_ctx==undefined || audio_ctx==null){return 0;}
		var r=audio_ctx.played;
		var s=0;
		for(var i=0;i<r.length;i++) {s+=r.end(i)-r.start(i);}
		return s;
	};

	var set_cover=function()
	{
		if(params.cover==null)
		{
			cover_img.attr("src", "../img/music-cd.svg");
		}
		else
		{
			cover_img.attr("src", params.cover);
			cover_img.css({"display":"inline-block"});
		}

		if(params.cover_link==null) {cover_a.attr("href", "javascript:void(0);");}
		else {cover_a.attr("href", params.cover_link);}
	};

	var set_waveform_image=function()
	{
		if(params.wave==null)
		{
			wave_img.attr("src", "");
			wave_img.css({"display":"none"});
		}
		else
		{
			wave_img.attr("src", params.wave);
			wave_img.css({"display":"inline-block"});
		}
	};

	var set_time_info=function()
	{
		if(is_seeking){return;}
		time_and_status_div.html(
			format_seconds(current_time)
			+"&nbsp;/&nbsp;"
			+format_seconds(duration)
			+"&nbsp;&nbsp;&nbsp;-"
			+format_seconds(duration-current_time)
		);
	};

	var display_error=function(message)
	{
		button_play_img.css({"display":"none"});
		button_pause_img.css({"display":"none"});
		busy_img.css({"display":"none"});
		var w=$(window).width()-block_size;
		info_div.html(HTML_WARN_PREFIX+message);
		info_div.css({"width":w+"px", "display":"block"});
	};

	var stop=function()
	{
		if(audio_ctx==undefined || audio_ctx==null || !track_loaded){return;}
		audio_ctx.currentTime=0;
		audio_ctx.pause();
	};

	var play=function()
	{
		if(audio_ctx==undefined || audio_ctx==null || !track_loaded){return;}
		audio_ctx.play();
	};

	var pause=function()
	{
		if(audio_ctx==undefined || audio_ctx==null || !track_loaded){return;}
		audio_ctx.pause();
	};

	var mute=function()
	{
		volume(0);
	};

	var unmute=function()
	{
		volume(default_params.volume);
	};

	var repeat=function(bool)
	{
		if(bool!=undefined) {params.repeat=bool;}
		return params.repeat;
	};

	var navplay=function(bool)
	{
		if(bool!=undefined) {params.navplay=bool;}
		return params.navplay;
	};

/*
On iOS devices, the audio level is always under the user's physical control. 
The volume property is not settable in JavaScript. Reading the volume property always returns 1.
*/
	var volume=function(vol) //fraction 0..1
	{
		if(audio_ctx==undefined || audio_ctx==null){return;}
		if(vol!=undefined && vol>=0 && vol<=1) {audio_ctx.volume=vol;}
		return audio_ctx.volume;
	};

	var rate=function(val) //fraction 0.5..4
	{
		if(audio_ctx==undefined || audio_ctx==null){return;}
		if(val!=undefined && val>=0.5 && val<=4)
		{
			params.rate=val;
			//let the player pick-up the new rate
			pause();
			audio_ctx.playbackRate=params.rate;
			play();
		}
		return params.rate;
	};

	var hidden=function()
	{
		return params.hidden;
	};


	var title=function(val)
	{
		params.title=val;
		set_title();
	};

	var cover=function(val)
	{
		params.cover=val;
		set_cover();
	}

	var cover_link=function(val)
	{
		params.cover_link=val;
		set_cover();
	}
/*
from libsndfile:
	SEEK_SET  - The offset is set to the start of the audio data plus offset (multichannel) frames.
	SEEK_CUR  - The offset is set to its current location plus offset (multichannel) frames.
	SEEK_END  - The offset is set to the end of the data plus offset (multichannel) frames.
*/
	var seek=function(time_s, whence)
	{
		if(audio_ctx==undefined || audio_ctx==null || !track_loaded){return;}
		if(time_s!=undefined)
		{
			if(whence==undefined) {whence=SEEK_SET;}
			switch(whence)
			{
				case SEEK_SET:
					if(time_s>=0 && time_s<=duration) {audio_ctx.currentTime=time_s;}
					break;
				case SEEK_CUR:
					var to=time_s+audio_ctx.currentTime;
					if(to>=0 && to<=duration) {audio_ctx.currentTime=to;}
					break;
				case SEEK_END:
					var to=time_s+audio_ctx.duration;
					if(to>=0 && to<=duration) {audio_ctx.currentTime=to;}
					break;
				default:
			}
		}
		return audio_ctx.currentTime;
	}/*end seek()*/

	var show=function()
	{
		_clog("show");
		player_div.css({"display":"inline-block"});
		delay_page_end_div.css({"display":"inline-block"});
		params.hidden=false;
	};

	var hide=function()
	{
		_clog("hide");
		player_div.css({"display":"none"});
		delay_page_end_div.css({"display":"none"});
		params.hidden=true;
	};

	//pseudo remove
	var remove=function()
	{
		_clog("remove");
		if(audio_ctx==undefined || audio_ctx==null){return;}
		//is there a better way?
		audio_ctx.removeAttribute("src");
		//sort of "commit"
		audio_ctx.load();

		//remove all playblack generated html from DOM
		player_div.remove();
		delay_page_end_div.remove();

		//just in case
		track_loaded=false;
		can_play=false;
		can_play_through=false;
		is_playing=false;
		is_seeking=false;
		full_buffer_drawn=false;

		duration=0;
		current_time=0;

		params={};

		//subsequent calls to "load()" will fail
		audio_ctx=null;
		//caller can now set the playblack handle to null
	};

	var set_callback=function(cb_type, cb)
	{
		switch(cb_type)
		{
			case CB_LOADED:
				if(cb!=undefined) {callbacks[CB_LOADED]=cb;}
				return callbacks[CB_LOADED];
				break;
			case CB_ERROR:
				if(cb!=undefined) {callbacks[CB_ERROR]=cb;}
				return callbacks[CB_ERROR];
				break;
			case CB_END:
				if(cb!=undefined) {callbacks[CB_END]=cb;}
				return callbacks[CB_END];
				break;
			default:
		}
		return null;
	};

	var get_height=function()
	{
		return block_size+title_div.height();
	};

	var set_bottom_offset=function(val)
	{
		if(val!=undefined) {player_div.css({"bottom":val});}
		return parseInt(player_div.css("bottom"), 10); //remove unit
	};

	var get_props=function()
	{
		//return a copy of the params object
		//add some status information
		return $.extend(true, 
		{
			"audio_initialized":   (audio_ctx==null ? false : true)
			, "id":                player_id
			, "track_loaded":      track_loaded
			, "duration":          duration
			, "current_time":      (audio_ctx==null ? current_time : audio_ctx.currentTime)
			, "can_play":          can_play
			, "can_play_through":  can_play_through
			, "is_playing":        is_playing
			, "is_seeking":        is_seeking
			, "bufreg_count":      (audio_ctx==null ? 0 : audio_ctx.buffered.length)
			, "bufreg_dur":        buffered_duration()
			, "playreg_dur":       played_duration()
			, "playreg_count":     (audio_ctx==null ? 0 : audio_ctx.played.length)
			, "height":            get_height()
			, "bottom":            set_bottom_offset()
			, "last_error":        last_error
		}, params);
	};

	var get_player_id=function()
	{
		return player_id;
	};

	//set size of player
	//most dimensions are derived from edge_length
	var set_block_size=function(edge_length)
	{
		if(edge_length==undefined) {return block_size;}
		block_size=edge_length;

		player_div.css({"height": (block_size)+"px"});

		left_section_div.css({"width": (2*block_size)+"px", "height": block_size+"px"});
		cover_div.css({"width": block_size+"px", "height": block_size+"px"});
		cover_img.css({"width": (block_size-4)+"px", "height": (block_size-4)+"px"});
		button_div.css({"width": block_size+"px", "height": block_size+"px"});
		button_play_img.css({"width": (block_size-4)+"px", "height": (block_size-4)+"px"});
		button_pause_img.css({"width": (block_size-4)+"px", "height": (block_size-4)+"px"});
		busy_img.css({"width": (block_size-4)+"px", "height": (block_size-4)+"px"});

		progress_div.css({"left": (2*block_size)+"px", "height": block_size+"px"});
		nav_div.css({"left": (2*block_size)+"px", "height": block_size+"px"});
		wave_img.css({"left": (2*block_size)+"px"});
		info_div.css({"left": (block_size)+"px", "height": block_size+"px"});
		mouse_nav_div.css({"left": (2*block_size)+"px", "height": block_size+"px"});
		time_and_status_div.css({"left": (2*block_size)+"px"});

		//if used on a touchscreen, show drag position above
//		if (typeof window.orientation !== 'undefined')
		if ('ontouchstart' in window)
		{
			time_mousepos_div.css({"left": (2*block_size)+"px", "margin-top": (-1.5*em_pixel_time)+"px"});
		}
		else
		{
			time_mousepos_div.css({"left": (2*block_size)+"px", "margin-top": (block_size - 1.5*em_pixel_time)+"px"});
		}

		delay_page_end_div.css({"height": get_height()+"px"});

		$(window).resize();

		return block_size;
	}; /*end set_block_size*/

	var seconds_to_pixels=function(sec)
	{
		if(duration<=0 || sec <=0) {return 2*block_size;}
		var f=sec/duration;
		return 2*block_size + ($(window).width()-2*block_size) * f;
	};

	var bufreg=function(bool)
	{
		if(bool!=undefined)
		{
			params.bufreg=bool;
			if(!params.bufreg)
			{
				load_region_container_1_div.remove();
				load_region_container_2_div.remove();
			}
			else
			{
				full_buffer_drawn=false;
				display_load_regions();
			}
		}
		return params.bufreg;
	}

	//show info about load progress
	var display_load_regions=function()
	{
		if(audio_ctx==undefined || audio_ctx==null || !params.bufreg || full_buffer_drawn) {return;}
//		_clog("progress");

		//alternate div to draw to: draw on new, keep old visible, then remove old
		var cn;
		if(load_region_container_toggle%2==0) {cn=1;}
		else {cn=2;}
		if(cn==1)
		{
			load_region_container_1_div.remove();
			load_region_container_1_div=$('<div class="pb_load_region_container_1"></div>');
			progress_container_div.append(load_region_container_1_div);
		}
		else
		{
			load_region_container_2_div.remove();
			load_region_container_2_div=$('<div class="pb_load_region_container_2"></div>');
			progress_container_div.append(load_region_container_2_div);
		}

		var b=audio_ctx.buffered; //object containing all ranges
		_clog("load region count: "+b.length);

		for(var i=0;i<b.length;i++)
		{
			var start_pixel=Math.floor( seconds_to_pixels(b.start(i)) );
			var end_pixel=Math.ceil( seconds_to_pixels(b.end(i)) );
//			_clog("range: "+i+" start: "+start_pixel+" end: "+end_pixel);

			var child = $('<div class="pb_load_region" id="pb_lr_'+i+'"></div>');
			child.css({"left":start_pixel, "width":(end_pixel-start_pixel), "margin-top":(block_size-load_region_height)+"px"});

			if(cn==1) {load_region_container_1_div.append(child);}
			else {load_region_container_2_div.append(child);}
		}

		//if one region covers the whole file -> 100% buffered
		if(b.length>=1 && b.start(0)==0 && b.end(0)==duration && b.end(0)>0)
		{
			can_play_through=true;
			full_buffer_drawn=true;
			child.css({"background":"rgba(0,255,0,0.6)"});
		}

		if(cn==1) {load_region_container_2_div.remove();}
		else {load_region_container_1_div.remove();}

		load_region_container_toggle++;
	}; /*end display_load_regions()*/

	var set_play_progress=function()
	{
		var f=current_time/duration;
		progress_div.width((($(window).width()-2*block_size) * f) +"px");
	};

	var set_mouse_cursor=function()
	{
		//if touch (start, move, end) x coordinate is available, use it
		if(last_touch_clientx>0) {last_clientx=last_touch_clientx;}
//		_clog("set_mouse_cursor()");
		if(last_clientx<2*block_size){return;}
		//total window width minus 2 blocks (cover, button)
		var w=$(window).width()-2*block_size;
		//mouse x position inside main area (waveform, progress, ...)
		var m=last_clientx-2*block_size;
		//mouse position inside track as a factor
		var f=m/w;
		mouse_position_s=duration * f;
		//use (absolute) mouse x position to draw vertical mouse "cursor" over waveform
		nav_div.css({"left": last_clientx});
//		_clog("mouse_position_s: "+mouse_position_s);
		//update display mm:ss for mouse
		time_mousepos_div.html(format_seconds(mouse_position_s));

		//position the mouse cursor time (12:34) container
		var dw=time_mousepos_div.width()+2*5;
		var left;
		if(m<=dw) {left=2*block_size;}
		else {left=last_clientx-dw;}
		time_mousepos_div.css({"left": left});
	};/*end set_mouse_cursor()*/

	var get_filename_from_url=function(path)
	{
		path=path.substring(path.lastIndexOf("/")+ 1);
		return (path.match(/[^.]+(\.[^?#]+)?/) || [])[0];
	};

	var format_seconds=function(sec)
	{
		var date=new Date(null);
		var sec_n=Math.floor(sec);
		date.setSeconds(sec_n);
		date.setMilliseconds(1000*(sec-sec_n));

		//hh:mm:ss
		var cut_start=11;
		var cut_length=8;

		if(duration<10) //s.xxx
		{
			cut_start+=7;
			cut_length=5;
		}
		else if(duration<600)//m:ss
		{
			cut_start+=4;
			cut_length=4;
		}
		else if(duration<3600)//mm:ss
		{
			cut_start+=3;
			cut_length=5;
		}
		//else hh:mm:ss
		if(!isNaN(date.getTime())) {return date.toISOString().substr(cut_start, cut_length);}
		else {return new Date(null).toISOString().substr(cut_start, cut_length);}
	}; /*end format_seconds*/

//=============================================================================
//=============================================================================
	var create_html=function()
	{
		var html='<div class="pb_delay_page_end" id="'+player_id+'_page_end"></div>\
<div class="pb_container" id="'+player_id+'">\
	<div class="pb_title pb_font pb_title_fs"></div>\
	<div class="pb_left_section">\
		<div class="pb_cover_container noselect">\
			<a class="pb_cover_link noselect" href="#" alt="Cover Image">\
				<img class="pb_cover_image"></img>\
			</a>\
		</div>\
		<div class="pb_button_container noselect">\
			<img class="pb_button_image pb_button_play" src="../img/drawing_button_play.svg"></img>\
			<img class="pb_button_image pb_button_pause" src="../img/drawing_button_pause.svg"></img>\
<img class="pb_button_image pb_status_busy" src="../img/loader-02.gif"></img>\
		</div>\
	</div>\
	<img class="pb_wave_image noselect"></img>\
	<div class="pb_progress_container noselect">\
		<div class="pb_progress_over"></div>\
		<div class="pb_navigate_over"></div>\
		<div class="pb_time_and_status pb_time pb_font pb_time_fs">No track loaded</div>\
		<div class="pb_time_mouse_position pb_time pb_font pb_time_fs"></div>\
		<div class="pb_info_over pb_font pb_info_fs"></div>\
		<div class="pb_mouse_nav_area"></div>\
		<div class="pb_load_region_container_1"></div>\
		<div class="pb_load_region_container_2"></div>\
	</div>\
	<div class="pb_em pb_em_pixel pb_font pb_title_fs"></div>\
	<div class="pb_em pb_em_pixel_time pb_font pb_time_fs"></div>\
</div>';
		//add above html to DOM
		container.append(html);
		//force layout update
		$(window).resize();
	}; /*end create_html()*/

	$(window).on("resize", function()
	{
		//if elements are not yet initialized
		if(player_div==undefined) {return;}

		wave_img.width(($(window).width()-2*block_size)+"px");
		wave_img.height(block_size+"px");
		info_div.width(($(window).width()-block_size)+"px");

		full_buffer_drawn=false;
		display_load_regions();
		update_display();
	});

//=============================================================================
	init();

//=============================================================================
//=============================================================================
	//exposed methods
	//remember handle to "self" for callbacks
	return thispb={
		"id":            function()      {return get_player_id();} //get
		, "load":        function(playitem) {load(playitem);}
		, "play":        function()      {play();}
		, "pause":       function()      {pause();}
		, "stop":        function()      {stop();}
		, "show":        function()      {show();}
		, "hide":        function()      {hide();}
		, "mute":        function()      {mute();}
		, "unmute":      function()      {unmute();}
		, "repeat":      function(bool)  {return repeat(bool);} //set or get
		, "navplay":     function(bool)  {return navplay(bool);} //set or get
		, "volume":      function(float) {return volume(float);} //set or get
		, "size":        function(edge_length) {return set_block_size(edge_length);} //set or get
		, "height":      function()      {return get_height();} //set or get
		, "bottom":      function(val)   {return set_bottom_offset(val);} //get
		, "seek":        function(time_s, whence) {return seek(time_s, whence);} //set or get
		, "rate":        function(val)   {return rate(val);} //set or get
		, "bufreg":      function(bool)  {return bufreg(bool);} //set or get
		, "hidden":      function()      {return hidden();} //get
		, "title":       function(val)   {title(val);}
		, "cover":       function(val)   {cover(val);}
		, "cover_link":  function(val)   {cover_link(val);}
		, "props":       function()      {return get_props();} //get
		, "remove":      function()      {remove();}
		, "on_loaded":   function(cb)    {return set_callback(CB_LOADED, cb);}
		, "on_error":    function(cb)    {return set_callback(CB_ERROR, cb);}
		, "on_end":      function(cb)    {return set_callback(CB_END, cb);}
		//for more control, using the audio element directly is always an option
		, "audio":	function() {return audio_ctx;} //get
	}; /*end return object*/
} /*end $.fn.playblack=function(options)*/
}); /*end $(document).ready(function(e)*/
/*EOF*/
