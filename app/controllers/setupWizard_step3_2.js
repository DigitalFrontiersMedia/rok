// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var constructionApp;

var wizardContinue = function() {
	Alloy.createController('setupWizard_step3_3').getView().open();
};

var OauthSuccess = function(authResults) {
    var secondsToSetExpiration = parseInt(authResults.expires_in) - 600;  //subtract 10 minutes
    var expDate = Date.now() + (secondsToSetExpiration * 1000);          //find that timestamp
    Ti.App.Properties.setInt('azure-ad-access-token-exp', expDate);      //set the time stamp for future reference
    global.oauth.close();
    
    // Add received tokens to xhr config for subsequent requests.
    global.xhrOptions.shouldAuthenticate = true;
    global.xhrOptions.oAuthToken = Ti.App.Properties.getString('azure-ad-access-token');
	global.xhr.setStaticOptions(global.xhrOptions);
	
	Ti.App.Properties.setString("constructionApp", constructionApp);

	// Set Konstruction vars.
	global.konstruction.setPlatform(constructionApp);

	wizardContinue();
	setTimeout(function() {
		$.nxtBtn.visible = true;
	}, 500);
};

var chooseApp = function(e) {
	if (Ti.App.Properties.getString('constructionApp') != e.source.text || !Ti.App.Properties.getString('azure-ad-access-token') || !Ti.App.Properties.getString('azure-ad-refresh-token')) {
		constructionApp = e.source.text;
		global.setOauthParams(constructionApp);
		//prompt/show UI   |   success CB  |   error CB    |   allowCancel  |   cancel CB
		global.oauth.authorize(true, OauthSuccess, global.onOauthError, true, global.onOauthCancel);			
	} else {
		wizardContinue();
	}
};

if (!Ti.App.Properties.getString('constructionApp') || !Ti.App.Properties.getString('azure-ad-access-token')) {
	$.nxtBtn.visible = false;
} else {
	$.nxtBtn.visible = true;
}
