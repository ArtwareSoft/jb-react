jb.component('newline', {
  impl: ctx => '\n'
})

jb.component('extract-text', {
  description: 'text breaking according to begin/end markers',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'startMarkers', as: 'array', essential: true},
    {id: 'endMarker', as: 'string'},
    {id: 'includingStartMarker', as: 'boolean', type: 'boolean', description: 'include the marker at part of the result' },
    {id: 'includingEndMarker', as: 'boolean', type: 'boolean', description: 'include the marker at part of the result'},
    {id: 'repeating', as: 'boolean', type: 'boolean', description: 'apply the markers repeatingly' },
    {id: 'noTrim', as: 'boolean', type: 'boolean'},
    {id: 'useRegex', as: 'boolean', type: 'boolean', description: 'use regular expression in markers' },
    {id: 'exclude', as: 'boolean', type: 'boolean', description: 'return the inverse result. E.g. exclude remarks' },
  ],
  impl: (ctx,text,startMarkers,endMarker,includingStartMarker,includingEndMarker,repeating,noTrim,regex,exclude) => {
	  var findMarker = (marker, startpos) => {
      var pos = text.indexOf(marker,startpos);
      if (pos != -1)
        return { pos: pos, end: pos + marker.length}
    }
	  if (regex)
		  findMarker = (marker, startpos) => {
	  		var len = 0, pos = -1;
	  		try {
		  		startpos = startpos || 0;
		  		var str = text.substring(startpos);
		  		var marker_regex = new RegExp(marker,'m');
          pos = str.search(marker_regex);
		    	if (pos > -1) {
		    		var match = str.match(marker_regex)[0];
            len = match ? match.length : 0;
            if (len)
              return { pos: pos+startpos, end: pos+ startpos+len };
		    	}
	  		} catch(e) {} // probably regex exception
	  }

    function findStartMarkers(startpos) {
      var firstMarkerPos;
      for(var i=0; i<startMarkers.length; i++) {
        var marker = startMarkers[i];
        var markerPos = findMarker(marker,markerPos ? markerPos.end : startpos);
        if (!markerPos) return;
        if (i==0)
          firstMarkerPos = markerPos;
      }
      return firstMarkerPos && { pos: firstMarkerPos.pos, end: markerPos.end }
    }

    var out = { match: [], unmatch: []},pos =0,start=null; 
    while(start = findStartMarkers(pos)) {
        if (endMarker)
          var end = findMarker(endMarker,start.end)
        else
          var end = findStartMarkers(start.end);

        if (!end) // if end not found use end of text
          end = { pos : text.length, end: text.length }
        var start_match = includingStartMarker ? start.pos : start.end;
        var end_match = includingEndMarker ? end.end : end.pos;
        if (pos != start_match) out.unmatch.push(text.substring(pos,start_match));
        out.match.push(text.substring(start_match,end_match));
        if (end_match != end.end) out.unmatch.push(text.substring(end_match,end.end));
        pos = endMarker ? end.end : end.pos;
    }
    out.unmatch.push(text.substring(pos));
    if (!noTrim) {
      out.match = out.match.map(x=>x.trim());
      out.unmatch = out.unmatch.map(x=>x.trim());
    }
    var res = exclude ? out.unmatch : out.match;
    return repeating ? res : res[0];
  }
})

jb.component('break-text', {
  description: 'recursive text breaking according to multi level separators',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'separators', as: 'array', essential: true, defaultValue: [], description: 'multi level separators'},
    {id: 'useRegex', as: 'boolean', type: 'boolean', description: 'use regular expression in separators' },
  ],
  impl: (ctx,text,separators,regex) => {
	  var findMarker = (text,marker, startpos) => {
      var pos = text.indexOf(marker,startpos);
      if (pos != -1)
        return { pos: pos, end: pos + marker.length}
    }
	  if (regex)
		  findMarker = (text,marker, startpos) => {
	  		var len = 0, pos = -1;
	  		try {
		  		startpos = startpos || 0;
		  		var str = text.substring(startpos);
		  		var marker_regex = new RegExp(marker,'m');
          pos = str.search(marker_regex);
		    	if (pos > -1) {
		    		var match = str.match(marker_regex)[0];
            len = match ? match.length : 0;
            if (len)
              return { pos: pos+startpos, end: pos+ startpos+len };
		    	}
	  		} catch(e) {} // probably regex exception
    }

    var result = [text];
    separators.forEach(sep=> result = recursiveSplit(result,sep));
    return result[0];

    function recursiveSplit(input,separator) {
      if (Array.isArray(input))
        return input.map(item=>recursiveSplit(item,separator))
      if (typeof input == 'string')
        return doSplit(input,separator)
    }

    function doSplit(text,separator) {
      var out = [],pos =0,found=null; 
      while(found = findMarker(text,separator,pos)) {
        out.push(text.substring(pos,found.pos));
        pos = found.end;
      }
      out.push(text.substring(pos));
      return out;
    }
  }
})


jb.component('zip-arrays', {
  description: '[[1,2],[10,20],[100,200]] => [[1,10,100],[2,20,200]]',
  params: [
    { id: 'value', description: 'array of arrays', as: 'array', essential: true },
  ],
  impl: (ctx,value) =>
    value[0].map((x,i)=>
      value.map(line=>line[i]))
})

jb.component('remove-sections', {
  description: 'remove sections between markers',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'startMarker', as: 'string', essential: true },
    {id: 'endMarker', as: 'string', essential: true},
    {id: 'keepEndMarker', as: 'boolean', type: 'boolean'},
  ],
  impl: (ctx,text,startMarker,endMarker,keepEndMarker) => {
    var out = text,range = null;
    if (!startMarker || !endMarker) return out;
    do {
      range = findRange(out);
      if (range)
        out = out.substring(0,range.from) + out.substring(range.to)
    } while (range && out);
    return out;

    function findRange(txt) {
      var start = txt.indexOf(startMarker);
      if (start == -1) return;
      var end = txt.indexOf(endMarker,start) + (keepEndMarker ? 0 : endMarker.length);
      if (end == -1) return;
      return { from: start, to: end}
    }
  }
})

jb.component('match-regex', {
  type: 'boolean',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
    {id: 'regex', as: 'string', essential: true },
    {id: 'fillText', as: 'boolean', essential: true, description: 'regex must match all text' },
  ],
  impl: (ctx,text,regex,fillText) =>
    text.match(new RegExp(fillText ? `^${regex}$` : regex))
})

jb.component('merge', {
	type: 'data',
  description: 'assign, merge object properties',
	params: [
    { id: 'objects', as: 'array', essential: true },
	],
	impl: (ctx,objects) =>
		Object.assign.apply({},objects)
})

jb.component('dynamic-object', {
	type: 'data',
  description: 'process items into object properties',
	params: [
    { id: 'items', essential: true, as: 'array' },
		{ id: 'propertyName', essential: true, as: 'string', dynamic: true },
		{ id: 'value', essential: true, dynamic: true },
	],
	impl: (ctx,items,name,value) =>
    items.reduce((obj,item)=>Object.assign(obj,jb.obj(name(ctx.setData(item)),value(ctx.setData(item)))),{})
})

jb.component('filter-empty-properties', {
	type: 'data',
  description: 'remove null or empty string properties',
	params: [
    { id: 'obj', as: 'single', defaultValue: '%%' },
	],
  impl: (ctx,obj) => {
    var props = Object.getOwnPropertyNames(obj).filter(p=>obj[p] != null && obj[p] != '');
    return props.reduce((res,p)=>Object.assign(res,jb.obj(p,obj[p])),{});
  }
})

jb.component('trim', {
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'},
  ],
  impl: (ctx,text) => text.trim()
})

jb.component('remove-prefix-regex', {
  params: [
    {id: 'prefix', as: 'string', essential: true },
    {id: 'text', as: 'string', defaultValue: '%%'},
  ],
  impl: (ctx,prefix,text) =>
    text.replace(new RegExp('^'+prefix) ,'')
})

jb.component('remove-suffix-regex', {
  params: [
    {id: 'suffix', as: 'string', essential: true },
    {id: 'text', as: 'string', defaultValue: '%%'},
  ],
  impl: (ctx,suffix,text) =>
    text.replace(new RegExp(suffix+'$') ,'')
})
