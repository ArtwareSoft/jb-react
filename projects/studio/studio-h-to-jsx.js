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

jb.delay(100).then(_=> {
  if (typeof Babel != 'undefined')
    Babel.registerPlugin('h-to-jsx',h_to_jsx);

// test
  function test() {
    input = (state,h) => h('div',{a: state.a},h('span'));
    var res = jb.studio.hToJSX(input.toString().split('=>').slice(1).join('=>'));
    console.log('jsx',res);
    console.log('back to h',jb.studio.jsxToH(res))
  }
})


jb.studio.jsxToH = jsx =>
  Babel.transform(jsx, {
    "plugins": [["transform-react-jsx", { "pragma": "h"  }]]
  }).code

jb.studio.hToJSX = hFunc =>
    Babel.transform(hFunc, {
      "plugins": ['h-to-jsx']
    }).code
