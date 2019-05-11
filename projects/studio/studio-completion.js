const st = jb.studio;
st.completion = 
function(text, ctx) {
    const cleanStringContent = txt=>txt.replace(/,|{|}|\$/g,'')
    const cleaned = text.replace(/'[^']*'/g, cleanStringContent).replace(/"[^"]*"/g, cleanStringContent).replace(/`[^`]*`/gm, cleanStringContent);
    const profile_str = extractProfileStr(cleaned)
    const pt = ptOfProfile(profile_str)
    if (pt)
        return st.previewjb.comps[pt].params.map(p=>p.id)
    const beforeProfile = cleaned.slice(0, findMatchingBlockBackwards(cleaned))
    const parentProfile = extractProfileStr(beforeProfile)
    const parentPt = ptOfProfile(parentProfile)
    const currentProp = (parentProfile.match(/([\$0-9A-Za-z_]*)\s*:\s*$/) || ['',''])[1]
    const type = (st.previewjb.comps[parentPt].params.filter(p=>p.id == currentProp)[0] || {}).type || 'data'
    return st.PTsOfType(type);

    function findMatchingBlockBackwards(str) {
        const depth = 0;
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