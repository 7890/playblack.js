//example1.js
"use strict";
//handle to player in global context
var pb;
//holding playable items
var tracks=[];

$(document).ready(function(e) {
//"trick" browser to not use cached version. for testing display of load regions.
var no_cache_extension="?foo="+new Date().getTime();

//put a few files of different formats to tracks[]
tracks.push({
	audio: "https://archive.org/download/testmp3testfile/mpthreetest.mp3"
	, wave: "img/mpthreetest.mp3.png"
	, title: "MP3 Test"
});
tracks.push({
	audio: "https://people.xiph.org/~giles/2012/opus/ehren-paper_lights-96.opus"
	, title: "OPUS Test"
});
tracks.push({
	audio: "https://archive.org/download/testfile_20160719/Memo 2.ogg"
	, wave: "img/Memo 2.wav.png"
	, title: "OGG Test"
});
tracks.push({
	audio: "https://archive.org/download/testfile_20160719/Memo 2.flac"
	, wave: "img/Memo 2.wav.png"
	, title: "FLAC Test"
});
tracks.push({
	audio: "https://archive.org/download/testfile_20160719/Memo 2.wav"
	, wave: "img/Memo 2.wav.png"
	, title: "AIFF Wave Test"
});
tracks.push({
	audio: "https://archive.org/download/EdadMedia_775/ya1.wav"
	, wave: "img/ya1.wav.png"
	, title: "RIFF Wave (big file) Test"
});
tracks.push({
	audio: "http://stream.rabe.ch:8000/livestream/rabe-low.opus"
	, title: "OPUS Stream Test"
});
tracks.push({
	audio: "http://stream.srg-ssr.ch/m/rsj/mp3_128"
	, title: "MP3 Stream Test"
});
tracks.push({
	audio: "http://stream.srg-ssr.ch/m/rsj/aacp_32"
	, title: "aacPlus Stream Test"
});
tracks.push({
	audio: "http://"
	, title: "Invalid Test"
});

var sel=$("<select/>");
$("<option selected disabled>Select Format</option>").appendTo(sel);
for(var i=0;i<tracks.length;i++)
{
	//add tracks as options to select dropdown
	 $("<option />", {value: i, text: tracks[i].title}).appendTo(sel);

	//add non-default option to tracks
	tracks[i].show_url=true;
	tracks[i].audio+=no_cache_extension;
}
sel.change(function ()
{
	pb.load(tracks[sel.val()]);
});
sel.insertAfter("h1");

console.log("example1.js: create playblack instance");
pb=$("body").playblack();
console.log("example1.js: done");
}); /*end document.ready*/
/*EOF*/
