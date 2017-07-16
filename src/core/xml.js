jb.xml = jb.xml || {}

jb.xml.xmlToJson = xml => {
  if (xml.nodeType == 9) // document
    return jb.xml.xmlToJson(xml.firstChild);

    if (Array.from(xml.attributes) == 0 && xml.childElementCount == 0)
      return xml.textContent;

    var props =  Array.from(xml.attributes).map(att=>({ id: att.name, val: att.value})).concat(
      Array.from(xml.children).map(child=>({ id: child.tagName, val: jb.xml.xmlToJson(child) }))
    );
    return props.reduce((obj,prop)=>{
      if (typeof obj[prop.id] == 'undefined')
        obj[prop.id] = prop.val;
      else if (Array.isArray(obj[prop.id]))
        obj[prop.id].push(prop.val)
      else
          obj[prop.id] = [obj[prop.id]].concat([prop.val])
      return obj
    }, {})
}
