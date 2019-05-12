const st = jb.studio;
st.completion = 
function(text, ctx) {
    const cleanStringContent = txt=>txt.replace(/,|{|}|\$/g,'')
    const cleaned = text.replace(/'[^']*'/g, cleanStringContent).replace(/"[^"]*"/g, cleanStringContent).replace(/`[^`]*`/gm, cleanStringContent);
    const profile_str = extractProfileStr(cleaned)
    const pt = ptOfProfile(profile_str)
    if (pt)
        return st.previewjb.comps[pt].params.map(prop =>({ type: 'prop', prop, displayText: prop.id }) )
    const beforeProfile = cleaned.slice(0, findMatchingBlockBackwards(cleaned))
    const parentProfile = extractProfileStr(beforeProfile)
    const parentPt = ptOfProfile(parentProfile)
    const currentProp = (parentProfile.match(/([\$0-9A-Za-z_]*)\s*:\s*$/) || ['',''])[1]
    const type = (st.previewjb.comps[parentPt].params.filter(p=>p.id == currentProp)[0] || {}).type || 'data'
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
    CodeMirror.registerHelper("hint", "javascript", (editor) => {
        const cur = editor.getCursor(), token = editor.getTokenAt(cur);
        const optionsFilter = token.string.replace(/[^a-zA-Z]/g,'');
        const textToToken = [...editor.getValue().split('\n').slice(0,cur.line), editor.getLine(cur.line).slice(0,cur.ch)].join('\n');
        const options = st.completion(textToToken)
        const codeMirrorOptions = options.map(e=>asCodeMirrorOption(e))
            .filter(e=>!optionsFilter || e.displayText.indexOf(optionsFilter) != -1)
        const result = { list: codeMirrorOptions, from: Pos(cur.line, token.start), to: Pos(cur.line, token.end) }
        jb.log('hint',['helper', { cur, token, textToToken, options, codeMirrorOptions}])
        return result;

        function asCodeMirrorOption(option) {
            const res = Object.assign(option,{text: option.displayText})
            if (option.type == 'prop') {
                if (!/,\s*$/.test(textToToken))
                    res.text = `, ${res.text}`
                if (option.prop.as == 'string')
                    res.text += ": ''"
                else if (option.prop.type &&  option.prop.type != 'data')
                    res.text += " :{$: '' }"
            }
            return res
        }
        
    });
}
