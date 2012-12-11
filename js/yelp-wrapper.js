/**
 * @author Robert
 */

var auth = {
	consumerKey: "jCnzi9pusNImnVhcXZH1CQ", 
	consumerSecret: "d23FQe0-zp7qJrOhjir38s3P0JE",
	accessToken: "VJOXYgYA3MAH5OTTK_u4JtwFim_GIN7m",
	accessTokenSecret: "tpS4CSD1aqK_jwH5SztNSdJy8EA",
	serviceProvider: { 
		signatureMethod: "HMAC-SHA1"
	}
};

var accessor = {
		consumerSecret: auth.consumerSecret,
		tokenSecret: auth.accessTokenSecret
};

/*
 * The Main function
 * Takes a query a zip and a 
 */
function searchAndDo(query, zip, offset, fun, catagories){
	var parameters = getParameters( query, zip, offset, catagories );
	var message = { 
		'action': 'http://api.yelp.com/v2/search',
		'method': 'GET',
		'parameters': parameters 
	};
	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);
	var parameterMap = OAuth.getParameterMap(message.parameters);
	parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
	console.log(parameterMap);

	query += " food restaurant ";
	
	function queryYelp(
		    fun) {
		        return $.ajax({
		        'url': message.action,
		        'data': parameterMap,
		        'cache': true,
		        'dataType': 'jsonp',
		        'jsonpCallback': 'cb',
		    })
		    .done(fun)
		    .fail(function() { alert ('Yelp has failed to return data'); });
	}
	queryYelp(fun);

}

/*
 * Create the parameters to call Yelp with
 */
function getParameters( query, zip, offset, cata ){
	var para = [];
	para.push(['term', query]);
	para.push(['location', zip]);
	para.push(['offset', offset]);
	if (typeof(cata) != 'undefined' && cata.length > 2)
		para.push(['category_filter', cata]);
	para.push(['callback', 'cb']);
	para.push(['oauth_consumer_key', auth.consumerKey]);
	para.push(['oauth_consumer_secret', auth.consumerSecret]);
	para.push(['oauth_token', auth.accessToken]);
	para.push(['oauth_signature_method', 'HMAC-SHA1']);
	return para;
}