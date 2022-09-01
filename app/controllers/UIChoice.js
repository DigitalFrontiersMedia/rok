// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var wizardContinue = function() {
	Ti.API.info('global.usingWebUi = ' + JSON.stringify(global.usingWebUi));
	//if (global.usingWebUi) {
		Alloy.createController('setupWizard_step3_2').getView().open();
	//} else {
	//	Alloy.createController('setupWizard_step3_2').getView().open();
	//}
};

var rokUi = function () {
  global.setUsingWebUi(false);
  global.setHybridUi(false);
  global.setNativeUi(false);
  wizardContinue();
};

var hybridUi = function () {
  global.setUsingWebUi(true);
  global.setHybridUi(true);
  global.setNativeUi(false);
  wizardContinue();
};

var webUi = function() {
	global.setUsingWebUi(true);
  global.setHybridUi(false);
  global.setNativeUi(false);
	wizardContinue();
};

var nativeUi = function() {
	global.setUsingWebUi(false);
  global.setHybridUi(false);
  global.setNativeUi(true);
	wizardContinue();
};
