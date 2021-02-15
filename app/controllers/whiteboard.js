// 
//  whiteboard.js
//  ROK
//  
//  Created by S.Barker on 2020-11-17.
//  Copyright 2020 S.Barker. All rights reserved.
// 

// TODO:  Add button icons.
// TODO:  Recompile Paint to fix strokeWidth.
// TODO:  Determine method for adding pre-fab circle/squares.
// TODO:  Add clear button?

// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var lastColor = '#000000';

var matrix = Ti.UI.createMatrix2D().rotate(-90);
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


$.imgBtn_red.addEventListener('click', function() { paintView.strokeColor = '#ff0000'; });
$.imgBtn_orange.addEventListener('click', function() { paintView.strokeColor = '#ffa500'; });
$.imgBtn_yellow.addEventListener('click', function() { paintView.strokeColor = '#ffff00'; });
$.imgBtn_green.addEventListener('click', function() { paintView.strokeColor = '#00ff00'; });
$.imgBtn_blue.addEventListener('click', function() { paintView.strokeColor = '#0000ff'; });
$.imgBtn_black.addEventListener('click', function() { paintView.strokeColor = '#000000'; });

//clear.addEventListener('click', function() { paintView.clear(); });


$.imgBtn_draw.addEventListener('click', function(e) {
	paintView.strokeColor = lastColor;
	paintView.eraseMode = false;
});
$.imgBtn_erase.addEventListener('click', function(e) {
	lastColor = paintView.strokeColor;
	paintView.eraseMode = true;
	//paintView.strokeWidth = 20;
});


