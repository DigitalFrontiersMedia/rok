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
// TODO:  Setup REST API endpoint for siteInfo links
// TODO:  Populate and handle siteInfoPickerValues choices

if (!Ti.Locale.currentLanguage) {
	Ti.Locale.setLanguage('en');
}
// For development purposes to bypass or induce setup.
// Uncomment and set as desired.
// configured = false -> setup
// configured = true -> bypass setup
Ti.App.Properties.setBool('configured', false);

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
Ti.App.Properties.setInt("deviceIndex", 0);

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

Alloy.Globals.rotate180 = Ti.UI.create2DMatrix().rotate(180);
Alloy.Globals.rotate45 = Ti.UI.create2DMatrix().rotate(45);
Alloy.Globals.rotateM45 = Ti.UI.create2DMatrix().rotate(-45);

Alloy.Globals.loading = Alloy.createWidget("nl.fokkezb.loading");

global.gridHeightMultiplier = 1.5;
var home = Alloy.createController('home').getView();
global.homeWindow = home;
var setupWizard_step1Window = Alloy.createController('setupWizard_step1').getView();
global.setupWizardWindow = setupWizard_step1Window;

global.userId = null;
global.usingBasicAuth = true;
global.basicAuthUser = 'guest';
global.basicAuthPass = 'dfmrokkormfd';
global.basicAuthHeader = Titanium.Utils.base64encode(global.basicAuthUser + ':' + global.basicAuthPass);
global.domain = 'dev-dfm-rok.pantheonsite.io';
global.scheme = 'https://';
global.deviceInfo = Ti.App.Properties.getObject('deviceInfo') ? Ti.App.Properties.getObject('deviceInfo') : new Array();
global.siteInfoPickerValues = new Array();

global.domainPrepend = global.usingBasicAuth ? global.basicAuthUser + ':' + global.basicAuthPass + '@' : '';
global.jDrupal.config('sitePath', global.scheme + global.domainPrepend + global.domain);

global.xhr.setStaticOptions({
		
});

global.Wifi = require('ti.wifimanager');
global.oauth = Alloy.createWidget('ti.oauth2');

global.oauth.customServer = true;  
global.oauth.customAuthUrl = "https://io.plangrid.com/oauth/authorize";  
global.oauth.customTokenUrl = "https://io.plangrid.com/oauth/token";  
global.oauth.clientId = "7fc99cd6-c209-40f4-b112-588bc624492f";  
global.oauth.state = "ROK-standard";  
global.oauth.clientSecret = "68fdd6ff-9bd0-4d3d-b1d9-78851eee384b";  
global.oauth.scope = "write:projects";  
global.oauth.redirectUrl = "https://dev-dfm-rok.pantheonsite.io/";  
global.oauth.responseType = "code";  
global.oauth.grantType = "authorization_code";  
global.oauth.customTitleText = "PlanGrid Authorization";  
global.oauth.saveTokensToTiProperties = true;    //saves to Ti.App.Properties.getString  ('azure-ad-access-token');

global.onOauthSuccess = function (authResults) {
    var secondsToSetExpiration = parseInt(authResults.expires_in) - 600;  //subtract 10 minutes
    var expDate = Date.now() + (secondsToSetExpiration * 1000);          //find that timestamp
    Ti.App.Properties.setInt('azure-ad-access-token-exp', expDate);      //set the time stamp for future reference
    global.oauth.close();
};

global.onOauthError = function (authResults) {
	Ti.API.info('ERROR: ', JSON.stringify(authResults));
		global.oauth.close();
};

global.onOauthCancel = function (authResults) {
	global.oauth.close();
};

Ti.App.addEventListener('resumed', function(e) {	Ti.API.info("APP RESUMED");
	var tokenExp = Ti.App.Properties.getInt('azure-ad-access-token-exp');
	var currentExp = Date.now();
	if (currentExp > tokenExp) {
		// TODO:  update to slightly different callbacks for refresh purposes?
		global.oauth.authorize(false, global.onOauthSuccess, global.onOauthError, true, global.onOauthCancel);
	} //else no refresh needed, more than 10 minnutes before expiring
});
/*
 * Add below to onError callbacks of ti.XHR REST calls to trigger re-authorization in event of 401.
 */
/*
    if (e.code === 401) {
        Alloy.PersistentEvents.trigger('app:unauthorizedRequest');
    } else {
        //handle other errors here
    }
*/

//prompt/show UI   |   success CB  |   error CB    |   allowCancel  |   cancel CB
global.oauth.authorize(true, global.onOauthSuccess, global.onOauthError, true, global.onOauthCancel);

if (!Ti.Network.online) {
	alert("It appears that your network connection dropped or that you haven't yet connected.  Currently using cached assets until connection is re-established to re-sync documents & configurations.");
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
	    		Alloy.Globals.loading.show('Attempting auto-login...');
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

var setDeviceConfig = function(results) {
	global.deviceInfo = results;
	Ti.App.Properties.setObject('deviceInfo', results);
	if (results.length == 1) {
		Ti.App.Properties.setInt("deviceIndex", 0);
	}
	Ti.App.Properties.setString('deviceName', results[Ti.App.Properties.getInt("deviceIndex")].title);
	Ti.App.Properties.setString('superName', results[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_name);
	Ti.App.Properties.setString('superPhone', results[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_mobile_numb);
	Ti.App.Properties.setString('admin_secret', results[Ti.App.Properties.getInt("deviceIndex")].field_admin_secret);
};

/*
 * Get global.getDeviceInfo List
 */
global.getDeviceInfo = function() {
	global.jDrupal.viewsLoad('rest/views/my-devices').then(function(view) {
		var results = view.getResults();
		Ti.API.info('results = ' + JSON.stringify(results));
		setDeviceConfig(results);
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
