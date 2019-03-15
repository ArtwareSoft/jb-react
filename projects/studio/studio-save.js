(function() {
var st = jb.studio;
var _window = window.parent || window;
var elec_remote = _window.require && _window.require('electron').remote;
var fs = elec_remote && elec_remote.require('fs');
var jb_projectFolder = elec_remote && elec_remote.getCurrentWindow().jb_projectFolder;

jb.component('studio.save-components', {
	type: 'action,has-side-effects',
	params: [
		{ id: 'force',as: 'boolean', type: 'boolean' }
	],
	impl : (ctx,force) =>
		jb.rx.Observable.from(Object.getOwnPropertyNames(st.previewjb.comps))
			.filter(id=>id.indexOf('$jb') != 0)
			.filter(id=>st.previewjb.comps[id] != st.serverComps[id])
			.concatMap(id=>{
				var original = st.serverComps[id] ? jb.prettyPrintComp(id,st.serverComps[id]) : '';
				st.message('saving ' + id + '...');
				if (force && !original)
					original = `jb.component('${id}', {`;
        var project = ctx.exp('%$studio/project%');

        if (fs) {
            return [{message: saveComp(st.compAsStr(id),original,id,project,force,jb_projectFolder && jb_projectFolder(project),''), type: 'success'}]
        } else { // via http
          var headers = new Headers();
          headers.append("Content-Type", "application/json; charset=UTF-8");
          return fetch(`/?op=saveComp&comp=${id}&project=${project}&force=${force}`,
            {method: 'POST', headers: headers, body: JSON.stringify({ original: original, toSave: st.compAsStr(id) }) })
          .then(res=>res.json())
          .then(res=>({ res: res , id: id }))
        }
			})
			.catch(e=>{
				st.message('error saving: ' + (typeof e == 'string' ? e : e.e), true);
				return jb.logException(e,'error while saving ' + e.id,ctx) || []
			})
			.subscribe(entry=>{
				var result = entry.res || entry;
				st.message((result.type || '') + ': ' + (result.desc || '') + (result.message || ''), result.type != 'success');
				if (result.type == 'success')
					st.serverComps[entry.id] = st.previewjb.comps[entry.id];
			})
});

// directly saving the comp - duplicated in studio-server
function saveComp(toSave,original,comp,project,force,projectDir,destFileName) {
    var _iswin = /^win/.test(process.platform);
    var projDir = projectDir;

    if (comp.indexOf('studio.') == 0 && project == 'studio-helper')
      projDir = 'projects/studio';

    if (!original) { // new comp
      var srcPath = `${projectDir}/${destFileName || (project+'.js')}`;
      try {
        var current = '' + fs.readFileSync(srcPath);
        var toStore =  current + '\n\n' + toSave;
        var cleanNL = toStore.replace(/\r/g,'');
        if (_iswin)
          cleanNL = cleanNL.replace(/\n/g,'\r\n');
        fs.writeFileSync(srcPath,cleanNL);
        return `component ${comp} added to ${srcPath}`;
      } catch (e) {
        throw `can not store component ${comp} in path ${srcPath}`
      }
    }

    var comp_found = '';
//        console.log(original);
    fs.readdirSync(projDir)
      .filter(x=>x.match(/\.js$/) || x.match(/\.ts$/))
      .forEach(srcFile=> {
          var srcPath = projDir+'/'+srcFile;
          var source = ('' + fs.readFileSync(srcPath)).replace(/\r/g,'').split('\n');
          var toFind = original.replace(/\r/g,'').split('\n');
          var replaceWith = toSave.replace(/\r/g,'').split('\n');
          var found = findSection(source,toFind,srcFile);
          if (found) {
            //console.log('splice',source,found.index,found.length,replaceWith);
            source.splice.apply(source, [found.index+1, found.length-1].concat(replaceWith.slice(1)));
            var newContent = source.join(_iswin ? '\r\n' : '\n');
            fs.writeFileSync(srcPath,newContent);
            comp_found = `component ${comp} saved to ${srcPath} at ${JSON.stringify(found)}`;
          }
      })

    if (comp_found)
      return comp_found
    else
      throw `Can not find component ${comp} in project`;

    function findSection(source,toFind,srcFile) {
      var index = source.indexOf(toFind[0]);
      // if (index == -1)
      //   index = source.indexOf(toFind[0].replace('jb_','jb.'));
      if (index != -1 && force) {// ignore content - just look for the end
        for(end_index=index;end_index<source.length;end_index++)
          if ((source[end_index]||'').match(/^}\)$/m))
            return { index: index, length: end_index - index +1}
      } else if (index != -1 && compareArrays(source.slice(index,index+toFind.length),toFind)) {
          return { index: index, length: toFind.length }
      } else if (index == -1) {
        return false;
      } else {
        // calc error message
        var err = '';
        var src = source.slice(index,index+toFind.length);
        console.log('origin not found at file ' + srcFile);
        src.forEach(l=>console.log(l));
        toFind.forEach((line,index) => {
          if (line != src[index])
            console.log(index + '-' +line + '#versus source#' + src[index]);
        })

        throw `${comp} found with a different source, use "force save" to save. ${err}`;
      }
    }
    function compareArrays(arr1,arr2) {
      return arr1.join('\n') == arr2.join('\n')
    }
}


})();
