jb.component('htmlDev', { passiveData: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script type="text/javascript">
    startTime = new Date().getTime();
  </script>
<!-- start-jb-scripts -->
<script type="text/javascript" src="/src/loader/jb-loader.js" modules="common,ui-common,material"></script>
<script type="text/javascript" src="/projects/sample1/sample1.js"></script>

<!-- end-jb-scripts -->
</head>
<body>
  <div id="main"> </div>
  <script>
    jb.ui.renderWidget({$:'sample1.main'},document.getElementById('main'))
  </script>
</body>
</html>`})

jb.component('htmlUser',{ passiveData: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script type="text/javascript">
    startTime = new Date().getTime();
  </script>
<!-- start-jb-scripts -->
<script type="text/javascript" src="/dist/jb-react-all.js"></script>
<script type="text/javascript" src="/dist/material.js"></script><link rel="stylesheet" type="text/css" href="/dist/material.css"/>
<script type="text/javascript" src="/sample1/sample1.js"></script>

<!-- end-jb-scripts -->
</head>
<body>
  <div id="main"> </div>
  <script>
    jb.ui.renderWidget({$:'sample1.main'},document.getElementById('main'))
  </script>
</body>
</html>`})

jb.component('htmlCloud', { passiveData: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script type="text/javascript">
    startTime = new Date().getTime();
  </script>
<!-- start-jb-scripts -->
<script type="text/javascript" src="//unpkg.com/jb-react/dist/jb-react-all.js"></script>
<script type="text/javascript" src="//unpkg.com/jb-react/dist/material.js"></script><link rel="stylesheet" type="text/css" href="//unpkg.com/jb-react/dist/material.css"/>
<script type="text/javascript" src="/sample1/sample1.js"></script>

<!-- end-jb-scripts -->
</head>
<body>
  <div id="main"> </div>
  <script>
    jb.ui.renderWidget({$:'sample1.main'},document.getElementById('main'))
  </script>
</body>
</html>`})

jb.resource('person', {
  name: "Homer Simpson",
  male: true,
  isMale: 'yes',
  age: 42
})


jb.resource('people-array', { "people": [
  { "name": "Homer Simpson" ,"age": 42 , "male": true},
  { "name": "Marge Simpson" ,"age": 38 , "male": false},
  { "name": "Bart Simpson"  ,"age": 12 , "male": true}
  ]
})

jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);

jb.component('sampleText1',{ passiveData: '#start hello world #end'});

jb.component('globals', {
  watchableData: {}
})


jb.resource('group-with-custom-style',
  {$: 'group',
    title: 'main',
    style : {$: 'customStyle',
    template: `<div class="jb-group">
        <div *ngFor="let ctrl of ctrls" class="group-item"><div *jbComp="ctrl"></div></div>
      </div>`,
      css: `.group-item { margin-bottom: %$spacing%px; display: block }
        .group-item:last-child { margin-bottom:0 }`,
    features :{$: 'group.init-group'}
  },
    controls : [
    {$: 'group', title: '2.0', controls :
       [
      { $: 'label', text: '2.1' },
      { $: 'button', title: '2.2' },
      ]
    },
    {$: 'label', text: '1.0' },
  ]}
)