// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var scan;
var network;
var ssid;
var netCheckTimer;

var wizardContinue = function() {
	Alloy.createController('setupWizard_step3').getView().open();
};

var setWifi = function(ssid) {
	Ti.App.Properties.setString('wifi', ssid);
	Ti.API.info('*** ' + ssid + ' ***');
};

var chooseNetwork = function(e) {
	if (scan) {
		var networkNotRemembered = true;
		var rememberedNetwork;	
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
			Alloy.Globals.loading.hide();
			alert(L('connected'));
			setTimeout(function() {
				$.nxtBtn.visible = true;
			}, 500);
			return;
		}
		global.Wifi.getConfiguredNetworks().forEach(function(saved) {
			//Ti.API.info(saved.SSID);
			//Ti.API.info(scan.scanResults[network].getSSID());		
		    if (saved.SSID == scan.scanResults[network].getSSID()) {
		    	networkNotRemembered = false;
		    	rememberedNetwork = scan.scanResults[network];
		    }
		});
		if (networkNotRemembered) {
		    var arg = {
		        title: e.row.children[0].text
		    };
			var password = Alloy.createController('password', arg).getView();
			$.setupWizard2Container.add(password);
		} else {
			if (!Ti.Network.online) {
				global.Wifi.reconnect(rememberedNetwork);
			} else {
				var password = Alloy.createController('password').getView();
		    	$.setupWizard2Container.remove(password);
				//$.open();
				wizardContinue();
				Alloy.Globals.loading.hide();
				alert(L('remembered_network'));
				return;
			}
		}
	}
};

var netConnect = function(pass) {
	var networkNotRemembered = true;
	var rememberedNetwork;	
	clearTimeout(netCheckTimer);
	var networkListener = function(e) {
		Ti.API.info('networkListener e = ' + JSON.stringify(e));
		Alloy.Globals.loading.hide();
		var currentSSID = global.Wifi.getCurrentConnection().ssid;
		if (e.online && currentSSID.substring(1, currentSSID.length-1) == ssid) {
			var password = Alloy.createController('password').getView();
	    	$.setupWizard2Container.remove(password);
    		//$.open();
			wizardContinue();
			setWifi(ssid);
			alert(L('connected'));
			setTimeout(function() {
				$.nxtBtn.visible = true;
				Ti.Network.removeEventListener('change', networkListener);
			}, 500);
			return;
		} else if (e.online && currentSSID.substring(1, currentSSID.length-1) != ssid) {
			alert(L('previous_network'));
			Ti.Network.removeEventListener('change', networkListener);
			//$.setupWizard_step2Window.remove($.password);
			//$.setupWizard_step2Window.open();
		} else if (!e.online) {
			alert(L('couldnt_connect'));
			Ti.Network.removeEventListener('change', networkListener);
		}
	};
	Ti.Network.removeEventListener('change', networkListener);
	Ti.Network.addEventListener('change', networkListener);
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
				//Alloy.Globals.loading.hide();
				//alert(L('couldnt_connect'));
				//Ti.Network.removeEventListener('change', networkListener);
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
			Alloy.Globals.loading.hide();
			alert(L('remembered_network'));
			Ti.Network.removeEventListener('change', networkListener);
			return;
		}
	}
	netCheckTimer = setTimeout(function() {
		Ti.Network.removeEventListener('change', networkListener);
	}, 12000);
};

if (!Ti.App.Properties.getString('wifi')) {
	$.nxtBtn.visible = false;
} else {
	$.nxtBtn.visible = true;
}

global.Wifi.startWifiScan({
	complete : function(scanned) {
		dataRow = {};
		var tableData = [];
		if (scanned.scanResults) {
			scan = scanned;
			scanned.scanResults.forEach(function(scanResult) {
				if (scanResult.getSSID()) {
					//Ti.API.info("bssid=" + scanResult.getBSSID() + "   rssi=" + scanResult.getRSSI() + "   ssid=" + scanResult.getSSID());
					dataRow = $.UI.create('TableViewRow');
					dataRow.add($.UI.create('Label', {
						text: scanResult.getSSID() + ' (' + (scanResult.getFrequency() / 1000).toFixed(1) + ' GHz)',
						classes: ["choice", 'left']
					}));
					dataRow.add($.UI.create('ImageView', {
						image: global.wifiIcon(scanResult.getRSSI()),
						classes: ['imageRight']
					}));
					tableData.push(dataRow);
				}
			});
		} else {
			emptyText = $.UI.create('Label', {
				text: "No WiFi networks found.",
				classes: ["choice"]
			});
			dataRow = Ti.UI.createTableViewRow();
			dataRow.add(emptyText);
			tableData.push(dataRow);
		}
		$.ListView_networks.data = tableData;
	}
});

global.netConnect = netConnect;
