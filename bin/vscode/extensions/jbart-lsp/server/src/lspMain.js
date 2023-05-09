
const formerImport = self.importScripts
const formerFetch = self.importScripts
jbBaseUrl = location.origin || ''
jb={extension: () => {}}
if (typeof importScripts != 'undefined') {
    self.importScripts = importScripts.native
    self.fetch = fetch.native
    importScripts(location.origin+'/plugins/loader/jb-loader.js')
}

jbInit('jbart-lsp-server',{}).then(jb=>{
    self.importScripts = formerImport
    self.fetch = formerFetch

    //globalThis.jb = jb
    //spy = jb.spy.initSpy({spyParam: 'remote'})
	require('./lsp-jbart.js')
})



