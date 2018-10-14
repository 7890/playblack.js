//playblack playitem schema to be used with json editor (https://github.com/jdorn/json-editor)
"use strict";
var get_playblack_playitem_schema=function() {
return {
	"schema": {
		"title": "Playitem Object Editor",
		"type": "object",
		"id": "person",
		"properties": {
			"audio": {
				"type": "string",
				"description": "url to audio file. this is the only MANDATORY property for a playitem.",
				"default": "https://archive.org/download/1HourWorkoutMusic61MB/-%2B%201%20hour%20workout%20music%20%2861MB%29.mp3"
			},
			"title": {
				"type": "string",
				"description": "title (artist, songname, ...). if null, the filename part of the 'audio' property will be used.",
				"default": "a track title"
			},
			"wave": {
				"type": "string",
				"description": "url to waveform image file. if null, no waveform is displayed.",
				"default": "img/mpthreetest.mp3.png"
			},
			"cover": {
				"type": "string",
				"description": "url to cover image file. if null, a generic cover icon will be shown.",
				"default": "img/cover1.png"
			},
			"cover_link": {
				"type": "string",
				"description": "url or javascript:... for cover image link (href). example: '#my_anchor'.",
				"default": "javascript:void(0);"
			},
			"hidden": {
				"type": "boolean",
				"format": "checkbox",
				"description": "if true, don't show player on load()",
				"default": false
			},
			"autoplay": {
				"type": "boolean",
				"format": "checkbox",
				"description": "if true, start playback after track has loaded",
				"default": true
			},
			"navplay": {
				"type": "boolean",
				"format": "checkbox",
				"description": "if true, start playback (even if currently paused) when navigating with the mouse",
				"default": true
			},
			"repeat": {
				"type": "boolean",
				"format": "checkbox",
				"description": "if true, repeat playback of currently loaded track when reaching the end",
				"default": false
			},
			"bufreg": {
				"type": "boolean",
				"format": "checkbox",
				"description": "if true, display buffered regions",
				"default": true
			},
			"show_url": {
				"type": "boolean",
				"format": "checkbox",
				"description": "if true, append audio file url to title.",
				"default": false
			},
			"show_cover": {
				"type": "boolean",
				"format": "checkbox",
				"description": "if true, display cover.",
				"default": true
			},
			"show_buttons": {
				"type": "boolean",
				"format": "checkbox",
				"description": "if true, display play/pause controls.",
				"default": true
			},
			"size": {
				"type": "number",
				"description": "initial player size (block size)",
				"default": 80,
				"minimum": 20
			},
			"seek": {
				"type": "number",
				"description": "initial seek (seconds), fraction >=0, <=track duration",
				"default": 0,
				"minimum": 0
			},
			"volume": {
				"type": "number",
				"description": "initial volume, fraction >=0, <=1",
				"default": 1,
				"minimum": 0,
				"maximum": 1
			},
			"rate": {
				"type": "number",
				"description": "initial playback rate (same pitch), fraction >=0.5, <=4",
				"default": 1,
				"minimum": 0.5,
				"maximum": 4
			}
		}
	}
};
} /*end get_playblack_playitem_schema()*/
/*EOF*/
