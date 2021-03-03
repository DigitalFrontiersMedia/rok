// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var setLang = function(lang) {
	Ti.App.Properties.setString('language', lang);
	Ti.API.info('*** ' + lang + ' ***');
	switch(lang) {
		case 'English':
		default:
			Ti.Locale.setLanguage('en');
			break;
	}
};

var wizardContinue = function() {
	var nextWindow = Alloy.createController('setupWizard_step2').getView();
	nextWindow.open();
};

var chooseLanguage = function(e) {
	setLang(e.source.text);
	wizardContinue();
	setTimeout(function() {
		$.nxtBtn.visible = true;
	}, 500);
};

if (!Ti.App.Properties.getString('language')) {
	$.nxtBtn.visible = false;
} else {
	$.nxtBtn.visible = true;
}

global.setLang = setLang;