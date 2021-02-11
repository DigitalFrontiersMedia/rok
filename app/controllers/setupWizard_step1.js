// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var chooseLanguage = function(e) {
	switch(e.index) {
		case 0:
			Ti.API.info('*** ENGLISH ***');
			break;
	}
	var setupWizard_step2Window = Alloy.createController('setupWizard_step2').getView();
	setupWizard_step2Window.open();
};
