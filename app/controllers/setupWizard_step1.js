// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var setLang = function(lang) {
	Ti.App.Properties.setString('language', lang);
	Ti.API.info('*** ' + Ti.App.Properties.getString('language') + ' ***');
	switch(lang) {
		case 'English':
		default:
			Ti.Locale.setLanguage('en');
			break;
	}
};

var wizardContinue = function() {
	Alloy.createController('hello').getView().open();
};

var chooseLanguage = function(e) {
	var choice = e.row.children[0].text;
	Ti.API.info('choice = ' + choice);
	for (var i = 0; i < $.ListView_languages.data[0].rows.length; ++i) {
	    $.ListView_languages.data[0].rows[i].hasCheck = false;
	}
	$.ListView_languages.data[0].rows[e.index].hasCheck = true;
	setLang(choice);
	wizardContinue();
	setTimeout(function() {
		$.nxtBtn.visible = true;
	}, 500);
};

var denoteInitial = function(lang) {
	for (var i = 0; i < $.ListView_languages.data[0].rows.length; ++i) {
	    $.ListView_languages.data[0].rows[i].hasCheck = ($.ListView_languages.data[0].rows[i].children[0].text == lang);
	}
};

Ti.API.info('language = ' + Ti.App.Properties.getString('language'));
if (!Ti.App.Properties.getString('language')) {
	$.nxtBtn.visible = false;
} else {
	$.nxtBtn.visible = true;
	denoteInitial(Ti.App.Properties.getString('language'));
}

global.setLang = setLang;