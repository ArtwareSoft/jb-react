function h_to_jsx({types: t}) {
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

          var name = t.JSXIdentifier(path.node.arguments[0].value);
          var props = getAttributes(path.node.arguments[1]);
          var children = processChildren(path.node.arguments.slice(2));

          var open = t.JSXOpeningElement(name, props);
          open.selfClosing = children.length === 0;
          var close = children.length === 0 ? null : t.JSXClosingElement(name);

          var el = t.JSXElement(open, close, children);
          path.replaceWith(path.parent.type === 'ReturnStatement' ? t.ParenthesizedExpression(el) : t.ExpressionStatement(el));
        }
      }
    }
  }
}

jb.studio.initJsxToH = _ => {
  if (jb.studio._initJsxToH) return;
  Babel.registerPlugin('h-to-jsx',h_to_jsx);
  jb.studio._initJsxToH = true;
}

// jb.studio.testJsxToH = _ => {    input = (state,h) => h('div',{a: state.a},h('span'));
//     var res = jb.studio.hToJSX(input.toString().split('=>').slice(1).join('=>'));
//     console.log('jsx',res);
//     console.log('back to h',jb.studio.jsxToH(res))
// }

jb.studio.jsxToH = jsx => {
  jb.studio.initJsxToH();
  try  {
  return Babel.transform(jsx, {
    "plugins": [["transform-react-jsx", { "pragma": "h"  }]]
  }).code
  } catch(e) {}
}

jb.studio.hToJSX = hFunc => {
    jb.studio.initJsxToH();
    try {
    return Babel.transform(hFunc, {
      "plugins": ['h-to-jsx']
    }).code
  } catch(e) {}
}

jb.component('studio.template-as-jsx', {
	type: 'data',
	params: [{ id: 'path', as: 'string', dynamic: true } ],
	impl: ctx => ({
			$jb_val: function(value) {
        var st = jb.studio;
				var path = ctx.params.path();
				if (!path) return;
				if (typeof value == 'undefined') {
          var func = st.valOfPath(path);
          if (typeof func == 'function')
            return jb.studio.hToJSX(func.toString().split('=>').slice(1).join('=>') );
				} else {
					var funcStr = jb.studio.jsxToH(value);
					if (funcStr)
            st.writeValueOfPath(path,st.evalProfile('(cmp,state,h) => ' + funcStr.slice(0,-1)) );
				}
			},
      $jb_observable: cmp =>
				jb.studio.refObservable(jb.studio.refOfPath(ctx.params.path()),cmp,{includeChildren: true})
		})
})
