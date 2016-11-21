var EXPORTED_SYMBOLS = ["XFoxLive"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

Components.utils.import("resource://xfox/XFoxLiveServices.jsm");
Components.utils.import("resource://xfox/JSON.jsm");

var XFoxLive = {
  friends: [],
  database: null,
  dbConnection: null,
  log: function(string) {
    XFoxLiveServices.console.logStringMessage(string);
  },
  updateTimer: null,
  initialize: function() {
    var friendsJSON;
    try {
      friendsJSON = XFoxLiveServices.xfoxprefs.getCharPref("friends");
      XFoxLive.friends = JSON.parse(friendsJSON);
    } catch (ex) {
      var database = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties)
								                               .get("ProfD", Ci.nsIFile);
	  database.append("xfox.sqlite");

      if (database.exists()) {
        var storageService = Cc["@mozilla.org/storage/service;1"].getService(Ci.mozIStorageService);

	    var dbConnection = storageService.openDatabase(database);
	    var statement = dbConnection.createStatement("SELECT * FROM friends");
        try {
          while (statement.executeStep()) {
            var row = statement.row;
            var friend = {};
            friend.gamertag = row["gamertag"];
            friend.online = row["online"];
            XFoxLive.friends.push(friend);
          }
        } finally {
          statement.reset();
          statement.finalize();
        }   
	    dbConnection.close();
        XFoxLiveServices.xfoxprefs.setCharPref("friends", JSON.stringify(XFoxLive.friends));
        try {
          database.remove();
        } catch(ex) {}
      }
    }
	if (!XFoxLive.updateTimer) {
      XFoxLive.updateTimer = Cc["@mozilla.org/timer;1"]
                            .createInstance(Ci.nsITimer);

      XFoxLive.startTimer();
	}
	XFoxLive.updateAllStatus();
  },

  startTimer: function() {
	XFoxLive.updateTimer.cancel();
	
    var timerCallback = { notify: function(timer) { XFoxLive.updateAllStatus();} }

    var updateInterval = XFoxLiveServices.xfoxprefs.getIntPref("updateInterval");
	// updateInterval is in minutes
	updateInterval = updateInterval*60*1000;

    XFoxLive.updateTimer.initWithCallback(timerCallback,
                           updateInterval,
                           Components.interfaces.nsITimer.TYPE_REPEATING_PRECISE);
  },

  updateAllStatus: function() {
	for (let i=0; i < XFoxLive.friends.length; i++) {
	  XFoxLive.updateStatus(XFoxLive.friends[i].gamertag, XFoxLive.friends[i].online);
	}
  },

  updateStatus: function(gamertag_in, online_in) {
	function updateStatus(gamertag, online) {
	  if (online_in != online) {
        for (let i=0; i < XFoxLive.friends.length; i++) {
          if (XFoxLive.friends[i].gamertag.toLowerCase() == gamertag.toLowerCase()) {
            XFoxLive.friends[i].online = online;
          }
        }
        XFoxLiveServices.xfoxprefs.setCharPref("friends", JSON.stringify(XFoxLive.friends));
        Cc["@mozilla.org/observer-service;1"]
          .getService(Ci.nsIObserverService)
          .notifyObservers(null, "xfox", "updatesAvailable");
	  }
	}
	updateStatus(gamertag_in, true);
  },

  moveTopFriend: function(gamertag) {
	for (let i=0; i < XFoxLive.friends.length; i++) {
      if (XFoxLive.friends[i].gamertag.toLowerCase() == gamertag.toLowerCase()) {
        var friend = XFoxLive.friends.splice(i, 1);
        XFoxLive.friends.splice(0, 0, friend[0]);
		break;
      }
	}
    XFoxLiveServices.xfoxprefs.setCharPref("friends", JSON.stringify(XFoxLive.friends));
	XFoxLiveServices.obs.notifyObservers(null, "xfox", "updateFriends");
  },
  moveBottomFriend: function(gamertag) {
	for (let i=0; i < XFoxLive.friends.length; i++) {
      if (XFoxLive.friends[i].gamertag.toLowerCase() == gamertag.toLowerCase()) {
        var friend = XFoxLive.friends.splice(i, 1);
        XFoxLive.friends.push(friend[0]);
		break;
      }
	}
    XFoxLiveServices.xfoxprefs.setCharPref("friends", JSON.stringify(XFoxLive.friends));
	XFoxLiveServices.obs.notifyObservers(null, "xfox", "updateFriends");
  },
  moveUpFriend: function(gamertag) {
	for (let i=0; i < XFoxLive.friends.length; i++) {
      if (XFoxLive.friends[i].gamertag.toLowerCase() == gamertag.toLowerCase()) {
        var friend = XFoxLive.friends.splice(i, 1);
		if (i == 0) {
          XFoxLive.friends.push(friend[0]);
		} else {
          XFoxLive.friends.splice(i-1, 0, friend[0]);
		}
		break;
      }
	}
    XFoxLiveServices.xfoxprefs.setCharPref("friends", JSON.stringify(XFoxLive.friends));
	XFoxLiveServices.obs.notifyObservers(null, "xfox", "updateFriends");
  },
  moveDownFriend: function(gamertag) {
	var length = XFoxLive.friends.length;
	for (let i=0; i < XFoxLive.friends.length; i++) {
      if (XFoxLive.friends[i].gamertag.toLowerCase() == gamertag.toLowerCase()) {
        var friend = XFoxLive.friends.splice(i, 1);
		if (i == length-1) {
          XFoxLive.friends.splice(0, 0, friend[0]);
		} else {
          XFoxLive.friends.splice(i+1, 0, friend[0]);
		}
		break;
      }
	}
    XFoxLiveServices.xfoxprefs.setCharPref("friends", JSON.stringify(XFoxLive.friends));
	XFoxLiveServices.obs.notifyObservers(null, "xfox", "updateFriends");
  },


  removeFriend: function(gamertag) {
	for (let i=0; i < XFoxLive.friends.length; i++) {
      if ((XFoxLive.friends[i].gamertag == gamertag) || (XFoxLive.friends[i].gamertag.toLowerCase() == gamertag.toLowerCase())) {
        XFoxLive.friends.splice(i, 1);
      }
	}
    XFoxLiveServices.xfoxprefs.setCharPref("friends", JSON.stringify(XFoxLive.friends));
	XFoxLiveServices.obs.notifyObservers(null, "xfox", "updateFriends");
  },

  friendExists: function(gamertag) {
	for (let i=0; i < XFoxLive.friends.length; i++) {
      if (XFoxLive.friends[i].gamertag.toLowerCase() == gamertag.toLowerCase()) {
		return true;
      }
	}
	return false;
  },

  addFriend: function(gamertag_in, notify) {
	function addFriend(gamertag, online) {
      var friend = {};
      friend.gamertag = gamertag;
      friend.online = online;
      XFoxLive.friends.push(friend);
      XFoxLiveServices.xfoxprefs.setCharPref("friends", JSON.stringify(XFoxLive.friends));
 	  XFoxLiveServices.obs.notifyObservers(null, "xfox", "updateFriends");
	}
	addFriend(gamertag_in, true);
  },

  getStatus: function(gamertag) {
	for (let i=0; i < XFoxLive.friends.length; i++) {
      if (XFoxLive.friends[i].gamertag == gamertag) {
        return XFoxLive.friends[i].online;
      }
	}
    return false;
  },

  getFriends: function() {
    var friendList = [];
	for (let i=0; i < XFoxLive.friends.length; i++) {
      friendList.push(XFoxLive.friends[i].gamertag);
	}
	return friendList.join('|');
  },
  observe: function(subject, topic, data) {
    switch (topic) {
      case "nsPref:changed":
		if (data == "MyGamerCard") {
	      XFoxLiveServices.obs.notifyObservers(null, "xfox", "updateFriends");		  
		} else if (data == "updateInterval") {
		  XFoxLive.startTimer();
		}
        break;
	}
  }
}

XFoxLiveServices.xfoxprefs.addObserver("", XFoxLive, false);

