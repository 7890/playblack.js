//example3.js
"use strict";
//handle to player in global context
var pb=[];//pb1, pb2;
var show_player;
var hide_players;
var stack_players;
var stop_all;
var play_all;
$(document).ready(function(e) {
var tracks=[];
tracks.push({
	audio: "https://archive.org/download/testmp3testfile/mpthreetest.mp3"
	, wave: "img/mpthreetest.mp3.png"
	, cover: "img/cover1.png"
	, cover_link: "#anchor1"
	, show_url: true
	, repeat: true
});
tracks.push({
	audio: "https://archive.org/download/EdadMedia_775/ya1.wav"
	, wave: "img/ya1.wav.png"
	, hidden: true
	, show_url: true
});
tracks.push({
	audio: "audio/1.mp3"
	, hidden: true
	, show_url: true
	, repeat: true
});

show_player=function(index)
{
	for(var i=0;i<pb.length;i++)
	{
		pb[i].hide();
		pb[i].bottom(0);
	}
	pb[index].bottom(0);
	pb[index].show();
};

hide_players=function()
{
	for(var i=0;i<pb.length;i++)
	{
		pb[i].hide();
		pb[i].bottom(0);
	}
};

//first player is at bottom
stack_players=function()
{
	var offset=0;
	for(var i=0;i<pb.length;i++)
	{
		pb[i].bottom(offset);
		pb[i].show();
		offset+=pb[i].height();
	}
};

stop_all=function()
{
	for(var i=0;i<pb.length;i++)
	{
		pb[i].stop();
	}
};

play_all=function()
{
	for(var i=0;i<pb.length;i++)
	{
		pb[i].play();
	}
};

console.log("example3.js: create playblack instances");
for(var i=0;i<tracks.length;i++)
{
	pb[i]=$("body").playblack();
	pb[i].load(tracks[i]);
}
//set custom size for 2nd and 3rd player
pb[1].size(150);
pb[2].size(40);
console.log("example3.js: done");
});
/*EOF*/
