function getProcessArgument(argName) {
    for (let i = 0; i < process.argv.length; i++) {
      const arg = process.argv[i];
      if (arg.indexOf('-' + argName + ':') == 0) 
        return arg.substring(arg.indexOf(':') + 1).replace(/'/g,'');
      if (arg == '-' + argName) return true;
    }
    return '';
}

function getURLParam(req,name) {
  try {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(req.url)||[,""])[1].replace(/\+/g, '%20'))||null;
  } catch(e) {}
}

function log(...args) { console.log(...args) }

async function jbGetJSFromUrl(url) { 
    const vm = require('vm'), fetch = require('node-fetch')
    const response = await fetch(url)
    const code = await response.text()
    vm.runInThisContext(code, url)
}

module.exports = {
    jbGetJSFromUrl, getProcessArgument, getURLParam, log
}