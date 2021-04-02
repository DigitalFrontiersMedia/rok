// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goHome = function() {
	global.homeWindow.open();
};

var wizardContinue = function() {
	Ti.App.Properties.setBool('configured', true);
	goHome();
	//Alloy.createController('home').getView().open();
};

$.deviceNameValue.value = Ti.App.Properties.getString('deviceName');
$.superNameValue.value = Ti.App.Properties.getString('superName');
$.superPhoneValue.value = Ti.App.Properties.getString('superPhone');

var view_edit_messages = function() {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	var options = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export;
	var fieldsets = [];
	var fieldset = {};
	for (i=0; i < options.length; i++) {
		fieldset = {
			legend: L('option') + ' ' + (i+1),
			fields: [{
				name : 'option_label',
				label : L('option_label'),
				value : global.UTIL.cleanString(options[i].option_label),
				type : 'text',
				hintText: L('option_hint')
			}, {
				name : 'message',
				label : L('message'),
				value : global.UTIL.cleanString(options[i].message),
				type : 'text'
			}]
		};
		fieldsets.push(fieldset);
	}
	var form = Alloy.createWidget('nl.fokkezb.form', {
		fieldsets : fieldsets
	}).getView();
	var arg = {
		title : L('super_sms_message_field_label'),
		container : $.setupWizard4Container
	};
	var commonView = Alloy.createController('commonView', arg).getView();
	Ti.API.info('*********\n' + JSON.stringify(form) + '\n********');
	form.separatorColor = 'transparent';
	commonView.getViewById('contentWrapper').add(form);
	$.setupWizard4Container.add(commonView);
};

var view_edit_siteInfo_options = function() {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	var options = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export;
	var fieldsets = [];
	var fieldset = {};
	var val;
	var valLabel;
	var typ;
	var hint;
	for (i=0; i < options.length; i++) {
		switch (options[i].bundle) {
			case 'text_component':
				valLabel = L('composed_text');
				val = options[i].text;
				typ = 'textarea';
				hint = L('composed_text_hint');
				break;
			case 'link_component':
				valLabel = L('external_url');
				val = options[i].link_url.url;
				typ = 'text';
				hint = 'https://www.example.com/foo.html';
				break;
			case 'uploaded_component':
				valLabel = L('uploaded_file');
				val = options[i].text;
				typ = 'text';
				break;
		}
		fieldset = {
			legend: L('option') + ' ' + (i+1),
			fields: [{
				name : 'option_label',
				label : L('option_label'),
				value : global.UTIL.cleanString(options[i].option_label),
				type : 'text',
				hintText: L('option_hint')
			}, {
				name : global.UTIL.cleanString(valLabel).toLowerCase(),
				label : global.UTIL.cleanString(valLabel),
				value : global.UTIL.htmlDecode(val),
				type : typ,
				hintText: hint
			}]
		};
		fieldsets.push(fieldset);
	}
	var form = Alloy.createWidget('nl.fokkezb.form', {
		fieldsets : fieldsets
	}).getView();
	var arg = {
		title : L('site_info_field_label'),
		container : $.setupWizard4Container
	};
	var commonView = Alloy.createController('commonView', arg).getView();
	Ti.API.info('*********\n' + JSON.stringify(form) + '\n********');
	form.separatorColor = 'transparent';
	commonView.getViewById('contentWrapper').add(form);
	$.setupWizard4Container.add(commonView);
};
