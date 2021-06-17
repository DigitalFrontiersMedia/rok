/**
 * Checks to see if an item in the cache is stale or fresh
 * @param {String} [_url] The URL of the file we're checking
 * @param {Integer} [_time] The time, in minutes, to consider 'warm' in the cache
 */
exports.isStale = function(_url, _time) {
	var db = Ti.Database.open("ChariTi");
	var time = new Date().getTime();
	var cacheTime = typeof _time !== "undefined" ? _time : 5;
	var freshTime = time - (cacheTime * 60 * 1000);
	var lastUpdate = 0;

	var data = db.execute("SELECT time FROM updates WHERE url = " + exports.escapeString(_url) + " ORDER BY time DESC LIMIT 1;");

	while(data.isValidRow()) {
		lastUpdate = data.fieldByName("time");

		data.next();
	}

	data.close();
	db.close();

	if(lastUpdate === 0) {
		return "new";
	} else if(lastUpdate > freshTime) {
		return false;
	} else {
		return true;
	}
};

/**
 * Returns last updated time for an item in the cache
 * @param {String} [_url] The URL of the file we're checking
 */
exports.lastUpdate = function(_url) {
	var db = Ti.Database.open("ChariTi");
	var lastUpdate = 0;

	var data = db.execute("SELECT time FROM updates WHERE url = " + exports.escapeString(_url) + " ORDER BY time DESC LIMIT 1;");

	while(data.isValidRow()) {
		lastUpdate = data.fieldByName("time");

		data.next();
	}

	data.close();
	db.close();

	if(lastUpdate === 0) {
		return new Date().getTime();
	} else {
		return lastUpdate;
	}
};

/* open remote window */
exports.showpage = function(_name,_link){
	
	Ti.API.debug("link: "+_link);
	var modalwin = Ti.UI.createWindow({
	    	titleControl: Ti.UI.createLabel({
		        text: _name,
		        color:'#000'
		    }),
			navTintColor : '#000'
	});
	dialogbrowser = Titanium.UI.createOptionDialog({
			options:["Open External Browser", "close"],
			destructive:1,
			cancel:1
	});
	dialogbrowser.addEventListener('click',function(event)
	{
		//thissavesec = "news";
		//thissaveid = e.row.nid;
		if (event.index!=1){
			Ti.Platform.openURL(_link);
		}
	});
	var bactiont = Titanium.UI.createButton({
		systemButton:Titanium.UI.iPhone.SystemButton.ACTION
	});
	bactiont.addEventListener('click', function()
	{
		dialogbrowser.show();
	});
	modalwin.rightNavButton = bactiont;
	
	var modalwebwin = Ti.UI.createWebView({
		url : _link
	});
	modalwin.add(modalwebwin);
	if(Alloy.Globals.isAndroid) {
		modalwin.open();
	} else {
		var navWin = Titanium.UI.iOS.createNavigationWindow({
		    modal: true,
		    window: modalwin,
		});
		var backbutton = Titanium.UI.createButton({
		    title:'X'
		});
		backbutton.addEventListener('click', function() {
		 navWin.close();
		});
		modalwin.leftNavButton = backbutton;
		navWin.open();
	}
};

/**
 * Escapes a string for SQL insertion
 * @param {String} [_string] The string to perform the action on
 */
exports.escapeString = function(_string) {
	if(typeof _string !== "string") {
		return "\"" + _string + "\"";
	}

	return exports.c2ncr("\"" + _string.replace(/"/g, "'") + "\"");
};

/**
 * Removes HTML entities, replaces breaks/paragraphs with newline, strips HTML, trims
 * @param {String} [_string] The string to perform the action on
 */
exports.cleanString = function(_string) {
	if(typeof _string !== "string") {
		return _string;
	}

	_string = _string.replace(/&amp;*/ig, "&");
	_string = exports.htmlDecode(_string);
	_string = _string.replace(/\s*<br[^>]*>\s*/ig, "\n");
	_string = _string.replace(/\s*<\/p>*\s*/ig, "\n\n");
	_string = _string.replace(/<a[^h]*href=["']{1}([^'"]*)["']{1}>([^<]*)<\/a>/ig, "$2 [$1]");
	_string = _string.replace(/<[^>]*>/g, "");
	_string = _string.replace(/\s*\n{3,}\s*/g, "\n\n");
	_string = _string.replace(/[^\S\n]{2,}/g, " ");
	_string = _string.replace(/\n[^\S\n]*/g, "\n");
	_string = _string.replace(/^\s+|\s+$/g, "");

	return exports.ncr2c(_string);
};

/**
 * Combination of clean and escape string
 * @param {String} [_string] The string to perform the action on
 */
exports.cleanEscapeString = function(_string) {
	_string = exports.cleanString(_string);

	return exports.escapeString(_string);
};

exports.truncateDecimals = function(_number, _digits) {
	var multiplier = Math.pow(10, _digits),
		adjustedNum = _number * multiplier,
		truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

	return truncatedNum / multiplier;
};

exports.prettyUSPhone = function(_number) {
	return _number.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

exports.callableUSPhone = function(_number) {
	return 'tel:' + _number.replace(/[^\d]/g, ""); //replace(/(\d{3})(\d{3})(\d{4})/, 'tel:1-$1-$2-$3');
};

// get the distance bewteen two places uses the Haversine Formula
exports.findDistance = function(_args) {
	// set some vars
	var t1, n1, t2, n2, lat1, lng1, lat2, lng2, dlat, dlng, a, c, dm, mi, Rm;

	// earth radius at 39 degrees
	Rm = 3961;

	// get values for lat1, lng1, lat2, and lng2
	t1 = _args.userlat;
	n1 = _args.userlng;
	t2 = _args.placelat;
	n2 = _args.placelng;

	// convert coordinates to radians
	lat1 = deg2rad(t1);
	lng1 = deg2rad(n1);
	lat2 = deg2rad(t2);
	lng2 = deg2rad(n2);

	// find the differences between the coordinates
	dlat = lat2 - lat1;
	dlng = lng2 - lng1;

	// do the math
	a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlng / 2), 2);
	c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great circle distance in radians
	dm = c * Rm; // great circle distance in miles

	mi = round(dm);

	return mi;
};

function deg2rad(deg) {
	rad = deg * Math.PI / 180; // radians = degrees * pi/180
	return rad;
}

// round to the nearest 1/1000
function round(x) {
	return Math.round(x * 1000) / 1000;
}

/**
 * Cleans up nasty XML
 * @param {String} [_string] The XML string to perform the action on
 */
exports.xmlNormalize = function(_string) {
	_string = _string.replace(/&nbsp;*/ig, " ");
	_string = _string.replace(/&(?!amp;)\s*/g, "&amp;");
	_string = _string.replace(/^\s+|\s+$/g, "");
	_string = _string.replace(/<title>(?!<!\[CDATA\[)/ig, "<title><![CDATA[");
	_string = _string.replace(/<description>(?!<!\[CDATA\[)/ig, "<description><![CDATA[");
	_string = _string.replace(/(\]\]>)?<\/title>/ig, "]]></title>");
	_string = _string.replace(/(\]\]>)?<\/description>/ig, "]]></description>");

	return _string;
};

/**
 * Decodes HTML entities
 * @param {String} [_string] The string to perform the action on
 */
exports.htmlDecode = function(_string) {
	var tmp_str = _string.toString();
	var hash_map = exports.htmlTranslationTable();
	var results = tmp_str.match(/&#\d*;/ig);

	if(results) {
		for(var i = 0, x = results.length; i < x; i++) {
			var code = parseInt(results[i].replace("&#", "").replace(";", ""), 10);

			hash_map[results[i]] = code;
		}
	}

	for(var entity in hash_map) {
		var symbol = String.fromCharCode(hash_map[entity]);

		tmp_str = tmp_str.split(entity).join(symbol);
	}

	return tmp_str;
};

/**
 * The HTML entities table used for decoding
 */
exports.htmlTranslationTable = function() {
	var entities = {
		"&#x2013;": "8211",
		"&#x2014;": "8212",
		"&#x2018;": "8216",
		"&#x2019;": "8217",
		"&#xae;": "174",
		"&amp;": "38",
		"&bdquo;": "8222",
		"&bull;": "8226",
		"&circ;": "710",
		"&dagger;": "8224",
		"&Dagger;": "8225",
		"&fnof;": "402",
		"&hellip;": "8230",
		"&ldquo;": "8220",
		"&lsaquo;": "8249",
		"&lsquo;": "8216",
		"&mdash;": "8212",
		"&ndash;": "8211",
		"&OElig;": "338",
		"&oelig;": "339",
		"&permil;": "8240",
		"&rdquo;": "8221",
		"&rsaquo;": "8250",
		"&rsquo;": "8217",
		"&sbquo;": "8218",
		"&scaron;": "353",
		"&Scaron;": "352",
		"&tilde;": "152",
		"&trade;": "8482",
		"&Yuml;": "376",
		"&Igrave;": "204",
		"&igrave;": "236",
		"&Iota;": "921",
		"&iota;": "953",
		"&Iuml;": "207",
		"&iuml;": "239",
		"&larr;": "8592",
		"&lArr;": "8656",
		"&Aacute;": "193",
		"&aacute;": "225",
		"&Acirc;": "194",
		"&acirc;": "226",
		"&acute;": "180",
		"&AElig;": "198",
		"&aelig;": "230",
		"&Agrave;": "192",
		"&agrave;": "224",
		"&alefsym;": "8501",
		"&Alpha;": "913",
		"&alpha;": "945",
		"&and;": "8743",
		"&ang;": "8736",
		"&Aring;": "197",
		"&aring;": "229",
		"&asymp;": "8776",
		"&Atilde;": "195",
		"&atilde;": "227",
		"&Auml;": "196",
		"&auml;": "228",
		"&Beta;": "914",
		"&beta;": "946",
		"&brvbar;": "166",
		"&cap;": "8745",
		"&Ccedil;": "199",
		"&ccedil;": "231",
		"&cedil;": "184",
		"&cent;": "162",
		"&Chi;": "935",
		"&chi;": "967",
		"&clubs;": "9827",
		"&cong;": "8773",
		"&copy;": "169",
		"&crarr;": "8629",
		"&cup;": "8746",
		"&curren;": "164",
		"&darr;": "8595",
		"&dArr;": "8659",
		"&deg;": "176",
		"&Delta;": "916",
		"&delta;": "948",
		"&diams;": "9830",
		"&divide;": "247",
		"&Eacute;": "201",
		"&eacute;": "233",
		"&Ecirc;": "202",
		"&ecirc;": "234",
		"&Egrave;": "200",
		"&egrave;": "232",
		"&empty;": "8709",
		"&emsp;": "8195",
		"&ensp;": "8194",
		"&Epsilon;": "917",
		"&epsilon;": "949",
		"&equiv;": "8801",
		"&Eta;": "919",
		"&eta;": "951",
		"&ETH;": "208",
		"&eth;": "240",
		"&Euml;": "203",
		"&euml;": "235",
		"&euro;": "8364",
		"&exist;": "8707",
		"&forall;": "8704",
		"&frac12;": "189",
		"&frac14;": "188",
		"&frac34;": "190",
		"&frasl;": "8260",
		"&Gamma;": "915",
		"&gamma;": "947",
		"&ge;": "8805",
		"&harr;": "8596",
		"&hArr;": "8660",
		"&hearts;": "9829",
		"&Iacute;": "205",
		"&iacute;": "237",
		"&Icirc;": "206",
		"&icirc;": "238",
		"&iexcl;": "161",
		"&image;": "8465",
		"&infin;": "8734",
		"&int;": "8747",
		"&iquest;": "191",
		"&isin;": "8712",
		"&Kappa;": "922",
		"&kappa;": "954",
		"&Lambda;": "923",
		"&lambda;": "955",
		"&lang;": "9001",
		"&laquo;": "171",
		"&lceil;": "8968",
		"&le;": "8804",
		"&lfloor;": "8970",
		"&lowast;": "8727",
		"&loz;": "9674",
		"&lrm;": "8206",
		"&macr;": "175",
		"&micro;": "181",
		"&middot;": "183",
		"&minus;": "8722",
		"&Mu;": "924",
		"&mu;": "956",
		"&nabla;": "8711",
		"&nbsp;": "160",
		"&ne;": "8800",
		"&ni;": "8715",
		"&not;": "172",
		"&notin;": "8713",
		"&nsub;": "8836",
		"&Ntilde;": "209",
		"&ntilde;": "241",
		"&Nu;": "925",
		"&nu;": "957",
		"&Oacute;": "211",
		"&oacute;": "243",
		"&Ocirc;": "212",
		"&ocirc;": "244",
		"&Ograve;": "210",
		"&ograve;": "242",
		"&oline;": "8254",
		"&Omega;": "937",
		"&omega;": "969",
		"&Omicron;": "927",
		"&omicron;": "959",
		"&oplus;": "8853",
		"&or;": "8744",
		"&ordf;": "170",
		"&ordm;": "186",
		"&Oslash;": "216",
		"&oslash;": "248",
		"&Otilde;": "213",
		"&otilde;": "245",
		"&otimes;": "8855",
		"&Ouml;": "214",
		"&ouml;": "246",
		"&para;": "182",
		"&part;": "8706",
		"&perp;": "8869",
		"&Phi;": "934",
		"&phi;": "966",
		"&Pi;": "928",
		"&pi;": "960",
		"&piv;": "982",
		"&plusmn;": "177",
		"&pound;": "163",
		"&prime;": "8242",
		"&Prime;": "8243",
		"&prod;": "8719",
		"&prop;": "8733",
		"&Psi;": "936",
		"&psi;": "968",
		"&radic;": "8730",
		"&rang;": "9002",
		"&raquo;": "187",
		"&rarr;": "8594",
		"&rArr;": "8658",
		"&rceil;": "8969",
		"&real;": "8476",
		"&reg;": "174",
		"&rfloor;": "8971",
		"&Rho;": "929",
		"&rho;": "961",
		"&rlm;": "8207",
		"&sdot;": "8901",
		"&sect;": "167",
		"&shy;": "173",
		"&Sigma;": "931",
		"&sigma;": "963",
		"&sigmaf;": "962",
		"&sim;": "8764",
		"&spades;": "9824",
		"&sub;": "8834",
		"&sube;": "8838",
		"&sum;": "8721",
		"&sup;": "8835",
		"&sup1;": "185",
		"&sup2;": "178",
		"&sup3;": "179",
		"&supe;": "8839",
		"&szlig;": "223",
		"&Tau;": "932",
		"&tau;": "964",
		"&there4;": "8756",
		"&Theta;": "920",
		"&theta;": "952",
		"&thetasym;": "977",
		"&thinsp;": "8201",
		"&THORN;": "222",
		"&thorn;": "254",
		"&tilde;": "732",
		"&times;": "215",
		"&Uacute;": "218",
		"&uacute;": "250",
		"&uarr;": "8593",
		"&uArr;": "8657",
		"&Ucirc;": "219",
		"&ucirc;": "251",
		"&Ugrave;": "217",
		"&ugrave;": "249",
		"&uml;": "168",
		"&upsih;": "978",
		"&Upsilon;": "933",
		"&upsilon;": "965",
		"&Uuml;": "220",
		"&uuml;": "252",
		"&weierp;": "8472",
		"&#xA;": "10",
		"&#xD;": "13",
		"&Xi;": "926",
		"&xi;": "958",
		"&Yacute;": "221",
		"&yacute;": "253",
		"&yen;": "165",
		"&yuml;": "255",
		"&Zeta;": "918",
		"&zeta;": "950",
		"&zwj;": "8205",
		"&zwnj;": "8204",
		"&quot;": "34",
		"&lt;": "60",
		"&gt;": "62"
	};

	return entities;
};

/**
 * Adds thousands separators to a number
 * @param {Integer} [_number] The number to perform the action on
 */
exports.formatNumber = function(_number) {
	_number = _number + "";

	x = _number.split(".");
	x1 = x[0];
	x2 = x.length > 1 ? "." + x[1] : "";

	var expression = /(\d+)(\d{3})/;

	while(expression.test(x1)) {
		x1 = x1.replace(expression, "$1" + "," + "$2");
	}

	return x1 + x2;
};

/**
 * Decodes numeric character references
 * @param {String} [_string] The string to perform the action on
 */
exports.ncr2c = function(_string) {
		return _string.replace( /&#x([\da-f]{2,4});/gi, function( $0, $1 ) { 
			return String.fromCharCode( "0x" + $1 ); 
		});
};

/**
 * Encodes numeric character references
 * @param {String} [_string] The string to perform the action on
 */
exports.c2ncr = function(_string) {
		return ncr2c(_string).replace( /./g, function( $0 ) { 
			return "&#x" + $0.charCodeAt( ).toString( 16 ).toUpperCase( ) + ";";
		});
};

/**
 * Finds index of matched target_id in entity reference field array
 * @param {String} [needle] The string to perform the action on
 * @param {Array} [haystack] The string to perform the action on
 */
exports.arrayTarget_search = function(needle, haystack) {
    for(var i in haystack) {
        if(haystack[i].target_id == needle) return i;
    }
    return -1;
};

/**
 * Sleep during an async-wrapped function
 * @param {Integer} [ms] The number of milliseconds to sleep
 */
exports.sleep = function(ms) {
  return new Promise(function(resolve, ms) {
  	setTimeout(resolve, ms);
  });
};
