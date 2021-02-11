// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var chooseNetwork = function(e) {
	Ti.API.info(JSON.stringify(e));
	switch(e.index) {
		case 0:
			
			break;
	}
	var setupWizard_step3Window = Alloy.createController('setupWizard_step3').getView();
	setupWizard_step3Window.open();
};

var Wifi = require('ti.wifimanager');
Wifi.startWifiScan({
	complete : function(scanned) {
		var networkName,
		dataRow;
		var tableData = [];
		Ti.API.info("runtime=" + scanned.runtime);
		if (scanned.scanResults) {
			Ti.API.info("scanResults = " + scanned.scanResults);
			scanned.scanResults.forEach(function(scanResult) {
				if (scanResult.getSSID()) {
					//Ti.API.info("bssid=" + scanResult.getBSSID() + "   rssi=" + scanResult.getRSSI() + "   ssid=" + scanResult.getSSID());
					networkName = $.UI.create('Label', {
						text: scanResult.getSSID(),
						classes: ["choice"]
					});
					dataRow = Ti.UI.createTableViewRow();
					dataRow.add(networkName);
					tableData.push(dataRow);
					$.ListView_networks.data = tableData;
				}
			});
		}
	}
});

//var intent = Ti.Android.createIntent({
//    action: Ti.Android.ACTION_WIFI_SETTINGS
//});
//intent.addCategory(Ti.Android.ACTION_WIFI_SETTINGS);
//Ti.Android.currentActivity.startActivity(intent);
//Ti.Android.currentActivity.startActivity(intent);