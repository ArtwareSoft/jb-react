const st = jb.studio;
st.completion = 
function(text, ctx) {
    const defaultType = 'control'

    const cleanStringContent = txt=>txt.replace(/,|{|}|\$/g,'')
    const cleaned = text.replace(/'[^']*'/g, cleanStringContent).replace(/"[^"]*"/g, cleanStringContent).replace(/`[^`]*`/gm, cleanStringContent);
    const profile_str = extractProfileStr(cleaned)
    const pt = ptOfProfile(profile_str)
    if (pt)
        return jb.compParams(st.previewjb.comps[pt]).map(prop =>({ type: 'prop', prop, displayText: prop.id }) )
    const beforeProfile = cleaned.slice(0, findMatchingBlockBackwards(cleaned))
    const parentProfile = extractProfileStr(beforeProfile)
    const parentPt = ptOfProfile(parentProfile)
    const currentProp = (parentProfile.match(/([\$0-9A-Za-z_]*)\s*:[\s|\[]*$/) || ['',''])[1]
    const type = st.previewjb.comps[parentPt] ? 
        (jb.compParams(st.previewjb.comps[parentPt]).filter(p=>p.id == currentProp)[0] || {}).type || 'data' 
        : defaultType
    return st.PTsOfType(type).map(pt=>({ type: 'pt', displayText: pt}));

    function findMatchingBlockBackwards(str) {
        let depth = 0;
        for(let i=str.length-1; i>=0;i--) {
            if (str[i] == '{' && depth == 0)
                return i;
            if (str[i] == '{') depth--;
            if (str[i] == '}') depth++;
        }
        return 0;
    }

    function ptOfProfile(profile_str) {
        return (profile_str.match(/\$\s*:\s*'([^']*)'/) || ['',''])[1]
    }

    function extractProfileStr(str) {
        return str.slice(findMatchingBlockBackwards(str))
    }
}

if (typeof CodeMirror != 'undefined') {
    const Pos = CodeMirror.Pos;
    CodeMirror.registerHelper("hint", "javascript", (editor, settings) => {
        const cur = editor.getCursor(), token = editor.getTokenAt(cur);
        const optionsFilter = token.string.replace(/[^a-zA-Z]/g,'');
        const textToToken = [...editor.getValue().split('\n').slice(0,cur.line), editor.getLine(cur.line)
            .slice(0,cur.ch)]
            .join('\n')
            .slice(0,-1*token.string.length);
        const options = st.completion(textToToken)
        const codeMirrorOptions = options.map(e=>asCodeMirrorOption(e))
            .filter(e=>!optionsFilter || e.displayText.indexOf(optionsFilter) != -1)
        const result = { list: codeMirrorOptions, from: Pos(cur.line, token.start), to: Pos(cur.line, token.end) }
        jb.log('hint',['helper', { cur, token, textToToken, options, codeMirrorOptions}])
        return result;

        function asCodeMirrorOption(option) {
            const res = Object.assign(option,{text: option.displayText, hint: applyHint})
            option.backOffset = 0
            if (option.type == 'prop') {
                const separator = /,\s*$/.test(textToToken) ? '' : ','
                const space = /\s+$/.test(textToToken) ? '' : ' '
                let value = option.prop.defaultValue && jb.prettyPrint(option.prop.defaultValue)
                value = value || ((option.prop.type &&  option.prop.type != 'data') ? "{$: '' }" : "''")
                const spaceBeforeValue = value.indexOf('$') == -1 ? ' ' : ''
                const spaceBeforeColon = value.indexOf('$') == -1 ? '' : ' '
                res.text = `${separator}${space}${res.text}${spaceBeforeColon}:${spaceBeforeValue}${value}`
                }
            if (option.type == 'pt') {
                res.text = `'${res.text}'`
            }
            option.backOffset = res.text.split('').reverse().join('').indexOf("''") + 1;
            // if (option.backOffset == -1)
            //     option.backOffset = 0
            return res

            function applyHint(editor) {
                editor.replaceRange(option.text, Pos(cur.line, token.start), Pos(cur.line, token.end))
                setTimeout(() => editor.setCursor(editor.getCursor().line, editor.getCursor().ch - option.backOffset), 20)
            }
        }
        
    });
}
