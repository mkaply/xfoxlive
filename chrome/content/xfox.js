Components.utils.import("resource://xfox/XFoxLiveServices.jsm");
Components.utils.import("resource://xfox/XFoxLive.jsm");

(function () {
  var stringBundle;  

  const extensionID = "xfox@kaply.com";

  function addFriend() {  
    var check = {};
    var input = {value: ""};
	if (XFoxLiveServices.prompt.prompt(null, stringBundle.getString("name"), stringBundle.getString("addGamertag"), input, null, check)) {
	  XFoxLive.addFriend(input.value, true);
      if (document.getElementById("sidebar-box").hidden) {
        toggleSidebar("xfox-sidebar", true);
      }
	}
  }

  function updateSidebar() {
    if (!document.getElementById("sidebar-box").hidden) {
      if (document.getElementById("sidebar-box").getAttribute("src").match("xfoxPanel.xul")) {
        toggleSidebar();
        toggleSidebar("xfox-sidebar", true);
      }
    }
  }

  var xfoxObserver = {
    observe: function observe(subject, topic, data) {
      switch (data) {
        case "updateFriends":
		  updateSidebar();
		  break;
        case "invalidGamertag":
	      XFoxLiveServices.prompt.alert(null, stringBundle.getString("name"), stringBundle.getString("invalidGamertag"));
		  break;
        case "duplicateGamertag":
	      XFoxLiveServices.prompt.alert(null, stringBundle.getString("name"), stringBundle.getString("duplicateGamertag"));
		  break;
		case "addFriend":
		  addFriend();
		  break;
		case "updatesAvailable":
		  /* if sidebar isn't open */
		  document.getElementById("xfox-statusbarpanel").setAttribute("updates", "true");
          break;
	  }
    }
  }

  function importFriends() {
	var friendDivs = content.document.querySelectorAll("li.friend[data-gamertag]");
	for (let i=0; i < friendDivs.length; i++) {
	  var gamertag = friendDivs[i].getAttribute("data-gamertag");
	  if (!XFoxLive.friendExists(gamertag)) {
	    XFoxLive.addFriend(gamertag, false);
	  }
	}
	if (document.getElementById("sidebar-box").hidden) {
      toggleSidebar("xfox-sidebar", true);
	}
  }

  function displayPreferences() {
	window.openDialog('chrome://xfox/content/options.xul','options','chrome,centerscreen,modal');
  }

  function shouldEnableImport() {
	if (/https?:\/\/live.xbox.com\/.+\/Friends.*/i.test(content.document.location.href)) {
	  document.getElementById("xfox-import").disabled = false;
	} else {
	  document.getElementById("xfox-import").disabled = true;
	}
  }

  function xfoxEvent(event) {
	var url;
	if (event.target.ownerDocument) {
	  url = event.target.ownerDocument.location.href;
	} else {
	  url = event.target.location.href;
	}
	if (/http:\/\/gamercard.xbox.com\/.*/i.test(url)) {
	  var gamertag = event.target.textContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
//	  var compareurl = "http://gamercard.xbox.com/%GAMERTAG%.card".replace("%GAMERTAG%", gamertag.replace(/ /g, "%20"));
//	  if (url.toLowerCase() != compareurl.toLowerCase()) {
//		return;
//	  }
	  if (event.target.hasAttribute("remove")) {
		event.target.removeAttribute("remove");
		if (XFoxLiveServices.prompt.confirm(null, stringBundle.getString("name"), stringBundle.getString("removeGamertag").replace("%GAMERTAG%", gamertag))) {
		  XFoxLive.removeFriend(gamertag);
		}
	  } else if (event.target.hasAttribute("moveup")) {
		event.target.removeAttribute("moveup");
		XFoxLive.moveUpFriend(gamertag);
	  } else if (event.target.hasAttribute("movedown")) {
		event.target.removeAttribute("movedown");
		XFoxLive.moveDownFriend(gamertag);
	  } else if (event.target.hasAttribute("movetop")) {
		event.target.removeAttribute("movedown");
		XFoxLive.moveTopFriend(gamertag);
	  } else if (event.target.hasAttribute("movebottom")) {
		event.target.removeAttribute("movedown");
		XFoxLive.moveBottomFriend(gamertag);
	  }
	}
  }

  /* This function handles the window startup piece, initializing the UI and preferences */
  function startup()
  {
    window.removeEventListener("load", startup, false);
	firstrun = XFoxLiveServices.xfoxprefs.getBoolPref("firstrun");

    var curVersion = "0.0.0";

	if (firstrun) {
      window.setTimeout(function(){
        gBrowser.selectedTab = gBrowser.addTab("http://mike.kaply.com/addons/xfoxlive/install/");
      }, 1000); //Firefox 2 fix - or else tab will get closed
 	  XFoxLiveServices.xfoxprefs.setBoolPref("firstrun", false);
	  XFoxLiveServices.xfoxprefs.setCharPref("installedVersion", curVersion);
	} else {
	  var installedVersion = XFoxLiveServices.xfoxprefs.getCharPref("installedVersion");
	  if (curVersion > installedVersion) {
        window.setTimeout(function(){
          gBrowser.selectedTab = gBrowser.addTab("http://mike.kaply.com/addons/xfoxlive/upgrade/");
        }, 1000); //Firefox 2 fix - or else tab will get closed
  	    XFoxLiveServices.xfoxprefs.setCharPref("installedVersion", curVersion);
	  }
	}
    try {
      XFoxLiveServices.obs.addObserver(xfoxObserver, "xfox", false);
    } catch (ex) {
    }
	window.addEventListener("XFoxEvent", xfoxEvent, false, true);

    var addonBar = document.getElementById("addon-bar");

    if (addonBar) {
	  if (!document.getElementById("xfox-statusbarpanel")) {
		var addonBarCloseButton = document.getElementById("addonbar-closebutton")
        addonBar.insertItem("xfox-statusbarpanel", addonBarCloseButton.nextSibling);
		addonBar.collapsed = false;
	  }
    }

    document.getElementById("xfox-contextmenu").addEventListener("popupshowing", shouldEnableImport, false);
    document.getElementById("xfox-import").addEventListener("command", importFriends, false);
    document.getElementById("xfox-addfriend").addEventListener("command", addFriend, false);
    document.getElementById("xfox-preferences").addEventListener("command", displayPreferences, false);

    stringBundle = document.getElementById("xfox_bundle");
  }

  /* This function handles the window closing piece, removing listeners and observers */
  function shutdown()
  {
    document.getElementById("xfox-import").removeEventListener("command", importFriends, false);
    document.getElementById("xfox-addfriend").removeEventListener("command", addFriend, false);
    document.getElementById("xfox-preferences").removeEventListener("command", displayPreferences, false);
    document.getElementById("xfox-contextmenu").removeEventListener("popupshowing", shouldEnableImport, false);
    window.removeEventListener("unload", shutdown, false);
  }

  Components.utils.import("resource://xfox/XFoxLive.jsm");

  XFoxLive.initialize();

  window.addEventListener("load", startup, false);
  window.addEventListener("unload", shutdown, false);
})();

