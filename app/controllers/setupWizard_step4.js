// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var widget;
var nodeDirty = false;
var messageOptions;
var messageOptionsDirty = false;
var dirtyMessagesIndex = [];
var newMessage = false;
var newMessageRef = {};
var messageOptionsChecked = false;
var siteInfoOptions;
var siteInfoOptionsDirty = false;
var dirtySiteInfoOptionsIndex = [];
var newSiteInfoOption = false;
var newSiteInfoOptionRef = {};
var siteInfoOptionsChecked = false;

var goHome = function() {
	Ti.API.info('going home...');
	//global.homeWindow.open();
	// TODO:  End activity or close all windows?
	Alloy.createController('home').getView().open();
	// Check/start background syncService.
	setTimeout(function() {
		var worker = require('ti.worker');
		// create a worker thread instance
		var task = worker.createWorker('syncService.js');
	}, global.backgroundServiceDelay * 60 * 1000);
	//global.syncService();
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

var saveDeviceProfileNode = function(nid) {
	Ti.API.info('saveDeviceProfileNode');
	// Get full node.
	global.jDrupal.nodeLoad(nid).then(function(node) {
		Ti.API.info('node = ' + JSON.stringify(node));
		// Remove protected fields
		node = removeProtectedFields(node);

		// Update field values
		node.entity.title = [{value: Ti.App.Properties.getString('deviceName')}];
		node.entity.field_device_id = [{value: Ti.Platform.id}];
		node.entity.field_rok_app_version = [{value: Ti.App.version}];
		node.entity.field_construction_app = [{value: Ti.App.Properties.getString('constructionApp')}];
		node.entity.field_project = [{value: Ti.App.Properties.getString('project')}];
		node.entity.field_superintendent_name = [{value: Ti.App.Properties.getString('superName')}];
		node.entity.field_superintendent_mobile_numb = [{value: Ti.App.Properties.getString('superPhone')}];
		node.entity.field_admin_secret = [{value: Ti.App.Properties.getString('admin_secret')}];
		node.entity.field_auto_asset_cache_sync = [{value: Ti.App.Properties.getBool('autoAssetCacheSync')}];
		node.entity.field_sync_interval = [{value: Ti.App.Properties.getInt('syncInterval')}];

		if (newMessageRef.id) {
			node.entity.field_superintendent_sms_message.push({
				target_id: newMessageRef.id,
				target_type: "paragraph",
        		target_revision_id : newMessageRef.revision_id,
        		target_uuid : newMessageRef.uuid
			});
		}
		
		if (newSiteInfoOptionRef.id) {
			node.entity.field_site_info_options.push({
				target_id: newSiteInfoOptionRef.id,
				target_type: "paragraph",
        		target_revision_id : newSiteInfoOptionRef.revision_id,
        		target_uuid : newSiteInfoOptionRef.uuid
			});
		}
	
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
};

var checkSave = function() {
	Ti.API.info('*** checkSave ***');
	Ti.API.info('*** messageOptionsChecked = ' + messageOptionsChecked);
	Ti.API.info('*** siteInfoOptionsChecked = ' + siteInfoOptionsChecked);
	if (messageOptionsChecked && siteInfoOptionsChecked) {
		Ti.API.info('Heading to saveDeviceProfileNode...');
		var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
		var nid = deviceInfo[Ti.App.Properties.getInt("deviceIndex")].nid_export;
		Ti.API.info('nid = ' + nid);
		saveDeviceProfileNode(nid);
	}
	if (!nodeDirty) {
		Alloy.Globals.loading.hide();
		goHome();
		return;
	}
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
	if (Ti.App.Properties.getBool('autoAssetCacheSync') != deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_auto_asset_cache_sync) {
		deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_auto_asset_cache_sync = Ti.App.Properties.getBool('autoAssetCacheSync');
		nodeDirty = true;
	}
	if (Ti.App.Properties.getInt('syncInterval') != deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_sync_interval) {
		deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_sync_interval = Ti.App.Properties.getInt('syncInterval');
		nodeDirty = true;
	}

	//if ($.appValue.value != deviceInfo[Ti.App.Properties.getInt("deviceIndex")].construction_app) {
		Ti.App.Properties.setString('constructionApp', $.appValue.value);
	//}
	//if ($.projectValue.value != deviceInfo[Ti.App.Properties.getInt("deviceIndex")].project) {
		Ti.App.Properties.setString('project', $.projectValue.value);
	//}
	
	// Update Messages & Site Info Options
	if (messageOptions) {
		for (var i = 0; i < deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export.length; i++) {
			if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export[i] != messageOptions[i]) {
				messageOptionsDirty = true;
				// Get indexes of changed items and store them
				dirtyMessagesIndex.push(i);
			}
			// Update and add any new messages to local data store
			deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export = messageOptions;
		}
	}
	if (siteInfoOptions) {
		for (var i = 0; i < deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export.length; i++) {
			if (deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export[i] != siteInfoOptions[i]) {
				siteInfoOptionsDirty = true;
				// Get indexes of changed items and store them
				dirtySiteInfoOptionsIndex.push(i);
			}
			// Update and add any new messages to local data store
			deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export = siteInfoOptions;
		}
	}
	
	// Flag that we've made configurations
	Ti.App.Properties.setBool('configured', true);

	if (nodeDirty || messageOptionsDirty || siteInfoOptionsDirty) {
		// Save deviceInfo properties object changes.
		Ti.App.Properties.setObject('deviceInfo', deviceInfo);
		global.setDeviceConfig();
	}

	if (newMessage) {
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
		paragraph.save().then(function(results) {
			//Ti.API.info('paragraph results = ' + JSON.stringify(results));
			var createdParagraph = JSON.parse(results.responseData.text);
			newMessageRef.id = createdParagraph.id ? createdParagraph.id[0].value : null;
			newMessageRef.uuid = createdParagraph.uuid ? createdParagraph.uuid[0].value : null;
			newMessageRef.revision_id = createdParagraph.revision_id ? createdParagraph.revision_id[0].value : null;
			messageOptionsChecked = true;
			// Only use saveDeviceProfileNode(nid) from timeout after all conditions completed.
			$.trigger('checkSave');
		});
	} else if (messageOptionsDirty) {
		// Check if at least dirty if not new and resave with changes before stating messageOptionsChecked.
		// TODO:  Only set messageOptionsChecked after all items in below loop have been checked.
		for (optIndex in dirtyMessagesIndex) {
			global.jDrupal.paragraphLoad(deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_superintendent_sms_message_export[optIndex].id).then(function(paragraph) {
				Ti.API.info('paragraph = ' + JSON.stringify(paragraph));
				// Remove protected fields
				paragraph = removeProtectedFields(paragraph);
		
				// Update field values
				paragraph.entity.field_option_label = [{value: messageOptions[optIndex].option_label}];
				paragraph.entity.field_message = [{value: messageOptions[optIndex].message}];
	
				// Save device profile with updated field values and report back then head home after Okay.
				paragraph.save().then(function(resp) {
					Ti.API.info('Saved paragraph.');
					// Only use saveDeviceProfileNode(nid) from timeout after all conditions completed.
					messageOptionsChecked = true;
					$.trigger('checkSave');
				});
			});
		}
	} else {
		messageOptionsChecked = true;
	}
	
	if (newSiteInfoOption) {
		// If we're adding completely new stuff to the deviceInfo profile node, then we set the node as dirty so it'll resave it later.
		nodeDirty = true;
		
		// Build & Save new siteInfoOption paragraph
		var paragraph = new global.jDrupal.Paragraph({
			type: [{
				target_id: siteInfoOptions[siteInfoOptions.length - 1].link_url ? 'link_component' : 'text_component',
				target_type: 'paragraphs_type'
			}],
			field_option_label: [{value: siteInfoOptions[siteInfoOptions.length - 1].option_label}],
			parent_id: [{value: nid}],
		    parent_type: [{value: "node"}],
		    parent_field_name: [{value: "field_site_info_options"}]
		});
		if (paragraph.entity.type[0].target_id == 'link_component') {
			paragraph.entity.field_link_url = [{uri: siteInfoOptions[siteInfoOptions.length - 1].link_url.url}];
		}
		if (paragraph.entity.type[0].target_id == 'text_component') {
			paragraph.entity.field_text = [{value: siteInfoOptions[siteInfoOptions.length - 1].text}];
		}
		paragraph.save().then(function(results) {
			//Ti.API.info('paragraph results = ' + JSON.stringify(results));
			var createdParagraph = JSON.parse(results.responseData.text);
			Ti.API.info('createdParagraph = ' + JSON.stringify(createdParagraph));
			newSiteInfoOptionRef.id = createdParagraph.id ? createdParagraph.id[0].value : null;
			newSiteInfoOptionRef.uuid = createdParagraph.uuid ? createdParagraph.uuid[0].value : null;
			newSiteInfoOptionRef.revision_id = createdParagraph.revision_id ? createdParagraph.revision_id[0].value : null;
			siteInfoOptionsChecked = true;
			// Only use saveDeviceProfileNode(nid) from timeout after all conditions completed.
			$.trigger('checkSave');
		});
	} else if (siteInfoOptionsDirty) {
		// Check if at least dirty if not new and resave with changes before stating messageOptionsChecked.
		// TODO:  Only set siteInfoOptionsChecked after all items in below loop have been checked.
		for (optIndex in dirtySiteInfoOptionsIndex) {
			global.jDrupal.paragraphLoad(deviceInfo[Ti.App.Properties.getInt("deviceIndex")].field_site_info_options_export[optIndex].id).then(function(paragraph) {
				Ti.API.info('paragraph = ' + JSON.stringify(paragraph));
				// Remove protected fields
				paragraph = removeProtectedFields(paragraph);
		
				// Update field values (Fields depend on type)
				paragraph.entity.field_option_label = [{value: siteInfoOptions[optIndex].option_label}];
				paragraph.entity.field_link_url = [{uri: siteInfoOptions[optIndex].link_url.url ? siteInfoOptions[optIndex].link_url.url : null}];
				paragraph.entity.field_text = [{value: siteInfoOptions[optIndex].text ? siteInfoOptions[optIndex].text : null}];
	
				// Save device profile with updated field values and report back then head home after Okay.
				paragraph.save().then(function(resp) {
					Ti.API.info('Saved paragraph.');
					// Only use saveDeviceProfileNode(nid) from timeout after all conditions completed.
					siteInfoOptionsChecked = true;
					$.trigger('checkSave');
				});
			});
		}
	} else {
		siteInfoOptionsChecked = true;
	}
	Ti.API.info('Heading to default checkSave...');
	$.trigger('checkSave');
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
		} else {
			newMessage = false;
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
	if (values.length > options.length) {
		if (values[options.length]["option_label_" + (options.length + 1)] != '' && values[options.length]["external_url_" + (options.length + 1)] != '') {
			options.push({
				bundle: 'link_component',
				option_label: values[options.length]["option_label_" + (options.length + 1)],
				link_url: {url: values[options.length]["external_url_" + (options.length + 1)]}
			});
			newSiteInfoOption = true;
		} else if (values[options.length]["option_label_" + (options.length + 1)] != '' && values[options.length]["composed_text_" + (options.length + 1)] != '') {
			options.push({
				bundle: 'text_component',
				option_label: values[options.length]["option_label_" + (options.length + 1)],
				text: values[options.length]["composed_text_" + (options.length + 1)]
			});
			newSiteInfoOption = true;
		} else {
			newSiteInfoOption = false;
			//alert(L('fields_empty'));
		}
	}
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
				row : {height: Ti.UI.SIZE},
				label : L('option_label'),
				value : global.UTIL.cleanString(options[i].option_label),
				type : 'text',
				hintText: L('option_hint')
			}, {
				name : 'message' + '_' + (i+1),
				row : {height: Ti.UI.SIZE},
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
			row : {height: Ti.UI.SIZE},
			label : L('option_label'),
			type : 'text',
			hintText: L('option_hint')
		}, {
			name : 'message' + '_' + (options.length + 1),
			row : {height: Ti.UI.SIZE},
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

var alignSiteInfoOptionsInterface = function(e) {
	Ti.API.info('Attempting to update form element classes...');
	var values = widget.getValues();
	if (values[values.length - 1]['external_url_' + values.length] != '') {
		$.addClass(widget.getField('composed_text_' + values.length).getView(), 'hidden');
	}
	if (values[values.length - 1]['composed_text_' + values.length] != '') {
		$.addClass(widget.getField('external_url_' + values.length).getView(), 'hidden');
	}
	if (values[values.length - 1]['external_url_' + values.length] == '' && values[values.length - 1]['composed_text_' + values.length] == '') {
		$.removeClass(widget.getField('external_url_' + values.length).getView(), 'hidden');
		$.removeClass(widget.getField('composed_text_' + values.length).getView(), 'hidden');
	}
};

var view_edit_siteInfo_options = function() {
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
				val = options[i].file.media_document;
				typ = 'text';
				break;
		}
		fieldset = {
			legend: L('option') + ' ' + (i+1),
			fields: [{
				name : 'option_label' + '_' + (i+1),
				row : {height: Ti.UI.SIZE},
				label : L('option_label'),
				value : global.UTIL.cleanString(options[i].option_label),
				type : 'text',
				hintText: L('option_hint'),
				input: {editable: options[i].bundle != 'uploaded_component'}
			}, {
				name : labId + '_' + (i+1),
				row : {height: Ti.UI.SIZE},
				label : global.UTIL.cleanString(valLabel),
				value : global.UTIL.htmlDecode(val),
				type : typ,
				hintText: hint,
				input: {editable: options[i].bundle != 'uploaded_component'}
			}]
		};
		//if (options[i].bundle != 'uploaded_component') {
			fieldsets.push(fieldset);
		//}
	}
	fieldset = {
		legend: L('option') + ' ' + (options.length + 1),
		fields: [{
			name : 'option_label' + '_' + (options.length + 1),
			row : {height: Ti.UI.SIZE},
			label : L('option_label'),
			type : 'text',
			hintText: L('option_hint')
		}, {
			name : 'external_url' + '_' + (options.length + 1),
			row : {height: Ti.UI.SIZE},
			label : global.UTIL.cleanString(L('external_url')) + L('or'),
			type : 'text',
			hintText: 'https://www.example.com/foo.html',
			listener: alignSiteInfoOptionsInterface
		}, {
			name : 'composed_text' + '_' + (options.length + 1),
			row : {height: Ti.UI.SIZE},
			label : global.UTIL.cleanString(L('composed_text')),
			type : 'textarea',
			hintText: L('composed_text_hint'),
			listener: alignSiteInfoOptionsInterface
		}]
	};
	fieldsets.push(fieldset);
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

var toggleAutoAssetCacheSync = function() {
	var deviceInfo = Ti.App.Properties.getObject('deviceInfo');
	Ti.App.Properties.setBool('autoAssetCacheSync', !Ti.App.Properties.getBool('autoAssetCacheSync', false));
};

var saveInterval = function(e) {
	switch(e.data[0].value) {
		case 'Every 2 hours':
			Ti.App.Properties.setInt('syncInterval', 2);
			break;
			
		case 'Every 8 hours':
			Ti.App.Properties.setInt('syncInterval', 8);
			break;
			
		case 'Once per day':
		default:
			Ti.App.Properties.setInt('syncInterval', 24);
			break;
	}
};

var showIntervalOptions = function() {
/*
	2|Every 2 hours
	8|Every 8 hours
	24|Once per day
*/
	var opts = [
		{option_label: 'Every 2 hours'},
		{option_label: 'Every 8 hours'},
		{option_label: 'Once per day'},
	];
	global.showOptions(L('interval'), opts, $, saveInterval);
};


$.deviceNameValue.value = Ti.App.Properties.getString('deviceName');
$.appValue.value = Ti.App.Properties.getString('constructionApp');
$.projectValue.value = Ti.App.Properties.getString('project');
$.superNameValue.value = Ti.App.Properties.getString('superName');
$.superPhoneValue.value = Ti.App.Properties.getString('superPhone');
$.adminSecretValue.value = Ti.App.Properties.getString('admin_secret');
$.autoAssetCacheSyncValue.value = Ti.App.Properties.getBool('autoAssetCacheSync');

$.appValue.addEventListener('focus', selectApp);
$.projectValue.addEventListener('focus', selectProject);

$.on('checkSave', checkSave);
