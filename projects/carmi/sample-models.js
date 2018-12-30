
jb.component('team_leaders', { 
    impl :{$: 'carmi.model',
        schemaByExample: ctx => ({
            nir: ['reut', 'or', 'yotam', 'oded'], 
            kaduri: ['nizan', 'lev', 'nir', 'ella'], 
            sivan: ['avi'], 
            or: ['Nir Zohar'], 
            oded: ['Avishai']
        }),
        vars: [
            {$: 'carmi.var', id: 'team_leaders',
                exp :{$: 'carmi.pipe', 
                     input :{$: 'carmi.root' },
                         pipe :[ 
                            {$: 'carmi.keys' },
                            {$: 'carmi.filter', 
                                condition :{$: 'carmi.not', of: 
                                    {$: 'carmi.or', 
                                        conditions: [
                                            {$: 'carmi.equal', to: 'oded'},
                                            {$: 'carmi.equal', to: 'or'},
                                        ]
                                    }
                                },
                            },
                ]},
            //carmi_exp: root.keys().filter(teamLeader => or(teamLeader.eq('oded'), teamLeader.eq('or')).not())
        }]
    }
})

jb.component('carmi.plus_plus', {
    impl :{$: 'carmi.model', 
    vars: [
      {$: 'carmi.var', 
        id: 'plus_plus', 
        exp :{$: 'carmi.pipe', 
          input :{$: 'carmi.root' }, 
          pipe: [
            {$: 'carmi.plus', toAdd: '5' }, 
            {$: 'carmi.plus', toAdd: '7' }, 
          ]
        }
      }
    ],
    schemaByExample: [10,20,30]
  }
  })
  
  jb.component('carmi.negated', {
      impl :{$: 'carmi.model',
          schemaByExample: [false, 1, 0],
          vars: [
              {$: 'carmi.var', id: 'negated',
                  exp :{$: 'carmi.map', 
                      array :{$: 'carmi.root'}, 
                      mapTo :{$: 'carmi.negate' }
                  }
              }
          ]
      }
  })
  
