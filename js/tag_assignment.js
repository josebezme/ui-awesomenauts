function hideTagIt(){
	$("#screen").css('visibility', 'hidden');
	$("#tagit").css('visibility', 'hidden');
}

function showTagIt(){
	$("#screen").css('visibility', 'visible');
	$("#tagit").css('visibility', 'visible');
}

function addTag(e) {
	var $e = $(e);
	var tag = e.id;
	
	$e.attr('onclick', '').unbind('click');

	$e.remove();
	$e.appendTo($('#chosen-tags'));
	$remove = $e.find($('.tag-remove'));
	$remove.css('display', 'inline');
	$e.removeClass('tag-clickable');

	removeTagFromOthers(tag);
}

function removeTagFromOthers(tag) {
	$('#recommended-tags span.tag').each(function(key, val){ 
		if(val.id == tag) {
			$(val).remove();
		}
	});

	$('#existing-tags span.tag').each(function(key, val){ 
		if(val.id == tag) {
			$(val).remove();
		}
	});
}

function createTag() {
	createChosenTagByName($("#new-tag").val());
	$("#new-tag").val("");
	$("#new-tag").attr("placeholder", "type new tag name...");
	return false;
}

function createChosenTagByName(tag) {
	$("#chosen-tags").append('<span id="' + tag + '" class="tag">' + tag + '<span class="tag-remove"> | <a href="#" onclick="removeTag(this,\'' + tag + '\');">X</a></span></span>');
}

function createSelectableTagByName(tag, dest) {
	$("#" + dest).append('<span id="' + tag + '" class="tag tag-clickable"  onclick="addTag(this);">' + tag + '<span style="display:none;" class="tag-remove"> | <a href="#" onclick="removeTag(this,\'' + tag + '\');">X</a></span></span>');
}

function removeTag(e, tagname) {
	$e = $(e);
	$tag = $e.parent().parent();
	$remove = $tag.find($('.tag-remove'));
	$remove.css('display', 'none');
	$tag.addClass('tag-clickable');

	if(containsRecommend(tagIt_obj, tagname)) {
		createSelectableTagByName(tagname, "recommended-tags");
	}


	if(isExistingTag(tagname)) {
		createSelectableTagByName(tagname, "existing-tags");
	}

	$tag.remove();
}

function submitTags() {
	var tags = [];
	$('#chosen-tags span.tag').each(function(key, val){ 
		tags.push(val.id.toLowerCase());
	});

	tagIt_obj.tags = tags;
	updateTags(tagIt_obj, function(success) {});

	return false;
}

var tagIt_tags;
function loadExistingTags() {
	getTags(function(tags){
		tagIt_tags = tags;
		for(var i = 0; i < tags.length; i++) {
			if(!containsTag(tagIt_obj, tags[i])) {
				createSelectableTagByName(tags[i], "existing-tags");	
			}
		}
	});
}

function isExistingTag(tag) {
	for(var i = 0; i < tagIt_tags.length; i++) {
		if(tagIt_tags[i] == tag) {
			return true;
		}
	}
	return false;
}

function loadRecommendedTags(obj) {
	var cats = obj.yelp_obj.categories;
	for(var i = 0; i < cats.length; i++) {
		var tag = cats[i][1];
		if(!containsTag(obj, tag)) {
			createSelectableTagByName(tag, "recommended-tags");
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
	$('#business-name').text(obj.yelp_obj.name);

	getTagsForId(tagIt_obj.yelp_obj.id, function(results) {
		tagIt_obj.tags = results;
		for(var i = 0; i < tagIt_obj.tags.length; i++) {
			createChosenTagByName(tagIt_obj.tags[i]);
		}

		loadRecommendedTags(tagIt_obj);
		loadExistingTags();
	});
}