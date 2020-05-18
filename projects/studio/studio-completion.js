(function() {
const st = jb.studio;
const OPEN = ['{','['], CLOSE = ['}',']'];
st.completion = {
    goUp(text) {
        let depth = 0, formerSiblings = 0;
        for(let i=text.length-1; i>=0;i--) {
            if (isOpen(text[i]) && depth == 0)
                return {upIndex: i, formerSiblings};
            if (isOpen(text[i]) && depth == 1)
                formerSiblings++;
            if (isOpen(text[i])) depth--;
            if (isClose(text[i])) depth++;
        }
        return {upIndex: 0, formerSiblings};

        function isClose(ch) { return CLOSE.indexOf(ch) != -1 }
        function isOpen(ch) { return OPEN.indexOf(ch) != -1 }
    },
    getProp(text) {
        const prop = (text.match(/([\$0-9A-Za-z_]*)\s*:[\s|\[|']*$/) || ['',''])[1]
        return prop ? [prop] : []
    },
    pathOfText(text) {
        const {goUp, pathOfText, getProp} = st.completion

        const {upIndex, formerSiblings} = goUp(text)
        if (upIndex == 0 || upIndex == text.length-1)
            return getProp(text)
        const parentPath = pathOfText(text.slice(0, upIndex))
        const isArrayElement = text[upIndex] == '['
        if (isArrayElement)
            return [...parentPath, formerSiblings]
        return [...parentPath, ...getProp(text)]
    },
    hint(text, token, ctx) {
        const defaultType = 'control'

        const cleanStringContent = txt=>txt.replace(/,|{|}|\$/g,'')
        const cleaned = text.replace(/'[^']*'/g, cleanStringContent).replace(/"[^"]*"/g, cleanStringContent).replace(/`[^`]*`/gm, cleanStringContent);
        const profile_str = extractProfileStr(cleaned)
        const pt = ptOfProfile(profile_str)
        if (pt) {
            if (/^\s*,/.test(token) || /,\s*$/.test(profile_str))
                return jb.compParams(st.previewjb.comps[pt]).map(prop =>({ type: 'prop', prop, displayText: prop.id }) )
            if ((/^'/.test(token) || /\s*'$/.test(profile_str))) {
                const profile_str = extractProfileStr(cleaned)
                const currentProp = (profile_str.match(/([\$0-9A-Za-z_]*)\s*:[\s|\[]*$/) || ['',''])[1]
                const options = st.previewjb.comps[pt] ? 
                    (jb.compParams(st.previewjb.comps[pt]).filter(p=>p.id == currentProp)[0] || {}).options || '' : ''
                return options.split(',').map(opt => ({ type: 'enum', displayText: opt}))
            }
        }
        // pts of type
        const beforeProfile = cleaned.slice(0, findMatchingBlockBackwards(cleaned))
        const parentProfile = extractProfileStr(beforeProfile)
        const parentPt = ptOfProfile(parentProfile)
        const path = this.pathOfText(cleaned)
        const currentProp = typeof path.slice(-2)[0] == 'number' ? path.slice(-3)[0] : path.slice(-2)[0];
        //(parentProfile.match(/([\$0-9A-Za-z_]*)\s*:\s*$/) || ['',''])[1]
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
        const options = st.completion.hint(textToToken, token.string)
        const codeMirrorOptions = options.map(e=>asCodeMirrorOption(e))
            .filter(e=>!optionsFilter || e.displayText.indexOf(optionsFilter) != -1)
        const result = { list: codeMirrorOptions }
        jb.log('hint',['helper', { cur, token, textToToken, options, codeMirrorOptions}])
        return result;

        function asCodeMirrorOption(option) {
            const res = Object.assign(option,{text: option.displayText, hint: applyHint})
            option.backOffset = 0
            if (option.type == 'prop') {
                const separator = /,\s*$/.test(textToToken) ? '' : ','
                const space = /\s+$/.test(textToToken) ? '' : ' '
                let value = option.prop.defaultValue && jb.prettyPrint(option.prop.defaultValue,{comps: jb.studio.previewjb.comps})
                value = value || ((option.prop.type &&  option.prop.type != 'data') ? "{$: '' }" : "''")
                const spaceBeforeValue = value.indexOf('$') == -1 ? ' ' : ''
                const spaceBeforeColon = value.indexOf('$') == -1 ? '' : ' '
                res.text = `${separator}${space}${res.text}${spaceBeforeColon}:${spaceBeforeValue}${value}`
                }
            else if (option.type == 'pt') {
                res.text = /\$:\s*/.test(textToToken) ? `'${res.text}'` : `{ $: '${res.text}'`
            }
            else if (option.type == 'enum') {
                res.text = `'${res.text}'`
            }
            option.backOffset = res.text.split('').reverse().join('').indexOf("''") + 1;
            return res

            function applyHint(editor) {
                editor.replaceRange(option.text, Pos(cur.line, token.start), Pos(cur.line, token.end))
                setTimeout(() => editor.setCursor(editor.getCursor().line, editor.getCursor().ch - option.backOffset), 20)
            }
        }
        
    });
}
})()