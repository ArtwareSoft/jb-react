const extractedCtrlSimpleText = group({
    controls: text('hello')
})

const extractedCtrlCard1 = group({
  controls: group({
    title: 'div',
    style: group.htmlTag('div'),
    controls: [
      group({
        title: 'g-inner-card',
        style: group.htmlTag('g-inner-card'),
        controls: [
          group({
            title: 'a',
            style: group.htmlTag('a'),
            controls: [
              group({
                title: 'div',
                style: group.htmlTag('div'),
                controls: [
                  group({
                    title: 'div',
                    style: group.htmlTag('div'),
                    controls: [
                      group({
                        title: 'div',
                        style: group.htmlTag('div'),
                        controls: [
                          group({
                            title: 'g-img',
                            style: group.htmlTag('g-img'),
                            controls: [
                              image({
                                url: 'data:image/jpeg;base64,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',
                                style: image.img(),
                                features: [
                                  css.layout('display: block'),
                                  css('position: relative'),
                                  htmlAttribute('width', '205'),
                                  htmlAttribute('height', '115')
                                ]
                              })
                            ],
                            features: [css.layout('display: block'), css('')]
                          })
                        ],
                        features: [
                          css.layout('left: -203px;right: -203px;top: -115px;bottom: -115px'),
                          css.width('205'),
                          css.height('115'),
                          css.marginAllSides('auto'),
                          css('background-color: rgb(143, 97, 51);position: absolute;z-index: 0')
                        ]
                      })
                    ],
                    features: [css.height('115'), css('overflow: hidden;position: relative')]
                  })
                ]
              }),
              group({
                title: 'div',
                style: group.htmlTag('div'),
                controls: [
                  text({
                    text: 'Disney Plus UK: five classic Simpsons episodes to binge-watch on March 24',
                    title: false,
                    style: text.htmlTag('div'),
                    features: [
                      css.layout('display: -webkit-box'),
                      css.height('5.5em'),
                      css.typography('font-size: 16px'),
                      css(
                        'line-height: 1.375;overflow: hidden;-webkit-box-orient: vertical;white-space: normal;-webkit-line-clamp: 4'
                      )
                    ]
                  })
                ],
                features: [
                  css.layout('display: block'),
                  css.padding({top: '16', left: '16', right: '16', bottom: '0'}),
                  css('')
                ]
              })
            ],
            features: [
              css.typography('text-decoration: none'),
              css('color: rgb(102, 0, 153);cursor: pointer')
            ]
          }),
          group({
            title: 'div',
            style: group.htmlTag('div'),
            features: [css.layout('flex: 1 1 0%'), css('')]
          }),
          group({
            title: 'div',
            style: group.htmlTag('div'),
            controls: [
              group({
                title: 'div',
                style: group.htmlTag('div'),
                controls: [
                  text({
                    text: 'T3.com',
                    title: false,
                    style: text.htmlTag('cite'),
                    features: [css.typography('font-style: normal'), css('color: rgb(60, 64, 67)')]
                  })
                ],
                features: [
                  css.padding({top: '8', left: '16', right: '16', bottom: '8'}),
                  css.typography('font-size: 14px;text-overflow: ellipsis'),
                  css('line-height: 1.57;overflow: hidden;white-space: nowrap')
                ]
              }),
              group({
                title: 'div',
                style: group.htmlTag('div'),
                controls: [
                  group({
                    title: 'span',
                    style: group.htmlTag('span'),
                    controls: [
                      text({text: '5 hours ago', title: false, style: text.htmlTag('span')})
                    ],
                    features: [css('color: rgb(112, 117, 122);line-height: 1.33')]
                  })
                ],
                features: [
                  css.typography('font-size: 12px;text-overflow: ellipsis'),
                  css(
                    'padding-bottom: 16px;padding-left: 16px;padding-right: 16px;overflow: hidden;white-space: nowrap'
                  )
                ]
              })
            ]
          })
        ],
        features: [
          css.layout('display: flex;flex-direction: column'),
          css.height('289'),
          css(
            'background-color: rgb(255, 255, 255);border-radius: 8px;overflow: hidden;border: 1px solid rgb(223, 225, 229);box-shadow: none'
          )
        ]
      })
    ],
    features: [
      css.layout('display: block'),
      css.width('205'),
      css.padding({top: '4', left: '4', right: '4', bottom: '4'}),
      css('position: relative')
    ]
  })
})

const extractedCtrlCard2 = group({
  title: 'div',
  style: group.htmlTag(
    'div'
  ),
  controls: [
    group({
      title: 'table',
      style: group.htmlTag('table'),
      controls: [
        group({
          title: 'tbody',
          style: group.htmlTag('tbody'),
          controls: [
            group({
              title: 'tr',
              style: group.htmlTag('tr'),
              controls: [
                group({
                  title: 'th',
                  style: group.htmlTag('th'),
                  controls: [
                    text({
                      text: 'Walt Disney',
                      title: false,
                      style: text.htmlTag('div'),
                      features: [css.layout('display: inline'), css('')]
                    })
                  ],
                  features: [
                    css.layout('vertical-align: top'),
                    css.typography('font-size: 15.4px;font-weight: bold;text-align: center'),
                    css('')
                  ]
                })
              ]
            }),
            group({
              title: 'tr',
              style: group.htmlTag('tr'),
              controls: [
                group({
                  title: 'td',
                  style: group.htmlTag('td'),
                  controls: [
                    group({
                      title: 'a',
                      style: group.htmlTag('a'),
                      controls: [
                        image({
                          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Walt_Disney_1946.JPG/220px-Walt_Disney_1946.JPG',
                          style: image.img(),
                          features: [
                            css.layout('vertical-align: middle'),
                            css(''),
                            htmlAttribute('width', '220'),
                            htmlAttribute('height', '330')
                          ]
                        })
                      ],
                      features: [
                        css.typography('text-decoration: underline'),
                        css('color: rgb(250, 167, 0);background: none')
                      ]
                    }),
                    text({text: 'Disney in 1946', title: false, style: text.htmlTag('div')})
                  ],
                  features: [css.layout('vertical-align: top;'), css.typography('text-align: center')]
                })
              ]
            }),
            group({
              title: 'tr',
              style: group.htmlTag('tr'),
              controls: [
                text({
                  text: 'Born',
                  title: false,
                  style: text.htmlTag('th'),
                  features: [css.layout('vertical-align: top'), css.typography('text-align: left')]
                }),
                group({
                  title: 'td',
                  style: group.htmlTag('td'),
                  controls: [
                    text({
                      text: 'Walter Elias Disney',
                      title: false,
                      style: text.htmlTag('div'),
                      features: [css.layout('display: inline'), css('')]
                    }),
                    group({title: 'br', style: group.htmlTag('br')}),
                    text({text: 'December 5, 1901', title: false, style: text.htmlTag('span')}),
                    group({title: 'br', style: group.htmlTag('br')}),
                    group({
                      title: 'div',
                      style: group.htmlTag('div'),
                      controls: [
                        button({
                          title: 'Chicago',
                          style: button.href(),
                          features: [
                            css.typography('text-decoration: none'),
                            css('color: rgb(11, 0, 128);background: none')
                          ]
                        }),
                        text({text: ',', title: false, style: text.htmlTag('span')}),
                        text({text: ' ', title: false, style: text.htmlTag('span')}),
                        button({
                          title: 'Illinois',
                          style: button.href(),
                          features: [
                            css.typography('text-decoration: none'),
                            css('color: rgb(11, 0, 128);background: none')
                          ]
                        }),
                        text({text: ', U.S.', title: false, style: text.htmlTag('span')})
                      ],
                      features: [css.layout('display: inline'), css('')]
                    })
                  ],
                  features: [css.layout('vertical-align: top'), css.typography('text-align: left')]
                })
              ]
            })
          ]
        })
      ],
      features: [
        css.width('22em'),
        css.margin({top: '0.5em', right: '0', bottom: '0.5em', left: '1em'}),
        css.padding({top: '0.2em', left: '0.2em', right: '0.2em', bottom: '0.2em'}),
        css.typography(
          'text-align: start;font-size: 12.32px;font-family: sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;text-indent: 0px;text-transform: none;-webkit-text-stroke-width: 0px;text-decoration-style: initial;text-decoration-color: initial'
        ),
        css(
          'border: 1px solid rgb(162, 169, 177);border-spacing: 3px;background-color: rgb(248, 249, 250);color: black;clear: right;line-height: 1.5em;letter-spacing: normal;orphans: 2;white-space: normal;widows: 2;word-spacing: 0px'
        )
      ]
    })
  ]
})

const wixIslandHtml = `<div title="" data-is-responsive="false" data-display-mode="fill" data-content-padding-horizontal="0" data-content-padding-vertical="0" data-exact-height="226" class="style-k80cl0zu" id="comp-k80cl0zl__item1" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; color: rgb(0, 0, 0); font-family: Arial, Helvetica, sans-serif; font-size: 10px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial; left: 0px; position: absolute; top: 0px; width: 306px; height: 226px;"><div id="comp-k80cl0zl__item1link" class="style-k80cl0zulink" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; display: block; overflow: hidden; width: 306px; height: 226px;"><div data-has-bg-scroll-effect="" data-image-info="{&quot;imageData&quot;:{&quot;width&quot;:6000,&quot;height&quot;:4000,&quot;alt&quot;:&quot;&quot;,&quot;uri&quot;:&quot;af9daef5b5684a679caf003614294ccd.jpg&quot;,&quot;metaData&quot;:{&quot;isPreset&quot;:false,&quot;schemaVersion&quot;:&quot;2.0&quot;,&quot;isHidden&quot;:false},&quot;crop&quot;:{&quot;x&quot;:584,&quot;y&quot;:0,&quot;width&quot;:5416,&quot;height&quot;:4000},&quot;title&quot;:&quot;&quot;,&quot;type&quot;:&quot;Image&quot;,&quot;id&quot;:&quot;dataItem-k80cl0zn__item1&quot;,&quot;description&quot;:&quot;&quot;,&quot;displayMode&quot;:&quot;fill&quot;},&quot;containerId&quot;:&quot;comp-k80cl0zl__item1&quot;,&quot;displayMode&quot;:&quot;fill&quot;}" data-has-ssr-src="" data-is-svg="false" data-is-svg-mask="false" class="style-k80cl0zuimg" id="comp-k80cl0zl__item1img" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; overflow: hidden; width: 306px; height: 226px;"><br class="Apple-interchange-newline"><img id="comp-k80cl0zl__item1imgimage" alt="" data-type="image" itemprop="image" src="https://static.wixstatic.com/media/af9daef5b5684a679caf003614294ccd.jpg/v1/crop/x_584,y_0,w_5416,h_4000/fill/w_306,h_226,al_c,q_80,usm_0.66_1.00_0.01/af9daef5b5684a679caf003614294ccd.webp" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; width: 306px; height: 226px; object-fit: cover;"></div></div></div><div data-is-absolute-layout="true" class="style-k80cl109" id="comp-k80cl106__item1" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; color: rgb(0, 0, 0); font-family: Arial, Helvetica, sans-serif; font-size: 10px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial; left: 75px; width: 231px; position: absolute; top: 169px; height: 57px;"><div id="comp-k80cl106__item1bg" class="style-k80cl109bg" style="margin: 0px; padding: 0px; border: 0px solid rgb(133, 133, 133); outline: 0px; vertical-align: baseline; background: rgb(255, 255, 255); border-radius: 0px; position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"></div><div class="style-k80cl109inlineContent" id="comp-k80cl106__item1inlineContent" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div data-packed="true" class="style-k80cl10u" id="comp-k80cl10l__item1" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; overflow-wrap: break-word; text-align: start; left: 12px; width: 159px; position: absolute; pointer-events: none; top: 19px;"><h4 class="font_2" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font: 20px proxima-n-w01-reg, sans-serif; color: rgb(65, 65, 65); pointer-events: auto; letter-spacing: normal;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font-size: 20px;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; letter-spacing: 0.08em;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font-weight: bold;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; color: rgb(87, 112, 131);"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font-family: &quot;open sans&quot;, sans-serif;">HYDRA</span></span></span></span></span></h4></div></div></div><div data-packed="true" class="style-k80cl11c" id="comp-k80cl117__item1" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; overflow-wrap: break-word; text-align: start; color: rgb(0, 0, 0); font-family: Arial, Helvetica, sans-serif; font-size: 10px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial; left: 19px; width: 257px; position: absolute; pointer-events: none; top: 253px;"><p class="font_7" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font: 14px proxima-n-w01-reg, sans-serif; color: rgb(65, 65, 65); pointer-events: auto; letter-spacing: normal;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font-size: 14px;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font-family: avenir-lt-w01_35-light1475496, sans-serif;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; color: rgb(54, 181, 205);">01/19 - 01/23</span></span></span></p></div><div data-packed="false" data-min-height="68" class="style-k80cl11t" id="comp-k80cl11o__item1" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; overflow-wrap: break-word; text-align: start; color: rgb(0, 0, 0); font-family: Arial, Helvetica, sans-serif; font-size: 10px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial; left: 13.5px; width: 268px; position: absolute; min-height: 68px; pointer-events: none; top: 283px;"><p class="font_8" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font: 15px / 1.5em proxima-n-w01-reg, sans-serif; color: rgb(65, 65, 65); pointer-events: auto; letter-spacing: normal;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; color: rgb(87, 112, 131);">Click here to add your own content, or connect to data from your collections.</span></p></div><div data-packed="true" class="style-k80cl12c1" id="comp-k80cl128__item1" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; overflow-wrap: break-word; text-align: start; color: rgb(0, 0, 0); font-family: Arial, Helvetica, sans-serif; font-size: 10px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial; left: 19px; width: 115px; position: absolute; pointer-events: none; top: 357px;"><p class="font_7" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font: 15px / 1.5em proxima-n-w01-reg, sans-serif; color: rgb(65, 65, 65); pointer-events: auto; letter-spacing: normal;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font-family: avenir-lt-w01_35-light1475496, sans-serif;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font-size: 15px;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; color: rgb(87, 112, 131);">From:</span></span></span></p></div><div data-packed="true" class="style-k80cl12t1" id="comp-k80cl12p__item1" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; overflow-wrap: break-word; text-align: start; color: rgb(0, 0, 0); font-family: Arial, Helvetica, sans-serif; font-size: 10px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial; left: 19px; width: 136px; position: absolute; pointer-events: none; top: 379px;"><p class="font_7" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font: 26px / 1.5em proxima-n-w01-reg, sans-serif; color: rgb(65, 65, 65); pointer-events: auto; letter-spacing: normal;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font-size: 26px;"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; color: rgb(54, 181, 205);"><span style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font-family: avenir-lt-w01_85-heavy1475544, sans-serif;">$550</span></span></span></p></div><div id="comp-k80cl138__item1" data-align="center" data-disabled="false" data-margin="0" data-should-use-flex="true" data-width="120" data-height="40" role="button" tabindex="0" class="style-k80cl13f" data-state="desktop shouldUseFlex center" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; color: rgb(0, 0, 0); font-family: Arial, Helvetica, sans-serif; font-size: 10px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial; left: 170px; position: absolute; top: 378px; height: 40px; min-height: 21px; width: 120px;"><div id="comp-k80cl138__item1link" class="g-transparent-a style-k80cl13flink" style="margin: 0px; padding: 0px; border: 0px solid rgb(84, 84, 84); outline: 0px; vertical-align: baseline; background: rgb(54, 181, 205); border-radius: 0px; position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; transition: border-color 0.4s ease 0s, background-color 0.4s ease 0s; text-align: initial; display: flex; align-items: center; cursor: pointer !important; justify-content: center;"><span id="comp-k80cl138__item1label" class="style-k80cl13flabel" style="margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: baseline; background: transparent; font: 15px / 1.4em helvetica-w01-roman, helvetica-w02-roman, helvetica-lt-w10-roman, sans-serif; transition: color 0.4s ease 0s; color: rgb(255, 255, 255); display: inline-block; position: relative; white-space: nowrap;">Book Now</span></div></div>`

jb.component('studioTest.dragTargetText', {
  type: 'control',
  impl: text(
    'paste here'
  )
})

jb.component('studioTest.dragTargetCard', {
  type: 'control',
  impl: group({
    controls: [
      text({text: '%title%', title: 'my title'}),
      image({url: '%image%', width: '200', height: '200'}),
      text({text: '%hits% hits', title: 'hits'})
    ],
    features: group.data({data: '%$phones[0]%', itemVariable: ''})
  })
})

jb.component('patternsTest.suggestedStyles.text', {
  impl: dataTest({
    vars: [
      Var('extractedCtrl', () => extractedCtrlSimpleText),
      Var('targetPath', 'studioTest.dragTargetText~impl')
    ],
    calculate: pipeline(
      ctx => ctx.run(studio.suggestedStyles('%$extractedCtrl%', '%$targetPath%')),
      '%control%',
      property('$'),
      join(',')
    ),
    expectedResult: equals('text,group')
  })
})

jb.component('patternsTest.selectStyle.text', {
  impl: uiTest({
    vars: [
      Var('extractedCtrl', () => extractedCtrlSimpleText),
      Var('targetPath', 'studioTest.dragTargetText~impl')
    ],
    control: ctx => ctx.run(studio.selectStyle('%$extractedCtrl%','%$targetPath%')),
    expectedResult: contains({text: 'hello', allText: 'hello'})
  })
})

jb.component('patternsTest.selectStyle.card1', {
  impl: uiTest({
    vars: [
      Var('extractedCtrl', () => extractedCtrlCard1),
      Var('targetPath', 'studioTest.dragTargetCard~impl'),
      Var('top')
    ],
    control: ctx => ctx.run(studio.selectStyle('%$extractedCtrl%','%$targetPath%')),
    runBefore: ctx => {
      const top = document.createElement('div')
      jb.ui.renderWidget({$: 'studioTest.dragTargetCard'},top)
      document.body.appendChild(top)
      ctx.vars.top = top
    },
    expectedResult: contains('alcatel 3C'),
    cleanUp: ctx => document.body.removeChild(ctx.vars.top)
  })
})

jb.component('patternsTest.selectStyleDeleteUnmapped.card1', {
  impl: uiTest({
    vars: [
      Var('extractedCtrl', () => extractedCtrlCard1),
      Var('targetPath', 'studioTest.dragTargetCard~impl'),
      Var('top')
    ],
    control: ctx => ctx.run(studio.selectStyle('%$extractedCtrl%','%$targetPath%')),
    runBefore: runActions(
      writeValue('%$studio/patterns/deleteUnmapped%', true),
      ctx => {
        const top = document.createElement('div')
        jb.ui.renderWidget({$: 'studioTest.dragTargetCard'},top)
        document.body.appendChild(top)
        ctx.vars.top = top
    }
    ),
    expectedResult: contains('alcatel 3C'),
    cleanUp: ctx => document.body.removeChild(ctx.vars.top)
  })
})

jb.component('patternsTest.selectStyleDeleteUnmapped.card2', {
  impl: uiTest({
    vars: [
      Var('extractedCtrl', () => extractedCtrlCard2),
      Var('targetPath', 'studioTest.dragTargetCard~impl'),
      Var('top')
    ],
    control: ctx => ctx.run(studio.selectStyle('%$extractedCtrl%','%$targetPath%')),
    runBefore: runActions(
      writeValue('%$studio/patterns/deleteUnmapped%', true),
      ctx => {
        const top = document.createElement('div')
        jb.ui.renderWidget({$: 'studioTest.dragTargetCard'},top)
        document.body.appendChild(top)
        ctx.vars.top = top
    }
    ),
    expectedResult: contains('alcatel 3C'),
    cleanUp: ctx => document.body.removeChild(ctx.vars.top)
  })
})

jb.component('patternsTest.flattenControlToGrid.card2', {
  impl: uiTest({
    control: studio.flattenControlToGrid(() => extractedCtrlCard2),
    expectedResult: contains('Disney in 1946'),
  })
})

jb.component('patternsTest.flattenControlToGrid.card1', {
  impl: uiTest({
    control: studio.flattenControlToGrid(() => extractedCtrlCard1),
    expectedResult: contains('T3.com'),
  })
})

jb.component('patternsTest.flattenControlToGrid.wixIsland', {
  impl: uiTest({
    control: group({
      layout: layout.vertical(20),
      controls: ctx => {
        const html_src = () => wixIslandHtml
        const ctrl = ctx.run(studio.htmlToControl(html_src))
        const flatten = studio.flattenControlToGrid(() => JSON.parse(JSON.stringify(ctrl)))
        // html({html: html_src}),
        return [ctrl, flatten].map(x=>ctx.run(x))
      }
    }),
    expectedResult: contains('HYDRA'),
  })
})
