
component('probe_sampleProbe', {
  passiveData: {
    result: [
      {
        in: {id: 77, path: 'test.probePipeline~impl~items~1', profile: '%%', data: 'a', vars: {v1: 1, v2: 2}},
        out: ['a'],
        counter: 0
      },
      {
        in: {id: 78, path: 'test.probePipeline~impl~items~1', profile: '%%', data: 'b', vars: {v1: 1, v2: 2}},
        out: ['b'],
        counter: 0
      }
    ]
  }
})

component('probe_sample_result_with_logs', {
  passiveData: {
    result: {
      probePath: 'uiTest.group~impl~expectedResult',
      result: [
        {
          out: true,
          in: {
            data: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>
`,
            vars: {
              $serviceRegistry: {baseCtx: {id: 10, path: 'uiTest.group~impl', profile: uiTest.group(), data: null, vars: {}}, services: {}},
              testID: 'uiTest.group',
              singleTest: true,
              uiTest: true,
              widgetId: 'main-29',
              headlessWidget: true,
              remoteUiTest: false,
              headlessWidgetId: 'main-29',
              useFrontEndInTest: false,
              transactiveHeadless: false,
              engineForTest: ''
            }
          }
        }
      ],
      circuitRes: {
        id: 'uiTest.group',
        success: true,
        html: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>`,
        css: '',
        all: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>
`
      },
      simpleVisits: 1,
      totalTime: 17,
      circuitPath: 'uiTest.group~impl',
      errors: [],
      logs: [
        {
          logNames: 'headless widget handle userRequset',
          widgetId: 'main-29',
          userReq: {
            $: 'createHeadlessWidget',
            ctrl: runCtx('uiTest~impl~calculate~items~0~elems~2~rx~control', {uiTest: true, widgetId: 'main-29'}, {
              profile: '%$control()%'
            }),
            widgetId: 'main-29'
          },
          reqCtx: {
            id: 126,
            path: 'uiTest~impl~calculate~items~0~elems~2~rx',
            profile: widget.headless('%$control()%', '%$widgetId%', {
              transactiveHeadless: '%$transactiveHeadless%'
            }),
            vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
          },
          ctx: {
            id: 126,
            path: 'uiTest~impl~calculate~items~0~elems~2~rx',
            profile: widget.headless('%$control()%', '%$widgetId%', {
              transactiveHeadless: '%$transactiveHeadless%'
            }),
            vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
          },
          index: 0,
          source: ['Object.handleUserReq','remote-widget.js?main:225:8','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:225:8)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
          _time: '3:675',
          time: 1707575343675,
          mem: null,
          $attsOrder: ['widgetId','tx','userReq','reqCtx','ctx'],
          stack: ['uiTest~impl~calculate~items~0~elems~2~rx','uiTest.group~impl']
        },
        {
          logNames: 'create headless widget',
          widgetId: 'main-29',
          path: 'uiTest~impl~calculate~items~0~elems~2~rx',
          index: 1,
          source: ['Object.createHeadlessWidget','remote-widget.js?main:207:8','at Object.createHeadlessWidget (/plugins/remote-widget/remote-widget.js?main:207:8)','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:237:13)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
          _time: '3:676',
          time: 1707575343676,
          mem: null,
          $attsOrder: ['widgetId','path']
        },
        {
          logNames: 'headless widget created',
          widgetId: 'main-29',
          body: {
            attributes: {widgettop: 'true', headless: 'true', widgetid: 'main-29'},
            tag: 'div',
            children: [
              {
                attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                tag: 'div',
                children: [
                  {
                    attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                    tag: 'span'
                  },
                  {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                ]
              }
            ]
          },
          index: 2,
          source: ['Object.createHeadlessWidget','remote-widget.js?main:214:8','at Object.createHeadlessWidget (/plugins/remote-widget/remote-widget.js?main:214:8)','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:237:13)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
          _time: '3:681',
          time: 1707575343681,
          mem: null,
          $attsOrder: ['widgetId','body']
        },
        {
          logNames: 'headless widget delta out 1',
          updatesCounter: 1,
          widgetId: 'main-29',
          t: 1,
          d: {
            widgetId: 'main-29',
            delta: {
              children: {
                resetAll: true,
                toAppend: [
                  {
                    attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                    children: [
                      {
                        attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                        tag: 'span'
                      },
                      {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                    ],
                    tag: 'div'
                  }
                ]
              }
            },
            reqCtx: {
              id: 126,
              path: 'uiTest~impl~calculate~items~0~elems~2~rx',
              profile: widget.headless('%$control()%', '%$widgetId%', {
                transactiveHeadless: '%$transactiveHeadless%'
              }),
              vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
            }
          },
          ctx: {
            id: 96,
            path: 'uiTest~impl~calculate~items~0~elems~2~rx',
            profile: widget.headless('%$control()%', '%$widgetId%', {
              transactiveHeadless: '%$transactiveHeadless%'
            }),
            vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
          },
          json: {
            widgetId: 'main-29',
            delta: {
              children: {
                resetAll: true,
                toAppend: [
                  {
                    attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                    children: [
                      {
                        attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                        tag: 'span'
                      },
                      {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                    ],
                    tag: 'div'
                  }
                ]
              }
            }
          },
          index: 3,
          source: ['headless','remote-widget.js?main:278:16','at headless (/plugins/remote-widget/remote-widget.js?main:278:16)','at filter (/plugins/rx/jb-callbag.js?main:57:29)','at eval (/plugins/rx/jb-callbag.js?main:521:43)','at Array.forEach (<anonymous>)','at subj (/plugins/rx/jb-callbag.js?main:519:28)','at Function.subj.next (/plugins/rx/jb-callbag.js?main:525:41)','at Object.sendRenderingUpdate (/plugins/ui/core/jb-react.js?main:490:41)','at Object.createHeadlessWidget (/plugins/remote-widget/remote-widget.js?main:216:11)','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:237:13)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
          _time: '3:681',
          time: 1707575343681,
          mem: null,
          $attsOrder: ['updatesCounter','widgetId','t','d','ctx','json'],
          stack: ['uiTest~impl~calculate~items~0~elems~2~rx','uiTest.group~impl']
        },
        {
          logNames: 'uiTest aggregate delta',
          ctx: {
            id: 220,
            path: 'uiTest~impl~calculate~items~0~elems~3~action',
            profile: uiTest.aggregateDelta('%%'),
            data: {
              widgetId: 'main-29',
              delta: {
                children: {
                  resetAll: true,
                  toAppend: [
                    {
                      attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                      children: [
                        {
                          attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                          tag: 'span'
                        },
                        {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                      ],
                      tag: 'div'
                    }
                  ]
                }
              },
              reqCtx: {
                id: 126,
                path: 'uiTest~impl~calculate~items~0~elems~2~rx',
                profile: widget.headless('%$control()%', '%$widgetId%', {
                  transactiveHeadless: '%$transactiveHeadless%'
                }),
                vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
              }
            },
            vars: {uiTest: true, widgetId: 'main-29'}
          },
          delta: {
            children: {
              resetAll: true,
              toAppend: [
                {
                  attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                  children: [
                    {
                      attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                      tag: 'span'
                    },
                    {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                  ],
                  tag: 'div'
                }
              ]
            }
          },
          renderingUpdate: {
            widgetId: 'main-29',
            delta: {
              children: {
                resetAll: true,
                toAppend: [
                  {
                    attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                    children: [
                      {
                        attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                        tag: 'span'
                      },
                      {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                    ],
                    tag: 'div'
                  }
                ]
              }
            },
            reqCtx: {
              id: 126,
              path: 'uiTest~impl~calculate~items~0~elems~2~rx',
              profile: widget.headless('%$control()%', '%$widgetId%', {
                transactiveHeadless: '%$transactiveHeadless%'
              }),
              vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
            }
          },
          widgetBody: {
            attributes: {widgetid: 'main-29', widgettop: 'true', frontend: 'true'},
            tag: 'div',
            children: [
              {
                attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                children: [
                  {
                    attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                    tag: 'span'
                  },
                  {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                ],
                tag: 'div'
              }
            ]
          },
          elem: {
            attributes: {widgetid: 'main-29', widgettop: 'true', frontend: 'true'},
            tag: 'div',
            children: [
              {
                attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                children: [
                  {
                    attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                    tag: 'span'
                  },
                  {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                ],
                tag: 'div'
              }
            ]
          },
          index: 4,
          source: ['aggDelta','ui-testers.js?main:188:6','at aggDelta (/plugins/ui/tests/ui-testers.js?main:188:6)','at uiTest.aggregateDelta (/plugins/ui/tests/ui-testers.js?main:178:14)','at Do (/plugins/rx/jb-callbag.js?main:45:23)','at headless (/plugins/remote-widget/remote-widget.js?main:279:13)','at filter (/plugins/rx/jb-callbag.js?main:57:29)','at eval (/plugins/rx/jb-callbag.js?main:521:43)','at Array.forEach (<anonymous>)','at subj (/plugins/rx/jb-callbag.js?main:519:28)','at Function.subj.next (/plugins/rx/jb-callbag.js?main:525:41)','at Object.sendRenderingUpdate (/plugins/ui/core/jb-react.js?main:490:41)','at Object.createHeadlessWidget (/plugins/remote-widget/remote-widget.js?main:216:11)','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:237:13)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
          _time: '3:682',
          time: 1707575343682,
          mem: null,
          $attsOrder: ['ctx','delta','renderingUpdate','cmpId','widgetBody','elem'],
          stack: ['uiTest~impl~calculate~items~0~elems~3~action','uiTest.group~impl']
        },
        {
          logNames: 'uiTest uiDelta from headless 1',
          data: {
            widgetId: 'main-29',
            delta: {
              children: {
                resetAll: true,
                toAppend: [
                  {
                    attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                    children: [
                      {
                        attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                        tag: 'span'
                      },
                      {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                    ],
                    tag: 'div'
                  }
                ]
              }
            },
            reqCtx: {
              id: 126,
              path: 'uiTest~impl~calculate~items~0~elems~2~rx',
              profile: widget.headless('%$control()%', '%$widgetId%', {
                transactiveHeadless: '%$transactiveHeadless%'
              }),
              vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
            }
          },
          vars: {
            $serviceRegistry: {baseCtx: {id: 10, path: 'uiTest.group~impl', profile: uiTest.group(), data: null, vars: {}}, services: {}},
            testID: 'uiTest.group',
            singleTest: true,
            uiTest: true,
            widgetId: 'main-29',
            headlessWidget: true,
            remoteUiTest: false,
            headlessWidgetId: 'main-29',
            useFrontEndInTest: false,
            transactiveHeadless: false,
            engineForTest: '',
            uiActionsTimeout: 2000,
            renderingCounters: '1'
          },
          ctx: {id: 114, path: 'rx.log~impl', profile: rx.do(), vars: {uiTest: true, widgetId: 'main-29'}},
          index: 5,
          source: ['Do','jb-callbag.js?main:45:23','at Do (/plugins/rx/jb-callbag.js?main:45:23)','at Do (/plugins/rx/jb-callbag.js?main:46:11)','at headless (/plugins/remote-widget/remote-widget.js?main:279:13)','at filter (/plugins/rx/jb-callbag.js?main:57:29)','at eval (/plugins/rx/jb-callbag.js?main:521:43)','at Array.forEach (<anonymous>)','at subj (/plugins/rx/jb-callbag.js?main:519:28)','at Function.subj.next (/plugins/rx/jb-callbag.js?main:525:41)','at Object.sendRenderingUpdate (/plugins/ui/core/jb-react.js?main:490:41)','at Object.createHeadlessWidget (/plugins/remote-widget/remote-widget.js?main:216:11)','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:237:13)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
          _time: '3:683',
          time: 1707575343683,
          mem: null,
          $attsOrder: ['data','vars','ctx'],
          stack: ['rx.log~impl','uiTest.group~impl']
        },
        {
          logNames: 'headless widget register FE',
          widgetId: 'main-29',
          t: 0,
          ctx: {
            id: 96,
            path: 'uiTest~impl~calculate~items~0~elems~2~rx',
            profile: widget.headless('%$control()%', '%$widgetId%', {
              transactiveHeadless: '%$transactiveHeadless%'
            }),
            vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
          },
          index: 6,
          source: ['headless','remote-widget.js?main:288:14','at headless (/plugins/remote-widget/remote-widget.js?main:288:14)','at Do (/plugins/rx/jb-callbag.js?main:46:11)','at 0: typeAdapter (/plugins/ui/tests/ui-action.js?main:125:7)','at register 1: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:286:7)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
          _time: '3:684',
          time: 1707575343684,
          mem: null,
          $attsOrder: ['widgetId','t','d','ctx'],
          stack: ['uiTest~impl~calculate~items~0~elems~2~rx','uiTest.group~impl']
        },
        {
          logNames: 'headless widget unregister FE',
          widgetId: 'main-29',
          t: 2,
          ctx: {
            id: 96,
            path: 'uiTest~impl~calculate~items~0~elems~2~rx',
            profile: widget.headless('%$control()%', '%$widgetId%', {
              transactiveHeadless: '%$transactiveHeadless%'
            }),
            vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
          },
          index: 7,
          source: ['headless','remote-widget.js?main:292:14','at headless (/plugins/remote-widget/remote-widget.js?main:292:14)','at Do (/plugins/rx/jb-callbag.js?main:46:11)','at nextSource (/plugins/ui/tests/ui-action.js?main:85:11)','at nextSource (/plugins/ui/tests/ui-action.js?main:100:11)','at eval (/plugins/ui/tests/ui-action.js?main:104:13)'],
          _time: '3:684',
          time: 1707575343684,
          mem: null,
          $attsOrder: ['widgetId','t','d','ctx'],
          stack: ['uiTest~impl~calculate~items~0~elems~2~rx','uiTest.group~impl']
        },
        {
          logNames: 'check test result',
          testRes: {
            html: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>`,
            css: '',
            all: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>
`
          },
          success: true,
          expectedResultRes: true,
          countersErr: '',
          expectedResultCtx: {
            id: 254,
            path: 'uiTest~impl',
            profile: dataTest({
              vars: [
                Var('uiTest', true),
                Var('widgetId', widget.newId()),
                Var('headlessWidget', true),
                Var('remoteUiTest', notEquals('%$backEndJbm%')),
                Var('headlessWidgetId', '%$widgetId%'),
                Var('useFrontEndInTest', '%$useFrontEnd%'),
                Var('transactiveHeadless', '%$transactiveHeadless%'),
                Var('testRenderingUpdate'),
                Var('engineForTest', '%$engine%')
              ],
              calculate: pipe(
                Var('uiActionsTimeout', If('%$backEndJbm%', 2000, 3000)),
                rx.pipe(
                  typeAdapter('ui-action<test>', {
                    $: 'uiActions',
                    actions: [
                      {$: 'waitForPromise', promise: remote.waitForJbm('%$backEndJbm%')},
                      '%$uiAction()%'
                    ]
                  }),
                  rx.log('uiTest userRequest'),
                  remote.operator({
                    rx: widget.headless('%$control()%', '%$widgetId%', {
                      transactiveHeadless: '%$transactiveHeadless%'
                    }),
                    jbm: '%$backEndJbm%'
                  }),
                  rx.do(uiTest.aggregateDelta('%%')),
                  rx.var('renderingCounters', uiTest.postTestRenderingUpdate()),
                  rx.log('uiTest uiDelta from headless %$renderingCounters%'),
                  rx.toArray(),
                  rx.map(uiTest.vdomResultAsHtml()),
                  rx.do()
                ),
                first()
              ),
              expectedResult: pipeline('%all%', '%$expectedResult()%', first()),
              runBefore: runActions(uiTest.addFrontEndEmulation(), '%$runBefore()%'),
              timeout: If(equals('%$backEndJbm%'), '%$timeout%', 5000),
              allowError: '%$allowError()%',
              cleanUp: runActions(uiTest.removeFrontEndEmulation(), call('cleanUp')),
              expectedCounters: '%$expectedCounters%'
            }),
            data: {
              html: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>`,
              css: '',
              all: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>
`
            },
            vars: {
              singleTest: true,
              uiTest: true,
              widgetId: 'main-29',
              headlessWidget: true,
              remoteUiTest: false,
              headlessWidgetId: 'main-29',
              useFrontEndInTest: false,
              transactiveHeadless: false,
              testRenderingUpdate: `@js@function subj(t, d, transactive) {
          if (t === 0) {
              const sink = d
              id && jb.log(\`\${id} subject sink registered\`,{sink})
              sinks.push(sink)
              sink(0, function subject(t,d) {
                  if (t === 2) {
                      const i = sinks.indexOf(sink)
                      if (i > -1) {
                        const sink = sinks.splice(i, 1)
                        id && jb.log(\`\${id} subject sink unregistered\`,{sink})
                      }
                  }
              })
          } else {
            id && t == 1 && jb.log(\`\${id} subject next\`,{d, sinks: sinks.slice(0)})
            id && t == 2 && jb.log(\`\${id} subject complete\`,{d, sinks: sinks.slice(0)})
            sinks.slice(0).forEach(sink=> {
              const td = transactive ? jb.callbag.childTxInData(d,sinks.length) : d
              sinks.indexOf(sink) > -1 && sink(t, td)
            })
          }
      }`,
              engineForTest: ''
            }
          },
          index: 8,
          source: ['dataTest','testers.js?main:40:7','at dataTest (/plugins/testing/testers.js?main:40:7)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
          _time: '3:686',
          time: 1707575343686,
          mem: null,
          $attsOrder: ['testRes','success','expectedResultRes','testFailure','countersErr','expectedResultCtx']
        }
      ]
    },
    errors: [],
    logs: [
      {
        logNames: 'headless widget handle userRequset',
        widgetId: 'main-29',
        userReq: {
          $: 'createHeadlessWidget',
          ctrl: runCtx('uiTest~impl~calculate~items~0~elems~2~rx~control', {uiTest: true, widgetId: 'main-29'}, {
            profile: '%$control()%'
          }),
          widgetId: 'main-29'
        },
        reqCtx: {
          id: 126,
          path: 'uiTest~impl~calculate~items~0~elems~2~rx',
          profile: widget.headless('%$control()%', '%$widgetId%', {
            transactiveHeadless: '%$transactiveHeadless%'
          }),
          vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
        },
        ctx: {
          id: 126,
          path: 'uiTest~impl~calculate~items~0~elems~2~rx',
          profile: widget.headless('%$control()%', '%$widgetId%', {
            transactiveHeadless: '%$transactiveHeadless%'
          }),
          vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
        },
        index: 0,
        source: ['Object.handleUserReq','remote-widget.js?main:225:8','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:225:8)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
        _time: '3:675',
        time: 1707575343675,
        mem: null,
        $attsOrder: ['widgetId','tx','userReq','reqCtx','ctx'],
        stack: ['uiTest~impl~calculate~items~0~elems~2~rx','uiTest.group~impl']
      },
      {
        logNames: 'create headless widget',
        widgetId: 'main-29',
        path: 'uiTest~impl~calculate~items~0~elems~2~rx',
        index: 1,
        source: ['Object.createHeadlessWidget','remote-widget.js?main:207:8','at Object.createHeadlessWidget (/plugins/remote-widget/remote-widget.js?main:207:8)','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:237:13)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
        _time: '3:676',
        time: 1707575343676,
        mem: null,
        $attsOrder: ['widgetId','path']
      },
      {
        logNames: 'headless widget created',
        widgetId: 'main-29',
        body: {
          attributes: {widgettop: 'true', headless: 'true', widgetid: 'main-29'},
          tag: 'div',
          children: [
            {
              attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
              tag: 'div',
              children: [
                {
                  attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                  tag: 'span'
                },
                {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
              ]
            }
          ]
        },
        index: 2,
        source: ['Object.createHeadlessWidget','remote-widget.js?main:214:8','at Object.createHeadlessWidget (/plugins/remote-widget/remote-widget.js?main:214:8)','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:237:13)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
        _time: '3:681',
        time: 1707575343681,
        mem: null,
        $attsOrder: ['widgetId','body']
      },
      {
        logNames: 'headless widget delta out 1',
        updatesCounter: 1,
        widgetId: 'main-29',
        t: 1,
        d: {
          widgetId: 'main-29',
          delta: {
            children: {
              resetAll: true,
              toAppend: [
                {
                  attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                  children: [
                    {
                      attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                      tag: 'span'
                    },
                    {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                  ],
                  tag: 'div'
                }
              ]
            }
          },
          reqCtx: {
            id: 126,
            path: 'uiTest~impl~calculate~items~0~elems~2~rx',
            profile: widget.headless('%$control()%', '%$widgetId%', {
              transactiveHeadless: '%$transactiveHeadless%'
            }),
            vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
          }
        },
        ctx: {
          id: 96,
          path: 'uiTest~impl~calculate~items~0~elems~2~rx',
          profile: widget.headless('%$control()%', '%$widgetId%', {
            transactiveHeadless: '%$transactiveHeadless%'
          }),
          vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
        },
        json: {
          widgetId: 'main-29',
          delta: {
            children: {
              resetAll: true,
              toAppend: [
                {
                  attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                  children: [
                    {
                      attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                      tag: 'span'
                    },
                    {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                  ],
                  tag: 'div'
                }
              ]
            }
          }
        },
        index: 3,
        source: ['headless','remote-widget.js?main:278:16','at headless (/plugins/remote-widget/remote-widget.js?main:278:16)','at filter (/plugins/rx/jb-callbag.js?main:57:29)','at eval (/plugins/rx/jb-callbag.js?main:521:43)','at Array.forEach (<anonymous>)','at subj (/plugins/rx/jb-callbag.js?main:519:28)','at Function.subj.next (/plugins/rx/jb-callbag.js?main:525:41)','at Object.sendRenderingUpdate (/plugins/ui/core/jb-react.js?main:490:41)','at Object.createHeadlessWidget (/plugins/remote-widget/remote-widget.js?main:216:11)','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:237:13)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
        _time: '3:681',
        time: 1707575343681,
        mem: null,
        $attsOrder: ['updatesCounter','widgetId','t','d','ctx','json'],
        stack: ['uiTest~impl~calculate~items~0~elems~2~rx','uiTest.group~impl']
      },
      {
        logNames: 'uiTest aggregate delta',
        ctx: {
          id: 220,
          path: 'uiTest~impl~calculate~items~0~elems~3~action',
          profile: uiTest.aggregateDelta('%%'),
          data: {
            widgetId: 'main-29',
            delta: {
              children: {
                resetAll: true,
                toAppend: [
                  {
                    attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                    children: [
                      {
                        attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                        tag: 'span'
                      },
                      {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                    ],
                    tag: 'div'
                  }
                ]
              }
            },
            reqCtx: {
              id: 126,
              path: 'uiTest~impl~calculate~items~0~elems~2~rx',
              profile: widget.headless('%$control()%', '%$widgetId%', {
                transactiveHeadless: '%$transactiveHeadless%'
              }),
              vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
            }
          },
          vars: {uiTest: true, widgetId: 'main-29'}
        },
        delta: {
          children: {
            resetAll: true,
            toAppend: [
              {
                attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                children: [
                  {
                    attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                    tag: 'span'
                  },
                  {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                ],
                tag: 'div'
              }
            ]
          }
        },
        renderingUpdate: {
          widgetId: 'main-29',
          delta: {
            children: {
              resetAll: true,
              toAppend: [
                {
                  attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                  children: [
                    {
                      attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                      tag: 'span'
                    },
                    {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                  ],
                  tag: 'div'
                }
              ]
            }
          },
          reqCtx: {
            id: 126,
            path: 'uiTest~impl~calculate~items~0~elems~2~rx',
            profile: widget.headless('%$control()%', '%$widgetId%', {
              transactiveHeadless: '%$transactiveHeadless%'
            }),
            vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
          }
        },
        widgetBody: {
          attributes: {widgetid: 'main-29', widgettop: 'true', frontend: 'true'},
          tag: 'div',
          children: [
            {
              attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
              children: [
                {
                  attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                  tag: 'span'
                },
                {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
              ],
              tag: 'div'
            }
          ]
        },
        elem: {
          attributes: {widgetid: 'main-29', widgettop: 'true', frontend: 'true'},
          tag: 'div',
          children: [
            {
              attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
              children: [
                {
                  attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                  tag: 'span'
                },
                {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
              ],
              tag: 'div'
            }
          ]
        },
        index: 4,
        source: ['aggDelta','ui-testers.js?main:188:6','at aggDelta (/plugins/ui/tests/ui-testers.js?main:188:6)','at uiTest.aggregateDelta (/plugins/ui/tests/ui-testers.js?main:178:14)','at Do (/plugins/rx/jb-callbag.js?main:45:23)','at headless (/plugins/remote-widget/remote-widget.js?main:279:13)','at filter (/plugins/rx/jb-callbag.js?main:57:29)','at eval (/plugins/rx/jb-callbag.js?main:521:43)','at Array.forEach (<anonymous>)','at subj (/plugins/rx/jb-callbag.js?main:519:28)','at Function.subj.next (/plugins/rx/jb-callbag.js?main:525:41)','at Object.sendRenderingUpdate (/plugins/ui/core/jb-react.js?main:490:41)','at Object.createHeadlessWidget (/plugins/remote-widget/remote-widget.js?main:216:11)','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:237:13)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
        _time: '3:682',
        time: 1707575343682,
        mem: null,
        $attsOrder: ['ctx','delta','renderingUpdate','cmpId','widgetBody','elem'],
        stack: ['uiTest~impl~calculate~items~0~elems~3~action','uiTest.group~impl']
      },
      {
        logNames: 'uiTest uiDelta from headless 1',
        data: {
          widgetId: 'main-29',
          delta: {
            children: {
              resetAll: true,
              toAppend: [
                {
                  attributes: {class: '', 'ctx-id': '156', 'cmp-id': 'main-1', 'cmp-ver': '1', 'cmp-pt': 'group'},
                  children: [
                    {
                      attributes: {$text: 'hello world', 'ctx-id': '204', 'cmp-id': 'main-2', 'cmp-ver': '1', 'cmp-pt': 'text'},
                      tag: 'span'
                    },
                    {attributes: {$text: '2', 'ctx-id': '211', 'cmp-id': 'main-3', 'cmp-ver': '1', 'cmp-pt': 'text'}, tag: 'span'}
                  ],
                  tag: 'div'
                }
              ]
            }
          },
          reqCtx: {
            id: 126,
            path: 'uiTest~impl~calculate~items~0~elems~2~rx',
            profile: widget.headless('%$control()%', '%$widgetId%', {
              transactiveHeadless: '%$transactiveHeadless%'
            }),
            vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
          }
        },
        vars: {
          $serviceRegistry: {baseCtx: {id: 10, path: 'uiTest.group~impl', profile: uiTest.group(), data: null, vars: {}}, services: {}},
          testID: 'uiTest.group',
          singleTest: true,
          uiTest: true,
          widgetId: 'main-29',
          headlessWidget: true,
          remoteUiTest: false,
          headlessWidgetId: 'main-29',
          useFrontEndInTest: false,
          transactiveHeadless: false,
          engineForTest: '',
          uiActionsTimeout: 2000,
          renderingCounters: '1'
        },
        ctx: {id: 114, path: 'rx.log~impl', profile: rx.do(), vars: {uiTest: true, widgetId: 'main-29'}},
        index: 5,
        source: ['Do','jb-callbag.js?main:45:23','at Do (/plugins/rx/jb-callbag.js?main:45:23)','at Do (/plugins/rx/jb-callbag.js?main:46:11)','at headless (/plugins/remote-widget/remote-widget.js?main:279:13)','at filter (/plugins/rx/jb-callbag.js?main:57:29)','at eval (/plugins/rx/jb-callbag.js?main:521:43)','at Array.forEach (<anonymous>)','at subj (/plugins/rx/jb-callbag.js?main:519:28)','at Function.subj.next (/plugins/rx/jb-callbag.js?main:525:41)','at Object.sendRenderingUpdate (/plugins/ui/core/jb-react.js?main:490:41)','at Object.createHeadlessWidget (/plugins/remote-widget/remote-widget.js?main:216:11)','at Object.handleUserReq (/plugins/remote-widget/remote-widget.js?main:237:13)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:284:13)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
        _time: '3:683',
        time: 1707575343683,
        mem: null,
        $attsOrder: ['data','vars','ctx'],
        stack: ['rx.log~impl','uiTest.group~impl']
      },
      {
        logNames: 'headless widget register FE',
        widgetId: 'main-29',
        t: 0,
        ctx: {
          id: 96,
          path: 'uiTest~impl~calculate~items~0~elems~2~rx',
          profile: widget.headless('%$control()%', '%$widgetId%', {
            transactiveHeadless: '%$transactiveHeadless%'
          }),
          vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
        },
        index: 6,
        source: ['headless','remote-widget.js?main:288:14','at headless (/plugins/remote-widget/remote-widget.js?main:288:14)','at Do (/plugins/rx/jb-callbag.js?main:46:11)','at 0: typeAdapter (/plugins/ui/tests/ui-action.js?main:125:7)','at register 1: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register 2: remote.operator (/plugins/remote-widget/remote-widget.js?main:286:7)','at register 3: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register 5: rx.log (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:722:5)','at register 6: rx.toArray (/plugins/rx/jb-callbag.js?main:65:7)','at register 7: rx.map (/plugins/rx/jb-callbag.js?main:65:7)','at register 8: rx.do (/plugins/rx/jb-callbag.js?main:44:7)','at register  (/plugins/rx/jb-callbag.js?main:65:7)','at eval (/plugins/rx/jb-callbag.js?main:786:15)','at new Promise (<anonymous>)','at toPromiseArray (/plugins/rx/jb-callbag.js?main:785:14)','at Object.toSynchArray (/plugins/core/core-utils.js?main:337:76)','at eval (/plugins/common/jb-common.js?main:75:38)','at async eval (/plugins/testing/testers.js?main:31:18)','at async dataTest (/plugins/testing/testers.js?main:24:20)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
        _time: '3:684',
        time: 1707575343684,
        mem: null,
        $attsOrder: ['widgetId','t','d','ctx'],
        stack: ['uiTest~impl~calculate~items~0~elems~2~rx','uiTest.group~impl']
      },
      {
        logNames: 'headless widget unregister FE',
        widgetId: 'main-29',
        t: 2,
        ctx: {
          id: 96,
          path: 'uiTest~impl~calculate~items~0~elems~2~rx',
          profile: widget.headless('%$control()%', '%$widgetId%', {
            transactiveHeadless: '%$transactiveHeadless%'
          }),
          vars: {uiTest: true, widgetId: 'main-29', transactiveHeadless: false}
        },
        index: 7,
        source: ['headless','remote-widget.js?main:292:14','at headless (/plugins/remote-widget/remote-widget.js?main:292:14)','at Do (/plugins/rx/jb-callbag.js?main:46:11)','at nextSource (/plugins/ui/tests/ui-action.js?main:85:11)','at nextSource (/plugins/ui/tests/ui-action.js?main:100:11)','at eval (/plugins/ui/tests/ui-action.js?main:104:13)'],
        _time: '3:684',
        time: 1707575343684,
        mem: null,
        $attsOrder: ['widgetId','t','d','ctx'],
        stack: ['uiTest~impl~calculate~items~0~elems~2~rx','uiTest.group~impl']
      },
      {
        logNames: 'check test result',
        testRes: {
          html: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>`,
          css: '',
          all: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>
`
        },
        success: true,
        expectedResultRes: true,
        countersErr: '',
        expectedResultCtx: {
          id: 254,
          path: 'uiTest~impl',
          profile: dataTest({
            vars: [
              Var('uiTest', true),
              Var('widgetId', widget.newId()),
              Var('headlessWidget', true),
              Var('remoteUiTest', notEquals('%$backEndJbm%')),
              Var('headlessWidgetId', '%$widgetId%'),
              Var('useFrontEndInTest', '%$useFrontEnd%'),
              Var('transactiveHeadless', '%$transactiveHeadless%'),
              Var('testRenderingUpdate'),
              Var('engineForTest', '%$engine%')
            ],
            calculate: pipe(
              Var('uiActionsTimeout', If('%$backEndJbm%', 2000, 3000)),
              rx.pipe(
                typeAdapter('ui-action<test>', {
                  $: 'uiActions',
                  actions: [
                    {$: 'waitForPromise', promise: remote.waitForJbm('%$backEndJbm%')},
                    '%$uiAction()%'
                  ]
                }),
                rx.log('uiTest userRequest'),
                remote.operator({
                  rx: widget.headless('%$control()%', '%$widgetId%', {
                    transactiveHeadless: '%$transactiveHeadless%'
                  }),
                  jbm: '%$backEndJbm%'
                }),
                rx.do(uiTest.aggregateDelta('%%')),
                rx.var('renderingCounters', uiTest.postTestRenderingUpdate()),
                rx.log('uiTest uiDelta from headless %$renderingCounters%'),
                rx.toArray(),
                rx.map(uiTest.vdomResultAsHtml()),
                rx.do()
              ),
              first()
            ),
            expectedResult: pipeline('%all%', '%$expectedResult()%', first()),
            runBefore: runActions(uiTest.addFrontEndEmulation(), '%$runBefore()%'),
            timeout: If(equals('%$backEndJbm%'), '%$timeout%', 5000),
            allowError: '%$allowError()%',
            cleanUp: runActions(uiTest.removeFrontEndEmulation(), call('cleanUp')),
            expectedCounters: '%$expectedCounters%'
          }),
          data: {
            html: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>`,
            css: '',
            all: `<div widgetid="main-29" widgettop="true" frontend="true">
 <div class="" ctx-id="156" cmp-id="main-1" cmp-ver="1" cmp-pt="group">
   <span ctx-id="204" cmp-id="main-2" cmp-ver="1" cmp-pt="text">hello world</span>
  <span ctx-id="211" cmp-id="main-3" cmp-ver="1" cmp-pt="text">2</span>
 </div>
</div>
`
          },
          vars: {
            singleTest: true,
            uiTest: true,
            widgetId: 'main-29',
            headlessWidget: true,
            remoteUiTest: false,
            headlessWidgetId: 'main-29',
            useFrontEndInTest: false,
            transactiveHeadless: false,
            testRenderingUpdate: `@js@function subj(t, d, transactive) {
          if (t === 0) {
              const sink = d
              id && jb.log(\`\${id} subject sink registered\`,{sink})
              sinks.push(sink)
              sink(0, function subject(t,d) {
                  if (t === 2) {
                      const i = sinks.indexOf(sink)
                      if (i > -1) {
                        const sink = sinks.splice(i, 1)
                        id && jb.log(\`\${id} subject sink unregistered\`,{sink})
                      }
                  }
              })
          } else {
            id && t == 1 && jb.log(\`\${id} subject next\`,{d, sinks: sinks.slice(0)})
            id && t == 2 && jb.log(\`\${id} subject complete\`,{d, sinks: sinks.slice(0)})
            sinks.slice(0).forEach(sink=> {
              const td = transactive ? jb.callbag.childTxInData(d,sinks.length) : d
              sinks.indexOf(sink) > -1 && sink(t, td)
            })
          }
      }`,
            engineForTest: ''
          }
        },
        index: 8,
        source: ['dataTest','testers.js?main:40:7','at dataTest (/plugins/testing/testers.js?main:40:7)','at async Probe.simpleRun (/plugins/probe/probe.js?main:138:26)','at async Probe.runCircuit (/plugins/probe/probe.js?main:103:35)'],
        _time: '3:686',
        time: 1707575343686,
        mem: null,
        $attsOrder: ['testRes','success','expectedResultRes','testFailure','countersErr','expectedResultCtx']
      }
    ],
    main: ''
  }
})