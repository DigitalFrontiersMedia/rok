// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;



var goWhiteboard = function() {
	Alloy.createController('whiteboard').getView().open();
};

var sendSMS = function(e) {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	var option = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export[e.data[0].key];
	var accountSid = "ACaab834c22e540ff5fc703ad65195b686";
	var authToken = "c7b5409b787dd9336939e446156e23e7";
	var fromNumber = "+18138561613";
	var toNumber = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_mobile_numb;
	var text = global.UTIL.cleanString(option.message);
	
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onreadystatechange = function (e) {
	    if (xhr.readyState === 4) {
	        if (xhr.status === 201) {
	           Ti.API.info(xhr.responseText);
	        } else {
	           Ti.API.info("Error", JSON.stringify(xhr));
	        }
	    }
	};
	xhr.open("POST", "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json", true);
	// Add Basic Authentication Header (Android doesn't support user:pass@domain.tld format)
	var h = Titanium.Utils.base64encode(accountSid + ':' + authToken);
	xhr.setRequestHeader('Authorization', 'Basic ' + h);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send("From=" + encodeURIComponent(fromNumber) + "&To=" + encodeURIComponent(toNumber) + "&Body=" + encodeURIComponent(text));
};

var pageSuperMenu = function(e) {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	if ((!Ti.App.Properties.getObject('deviceInfo') && !Ti.App.Properties.getInt("deviceIndex")) || !global.userId) {
		alert(L('device_info_not_synced'));
		return;
	}
	if (!deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export) {
		alert(L('no_options'));
		return;
	}
	global.showOptions(L('page_super_prompt'), deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export, $, sendSMS);
};

var displaySiteInfo = function(e) {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	var option = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export[e.data[0].key];
	switch (option.bundle) {
		case 'link_component':
			var dialog = require('ti.webdialog');
			if (dialog.isSupported()) {
				dialog.open({
					id: 'optionDisplay',
			    	title: global.UTIL.cleanString(option.option_label),
			    	url: option.link_url.url,
			        tintColor: '#ffffff',
			        barColor: '#ff9200',
			        showTitle: true,
			        animated: true,
			        fadeTransition: true,
			        enableSharing: false
			   });
		    }
			break;
		case 'text_component':
			var win = Alloy.createController('commonWindow').getView();
			win.add(Ti.UI.createWebView({width: '50%', height: '50%', html: '<html><body>' + option.text + '</body></html>'}));
			win.open();
			break;
	}
};

var siteInfoMenu = function() {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	if ((!Ti.App.Properties.getObject('deviceInfo') && !Ti.App.Properties.getInt("deviceIndex")) || !global.userId) {
		alert(L('device_info_not_synced'));
		return;
	}
	if (!deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export) {
		alert(L('no_options'));
		return;
	}
	global.showOptions(L('site_info_prompt'), deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export, $, displaySiteInfo);
};

var goRfis = function() {
	Ti.API.info('*** RFIs ***');
};

var goDrawings = function() {
	Ti.API.info('*** DRAWINGS ***');
};

var goSubmittals = function() {
	Ti.API.info('*** SUBMITTALS ***');
};

var goDocuments = function() {
	Ti.API.info('*** DOCUMENTS ***');
};

$.home.addEventListener('androidback', function() {
	return;
});
