jb.component('extract-text', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'startMarkers', as: 'array'},
    {id: 'endMarker', as: 'string'},
    {id: 'includingStartMarker', as: 'boolean', type: 'boolean'},
    {id: 'includingEndMarker', as: 'boolean', type: 'boolean'},
    {id: 'onlyFirstResult', as: 'boolean', type: 'boolean', defaultValue: true},
    {id: 'trim', as: 'boolean', type: 'boolean', defaultValue: true},
    {id: 'useRegex', as: 'boolean', type: 'boolean' },
  ],
  impl: (ctx,text,startMarkers,endMarker,includingStartMarker,includingEndMarker,onlyFirst,trim,regex) => {
    var index = 0, out = [], prev_index=-1;
	  var string_start =0, str= text;
	  var position = (str, marker, startpos) => ({ pos: str.indexOf(marker,startpos), length: marker.length })
	  if (regex)
		  position = function(str, marker, startpos) {
	  		var len = 0, pos = -1;
	  		try {
		  		startpos = startpos || 0;
		  		var str = str.substring(startpos);
		  		var marker_regex = new RegExp(marker,'m');
		    	pos = str.search(marker_regex);
		    	if (pos > -1) { // get the length of the regex
		    		pos = (pos >= 0) ? pos + startpos : pos;
		    		var match = str.match(marker_regex)[0];
		    		len = match ? match.length : 0;
		    	}
	  		} catch(e) {} // probably regex exception
		    return { pos: pos , length: len };
	  }
	  while (1) {
	  	  if (prev_index == index) break;	// prevent infinitive loop
	  	  prev_index = index;
        var cut_previous_index;
  		  for(var i=0; i<startMarkers.length; i++) {
  			  var marker = startMarkers[i];
  			  var markerPos = position(str,marker,index);
  			  index = markerPos.pos;
  			  if (i==0)
  				  cut_previous_index = markerPos.pos - string_start;
  			  if (markerPos.pos == -1) return out;
  			  string_start = markerPos.pos;
  			  if (!includingStartMarker)
  				  string_start += markerPos.length;
  			  index += markerPos.length;
  		  }
  		  if (out.length>0 && endMarker == '') {  // cutting previous item
  			  out[out.length-1] = out[out.length-1].substring(0,cut_previous_index);
  		  }
  		  var endPos = position(str,endMarker,index);
  		  var out_item = '';
  		  if (endMarker == '')
  			  out_item = str.substring(string_start);
  		  else if (endPos.pos == -1)
  			  return out;
  		  else if (includingEndMarker)
  			  out_item = str.substring(string_start,endPos.pos+endPos.length);
  		  else
  			  out_item = str.substring(string_start,endPos.pos);

  		  if (trim)
  			  out_item = out_item.trim();
  		  if (out_item)
  			  out.push(out_item);
  		  if (onlyFirst)
  			  return out;
  		  if (endMarker != '')
  		  	index = endPos.pos+endPos.length;
  	}
	  return out;
  }
})

jb.component('exclude-sections', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'startMarker', as: 'string'},
    {id: 'endMarker', as: 'string'}
  ],
  impl: (ctx,text,startMarker,endMarker) => {
    var out = text,range = null;
    do {
      range = findRange(out);
      if (range)
        out = out.substring(0,range.from) + out.substring(range.to)
    } while (range);
    return out;

    function findRange(txt) {
      var start = txt.indexOf(startMarker);
      if (start == -1) return;
      var end = txt.indexOf(endMarker,start);
      if (end == -1) return;
      return { from: start, to: end}
    }
  }
})
