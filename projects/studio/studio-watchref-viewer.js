(function() {
const st = jb.studio

jb.component('position-of-data', {
    type: 'position',
    params: [
        {id: 'data', defaultValue: '%%'},
    ],
    impl: (ctx,data) => {
        const ref = jb.asRef(data)
        const path = ref && jb.refHandler(ref).pathOfRef(ref)
        if (!path) return
        const resource = path.split('~')[0]
        const innerPath = path.split('~').slice(1).join('~')
        const dialog_elem = document.querySelectorAll('[dialogId=edit-data-resource')
            .filter(el=>el._component.ctx.data.path == resource + '~watchableData')[0]
        if (!dialog_elem) {
            openDataResource(path)
            return jb.delay(500).then(()=> positionOfData(path))
        }
        const cm_elem = dialog_elem.querySelector('.CodeMirror')
        const editor = cm_elem.parentElement._component.editor
        const map = editor.data_ref.locationMap
        const positions = jb.entries(map).filter(e=>e[0].split('~watchableData~')[1].split('~!')[0] == innerPath)
            .map(e=>e[1].positions)
        const asPoints = positions.map(pos=>editor(charCoords))
        return {
            top: Math.min(...asPoints.map(x=>x.top)),
            left: Math.min(...asPoints.map(x=>x.left)),
            right: Math.max(...asPoints.map(x=>x.left + x.width)),
            buttom: Math.max(...asPoints.map(x=>x.top + x.height))
        }
    }
})

function openDataResource(path) {
}

jb.component('position-of-ctx', {
    type: 'position',
    params: [
        {id: 'ctxId', as: 'string'},
    ],
    impl: (ctx,ctxId) => Array.from(st.previewWindow.document.querySelectorAll(`[jb-ctx="${ctxId}"]`))
        .map(el => jb.ui.offset(el))
})

jb.studio.activateWatchRefViewer = () => {
    if (!st.previewjb.spy)
        st.previewjb.initSpy({})
    st.previewjb.spy.includeLogs.registerCmpObservable = true
}

})()