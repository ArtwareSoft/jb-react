jb.component('carmi.editor', {
    type: 'control',
    params: [{ id: 'path', defaultValue: 'carmi.doubleNegated' }],
    impl :{$: 'group',
      title: 'main',
      style :{$: 'layout.flex', align: 'flex-start' },
      controls: [
        {$: 'studio.jb-editor',
          path: 'carmi.doubleNegated'
        },
        {$: 'group',
          controls: [
            {$: 'label',
              title: '%$jbEditor_selection%',
              style :{$: 'label.span' }
            },
            {$: 'editable-text',
              databind :{$: 'studio.profile-as-text', path: '%$jbEditor_selection%' },
              style :{$: 'editable-text.textarea' },
              features: [
                {$: 'css.width', width: '300' },
                {$: 'css.height', height: '200' },
                {$: 'css.margin', left: '10' }
              ]
            }
          ],
          features: [
            {$: 'watch-ref',
              path: '%$jbEditor_selection%',
              ref: '%$jbEditor_selection%'
            }
          ]
        }
      ],
      features: [
        {$: 'css', css: '{ height: 200px; padding: 50px }' },
        {$: 'var',
          name: 'jbEditor_selection',
          value: 'carmi.doubleNegated',
          mutable: true
        },
        {$: 'var',
          name: 'circuit',
          value: 'carmi.doubleNegated'
        }
      ]
    }
  })
  