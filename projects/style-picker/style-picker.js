(function() {
jb.ns('stylePicker')
jb.component('sample-card-data', { watchableData: {
    title: 'hello',
    content: '<div>hello <b>world</b></div>',
    image: 'http://images.immediate.co.uk/production/volatile/sites/3/2018/08/Simpsons_SO28_Gallery_11-fb0b632.jpg?webp=true&quality=90&resize=620%2C413'
}})

jb.component('style-picker.main', { /* stylePicker.main */
  type: 'control',
  impl: group({
    title: '',
    layout: layout.horizontal(),
    controls: [
      html({
        title: 'html',
        html: '%$desney-news%',
        style: html.inIframe('700', '700'),
        features: id('target')
      }),
      group({
        controls: [
          stylePicker.htmlToControl()
        ],
        features: group.wait({for: delay('100')})
      })
    ]
  })
})

jb.component('style-picker.show-patterns', {
    type: 'control',
    impl: itemlist({
        title: '',
        items: stylePicker.cardPatterns(),
        controls: [
          group({
            layout: layout.vertical(),
            style: propertySheet.titlesLeft({}),
            controls: [
              text({text: '%pattern/image%', title: 'Image'}),
              text({text: pipeline('%pattern/text%', join(',   ')), title: 'Text'}),
              itemlist({
                title: 'instances',
                items: '%instances%',
                controls: [
                  group({
                    layout: layout.vertical(),
                    controls: [
                      text({text: '%path%', title: 'path'}),
                      text({text: '%elem.tagName%', title: 'tag'}),
                      html({
                        title: 'html',
                        html: '%elem.outerHTML%',
                        features: css.border({width: '2', style: 'solid', color: 'black'})
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ],
        features: group.wait({for: delay('100')})
      })
})

jb.component('blank-card-style', {
    type: 'card.style',
    impl: group({
      layout: layout.flex('column'),
      style: group.htmlTag('article'),
      controls: [
        image({
          url: '%image%',
          width: 290,
          height: 161,
          position: image.position('50%', '50%'),
          features: [feature.if('%image%'), css.height(161), css.padding(2.40625), css.margin(39)]
        }),
        text({
          text: '%title%',
          features: [
            css('font: 16px proxima-n-w01-reg, sans-serif; font-weight:700;'),
            css('margin: 24px;'),
            feature.byCondition('%image%', css.lineClamp('2'))
          ]
        }),
        html({
          title: 'full text',
          html: '%content%',
          features: [
            css.lineClamp('6'),
            css('font: 16px questrial, sans-serif;'),
            css('margin: 24px;'),
            feature.if(not('%image%'))
          ]
        })
      ],
      features: [css.width('292'), css.height('268'), css('background-color:rgb(195, 255, 91);')]
    })
})

jb.component('style-picker.card-patterns', {
    impl: ctx => cardPatterns()
})

jb.component('style-picker.generated-ctrl', {
    type: 'control',
    impl: {}
})
jb.component('style-picker.html-to-control', {
    type: 'control',
    impl: ctx => {
        const target_el = targetElem()
        if (!target_el) return []
        cleanDraggedHTML(target_el)
        jb.comps['stylePicker.generatedCtrl'].impl = vdomToControl(elemToVdom(target_el))
        ctx.run(stylePicker.generatedCtrl())
    }
})

jb.component('style-picker.path-to-html', {
    params: [
       {id: 'path', as: 'string'}
    ],
    impl: ctx => cardPatterns()
})

jb.ui.cssProcessors = {
    layout: {
        filter: prop => prop.match(/flex|grid|align/) || 
            ['display','order','top','left','right','bottom','box-sizing'].find(x=>prop.indexOf(x+':') == 0),
        features: props => [css.layout(props.join(';'))]
    },
    margin: {
        filter: x=>x.match(/margin:/),
        features: props => {
            if (props.length > 1)
                return [css.layout(props.join(';'))]
            const vals = props[0].split(':').pop().split(' ').filter(x=>x).map(x=>x.split('px')[0])
            const allZero = vals.reduce((agg,val) => agg && val == '0', true)
            if (allZero) return []
            const out = vals.length == 1 ? css.marginAllSides(vals[0])
                : vals.length == 2 ? css.marginVerticalHorizontal(vals[0],vals[1])
                : vals.length == 3 ? css.margin({top: vals[0], right: vals[1], bottom: vals[2], left: vals[1] })
                : css.margin({top: vals[0], right: vals[1], bottom: vals[2], left: vals[3] })
            return [out]
        }
    },
    padding: {
        filter: x=>x.match(/padding:/),
        features: props => {
            if (props.length > 1)
                return [css(props.join(';'))]
            const vals = props[0].split(':').pop().split(' ').filter(x=>x).map(x=>x.split('px')[0])
            const allZero = vals.reduce((agg,val) => agg && val == '0', true)
            if (allZero) return []
            const out = vals.length == 1 ? css.padding({top: vals[0], right: vals[0], bottom: vals[0], left: vals[0] })
                : vals.length == 2 ? css.padding({top: vals[0], right: vals[1], bottom: vals[0], left: vals[1] })
                : vals.length == 3 ? css.padding({top: vals[0], right: vals[1], bottom: vals[2], left: vals[1] })
                : css.padding({top: vals[0], right: vals[1], bottom: vals[2], left: vals[3] })
            return [out]
        }
    },
    typography: {
        filter: x=>x.match(/font/),
        features: props => [css.typography(props.join(';'))]
    },
}

function vdomToControl(vdom) {
    const atts = vdom.attributes || {}
    const tag = vdom.tag
    const pt = tag == 'button' || tag == 'a' && !vdom.children ? 'button'
        : atts.$text ? 'text'
        : tag == 'img' && !vdom.children ? 'image'  
        : 'group'
    return {$: pt, style: extractStyle(), features: extractFeatures(), controls: extractControls(), ...extractPTProps()}

    function extractFeatures() {
        const attfeatures = ['width','height','tabindex'].filter(att => atts[att])
            .map(att=> htmlAttribute(att,atts[att]))
        return [atts.class && css.class(atts.class), ...cssToFeatures(atts.style||''), ...attfeatures].filter(x=>x)
    }

    function cssToFeatures(styleCss) {
        if (!styleCss) return []
        const props = styleCss.trim().split(';').map(x=>x.trim()).map(x=>x,replace(/\s*:\s*/g,':'))
        const res = Object.values(jb.ui.cssProcessors).reduce((agg,proc) => ({
            props: agg.props.filter(p=>! proc.filter(p)),
            features: [...agg.features, ...proc.features(agg.props.filter(p=>proc.filter(p)))]
        }), {props, features: []})
        return res.features.concat([css(res.props.join(';'))])
    }

    function extractStyle() {
        if (jb.comps[pt+'.htmlTag']) // group & text
            return jb.frame[pt].htmlTag(tag)
        else if (tag == 'button')
            return button.native()
        else if (tag == 'a')
            return button.href()
        else if (tag == 'img')
            return image.img()
    }
    function extractControls() {
        return vdom.children && vdom.children.map(ch=>vdomToControl(ch))
    }
    function extractPTProps() {
        return { 
            text: pt == 'text' && atts.$text, 
            url: pt == 'image' && atts.src,
            title: pt == 'button' && tag == 'a' && atts.$text ||
                   pt == 'group' && tag 
        }
    }
}

function elemToVdom(elem) {
    return {
        elem,
        tag: elem.tagName.toLowerCase(),
        attributes: jb.objFromEntries([
            ...Array.from(elem.attributes).map(e=>[e.name,e.value]),
            ...(jb.path(elem,'firstChild.nodeName') == '#text' ? [['$text',elem.firstChild.nodeValue]] : [])
        ]),
        ...( elem.childElementCount && !elem.getAttribute('jb_external')
            ? { children: Array.from(elem.children).map(el=> elemToVdom(el)) } : {})
    }
}

function findContent(el,path) {
  const content = [ el.attributes.src && {image: el.attributes.src, path, tag: el.tag },
    el.attributes.$text && {text: el.attributes.$text, path, tag: el.tag, elem: el.elem }].filter(x=>x)
  if (!el.children || el.children.length == 0)
    return content
  else if (el.children.length == 1)
    return content.concat(findContent(el.children[0],path+'.'+el.children[0].tag))
  else
    return content.concat(el.children.flatMap((ch,i) => findContent(ch,path+'/'+i)))
}

function pathToObj(base, path) {
    const fixedPath = path.replace(/^\//,'').replace(/\.[a-z]*/g,'/0').split('/')
    return fixedPath.reduce((o,p) => o.children[p],base)
}

function parents(path) {
    const result = []
    path.split('/').filter(x=>x).reduce((acc,p) => {
        const path = acc +'/'+p
        result.push(path)
        return path
    } ,'')
    return result.reverse()
}

function hasTexts(base,texts,contentObj) {
    return texts.reduce((acc,txt) => acc && contentObj[base + '/' +txt], true)
}

function targetElem() {
    const target_el = document.querySelector('#target')
    return (target_el && target_el.contentDocument) ?
        target_el.contentDocument.querySelector('#target') : target_el
}
function cleanDraggedHTML(elem) {
    elem.setAttribute('class','')
    elem.setAttribute('style',(elem.getAttribute('style') ||'').split(';')
        .filter(x=>!x.match('inherit'))
        .filter(x=>!x.match(/^\s*border: 0px$/))
        .join(';'))
    Array.from(elem.children).forEach(e => cleanDraggedHTML(e))
}

function cardPatterns() {
    const target_el = targetElem()
    if (!target_el) return []
    cleanDraggedHTML(target_el)
    const target = elemToVdom(target_el)
    const contentAr = findContent(target,'')
    const contentObj = jb.objFromEntries(contentAr.map(x=>([x.path,x])))

    return jb.unique(contentAr.filter(x=>x.image).flatMap(x=>[imageToCardPattern(x.path)]), x=>JSON.stringify(x))
        .map(pattern => ({pattern, instances: findPatternInstances(pattern,contentObj)}))

    function cardPattern(path) {
        const subPaths = contentAr.filter(x=>x.path.indexOf(path) == 0)
        const image = subPaths.filter(x=>x.image).map(x=>x.path.slice(path.length+1))
        const text = subPaths.filter(x=>x.text).map(x=>x.path.slice(path.length+1))
        if (image && text)
            return {image,text}
    }
    function findPatternInstances(pattern,contentObj) {
        const imageDepth = pattern.image[0].split('/').length
        return contentAr.filter(x=>x.image).map(x=>parents(x.path)[imageDepth])
            .filter(base=> hasTexts(base, pattern.text,contentObj))
            .map(path=>({path,
                elem: pathToObj(target_el,path) }))
    }
    function imageToCardPattern(imgPath) {
        return parents(imgPath).slice(1).reduce((acc,x) => acc || (acc = cardPattern(x)), null)
    }
}


// const ct = contentAr.map(({path,elem})=>({path,elem}))
//     .sort((x,y)=>x.path.localeCompare(y.path) )

// const repsPaths = jb.unique(contentAr.filter(x=>x.path.indexOf('/2/') != -1)
//     .map(x=>x.path.slice(0, x.path.indexOf('/2/') )))

// const repsObj = repsPaths.map(path => ({ obj: pathToObj(path), path} ))


})()