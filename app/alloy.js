// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};
//

if (!Ti.Locale.currentLanguage) {
	Ti.Locale.setLanguage('en');
}
// For development purposes to bypass or induce setup.
// Uncomment and set as desired.
// configured = false -> setup
// configured = true -> bypass setup
//Ti.App.Properties.setBool('configured', true);
//Ti.App.Properties.setBool('configured', false);

// For development purposes to bypass or induce language setup.
// Uncomment and set as desired.
// language = 'English' -> skip button
// language = '' -> no skip button
//Ti.App.Properties.setString('language', '');

// For development purposes to bypass or induce setup.
// Uncomment and set as desired.
// global.userId = 0 -> setup
// global.userId = 1 -> bypass setup
//global.userId = 1;

// For development purposes to bypass or induce setup.
// Uncomment and set as desired.
//Ti.App.Properties.setString("email", 'stephen@digitalfrontiersmedia.com');
//Ti.App.Properties.setString("password", 'DL9Xptgo.irdt');

// For development purposes to bypass or induce setup.
// Uncomment and set as desired.
//Ti.App.Properties.setInt("deviceIndex", 0);

global.jDrupal = require('jdrupal');
//global.Promise = require('bluebird.core');
/*
global.Promise.config({
    warnings: false
 });
*/
global.UTIL = require("utilities");
global.xp = require('xp.ui');
global.xhr = new(require("ti.xhr"))();
global.konstruction = new(require("konstruction"))();

Alloy.Globals.rotate180 = Ti.UI.create2DMatrix().rotate(180);
Alloy.Globals.rotate45 = Ti.UI.create2DMatrix().rotate(45);
Alloy.Globals.rotateM45 = Ti.UI.create2DMatrix().rotate(-45);

Alloy.Globals.loading = Alloy.createWidget("nl.fokkezb.loading");
Alloy.Globals.Util = {height: 1015};

Alloy.Globals.usingWebUi = false;

global.gridHeightMultiplier = 0.65; //1.10;
global.homeWindow = Alloy.createController('home').getView();
global.setupWizardWindow = Alloy.createController('setupWizard_step1').getView();

global.backgroundServiceDelay = 0.3; // minutes
global.ttl = 24; // hours
global.xhrTimeout = 30; // seconds
global.postRetryDelay = 60; // minutes
global.syncCompleteDelay = 5; // seconds
global.netListenTime = 15; // seconds
global.userId = null;
global.usingBasicAuth = false;
global.basicAuthUser = 'guest';
global.basicAuthPass = 'dfmrokkormfd';
global.basicAuthHeader = Titanium.Utils.base64encode(global.basicAuthUser + ':' + global.basicAuthPass);
global.domain = 'www.roktech.com';
global.scheme = 'https://';
global.siteInfoPickerValues = new Array();
global.idleTimeoutMinutes = 10;
global.timeoutID = null;
global.isIdle = false;
global.isHome = true;
global.homeUIDirty = false;
global.historyUsers = Ti.App.Properties.getObject('historyUsers', {});
global.show429Error = true;
global.xhrErrorCodes = new Array();
global.reAuthStatus = false;
global.adminMode = false;
global.usingWebUi = false;
global.UiSwitched = false;
global.overlayZoom = null;

global.domainPrepend = global.usingBasicAuth ? global.basicAuthUser + ':' + global.basicAuthPass + '@' : '';
global.jDrupal.config('sitePath', global.scheme + global.domainPrepend + global.domain);

global.xhrOptions = {
	ttl : global.ttl * 60, // Needs to be in minutes
	debug : true
};
global.xhr.setStaticOptions(global.xhrOptions);

global.setXHROauthParams = function() {
    // Add received tokens to xhr config for subsequent requests.
    global.xhrOptions.shouldAuthenticate = true;
    global.xhrOptions.oAuthToken = Ti.App.Properties.getString('azure-ad-access-token');
	global.xhr.setStaticOptions(global.xhrOptions);
};

global.onXHRError = function (xhrResults) {
    if (xhrResults.status === 401) {
        Ti.App.fireEvent('app:unauthorizedRequest');
    } else if(global.show429Error) {
		Ti.API.info('ERROR: ', JSON.stringify(xhrResults));
		//alert(L('error_occurred') + ': \n', JSON.stringify(xhrResults));
		if (global.xhrErrorCodes.indexOf(xhrResults.status) == -1) {
			global.xhrErrorCodes.push(xhrResults.status);
			var dialog = Ti.UI.createAlertDialog({
				//title: 'Enter text',
				message: L('error_occurred') + ': \n' + JSON.stringify(xhrResults),
				buttonNames: ['OK']
			});
			dialog.addEventListener('click', function(e) {
				global.xhrErrorCodes = new Array();
			});
			dialog.show();
		}
	}
};

global.Wifi = require('ti.wifimanager');
global.oauth = Alloy.createWidget('ti.oauth2');

global.oauth.customServer = true;  
global.oauth.responseType = "code";  
global.oauth.grantType = "authorization_code";  
global.oauth.saveTokensToTiProperties = true;    //saves to Ti.App.Properties.getString  ('azure-ad-access-token');

global.onOauthSuccess = function (authResults) {
    var secondsToSetExpiration = parseInt(authResults.expires_in) - 86400;  //subtract 10 minutes
    var expDate = Date.now() + (secondsToSetExpiration * 1000);          //find that timestamp
    Ti.App.Properties.setInt('azure-ad-access-token-exp', expDate);      //set the time stamp for future reference
    global.oauth.close();
    global.konstruction.clearProjects();
  if (global.reAuthStatus) {
    global.reAuthStatus = false;
    if (!global.adminMode) {
      Alloy.createController('home').getView().open();
    } else {
      global.wizOkay2Cont = authResults;
    }
  }
};

global.reAuth = function() {
	var tokenExp = Ti.App.Properties.getInt('azure-ad-access-token-exp');
	var currentTime = Date.now();
	 if (Ti.Network.online && (!Ti.App.Properties.getString('azure-ad-access-token') && !global.usingWebUi) || (!Ti.App.Properties.getString('azure-ad-refresh-token') && !global.usingWebUi) || ((currentTime > tokenExp) && (!global.usingWebUi || global.konstruction.platform == 'PlanGrid'))) {
		global.reAuthStatus = true;
		//prompt/show UI   |   success CB  |   error CB    |   allowCancel  |   cancel CB
    if (!global.nativeUi) {
		  global.oauth.authorize(true, global.onOauthSuccess, global.onOauthError, true, global.onOauthCancel);
    }
	}	
};

global.onOauthError = function (authResults) {
	Ti.API.info('Oauth ERROR: ', JSON.stringify(authResults));
	global.oauth.close();
	var dialog = Ti.UI.createAlertDialog({
        okay: 0,
        buttonNames: [L('auth'), L('cancel')],
        message: L('auth_denied'),
        title: L('auth_err_exp')
	});
	dialog.addEventListener('click', function (e) {
	    if (e.index === e.source.okay) {
	    	global.reAuth();
	    }
	});
	dialog.show();
  Ti.API.info('global.usingWebUi: ', JSON.stringify(global.usingWebUi));
};

global.onOauthCancel = function (authResults) {
	global.oauth.close();
};

global.closeAllWindows = function() {
	for (i = 4; i > 0; i--) {
		windowName = 'setupWizard_step' + i;
		Ti.API.info('*** Closing:  ' + windowName + ' ***');
		Alloy.createController(windowName).getView().close();
	}
};

global.formatDate = function(dateString) {
	return dateString ? new Date(dateString).toLocaleDateString(Ti.Locale.currentLanguage) : '';
};

global.formatTime = function(timeString) {
	return timeString ? new Date(timeString).toLocaleTimeString(Ti.Locale.currentLanguage, { hour: '2-digit', minute: '2-digit' }) : '';
};

global.checkRefresh = function(callback) {
	var callback = callback || null;
	var tokenExp = Ti.App.Properties.getInt('azure-ad-access-token-exp');
	var currentTime = Date.now();
  if (currentTime > tokenExp && Ti.Network.online && Ti.App.Properties.getString("project_uid") && !global.usingWebUi) {
	// TODO:  update to slightly different callbacks for refresh purposes?
		//global.oauth.authorize(false, global.onOauthSuccess, global.onOauthError, true, global.onOauthCancel);
		global.oauth.refresh(callback);
	} //else no refresh needed, more than 10 minutes before expiring	
};

Ti.App.addEventListener('resumed', global.checkRefresh);

Ti.App.addEventListener('app:unauthorizedRequest', function(e) {
	global.oauth.refresh();
});

if (Ti.App.Properties.getString('azure-ad-access-token')) {
	global.setXHROauthParams();
}
Ti.Network.addEventListener('change', function(e) {
    if (!Ti.Network.online) {
    	alert(L('offline_warning'));
    }
});
if (!Ti.Network.online) {
	alert(L('offline_warning'));
} else {
	Ti.API.info('Attempting to connect...');
	global.jDrupal.connect().then(function() {
		// global.jDrupal.currentUser() is now ready...
		var account = global.jDrupal.currentUser();
		global.userId = account ? account.id() : null;
		Ti.API.info('Initial User id: ' + global.userId);
		if (global.userId) {
			global.getDeviceInfo();
			Ti.App.fireEvent('loggedIn');
		} else {
			Ti.API.info('*** No Active Session ***');
			Ti.API.info('email = ' + Ti.App.Properties.getString("email"));
		    if (Ti.App.Properties.getString("password") && Ti.App.Properties.getString("email")) {
		    	Ti.API.info('Attempting auto-login...');
	    		Alloy.Globals.loading.show(L('auto_login'));
				global.jDrupal.userLogin(Ti.App.Properties.getString("email"), Ti.App.Properties.getString("password")).then(function(e) {
					account = global.jDrupal.currentUser();
					global.userId = account ? account.id() : null;
					if (global.userId) {
						Ti.API.info('Auto-logged in!');
						//Ti.App.fireEvent('loggedIn');
					}
					Alloy.Globals.loading.hide();
					global.getDeviceInfo();
					Ti.App.fireEvent('loggedIn');
				});
			} else {
				// Optional default action if not logged in and can't do so.
			}	
		}
	});
}

global.setProjects = function(projects) {
	switch(Ti.App.Properties.getString("constructionApp")) {
		case 'PlanGrid':
		default:
			Ti.App.Properties.setObject("projects", projects);
			break;
	}
};

global.setRfis = function(rfis) {
	switch(Ti.App.Properties.getString("constructionApp")) {
		case 'PlanGrid':
		default:
			Ti.App.Properties.setObject("rfis", rfis);
			break;
	}
};

global.setDocuments = function(documents) {
	switch(Ti.App.Properties.getString("constructionApp")) {
		case 'PlanGrid':
		default:
			Ti.App.Properties.setObject("documents", documents);
			break;
	}
};

global.setDrawings = function(drawings) {
	switch(Ti.App.Properties.getString("constructionApp")) {
		case 'PlanGrid':
		default:
			Ti.App.Properties.setList("drawings", drawings);
			break;
	}
};

global.setSubmittals = function(submittals) {
	switch(Ti.App.Properties.getString("constructionApp")) {
		case 'PlanGrid':
		default:
			Ti.App.Properties.setList("submittals", submittals);
			break;
	}
};

global.setOauthParams = function(platform) {
	switch(platform) {
    case 'Autodesk Build':
      global.oauth.customAuthUrl = "https://developer.api.autodesk.com/authentication/v1/authorize";
      global.oauth.customTokenUrl = "https://developer.api.autodesk.com/authentication/v1/gettoken";
      global.oauth.clientId = "W6kHWGVUFvqrkoUHHxXIYBzxHdO7tFBK";
      global.oauth.state = "ROK-standard";
      global.oauth.clientSecret = "iIA20PYFFPxhewi6";
      global.oauth.scope = "account:read data:create data:read data:write";
      global.oauth.redirectUrl = 'https://www.roktech.com/'; //global.jDrupal.sitePath() + '/';
      global.oauth.customTitleText = "Autodesk Build Authorization"; 
      break;

    case 'PlanGrid':
    default:
      global.oauth.customAuthUrl = "https://io.plangrid.com/oauth/authorize";
      global.oauth.customTokenUrl = "https://io.plangrid.com/oauth/token";
      global.oauth.clientId = "7fc99cd6-c209-40f4-b112-588bc624492f";
      global.oauth.state = "ROK-standard";
      global.oauth.clientSecret = "68fdd6ff-9bd0-4d3d-b1d9-78851eee384b";
      global.oauth.scope = "write:projects";
      global.oauth.redirectUrl = 'https://www.roktech.com/'; //global.jDrupal.sitePath() + '/';
      global.oauth.customTitleText = "PlanGrid Authorization"; 
			break;
	}
};

global.setPlatform = function() {
	global.UiSwitched = false;
	if (Ti.App.Properties.getString('constructionApp')) {
		Alloy.Globals.constructionApp = Ti.App.Properties.getString('constructionApp');
    Alloy.Globals.constructionAppWebUIDrawingsLbl = L("project_drawings") + '\n' + '(' + Alloy.Globals.constructionApp + ')';

		//if (!global.usingWebUi) {
			global.konstruction.setPlatform(Ti.App.Properties.getString('constructionApp'));
			Ti.API.info('konstruction.platform = ', global.konstruction.platform);
			global.setOauthParams(global.konstruction.platform);
		//}
		
		switch (Ti.App.Properties.getString('constructionApp')) {
      case 'Procore':
        Ti.App.Properties.setString('constructionAppUrl', 'https://app.procore.com/');
        break;

      case 'Autodesk Build':
        Ti.App.Properties.setString('constructionAppUrl', 'https://acc.autodesk.com/build/');
        break;

			case 'PlanGrid':
			default:
				Ti.App.Properties.setString('constructionAppUrl', 'https://app.plangrid.com/');
				break;
		}
	}
};
global.setPlatform();

global.setDeviceConfig = function(bypass) {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
  if (deviceInfo && deviceInfo.length == 1) {
		Ti.App.Properties.setInt("deviceIndex", 0);
	}
	if (Ti.App.Properties.getInt("deviceIndex") !== null && Ti.App.Properties.getInt("deviceIndex") !== false && Ti.App.Properties.getInt("deviceIndex") !== '') {
		if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].title != '') {
			Ti.App.Properties.setString('deviceName', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].title);
		}
		if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_construction_app != '') {
			Ti.App.Properties.setString('constructionApp', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_construction_app);
		}
		if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_project != '') {
			Ti.App.Properties.setString('project', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_project);
		}
		//Ti.App.Properties.setBool('usingWebUi', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_using_web_ui == "True");
		//if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_name != '' && deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_name != false) {
			Ti.App.Properties.setString('superName', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_name);
		//}
		//if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_mobile_numb != '' && deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_mobile_numb != false) {
			Ti.App.Properties.setString('superPhone', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_mobile_numb);
		//}
		if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_admin_secret != '' && deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_admin_secret != false) {
			Ti.App.Properties.setString('admin_secret', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_admin_secret);
		} else {
			Ti.App.Properties.setString('admin_secret', 'password');
		}
		Ti.App.Properties.setBool('autoAssetCacheSync', (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_auto_asset_cache_sync == "True"));
		if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_sync_interval != '') {
			Ti.App.Properties.setInt('syncInterval', parseInt(deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_sync_interval));
		}
		global.ttl = Ti.App.Properties.getInt('syncInterval', 24);
		global.xhrOptions = {
			ttl : global.ttl * 60, // Needs to be in minutes
			debug : true
		};
		global.xhr.setStaticOptions(global.xhrOptions);
		if (bypass) {
			if (!global.manualSync) {
				Alloy.Globals.loading.hide();
			}
		} else {
			var tokenExp = Ti.App.Properties.getInt('azure-ad-access-token-exp');
			var currentTime = Date.now();
			if (currentTime < tokenExp) {
				global.syncService();
			}
		}
	}
	global.setPlatform();
};

/*
 * Get global.getDeviceInfo List
 */
global.getDeviceInfo = function(callback, bypass) {
	global.jDrupal.viewsLoad('rest/views/my-devices').then(function(view) {
		var results = view.getResults();
		//Ti.API.info('view = ' + JSON.stringify(view));
		Ti.API.info('deviceInfo = ' + JSON.stringify(results));
		Ti.App.Properties.setObject('deviceInfo', results);
		global.setDeviceConfig(bypass);
		if (callback) {
			callback();
		}
	});
};

global.showOptions = function(prompt, opts, context, callback) {
	var options = {};
	for (var i = 0; i < opts.length; i++) {
		options[i] = global.UTIL.cleanString(opts[i].option_label);
	}
	Alloy.createWidget('danielhanold.pickerWidget', {
		id : 'picker',
		outerView : context,
		hideNavBar : false,
		type : 'single-column',
		selectedValues : [0],
		pickerValues : [options],
		onDone : function(e) {
			// Do something
			Ti.API.info(JSON.stringify(e));
			if (!e.cancel && e.data[0].key && callback) {
				callback(e);
			}
		},
		title: global.UTIL.cleanString(prompt)
	});
};

global.wifiIcon = function(level) {
	var signalLevelImage;
    if (level <= 0 && level >= -50) {
		//Best signal
		signalLevelImage = '/images/ico_wifi_100.png';
    } else if (level < -50 && level >= -70) {
		//Good signal
		signalLevelImage = '/images/ico_wifi_75.png';
    } else if (level < -70 && level >= -80) {
		//Low signal
		signalLevelImage = '/images/ico_wifi_50.png';
    } else if (level < -80 && level >= -100) {
		//Very weak signal
		signalLevelImage = '/images/ico_wifi_25.png';
    } else {
		// no signals
		signalLevelImage = '/images/ico_wifi_0.png';
    }
    return signalLevelImage;
};

global.copyFileToAppData = function(name) {
	var oldfile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, name);
	Ti.API.info('#### oldfile path: ' + oldfile.nativePath);
	var newfile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, name);
	newfile.write(oldfile.read()); // both old.txt and new.txt exist now
	Ti.API.info('#### newfile path: ' + newfile.nativePath + '\n\n');
	return newfile;
};

global.recursiveResourcesCopy = function(name) {
	var node;
	var nodeHandle;
    var secDir = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, name);
    var secDirArr = secDir.getDirectoryListing();
	Ti.API.info(name + ' Dir = ' + JSON.stringify(secDirArr));
    if (secDirArr != null) {
	    for (i = 0; i < secDirArr.length; i++) {
	    	node = secDirArr[i].toString();
	        Ti.API.info('Processing.....' + name + Titanium.Filesystem.separator + node);
	        nodeHandle = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, name + Titanium.Filesystem.separator + node);
	        if (nodeHandle.isDirectory()) {
	        	global.recursiveResourcesCopy(name + Titanium.Filesystem.separator + node);
	        } else {
	        	global.copyFileToAppData(name + Titanium.Filesystem.separator + node);
	        }
    	}	
    }
    return;
};

global.setMainBtnLabels = function () {
  if (global.useROKbtns) {
    Alloy.Globals.constructionAppWebUIDrawingsLbl = L("project_drawings") + '\n' + '(' + Ti.App.Properties.getString('constructionApp') + ')';
    if (Ti.App.Properties.getString("project_uid")) {
      Alloy.Globals.constructionAppWebUIDocumentsLbl = global.hybridUi ? L("documents") : L("documents") + '\n' + '(' + Ti.App.Properties.getString('constructionApp') + ')';
      Alloy.Globals.constructionAppWebUISubmittalsLbl = global.hybridUi ? L("submittals") : L("submittals") + '\n' + '(' + Ti.App.Properties.getString('constructionApp') + ')';
      Alloy.Globals.constructionAppWebUIRfiLbl = global.hybridUi ? L("rfi") : L("rfi") + '\n' + '(' + Ti.App.Properties.getString('constructionApp') + ')';
    }
  } else {
    Alloy.Globals.constructionAppWebUIDrawingsLbl = Ti.App.Properties.getString('constructionApp');
  }
};

global.setUseROKbtns = function (useROKbtns) {
  if (useROKbtns != null) {
    Ti.App.Properties.setBool('useROKbtns', useROKbtns);
  }
  if (useROKbtns != global.useROKbtns) {
    global.UiSwitched = true;
  }
  global.useROKbtns = Ti.App.Properties.getBool('useROKbtns', true);
  Alloy.Globals.useROKbtns = Ti.App.Properties.getBool('useROKbtns', true);
  global.setMainBtnLabels();
};
global.setUseROKbtns();

global.setUsingWebUi = function (usingWebUi) {
  if (usingWebUi != null) {
    Ti.App.Properties.setBool('usingWebUi', usingWebUi);
  }
  if (usingWebUi != global.usingWebUi) {
    global.UiSwitched = true;
  }
  global.usingWebUi = Ti.App.Properties.getBool('usingWebUi', false);
  Alloy.Globals.usingWebUi = Ti.App.Properties.getBool('usingWebUi', false);
  global.setMainBtnLabels();
};
global.setUsingWebUi();

global.setHybridUi = function (hybridUi) {
  if (hybridUi != null) {
    Ti.App.Properties.setBool('hybridUi', hybridUi);
  }
  if (hybridUi != global.hybridUi) {
    global.UiSwitched = true;
  }
  global.hybridUi = Ti.App.Properties.getBool('hybridUi', false);
  Alloy.Globals.hybridUi = Ti.App.Properties.getBool('hybridUi', false);
  global.setMainBtnLabels();
};
global.setHybridUi();

global.setNativeUi = function (nativeUi) {
  if (nativeUi != null) {
    Ti.App.Properties.setBool('nativeUi', nativeUi);
  }
  if (nativeUi != global.nativeUi) {
    global.UiSwitched = true;
  }
  global.nativeUi = Ti.App.Properties.getBool('nativeUi', false);
  Alloy.Globals.nativeUi = Ti.App.Properties.getBool('nativeUi', false);
  global.setMainBtnLabels();
};
global.setNativeUi();

global.userIsInactive = function() {
	Ti.API.info('userIsInactive');
	Ti.API.info('global.isHome = ' + global.isHome);
	Ti.API.info('global.homeUIDirty = ' + global.homeUIDirty);
	if (Ti.App.Properties.getBool('configured') && !global.isIdle) {
		//Titanium.Android.currentActivity.finish();
		Alloy.createController('idleScreen').getView().open();
		global.isIdle = true;
	}
/*
	if (!global.isHome && !global.working && Ti.App.Properties.getBool('configured')) {
	    Titanium.Android.currentActivity.finish();
		global.home.close();
		Alloy.createController('home').getView().open();
		//global.home.open();
		global.isHome = true;
	}
	if (global.isHome && global.homeUIDirty) {
		global.home.close();
		Alloy.createController('home').getView().open();
	}
*/
};

global.userInteraction = function() {
	Ti.API.info('RESET TIMEOUT');
    if (global.timeoutID) {
        clearTimeout(global.timeoutID);
    }
    global.timeoutID = setTimeout(function(e) {
    	//global.userIsInactive();
	}, global.idleTimeoutMinutes * 60 * 1000);
};
Ti.App.addEventListener('userinteraction', global.userInteraction);

Alloy.Globals.configured = function() {
	return Ti.App.Properties.getBool('configured', false);
};

global.syncService = function() {
	/*
	var worker = require('ti.worker');

	// create a worker thread instance
	var task = worker.createWorker('syncService.js');
	*/
	
	// start cache-warming syncService
	var intent = Titanium.Android.createServiceIntent({
	  url: 'syncService.js'
	});
	intent.putExtra('interval', global.ttl * 60 * 60 * 1000); // Needs to be milliseconds
	if (!Ti.Android.isServiceRunning(intent)) {
		var service = Ti.Android.createService(intent);
		// service.addEventListener('stop', function() {
			// service.start();
		// });
		service.start();
	} else {
	    Ti.API.info('Service is already running. Resetting.');
	    Titanium.Android.stopService(intent);
		var service = Ti.Android.createService(intent);
		// service.addEventListener('stop', function() {
			// service.start();
		// });
		service.start();
	}
	
};
//setTimeout(global.syncService, global.backgroundServiceDelay * 60 * 1000);
