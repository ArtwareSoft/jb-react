Object.assign(jb, {
    defOperator: (id, {detect, extractAliases, registerComp}) => operators.push({id, detect, extractAliases, registerComp})
})

jb.extension('loader', {
    loadPluingsFromPackage(uri, inheritedSettings, pluginsToLoad) {
        const jbSettings = JSON.parse(jb.uri.getFileContent(`${uri}/jb-settings.json`) || '{}')
        const settings = {...inheritedSettings, ...jbSettings}
        const plgins = jb.utils.entries(jbSettings.plugins).map(([id,plugin]) => {
            
        })
        


    },
})

jb.extension('operator', {
    extractOperatorAliases(operators, fileContent) {
        const allOperators = new RegExp(`^(${Object.keys(operators).join('|')})\.([a-zA-Z0-9_]*)`)
        const lines = fileContent.split('\n')
        lines.map(l=>l.match(allOperators)).filter(x=>x).forEach( ([op, symbol])=> {
            operators[op].registerAlias()
        })
    },
    addAliasToPluginExports(id, line, jbSettings, plugin) {
        plugin.exports[id] = true
    }
})

// jb.defOperator('defType', {
//     extractAliases: jb.operator.addAliasToPlugin
// })
// jb.defOperator('pub', {impl: () => jb.component})
// jb.defOperator('private')
// jb.defOperator('alias')