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
