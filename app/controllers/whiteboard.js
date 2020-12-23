// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var matrix = Ti.UI.createMatrix2D().rotate(-90)
$.Label_color.transform = matrix;

var Paint = require('ti.paint');

var paintView = Paint.createPaintView({ 
	backgroundColor: '#fff',
    strokeColor:'#000',
    strokeAlpha:255,
    strokeWidth:10,
    eraseMode:false
});
$.canvas.add(paintView);

var buttonStrokeWidth = Ti.UI.createButton({ left:10, bottom:10, right:10, height:30, title:'Decrease Stroke Width' });
buttonStrokeWidth.addEventListener('click', function(e) {
	paintView.strokeWidth = (paintView.strokeWidth === 10) ? 5 : 10;
	e.source.title = (paintView.strokeWidth === 10) ? 'Decrease Stroke Width' : 'Increase Stroke Width';
});
$.whiteboard.add(buttonStrokeWidth);

var buttonStrokeColorRed = Ti.UI.createButton({ bottom:100, left:10, width:75, height:30, title:'Red' });
buttonStrokeColorRed.addEventListener('click', function() { paintView.strokeColor = 'red'; });
var buttonStrokeColorGreen = Ti.UI.createButton({ bottom:70, left:10, width:75, height:30, title:'Green' });
buttonStrokeColorGreen.addEventListener('click', function() { paintView.strokeColor = '#0f0'; });
var buttonStrokeColorBlue = Ti.UI.createButton({ bottom:40, left:10, width:75, height:30, title:'Blue' });
buttonStrokeColorBlue.addEventListener('click', function() { paintView.strokeColor = '#0000ff'; });
$.whiteboard.add(buttonStrokeColorRed);
$.whiteboard.add(buttonStrokeColorGreen);
$.whiteboard.add(buttonStrokeColorBlue);

var clear = Ti.UI.createButton({ bottom:40, left:100, width:75, height:30, title:'Clear' });
clear.addEventListener('click', function() { paintView.clear(); });
$.whiteboard.add(clear);

var buttonStrokeAlpha = Ti.UI.createButton({ bottom:70, right:10, width:100, height:30, title:'Alpha : 100%' });
buttonStrokeAlpha.addEventListener('click', function(e) {
	paintView.strokeAlpha = (paintView.strokeAlpha === 255) ? 127 : 255;
	e.source.title = (paintView.strokeAlpha === 255) ? 'Alpha : 100%' : 'Alpha : 50%';
});
$.whiteboard.add(buttonStrokeAlpha);

var buttonStrokeColorEraser = Ti.UI.createButton({ bottom:40, right:10, width:100, height:30, title:'Erase : Off' });
buttonStrokeColorEraser.addEventListener('click', function(e) {
	paintView.eraseMode = (paintView.eraseMode) ? false : true;
	e.source.title = (paintView.eraseMode) ? 'Erase : On' : 'Erase : Off';
});
$.whiteboard.add(buttonStrokeColorEraser);


