const {getProcessArgument} = require('./utils.js')
const fs = require('fs');
const name = getProcessArgument('name') || 'sample1'
const baseDir = getProcessArgument('baseDir') || '';
const projDir = baseDir + '/' + name;

const files = [
    { fileName: `${name}.js`, content: `
jb.component('${name}.main', {
type: 'control',
impl: group({
    controls: [button('my button')]
    })
})

`},
    { fileName: `${name}.html`, content: `
<!DOCTYPE html>
<head>
<meta charset="utf-8">
<script type="text/javascript">
    startTime = new Date().getTime();
</script>
<script type="text/javascript" src="/src/loader/jb-loader.js" modules="common,ui-common,material-css"></script>
<script type="text/javascript" src="/projects/${name}/${name}.js"></script>
</head>
<body>
    <div id="main"> </div>
    <script>
    jb.ui.renderWidget({$:'${name}.main'},document.getElementById('main'))
    </script>
</body>
</html>
`}]


if (!getProcessArgument('name'))
    return console.log('Usage: node new-project -name:myProj -baseDir:projects')

try {
    fs.mkdirSync(baseDir);
} catch(e) {}

try {
    fs.mkdirSync(projDir);
} catch(e) {}

files.forEach(f=> fs.writeFileSync(projDir+ '/' + f.fileName,f.content))

