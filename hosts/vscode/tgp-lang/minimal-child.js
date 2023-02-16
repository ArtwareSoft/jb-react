const vm = require('vm');
const vmContext = { require, process }
vm.createContext(vmContext)
function _initialCodeLoader(message) {
    if (typeof message == 'string' && message.match(/^eval:/)) {
        (new vm.Script(message.slice(5))).runInContext(vmContext)
        process.on('message', () => {}) // keep alive
        process.off('message', _initialCodeLoader) // allow only single eval
    }
}
process.on('message', _initialCodeLoader);
