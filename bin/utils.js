function getProcessArgument(argName) {
    for (const i = 0; i < process.argv.length; i++) {
      const arg = process.argv[i];
      if (arg.indexOf('-' + argName + ':') == 0) 
        return arg.substring(arg.indexOf(':') + 1).replace(/'/g,'');
      if (arg == '-' + argName) return true;
    }
    return '';
}

module.exports = {
    getProcessArgument
}