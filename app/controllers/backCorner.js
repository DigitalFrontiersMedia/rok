// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var goBack = function() {
    Titanium.Android.currentActivity.finish();
};

$.lbl_backCorner.html = '<font color="#ff9200">❮</font>&nbsp;' + L('back');
