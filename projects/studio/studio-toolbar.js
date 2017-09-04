jb.component('studio.pickAndOpen', {
	type: 'action',
	params: [
		{ id: 'from', options: 'studio,preview', as: 'string', defaultValue: 'preview'}
	],
	impl :{$: 'studio.pick',
		from: '%$from%',
	  	onSelect: [
      {$: 'write-value', to: '%$studio/last_pick_selection%', value: '%%' },
      {$: 'write-value', to: '%$studio/profile_path%', value: '%path%' },
			{$: 'studio.open-control-tree'},
      {$: 'studio.open-properties'},
 		],
	}
})

jb.component('studio.toolbar', {
  type: 'control', 
  impl :{$: 'group', 
    style :{$: 'studio-toolbar' }, 
    controls: [
      {$: 'label', 
        title: '', 
        features :{$: 'css', css: '{ width: 170px }' }
      }, 
      {$: 'button', 
        title: 'Select', 
        action :{$: 'studio.pickAndOpen' }, 
        style :{$: 'button.mdl-icon', 
          features :{$: 'css', css: '{transform: scaleX(-1)}' }, 
          icon: 'call_made'
        }
      }, 
      {$: 'button', 
        title: 'Save', 
        action :{$: 'studio.save-components' }, 
        style :{$: 'button.mdl-icon', icon: 'save' }, 
        features :{$: 'ctrl-action', 
          action :{$: 'studio.save-components', force: true }
        }
      }, 
      {$: 'button', 
        title: 'Refresh Preview', 
        action :{$: 'studio.refresh-preview' }, 
        style :{$: 'button.mdl-icon', icon: 'refresh' }
      }, 
      {$: 'button', 
        title: 'Javascript', 
        action :{$: 'studio.edit-source' }, 
        style :{$: 'button.mdl-icon', icon: 'code' }
      }, 
      {$: 'button', 
        title: 'Outline', 
        action :{$: 'studio.open-control-tree' }, 
        style :{$: 'button.mdl-icon', icon: 'format_align_left' }
      }, 
      {$: 'button', 
        title: 'Properties', 
        action :{$: 'studio.open-properties', focus: 'true' }, 
        style :{$: 'button.mdl-icon', icon: 'storage' }
      }, 
      {$: 'button', 
        title: 'jbEditor', 
        action :{$: 'studio.open-component-in-jb-editor', 
          path: '%$studio/project%.%$studio/page%'
        }, 
        style :{$: 'button.mdl-icon', icon: 'build' }, 
        features :{$: 'ctrl-action', 
          action :{$: 'studio.open-jb-editor', 
            path: '%$studio/profile_path%', 
            newWindow: true
          }
        }
      }, 
      {$: 'button', 
        title: 'Event Tracker', 
        action :{$: 'studio.open-event-tracker' }, 
        style :{$: 'button.mdl-icon', icon: 'hearing' }, 
        features :{$: 'ctrl-action', 
          action :{$: 'studio.open-event-tracker', studio: 'true' }
        }
      }, 
      {$: 'button', 
        title: 'History', 
        action :{$: 'studio.open-script-history' }, 
        style :{$: 'button.mdl-icon', icon: 'pets' }
      }, 
      {$: 'button', 
        title: 'Show Data', 
        action :{$: 'studio.showProbeData' }, 
        style :{$: 'button.mdl-icon', icon: 'input' }
      }, 
      {$: 'button', 
        title: 'Insert Control', 
        action :{$: 'studio.open-new-profile-dialog', 
          type: 'control', 
          mode: 'insert-control'
        }, 
        style :{$: 'button.mdl-icon', icon: 'add' }
      }, 
      {$: 'button', 
        title: 'Responsive', 
        action :{$: 'studio.open-responsive-phone-popup' }, 
        style :{$: 'button.mdl-icon', icon: 'tablet_android' }
      }
    ], 
    features: [
      {$: 'feature.keyboard-shortcut', 
        key: 'Alt+C', 
        action :{$: 'studio.pickAndOpen' }
      }, 
      {$: 'feature.keyboard-shortcut', 
        key: 'Alt++', 
        action :{$: 'studio.open-new-profile-dialog', 
          type: 'control', 
          mode: 'insert-control'
        }
      }, 
      {$: 'feature.keyboard-shortcut', 
        key: 'Alt+N', 
        action :{$: 'studio.pickAndOpen', from: 'studio' }
      }, 
      {$: 'feature.keyboard-shortcut', 
        key: 'Alt+X', 
        action :{$: 'studio.open-jb-editor', 
          path :{
            $firstSucceeding: ['%$studio/profile_path%', '%$studio/project%.%$studio/page%']
          }
        }
      }
    ]
  }
})

jb.component('studio_button.toolbarButton', {
	type: 'button.style',
	params: [
		{ id: 'spritePosition', as: 'string', defaultValue: '0,0' }
	],
	impl: {$: 'custom-style',
			template: (cmp,state,h) => h('button',{class: 'studio-btn-toolbar', click: _=> cmp.clicked() },
          h('span', {title: state.title, style: { 'background-position': state.pos} })),
      features: ctx => ({
          init: cmp =>
              cmp.state.pos = cmp.spritePosition.split(',').map(item => (-parseInt(item) * 16) + 'px').join(' '),
      })
	}
})

jb.component('studio-toolbar', {
  type: 'group.style',
  impl :{$: 'custom-style',
    features :{$: 'group.init-group' },
    template: (cmp,state,h) => h('section',{class:'jb-group'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx))),
    css: `{
            display: flex;
            height: 33px;
            width: 100%;
        }
        >*:not(:last-child) { padding-right: 8px }
        >* { margin-right: 0 }`
  }
})
