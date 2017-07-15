import h_to_jsx from 'babel-plugin-transform-preact-h-to-jsx';

if (typeof Babel != 'undefined')
  Babel.registerPlugin('h-to-jsx',h_to_jsx)

jb.studio.jsxToH = jsx =>
  Babel.transform('<div></div>', {
    "plugins": [["transform-react-jsx", { "pragma": "h"  }]]
  }).code

jb.studio.hToJSX = hFunc =>
    Babel.transform(hFunc, {
      "plugins": ['h-to-jsx']
    }).code
