extension('studio', 'jsx', {
  initExtension() {
    if (jb.studio._initJsxToH || !jb.frame.Babel) return;
    jb.frame.Babel.registerPlugin('h-to-jsx',h_to_jsx);
    jb.studio._initJsxToH = true;
  },  
 h_to_jsx({types: t}) {
  const getAttributes = (props) => {
    if (t.isIdentifier(props) || t.isMemberExpression(props)) {
      return [t.JSXSpreadAttribute(props)];
    }

    return (props && props.properties || []).map(prop => {
      const key = t.JSXIdentifier(prop.key.name || prop.key.value)
      const value = t.isLiteral(prop.value) && (typeof prop.value.value === 'string') ? prop.value : t.JSXExpressionContainer(prop.value);
      return t.JSXAttribute(key, value);
    });
  }

  const processChildren = (children) => {
    return children.map(c => {
      if (t.isJSXElement(c) || t.isJSXExpressionContainer(c)) {
        return c;
      } else if (t.isStringLiteral(c)) {
        return t.JSXText(c.value);
      } else {
        return t.JSXExpressionContainer(c);
      }
    });
  }

  return {
    visitor: {
      CallExpression: {
        exit: function (path, state) {
          if (path.node.callee.name != 'h' || path.node.arguments[0].type != 'StringLiteral') return;

          const name = t.JSXIdentifier(path.node.arguments[0].value);
          const props = getAttributes(path.node.arguments[1]);
          const children = processChildren(path.node.arguments.slice(2));

          const open = t.JSXOpeningElement(name, props);
          open.selfClosing = children.length === 0;
          const close = children.length === 0 ? null : t.JSXClosingElement(name);

          const el = t.JSXElement(open, close, children);
          path.replaceWith(path.parent.type === 'ReturnStatement' ? t.ParenthesizedExpression(el) : t.ExpressionStatement(el));
        }
      }
    }}
  },

  testJsxToH() {
      input = (state,h) => h('div',{a: state.a},h('span'));
      const res = jb.studio.hToJSX(input.toString().split('=>').slice(1).join('=>'));
      console.log('jsx',jb.utils.prettyPrint(res));
      console.log('back to h',jb.studio.jsxToH(res))
  },

  jsxToH(jsx) {
    try  {
    return Babel.transform(jsx, {
      "plugins": [["transform-react-jsx", { "pragma": "h"  }]]
    }).code.replace(/;$/,'').replace(/\(\s*/mg,'(').replace(/\s*\)/mg,')').replace(/,null,/mg,',{},').replace(/,\s*\{/mg,',{').replace(/"class"/mg,'class').replace(/"/mg,"'")
    } catch(e) {
      jb.logException(e)
    }
  },

  hToJSX(hFunc) {
      try {
      return Babel.transform(hFunc, {
        "plugins": ['h-to-jsx']
    }).code
    } catch(e) {
      jb.logException(e)
    }
  },
})

component('studio.jsxToH', {
  type: 'data',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,text) => jb.studio.jsxToH(text)
})

component('studio.hToJsx', {
  type: 'data',
  params: [
    {id: 'text', as: 'string', defaultValue: '%%'}
  ],
  impl: (ctx,text) => jb.studio.hToJSX(text)
})


component('studio.templateAsJsx', {
  type: 'data',
  params: [
    {id: 'path', as: 'string', dynamic: true}
  ],
  impl: ctx => ({
		$jb_val: function(value) {
			const path = ctx.params.path();
			if (!path) return;
			if (typeof value == 'undefined') {
				const func = jb.tgp.valOfPath(path);
				if (typeof func == 'function')
            		return jb.studio.hToJSX(func.toString().split('=>').slice(1).join('=>') );
			} else {
				const funcStr = jb.studio.jsxToH(value);
				if (funcStr)
            		jb.tgp.writeValueOfPath(path,jb.tgp.evalProfile('(cmp,state,h) => ' + funcStr) );
			}
		},
		$jb_observable: cmp =>
			jb.watchableComps.handler.refObservable(jb.watchableComps.handler.refOfPath(ctx.params.path()),cmp,{includeChildren: 'yes'})
	})
})
