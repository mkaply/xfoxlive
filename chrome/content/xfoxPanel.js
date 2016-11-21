function onLoad() {
  if ((!window.top.document.getElementById("sidebar-box").width) ||
      (window.top.document.getElementById("sidebar-box").width < 225)) {
    window.top.document.getElementById("sidebar-box").width = 225;
  }

  window.top.document.getElementById("xfox-statusbarpanel").setAttribute("updates", "false");

  Components.utils.import("resource://xfox/XFoxLive.jsm");
  Components.utils.import("resource://xfox/XFoxLiveServices.jsm");

  function removeFriend(event) {
	var doc = event.target.ownerDocument;
	var gamertag = doc.getElementsByClassName("XbcFLAL")[0];
    var ev = doc.createEvent("Events");
    ev.initEvent("XFoxEvent", true, false);
	gamertag.setAttribute("remove","true");
    gamertag.dispatchEvent(ev);
  }

  function friendCommand(command) {
	return function(event) {
	  var doc = event.target.ownerDocument;
	  var gamertag = doc.getElementById("Gamertag");
      var ev = doc.createEvent("Events");
      ev.initEvent("XFoxEvent", true, false);
	  gamertag.setAttribute(command,"true");
      gamertag.dispatchEvent(ev);
	}
  }

  var toolbarButtons = {
	"closeButton": {
	  "command": "remove",
	  "title": "Remove"
	},
	"bottomButton": {
	  "command": "movebottom",
	  "title": "Move to the bottom"
	},
	"topButton": {
	  "command": "movetop",
	  "title": "Move to the top"
	},
	"downButton": {
	  "command": "movedown",
	  "title": "Move down"
	},
	"upButton": {
	  "command": "moveup",
	  "title": "Move up"
	}
  }


  function showToolbar(event) {
	var doc = event.target.ownerDocument;
	for (var i in toolbarButtons) {
	  var button = doc.getElementById(i);
  	  if (button) {
	    button.style.display = "block";
	  }
	}
  }
  function hideToolbar(event) {
	var doc = event.target.ownerDocument;
	for (var i in toolbarButtons) {
	  var button = doc.getElementById(i);
  	  if (button) {
	    button.style.display = "none";
	  }
	}
  }

  var browser = document.getElementById("xfoxBrowser");
  browser.addEventListener("mouseover", showToolbar, true);
  browser.addEventListener("mouseout", hideToolbar, true);
  browser.addEventListener("DOMContentLoaded", fixBase, false);
  var body = browser.contentDocument.getElementById("body");

  function fixBase(event) {
	var doc = event.target;
	var anchors = doc.getElementsByTagName("a");
	for (var i=0; i < anchors.length; i++) {
	  anchors[i].setAttribute("target", "_content");
	  anchors[i].target = "_content";
	}
	/* These are from right to left */
	var body = doc.getElementsByTagName("body");
	var imageRight = 4;
	for (var i in toolbarButtons) {
	  var image = doc.createElement("img");
	  image.setAttribute("src", "chrome://xfox/skin/" + i + ".gif");
	  image.setAttribute("id", i);
	  image.setAttribute("title", toolbarButtons[i].title);
	  image.style.position = "absolute";
	  image.style.right = imageRight + "px";
	  image.style.top = "5px";
	  image.style.display = "none";
	  image.addEventListener("click", friendCommand(toolbarButtons[i].command), false);
	  imageRight += 16;
	  body[0].appendChild(image);
	}
  }

  var friendString = XFoxLive.getFriends();
  if (friendString.length == 0) {
	return;
  }
  var friends = friendString.split("|");
  for (var i=0; i < friends.length; i++) {
	var gamercardURL = "http://gamercard.xbox.com/%GAMERTAG%.card";
	var url = gamercardURL.replace("%GAMERTAG%", friends[i]);
	var iframe = browser.contentDocument.createElement("iframe");
	iframe.setAttribute("gamertag", friends[i]);
	iframe.setAttribute("scrolling", "no");
	iframe.setAttribute("frameBorder", "0");
	iframe.setAttribute("height", "140");
	iframe.setAttribute("width", "204");
	//var online = XFoxLive.getStatus(friends[i]);
	//if (online == "false") {
	//  iframe.style.opacity = 0.5;
	//}
	body.appendChild(iframe);	
	iframe.setAttribute("src", url);
  }
}
