jb.xml = jb.xml || {}

jb.xml.xmlToJson = xml => {
  if (xml.nodeType == 9) // document
    return jb.xml.xmlToJson(xml.firstChild);

    if (Array.from(xml.attributes || []) == 0 && xml.childElementCount == 0)
      return xml.textContent;

    var props =  Array.from(xml.attributes || []).map(att=>({ id: att.name, val: att.value})).concat(
      Array.from(xml.childNodes).filter(x=>x.nodeType == 1).map(child=>({ id: child.tagName, val: jb.xml.xmlToJson(child) }))
    );
    var res = props.reduce((obj,prop)=>{
      if (typeof obj[prop.id] == 'undefined')
        obj[prop.id] = prop.val;
      else if (Array.isArray(obj[prop.id]))
        obj[prop.id].push(prop.val)
      else
          obj[prop.id] = [obj[prop.id]].concat([prop.val])
      return obj
    }, {});
    // check for simple array
    jb.entries(res).forEach(e=>res[e[0]] = flattenArray(e[1]));

    return res;

    function flattenArray(ar) {
      if (!Array.isArray(ar)) return ar;
      var res = jb.unique(ar.map(item=>jb.entries(item).length == 1 ? jb.entries(item)[0][0] : null));
      if (res.length == 1 && res[0])
        return ar.map(item=>jb.entries(item)[0][1])
      return ar;
    }
}
;

