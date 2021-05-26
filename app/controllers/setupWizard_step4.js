// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var widget;
var nodeDirty = false;
var messageOptions;
var messageOptionsDirty = false;
var newMessage = false;
var newMessageRef;
var siteInfoOptions;
var siteInfoOptionsDirty = false;
var newSiteInfoOption = false;
var newSiteInfoOptionRef;

var goHome = function() {
	Ti.API.info('going home...');
	//global.homeWindow.open();
	Alloy.createController('home').getView().open();
};

var removeProtectedFields = function(node) {
	delete node.entity.uuid;
	delete node.entity.vid;
	delete node.entity.revision_timestamp;
	//delete node.entity.revision_uid;
	delete node.entity.created;
	delete node.entity.changed;
	//delete node.entity.nid;
	delete node.entity.langcode;
	delete node.entity.revision_log;
	delete node.entity.status;
	delete node.entity.uid;
	delete node.entity.promote;
	delete node.entity.sticky;
	delete node.entity.default_langcode;
	delete node.entity.revision_translation_affected;
	delete node.entity.path;
	delete node.entity.menu_link;
	delete node.entity.field_comment;
	//delete node.entity.type;
	//delete node.entity.type[0].target_uuid;
	//delete node.entity.type[0].target_type;
	//delete node.entity.title;
	delete node.entity.body;
	return node;
};

var wizardContinue = function() {
	// Save all new/edited settings before going home
	Alloy.Globals.loading.show(L('updating'));
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	var nid = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].nid_export;
	
	// Update local Properties.
	if ($.deviceNameValue.value != deviceInfo[Ti.App.Properties.getInt("deviceIndex")].title) {
		deviceInfo[Ti.App.Properties.getInt("deviceIndex")].title = $.deviceNameValue.value;
		nodeDirty = true;
	}
	if ($.superNameValue.value != deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_name) {
		deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_name = $.superNameValue.value;
		nodeDirty = true;
	}
	if ($.superPhoneValue.value != deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_mobile_numb) {
		deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_mobile_numb = $.superPhoneValue.value;
		nodeDirty = true;
	}
	if ($.adminSecretValue.value != deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_admin_secret) {
		deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_admin_secret = $.adminSecretValue.value;
		nodeDirty = true;
	}

	//if ($.appValue.value != deviceInfo[Ti.App.Properties.getInt("deviceIndex")].construction_app) {
		Ti.App.Properties.setString('constructionApp', $.appValue.value);
	//}
	//if ($.projectValue.value != deviceInfo[Ti.App.Properties.getInt("deviceIndex")].project) {
		Ti.App.Properties.setString('project', $.projectValue.value);
	//}
	
	// Update Messages & Site Info Options
	if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export != messageOptions) {
		deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export = messageOptions;
		messageOptionsDirty = true;
	}
	if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export != siteInfoOptions) {
		deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export = siteInfoOptions;
		siteInfoOptionsDirty = true;
	}
	
	// Flag that we've made configurations
	Ti.App.Properties.setBool('configured', true);

	if (nodeDirty || messageOptionsDirty || siteInfoOptionsDirty) {
		// Save deviceInfo properties object changes.
		Ti.App.Properties.setObject('deviceInfo', deviceInfo);
		global.setDeviceConfig();
	}

	if (newMessage) {
		Ti.API.info('Trying to save newMessage paragraph entity...');
		// If we're adding completely new stuff to the deviceInfo profile node, then we set the node as dirty so it'll resave it later.
		nodeDirty = true;
		
		// Build & Save new Message paragraph
		var paragraph = new global.jDrupal.Paragraph({
			type: [{
				target_id: 'superintendent_sms_message',
				target_type: 'paragraphs_type'
			}],
			field_option_label: [{value: messageOptions[messageOptions.length - 1].option_label}],
			field_message: [{value: messageOptions[messageOptions.length - 1].message}],
			parent_id: [{value: nid}],
		    parent_type: [{value: "node"}],
		    parent_field_name: [{value: "field_superintendent_sms_message"}]
		});
		paragraph.save().then(function(resp) {
			Ti.API.info('resp = ' + JSON.stringify(resp));
		});

		// Save reference to new paragraph (newMessageRef) to add to deviceInfo profile node later.
	}
	
	if (newSiteInfoOption) {
		// If we're adding completely new stuff to the deviceInfo profile node, then we set the node as dirty so it'll resave it later.
		nodeDirty = true;
		
		// Build & Save new siteInfoOption paragraph
		
		// Save reference to new paragraph (newSiteInfoOptionRef) to add to deviceInfo profile node later.
	}
	
	if (nodeDirty) {
		// Get full node.
		global.jDrupal.nodeLoad(nid).then(function(node) {
			Ti.API.info('node = ' + JSON.stringify(node));
			// Remove protected fields
			node = removeProtectedFields(node);
	
			// Update field values
			node.entity.title = [{value: Ti.App.Properties.getString('deviceName')}];
			//$.appValue.value = Ti.App.Properties.getString('constructionApp');
			//$.projectValue.value = Ti.App.Properties.getString('project');
			node.entity.field_superintendent_name = [{value: Ti.App.Properties.getString('superName')}];
			node.entity.field_superintendent_mobile_numb = [{value: Ti.App.Properties.getString('superPhone')}];
			node.entity.field_admin_secret = [{value: Ti.App.Properties.getString('admin_secret')}];
	
			// TODO: Save updated Messages & Site Info Option paragraphs.
			// Use newMessageRef & newSiteInfoOptionRef for new target_id as appropriate for node's paragraph fields.
/*
			node.entity.field_superintendent_sms_message[node.entity.field_superintendent_sms_message.length] = {
				target_id: newMessageRef,
				target_type: "paragraph",
        		//'target_revision_id' : ->getRevisionId()
			};
*/

			// Save device profile with updated field values and report back then head home after Okay.
			node.save().then(function(resp) {
				Alloy.Globals.loading.hide();
				//Ti.API.info('resp =  ' + JSON.stringify(resp));
				Ti.API.info('Saved ' + node.getTitle());
				var message = $.UI.create('Label', {text: L('config_updated')});
				var arg = {
					title : L('saved'),
					container : $.getView().parent,
					callback : goHome
				};
				var commonView = Alloy.createController('commonView', arg).getView();
				commonView.getViewById('contentWrapper').add(message);
				$.getView().parent.add(commonView);
			});
		});
	} else {
		Alloy.Globals.loading.hide();
		goHome();
	}
};

var updateMessages = function(form) {
	Ti.API.info('*** widget.getValues() = ' + JSON.stringify(widget.getValues()) + ' ***');
	var values = widget.getValues();
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	var options = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export;
	for (i=0; i < options.length; i++) {
		options[i].option_label = values[i]["option_label_" + (i+1)];
		options[i].message = values[i]["message_" + (i+1)];
	}
	if (values.length > options.length) {
		if (values[options.length]["option_label_" + (options.length + 1)] != '' && values[options.length]["message_" + (options.length + 1)] != '') {
			options.push({
				option_label: values[options.length]["option_label_" + (options.length + 1)],
				message: values[options.length]["message_" + (options.length + 1)]
			});
			newMessage = true;
			Ti.API.info('newMessage = true');
		} else {
			//alert(L('fields_empty'));
		}
	}
	messageOptions = options;
};

var updateSiteInfoOptions = function(form) {
	Ti.API.info('*** widget.getValues() = ' + JSON.stringify(widget.getValues()) + ' ***');
	var values = widget.getValues();
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	var options = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export;
	for (i=0; i < options.length; i++) {
		options[i].option_label = values[i]["option_label_" + (i+1)];
		switch (options[i].bundle) {
			case 'text_component':
				labId = 'composed_text';
				options[i].text = values[i][labId + "_" + (i+1)];
				break;
			case 'link_component':
				labId = 'external_url';
				options[i].link_url.url = values[i][labId + "_" + (i+1)];
				break;
			case 'uploaded_component':
				labId = 'uploaded_file';
				options[i].text = values[i][labId + "_" + (i+1)];
				break;
		}
	}
/*
	if (values.length > options.length) {
		if (values[options.length]["option_label_" + (options.length + 1)] != '' && values[options.length]["message_" + (options.length + 1)] != '') {
			options.push({
				option_label: values[options.length]["option_label_" + (options.length + 1)],
				message: values[options.length]["message_" + (options.length + 1)]
				newSiteInfoOption = true;
			});
		} else {
			//alert(L('fields_empty'));
		}
	}
*/
	siteInfoOptions = options;
};

var view_edit_messages = function() {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	var options = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export;
	var fieldsets = [];
	var fieldset = {};
	for (i=0; i < options.length; i++) {
		fieldset = {
			legend: L('option') + ' ' + (i+1),
			fields: [{
				name : 'option_label' + '_' + (i+1),
				label : L('option_label'),
				value : global.UTIL.cleanString(options[i].option_label),
				type : 'text',
				hintText: L('option_hint')
			}, {
				name : 'message' + '_' + (i+1),
				label : L('message'),
				value : global.UTIL.cleanString(options[i].message),
				type : 'text'
			}]
		};
		fieldsets.push(fieldset);
	}
	fieldset = {
		legend: L('option') + ' ' + (options.length + 1),
		fields: [{
			name : 'option_label' + '_' + (options.length + 1),
			label : L('option_label'),
			type : 'text',
			hintText: L('option_hint')
		}, {
			name : 'message' + '_' + (options.length + 1),
			label : L('message'),
			type : 'text'
		}]
	};
	fieldsets.push(fieldset);
	widget = Alloy.createWidget('nl.fokkezb.form', {
		fieldsets : fieldsets
	});
	var form = widget.getView();
	var arg = {
		title : L('super_sms_message_field_label'),
		container : $.setupWizard4Container,
		formInput: form,
		callback: updateMessages
	};
	var commonView = Alloy.createController('commonView', arg).getView();
	//Ti.API.info('*********\n' + JSON.stringify(form) + '\n********');
	form.separatorColor = 'transparent';
	commonView.getViewById('contentWrapper').add(form);
	$.setupWizard4Container.add(commonView);
};

var view_edit_siteInfo_options = function() {
	// TODO:  Provide an option for adding new Site Info values.
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	var options = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export;
	var fieldsets = [];
	var fieldset = {};
	var val;
	var labId;
	var valLabel;
	var typ;
	var hint;
	for (i=0; i < options.length; i++) {
		switch (options[i].bundle) {
			case 'text_component':
				labId = 'composed_text';
				valLabel = L(labId);
				val = options[i].text;
				typ = 'textarea';
				hint = L('composed_text_hint');
				break;
			case 'link_component':
				labId = 'external_url';
				valLabel = L(labId);
				val = options[i].link_url.url;
				typ = 'text';
				hint = 'https://www.example.com/foo.html';
				break;
			case 'uploaded_component':
				labId = 'uploaded_file';
				valLabel = L(labId);
				val = options[i].text;
				typ = 'text';
				break;
		}
		fieldset = {
			legend: L('option') + ' ' + (i+1),
			fields: [{
				name : 'option_label' + '_' + (i+1),
				label : L('option_label'),
				value : global.UTIL.cleanString(options[i].option_label),
				type : 'text',
				hintText: L('option_hint')
			}, {
				name : labId + '_' + (i+1),
				label : global.UTIL.cleanString(valLabel),
				value : global.UTIL.htmlDecode(val),
				type : typ,
				hintText: hint
			}]
		};
		fieldsets.push(fieldset);
	}
	widget = Alloy.createWidget('nl.fokkezb.form', {
		fieldsets : fieldsets
	});
	var form = widget.getView();
	var arg = {
		title : L('site_info_field_label'),
		container : $.setupWizard4Container,
		formInput: form,
		callback: updateSiteInfoOptions
	};
	var commonView = Alloy.createController('commonView', arg).getView();
	//Ti.API.info('*********\n' + JSON.stringify(form) + '\n********');
	form.separatorColor = 'transparent';
	commonView.getViewById('contentWrapper').add(form);
	$.setupWizard4Container.add(commonView);
};

var selectApp = function() {
	Alloy.createController('setupWizard_step3_2').getView().open();
};

var selectProject = function() {
	Alloy.createController('setupWizard_step3_3').getView().open();
};

$.deviceNameValue.value = Ti.App.Properties.getString('deviceName');
$.appValue.value = Ti.App.Properties.getString('constructionApp');
$.projectValue.value = Ti.App.Properties.getString('project');
$.superNameValue.value = Ti.App.Properties.getString('superName');
$.superPhoneValue.value = Ti.App.Properties.getString('superPhone');
$.adminSecretValue.value = Ti.App.Properties.getString('admin_secret');

$.appValue.addEventListener('focus', selectApp);
$.projectValue.addEventListener('focus', selectProject);
