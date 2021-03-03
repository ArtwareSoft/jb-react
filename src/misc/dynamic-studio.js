jb.dynamicStudio = function(studioVars) {
    if (typeof document === 'undefined') return
    const studioDir = '/projects/studio' // bin/studio
    const studioUrl = `${studioDir}/dynamic-studio.html`

    const iframe = document.createElement('iframe');
    iframe.id = 'studio';
    iframe.sandbox = 'allow-same-origin allow-forms allow-scripts';
    iframe.src = studioUrl
    iframe.height = '900px'
    iframe.onload = function() {
        this.contentWindow.jb.studio.initPreview(window)
        Object.assign(this.contentWindow.jb.db.resources.studio,studioVars || {})
    }
    document.querySelector('body>*').prepend(iframe)
}