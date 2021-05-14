// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goBack = function() {
    Titanium.Android.currentActivity.finish();
};

var checkConfirmation = function() {
	if ($.getView().parent.id != 'rfi_entry' && !($.getView().parent.id == 'rfi_view' && $.getView().parent.editMode)) {
		goBack();
		return;
	}
	var arg = {
		title : L('cancel'),
		container : $.getView().parent,
		callback : goBack
	};
	var messageWrapper = $.UI.create('View', {layout: 'vertical'});
	var message = $.UI.create('Label', {top: '40%', text: L('cancel_confirmation')});
	var returnToEditBtn = $.UI.create('Label', {top: '10', height: '40', width: '60', classes: ['btnText', 'no', 'lesserOption']});
	returnToEditBtn.addEventListener('click', function() {
		$.getView().parent.remove(commonView);
	});
	var commonView = Alloy.createController('commonView', arg).getView();
	messageWrapper.add(message);
	messageWrapper.add(returnToEditBtn);
	commonView.getViewById('contentWrapper').add(messageWrapper);
	$.getView().parent.add(commonView);
};

$.lbl_backCorner.html = '<font color="#ff9200">❮</font>&nbsp;' + L('back');
