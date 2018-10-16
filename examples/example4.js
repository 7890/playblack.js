//example4.js
"use strict";
//handle to player in global context
var pb;
var load_player;

$(document).ready(function(e) {
var tracks=[];
tracks.push({audio: "audio/0.mp3"});
tracks.push({audio: "audio/1.mp3"});

for(var i=0;i<tracks.length;i++)
{
	//add common / non-default properties to tracks
	tracks[i].show_url=true;
}

load_player=function()
{
	pb.load(tracks[0]);
};

console.log("example4.js: create playblack instances");
pb=$("body").playblack();
var next_track=0;
//when end of track reached, load next track

pb.on_end(function(obj) { //obj is reference to playblack
	console.log("end of track reached "+obj.props().audio);
	next_track++;
	obj.load(tracks[next_track%2]); //toggle tracks[] index
});

pb.on_loaded(function(obj)
{
	console.log("start playing track "+obj.props().audio);
	obj.play();
});

console.log("example4.js: done");
});
/*EOF*/
