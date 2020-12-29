
//$.index.open();

    var win2 = Alloy.createController('whiteboard').getView();
    // For Alloy projects, you can pass context
    // to the controller in the Alloy.createController method.
    // var win2 = Alloy.createController('win2', {foobar: 42}).getView();
    win2.open();

var Wifi = require('ti.wifimanager');
Wifi.startWifiScan({
    complete : function(scanned) {
	    Ti.API.info("runtime="+ scanned.runtime);
	    if (scanned.scanResults) {
	    	Ti.API.info("scanResults = " + scanned.scanResults);
	        scanned.scanResults.forEach(function(scanResult) {
		        if (scanResult) {
		            Ti.API.info("bssid=" + scanResult.getBSSID() + "   rssi=" + scanResult.getRSSI() + "   ssid=" + scanResult.getSSID());
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