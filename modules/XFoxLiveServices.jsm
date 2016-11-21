var EXPORTED_SYMBOLS = ["XFoxLiveServices"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

 function defineLazyGetter(aObject, aName, aLambda)
  {
    aObject.__defineGetter__(aName, function() {
      delete aObject[aName];
      return aObject[aName] = aLambda.apply(aObject);
    });
  }

  function defineLazyServiceGetter(aObject, aName, aContract, aInterfaceName)
  {
    defineLazyGetter(aObject, aName, function XPCU_serviceLambda() {
      return Cc[aContract].getService(Ci[aInterfaceName]);
    });
  }


let XFoxLiveServices = {};

defineLazyServiceGetter(XFoxLiveServices, "obs",
                                    "@mozilla.org/observer-service;1",
                                    "nsIObserverService");
defineLazyServiceGetter(XFoxLiveServices, "console",
                                   "@mozilla.org/consoleservice;1",
                                   "nsIConsoleService");
defineLazyServiceGetter(XFoxLiveServices, "search",
                                   "@mozilla.org/browser/search-service;1",
                                   "nsIBrowserSearchService");
defineLazyServiceGetter(XFoxLiveServices, "storage",
                                   "@mozilla.org/storage/service;1",
                                   "mozIStorageService");
defineLazyServiceGetter(XFoxLiveServices, "rdf",
                                   "@mozilla.org/rdf/rdf-service;1",
                                   "nsIRDFService");
defineLazyServiceGetter(XFoxLiveServices, "io",
                                   "@mozilla.org/network/io-service;1",
                                   "nsIIOService");
defineLazyServiceGetter(XFoxLiveServices, "dirsvc",
                                   "@mozilla.org/file/directory_service;1",
                                   "nsIProperties");
defineLazyServiceGetter(XFoxLiveServices, "perms",
                                   "@mozilla.org/permissionmanager;1",
                                   "nsIPermissionManager");
defineLazyServiceGetter(XFoxLiveServices, "rdf",
                                   "@mozilla.org/rdf/rdf-service;1",
                                   "nsIRDFService");
defineLazyServiceGetter(XFoxLiveServices, "etld",
                                   "@mozilla.org/network/effective-tld-service;1",
                                                                   "nsIEffectiveTLDService");
defineLazyServiceGetter(XFoxLiveServices, "stringbundle",
                                   "@mozilla.org/intl/stringbundle;1",
                                                                   "nsIStringBundleService");
defineLazyServiceGetter(XFoxLiveServices, "cookiemgr",
                                   "@mozilla.org/cookiemanager;1",
                                                                   "nsICookieManager2");
defineLazyServiceGetter(XFoxLiveServices, "prompt",
                                   "@mozilla.org/embedcomp/prompt-service;1",
                                                                   "nsIPromptService");

defineLazyGetter(XFoxLiveServices, "prefs", function () {
  return Cc["@mozilla.org/preferences-service;1"]
           .getService(Ci.nsIPrefService)
           .QueryInterface(Ci.nsIPrefBranch2);
});
defineLazyGetter(XFoxLiveServices, "xfoxprefs", function () {
  return Cc["@mozilla.org/preferences-service;1"]
           .getService(Ci.nsIPrefService)
                   .getBranch("extensions.xfox.")
           .QueryInterface(Ci.nsIPrefBranch2);
});