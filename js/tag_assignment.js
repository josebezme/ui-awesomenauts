function hideTagIt(){
	$("#screen").css('display', 'none');
	$("#tagit").css('display', 'none');
}

function showTagIt(){
	$("#screen").css('display', 'block');
	$("#tagit").css('display', 'block');
}

function tagIt_addTag(e) {
	var $e = $(e);
	var tag = e.id;


	
	$e.attr('onclick', '').unbind('click');

	$e.remove();
	$e.appendTo($('#tagit-chosen-tags'));
	$('#tagit-chosen-tags').append(" ");
	$remove = $e.find($('.tag-remove'));
	$remove.css('display', 'inline');
	$e.removeClass('tag-clickable');

	tagIt_removeTagFromOthers(tag);
}

function tagIt_removeTagFromOthers(tag) {
	$('#tagit-recommended-tags span.tag').each(function(key, val){ 
		if(val.id == tag) {
			$(val).remove();
		}
	});

	$('#tagit-existing-tags span.tag').each(function(key, val){ 
		if(val.id == tag) {
			$(val).remove();
		}
	});
}

function tagIt_createTag() {
	createChosenTagByName($("#new-tag").val());
	$("#new-tag").val("");
	$("#new-tag").attr("placeholder", "type new tag name...");
	return false;
}

function createChosenTagByName(tag) {
	$("#tagit-chosen-tags").append('<span id="' + tag + '" class="tag">' + tag + 
		'<button class="close tag-remove" onclick="return tagIt_removeTag(this,\'' + tag + 
		'\');">&times;</button></span> ');
}

function createSelectableTagByName(tag, dest) {
	$("#" + dest).append(
		'<span id="' + tag + '" class="tag tag-clickable"  onclick="tagIt_addTag(this);">' 
		+ tag + 
		'<button class="close tag-remove" style="display: none;" onclick="return tagIt_removeTag(this,\'' + tag + 
		'\');">&times;</button></span> ');
}

function tagIt_removeTag(e, tagname) {
	$e = $(e);
	$tag = $e.parent();
	$remove = $tag.find($('.tag-remove'));
	$remove.css('display', 'none');
	$tag.addClass('tag-clickable');

	if(containsRecommend(tagIt_obj, tagname)) {
		createSelectableTagByName(tagname, "tagit-recommended-tags");
	}


	if(tagIt_isExistingTag(tagname)) {
		createSelectableTagByName(tagname, "tagit-existing-tags");
	}

	$tag.remove();
}

function tagIt_submitTags(cb) {
	var tags = [];
	$('#tagit-chosen-tags span.tag').each(function(key, val){ 
		tags.push(val.id.toLowerCase());
	});

	tagIt_obj.tags = tags;
	updateTags(tagIt_obj, function(success) {
		if(cb) {
			cb();
		}
	});

	hideTagIt();

	return false;
}

var tagIt_tags;
function tagIt_loadExistingTags() {
	$('#tagit-existing-tags').empty();
	getTags(function(tags){
		tagIt_tags = tags;
		for(var i = 0; i < tags.length; i++) {
			if(!containsTag(tagIt_obj, tags[i])) {
				createSelectableTagByName(tags[i], "tagit-existing-tags");	
			}
		}
	});
}

function tagIt_isExistingTag(tag) {
	for(var i = 0; i < tagIt_tags.length; i++) {
		if(tagIt_tags[i] == tag) {
			return true;
		}
	}
	return false;
}

function loadRecommendedTags(obj) {
	$('#tagit-recommended-tags').empty();
	var cats = obj.yelp_obj.categories;
	for(var i = 0; i < cats.length; i++) {
		var tag = cats[i][1];
		if(!containsTag(obj, tag)) {
			createSelectableTagByName(tag, "tagit-recommended-tags");
		}
	}
}

function containsRecommend(obj, tag) {
	var cats = obj.yelp_obj.categories;
	for(var i = 0; i < cats.length; i++) {
		if(cats[i][1] == tag) {
			return true;
		}
	}
}

function containsTag(obj, tag) {
	for(var i = 0; i < obj.tags.length; i++) {
		if(obj.tags[i] == tag) {
			return true;
		}
	}

	return false;
}

var tagIt_obj;

function tagItLoad(obj) {
	tagIt_obj = obj;
	$('#tagit-business-name').text(obj.yelp_obj.name);

	$('#tagit-chosen-tags').empty();

	getTagsForId(tagIt_obj.yelp_obj.id, function(results) {
		tagIt_obj.tags = results;
		for(var i = 0; i < tagIt_obj.tags.length; i++) {
			createChosenTagByName(tagIt_obj.tags[i]);
		}

		loadRecommendedTags(tagIt_obj);
		tagIt_loadExistingTags();
	});
}

function startTagItWithObject(obj) {
	showTagIt();
	tagItLoad(obj);

	return false;
}

function startTagIt(results, idx) {
	var yelpObj = results[idx];

	showTagIt();
	var obj = {
		"yelp_obj": yelpObj,
		"tags": []
	};

	tagItLoad(obj);

	return false;
}





