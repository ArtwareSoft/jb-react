(function () {
const st = jb.studio;

st.compsHistory = [];
st.undoIndex = 0;

function setToVersion(versionIndex, ctx, after) {
  const version = st.compsHistory[versionIndex];
  if (!version || !version.opEvent) debugger;

  let opEvent = Object.assign({}, version.opEvent);
  opEvent.oldVal = version.opEvent.newVal;
  opEvent.newVal = version.opEvent.oldVal;
  opEvent.srcCtx = ctx;

  if (after) {
    st.previewjb.comps = version.after;
    st.compsRefHandler.resourceVersions = version.opEvent.resourceVersionsAfter;
  } else {
    st.previewjb.comps = version.before;
    st.compsRefHandler.resourceVersions = version.opEvent.resourceVersionsBefore;
  }

  st.compsRefHandler.resourceChange.next(opEvent);
}

jb.component('studio.undo', {
  type: 'action',
  impl: ctx => {
    if (st.undoIndex > 0)
      setToVersion(--st.undoIndex, ctx)
  }
})

jb.component('studio.clean-selection-preview', {
  type: 'action',
  impl: () => {
    if (st.compsHistory.length > 0)
      st.previewjb.comps = st.compsHistory.slice(-1)[0].after;
  }
})

jb.component('studio.revert', {
  type: 'action',
  params: [
    { id: 'toIndex', as: 'number' }
  ],
  impl: (ctx, toIndex) => {
    if (st.compsHistory.length == 0 || toIndex < 0) return;
    st.undoIndex = toIndex;
    st.compsHistory = st.compsHistory.slice(0, toIndex + 1);
    setToVersion(st.undoIndex, ctx)
  }
})

jb.component('studio.redo', {
  type: 'action',
  impl: ctx => {
    if (st.undoIndex < st.compsHistory.length)
      setToVersion(st.undoIndex++, ctx, true)
  }
})

jb.component('studio.copy', {
  type: 'action',
  params: [{ id: 'path', as: 'string' }],
  impl: (ctx, path) => {
    try {
      st.clipboard = eval('(' + jb.prettyPrint(st.valOfPath(path)) + ')')
    } catch(e) {}
  }
})

jb.component('studio.paste', {
  type: 'action',
  params: [{ id: 'path', as: 'string' }],
  impl: (ctx, path) =>
    (st.clipboard != null) && jb.writeValue(st.refOfPath(path), st.clipboard, ctx)
})

jb.component('studio.script-history-items', {
  impl: ctx => st.compsHistory
})

jb.component('studio.comps-undo-index', {
  impl: ctx => st.undoIndex - 1
})

jb.component('studio.script-history', {
  type: 'control',
  impl: {
    $: 'group',
    controls: [
      {
        $: 'table',
        items: { $: 'studio.script-history-items' },
        fields: [
          {
            $: 'field.control',
            title: 'changed',
            control: {
              $: 'button',
              title: { $: 'studio.name-of-ref', ref: '%opEvent/ref%' },
              action: {
                $: 'studio.goto-path',
                path: { $: 'studio.path-of-ref', ref: '%opEvent/ref%' }
              },
              style: { $: 'button.href' },
              features: {
                $: 'feature.hover-title',
                title: { $: 'studio.path-of-ref', ref: '%opEvent/ref%' }
              }
            },
            width: '100'
          },
          {
            $: 'field',
            title: 'from',
            data: { $: 'pretty-print', profile: '%opEvent/oldVal%' },
            width: '200'
          },
          {
            $: 'field',
            title: 'to',
            data: { $: 'pretty-print', profile: '%opEvent/newVal%' },
            width: '200'
          },
          {
            $: 'field.control',
            title: 'undo/redo',
            control: {
              $: 'button',
              title: 'revert to here',
              action: { $: 'studio.revert', toIndex: '%undoIndex%' },
              style: { $: 'button.href' }
            },
            width: '100'
          }
        ],
        style: { $: 'table.with-headers' }
      }
    ],
    features: [
      {
        $: 'watch-observable',
        toWatch: ctx => st.compsRefHandler.resourceChange.debounceTime(500),
      },
      { $: 'css.height', height: '400', overflow: 'auto', minMax: 'max' }
    ]
  }
})

jb.component('studio.open-script-history', {
  type: 'action',
  impl: {
    $: 'open-dialog',
    content: { $: 'studio.script-history' },
    style: {
      $: 'dialog.studio-floating',
      id: 'script-history',
      width: '700',
      height: '400'
    },
    title: 'Script History'
  }
})

})()
