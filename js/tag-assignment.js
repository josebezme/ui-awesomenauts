/**
 * Authors Philip and Robert
 */
	function showTagIt(){
		$('#tagIt').css("visibility", "visible");
		$('#screen').css("visibility", "visible");
	}
	
	function hideTagIt(){
		$('#tagIt').css("visibility", "hidden");
		$('#screen').css("visibility", "hidden");
	}

	function addTag(e) {
		var $e = $(e);
		
		$e.attr('onclick', '').unbind('click');

		$e.remove();
		$e.appendTo($('#chosen-tags'));
		$remove = $e.find($('.tag-remove'));
		$remove.css('display', 'inline');
		$e.removeClass('tag-clickable');
	}

	function createTag() {
		var $newtag = $("#new-tag").val();
		$("#chosen-tags").append('<span id="' + $newtag + '" class="tag">' + $newtag + '<span class="tag-remove"> | <a href="#" onclick="removeTag(this,\'' + $newtag + '\');">X</a></span></span>');
		$("#new-tag").val("");
		$("#new-tag").attr("placeholder", "type new tag name...");

		return false;
	}

	function removeTag(e, tagname) {
		$e = $(e);
		$tag = $e.parent().parent();
		$remove = $tag.find($('.tag-remove'));
		$remove.css('display', 'none');
		$tag.addClass('tag-clickable');

		var tagcat = $("#" + tagname).attr("data-tagcat");

		if(tagcat) {
			$tag.appendTo($('#' + tagcat));

			var rebind = function() {
				$tag.bind('click', function() {
					addTag($tag);
				});	
			}
			setTimeout(rebind, 300);	
		} else {
			$tag.remove();
		}
		
	}
	