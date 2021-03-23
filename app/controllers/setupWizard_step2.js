// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var scan;
var network;
var ssid;

var wizardContinue = function() {
	Alloy.createController('setupWizard_step3').getView().open();
};

var setWifi = function(ssid) {
	Ti.App.Properties.setString('wifi', ssid);
	Ti.API.info('*** ' + ssid + ' ***');
};

var chooseNetwork = function(e) {
	//Ti.API.info(JSON.stringify(e));
	network = e.index;
	ssid = scan.scanResults[network].getSSID();
	var currentSSID = global.Wifi.getCurrentConnection().ssid;
	Ti.API.info(ssid);
	Ti.API.info(currentSSID.substring(1, currentSSID.length-1));
	if (Ti.Network.online && currentSSID.substring(1, currentSSID.length-1) == ssid) {
		var password = Alloy.createController('password').getView();
    	$.setupWizard2Container.remove(password);
    	//$.open();
		wizardContinue();
		setWifi(ssid);
		alert('Connected!');
		setTimeout(function() {
			$.nxtBtn.visible = true;
		}, 500);
		return;
	}
    var arg = {
        title: e.row.children[0].text
    };
	var password = Alloy.createController('password', arg).getView();
	$.setupWizard2Container.add(password);
};

var netConnect = function(pass) {
	var networkNotRemembered = true;
	var rememberedNetwork;	
	var networkListener = Ti.Network.addEventListener('change', function(e) {
		var currentSSID = global.Wifi.getCurrentConnection().ssid;
		if (Ti.Network.online && currentSSID.substring(1, currentSSID.length-1) == ssid) {
			var password = Alloy.createController('password').getView();
	    	$.setupWizard2Container.remove(password);
    		//$.open();
			wizardContinue();
			setWifi(ssid);
			alert('Connected!');
			setTimeout(function() {
				$.nxtBtn.visible = true;
			}, 500);
			return;
		} else if (Ti.Network.online && currentSSID.substring(1, currentSSID.length-1) != ssid) {
			alert('System connected to a previously remembered network before we could connect to the newly chosen one. Try again?');
			//$.setupWizard_step2Window.remove($.password);
			//$.setupWizard_step2Window.open();
		} else {
			alert('Could not connect. Try again?');
		}
	});
	global.Wifi.getConfiguredNetworks().forEach(function(saved) {
		//Ti.API.info(saved.SSID);
		//Ti.API.info(scan.scanResults[network].getSSID());		
	    if (saved.SSID == scan.scanResults[network].getSSID()) {
	    	networkNotRemembered = false;
	    	rememberedNetwork = scan.scanResults[network];
	    }
	});
	if (networkNotRemembered) {
		var networkId = global.Wifi.addNetwork(scan.scanResults[network].setPassword(pass));
		Wifi.enableNetwork({
		    netId : networkId
		});
		setTimeout(function() {
			if (!Ti.Network.online) {
				Ti.API.info('*** FORGETTING NETWORK ' + networkId + ' ***');
				global.Wifi.removeNetwork(networkId);
				alert('Could not connect. Try again?');
			}
		}, 10000);
	} else {
		if (!Ti.Network.online) {
			global.Wifi.reconnect(rememberedNetwork);
		} else {
			var password = Alloy.createController('password').getView();
	    	$.setupWizard2Container.remove(password);
			$.open();
			wizardContinue();
			alert('Connected to remembered network.');
			return;
		}
	}
	setTimeout(function() {
		networkListener = null;
	}, 10000);
};

if (!Ti.App.Properties.getString('wifi')) {
	$.nxtBtn.visible = false;
} else {
	$.nxtBtn.visible = true;
}

global.Wifi.startWifiScan({
	complete : function(scanned) {
		var networkName,
		dataRow;
		var tableData = [];
		if (scanned.scanResults) {
			//Ti.API.info("scanResults = " + scanned.scanResults);
			scan = scanned;
			scanned.scanResults.forEach(function(scanResult) {
				if (scanResult.getSSID()) {
					//Ti.API.info("bssid=" + scanResult.getBSSID() + "   rssi=" + scanResult.getRSSI() + "   ssid=" + scanResult.getSSID());
					networkName = $.UI.create('Label', {
						text: scanResult.getSSID() + ' (' + (scanResult.getFrequency() / 1000).toFixed(1) + ' GHz)',
						classes: ["choice"]
					});
					dataRow = Ti.UI.createTableViewRow();
					dataRow.add(networkName);
					tableData.push(dataRow);
				}
			});
			if (tableData.length) {
				$.ListView_networks.data = tableData;
			}
		}
	}
});


global.netConnect = netConnect;
