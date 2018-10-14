//example2.js
"use strict";
//handle to player in global context
var pb;
var editor;
var load_url;

var update_props;
var update_interval;
var start_update;
var stop_update;
var cd_seek;

$(document).ready(function(e) {
//the editor allows to create playitem objects, to be used as arguments to load()
editor = new JSONEditor(
	document.getElementById("json_editor")
	, get_playblack_playitem_schema()
);

//make textfields larger
$(":text").each(function(){
	$(this).attr("size",80);
});

update_props=function()
{
	if(pb==undefined)
	{
		$("#object_dump").html("(n/a)");
	}
	else
	{
		$("#object_dump").html(
/*			new Date().getTime()+"\n"*/
			""+JSON.stringify(pb.props(), null, 4) //4 spaces indent
		);
	}
}

start_update=function()
{
	update_interval=setInterval(update_props, 100);
};

stop_update=function()
{
	clearInterval(update_interval);
};

var seek_interval;
cd_seek=function(dir, set, fast)
{
	clearInterval(seek_interval);
	if(set)
	{
		var sec=2;
		sec*=dir; //dir: -1, +1
		var iv=150;
		if(fast){sec*=2; iv=100;}
		seek_interval=setInterval(function(){pb.seek(sec, 1);}, iv);
	}
};

$(document).keypress(function(e)
{
	if(e.which == 13) //enter performs load()
	{
		//switch focus to finalize json editor object (hack)
		var a=$(document.activeElement);
		var x = window.scrollX, y = window.scrollY;
		$("#load").focus();
		a.focus();
		window.scrollTo(x,y);
		pb.load(editor.getValue());
	}
});

console.log("example2.js: create playblack instance");
pb=$("body").playblack("player1234"); //using custom id 'player1234'
console.log("example2.js: done");
});
/*EOF*/
