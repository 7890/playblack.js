//example6.js
"use strict";
//handle to players in global context
var pb=[];
var show_player;
var hide_players;
var stack_players;
var stop_all;
var play_all;

var load_players;
//var pseudo_sync;
var hard_sync;
var A;
var B;
var toggle;
var current=0;

$(document).ready(function(e) {
var tracks=[];

// 'A' track, reference
tracks.push({
	audio: "https://github.com/7890/boilertest/raw/master/audio/opus/lendian/44100hz/misc/they_came_from_space_mellow_mix-freesoundtrackmusic.256.opus"
	, title: 'A: <a href="https://www.freesoundtrackmusic.com/stargazer_jazz.html" target="_blank">Stargazer Jazz</a> - They Came From Space'
	, show_cover: false
	, navplay: false
});
// 'B' track, alternative
tracks.push({
	audio: "https://github.com/7890/boilertest/raw/master/audio/opus/lendian/44100hz/misc/they_came_from_space_mellow_mix-freesoundtrackmusic.32.opus"
	, title: 'B: <a href="https://www.freesoundtrackmusic.com/stargazer_jazz.html" target="_blank">Stargazer Jazz</a> - They Came From Space'
	, show_cover: false
	, slave: true
	, volume: 0
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

//stacking:
//A --
//B --
stack_players=function()
{
	var offset=0;
//	for(var i=0;i<pb.length;i++)
	for(var i=pb.length;i>0;i--)
	{
		pb[i-1].bottom(offset);
		pb[i-1].show();
		offset+=pb[i-1].height();
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

load_players=function()
{
	for(var i=0;i<tracks.length;i++)
	{
		pb[i].load(tracks[i]);
	}
};

A=function()
{
	pb[0].volume(1);
	pb[1].volume(0);
	current=0;
};

B=function()
{
	pb[1].volume(1);
	pb[0].volume(0);
	current=1;
};

toggle=function()
{
	if(current==0){B();}else{A();}
};

/*
pseudo_sync=function()
{
	pb[1].audio().currentTime=pb[0].audio().currentTime;
};
*/

hard_sync=function(bool)
{
	//operate on A, B will follow
	pb[0].pause();
	setTimeout(function(){
		pb[0].seek(pb[0].audio().currentTime)
	},100);

	if(bool==undefined){return;}
	if(bool) //play
	{
		setTimeout(function(){
			pb[0].play();
		},100);
	}
};

for(var i=0;i<tracks.length;i++)
{
	pb.push($("body").playblack());
}
stack_players();
pb[0].add_slave(pb[1]);

console.log("example6.js: done");
});
/*EOF*/
