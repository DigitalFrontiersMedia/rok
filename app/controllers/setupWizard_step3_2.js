// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var constructionApp;

var wizardContinue = function() {
	global.setPlatform();
  if (!Alloy.Globals.useROKbtns) {
		Alloy.createController('setupWizard_step4').getView().open();
	} else {
		Alloy.createController('setupWizard_step3_3').getView().open();
	}
};

var OauthSuccess = function(authResults) {
    var secondsToSetExpiration = parseInt(authResults.expires_in) - 86400;  //subtract 10 minutes
    var expDate = Date.now() + (secondsToSetExpiration * 1000);          //find that timestamp
    Ti.App.Properties.setInt('azure-ad-access-token-exp', expDate);      //set the time stamp for future reference
    global.oauth.close();
    global.konstruction.clearProjects();
    // Add received tokens to xhr config for subsequent requests.
    global.xhrOptions.shouldAuthenticate = true;
    global.xhrOptions.oAuthToken = Ti.App.Properties.getString('azure-ad-access-token');
	global.xhr.setStaticOptions(global.xhrOptions);
	
	Ti.App.Properties.setString("constructionApp", constructionApp);
	//global.setPlatform();

	// Set Konstruction vars.
	global.konstruction.setPlatform(constructionApp);

	global.konstruction.clearProjects();

  wizardContinue();
	setTimeout(function() {
		$.nxtBtn.visible = true;
	}, 500);
};

var chooseApp = function(e) {
	//Ti.API.info('e = ' + JSON.stringify(e));
	var choice = e.row.children[0].text;

  if (global.nativeUi) {
    global.setUseROKbtns(false);
  } else {
    switch (choice) {
      case 'Procore':
        break;

      case 'Autodesk Build':
        global.setUsingWebUi(true);
        global.setUseROKbtns(false);
        global.setHybridUi(false);
        break;

      case 'PlanGrid':
      default:
        //global.setUsingWebUi(true);
        global.setUseROKbtns(true);
        //global.setHybridUi(false);
        break;
    }
  }

	for (var i = 0; i < $.ListView_apps.data[0].rows.length; ++i) {
	    $.ListView_apps.data[0].rows[i].hasCheck = false;
	}
	$.ListView_apps.data[0].rows[e.index].hasCheck = true;
	var tokenExp = Ti.App.Properties.getInt('azure-ad-access-token-exp');
	var currentTime = Date.now();
	 if ((Ti.App.Properties.getString('constructionApp') != choice && !global.usingWebUi) || (!Ti.App.Properties.getString('azure-ad-access-token') && !global.usingWebUi) || (!Ti.App.Properties.getString('azure-ad-refresh-token') && !global.usingWebUi) || ((currentTime > tokenExp) && (!global.usingWebUi || global.konstruction.platform == 'PlanGrid'))) {
		constructionApp = choice;
		global.setOauthParams(constructionApp);
		//prompt/show UI   |   success CB  |   error CB    |   allowCancel  |   cancel CB
    if (!global.nativeUi) {
		  global.oauth.authorize(true, OauthSuccess, global.onOauthError, true, global.onOauthCancel);
    }
	} else if (global.usingWebUi) {
		constructionApp = choice;
    if (choice != Ti.App.Properties.getString("constructionApp")) {
      Ti.App.Properties.setString("project_uid", null);
      deviceInfo = Ti.App.Properties.getObject('deviceInfo');
      deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_project = null;
      Ti.App.Properties.setString('project', deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_project);
      // Set Konstruction vars.
      global.konstruction.setPlatform(constructionApp);

      global.konstruction.clearProjects();

      switch (choice) {
        case 'PlanGrid':
          constructionApp = choice;
          global.setOauthParams(constructionApp);
          //prompt/show UI   |   success CB  |   error CB    |   allowCancel  |   cancel CB
          global.oauth.authorize(true, OauthSuccess, global.onOauthError, true, global.onOauthCancel);
          break;

        default:
          break;
      }
    }
	}
  Ti.App.Properties.setString("constructionApp", constructionApp);
  //global.setPlatform();
  wizardContinue();
  setTimeout(function() {
    $.nxtBtn.visible = true;
  }, 500);
};

var denoteInitial = function(val) {
	for (var i = 0; i < $.ListView_apps.data[0].rows.length; ++i) {
	    $.ListView_apps.data[0].rows[i].hasCheck = ($.ListView_apps.data[0].rows[i].children[0].text == val && val != null && val != '');
	}
};

if (!Ti.App.Properties.getString('constructionApp') || !Ti.App.Properties.getString('azure-ad-access-token') || global.UiSwitched) {
	$.nxtBtn.visible = false;
} else {
	$.nxtBtn.visible = true;
	denoteInitial(Ti.App.Properties.getString('constructionApp'));
}

var wizContCheck = setInterval(function() {
  if (global.wizOkay2Cont) {
    authResults = global.wizOkay2Cont;
    global.wizOkay2Cont = false;
    clearInterval(wizContCheck);
    wizContCheck = null;
    $.nxtBtn.visible = true;
    OauthSuccess(authResults);
  }
}, 1000);