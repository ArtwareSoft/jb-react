using('ui-tests')

component('uiTest.probeUI.detailedInput', {
  impl: uiTest(probeUI.detailedInput('%$probe_sampleProbe/result%'), contains('---'))
})

component('probe_sampleProbe', { passiveData: {
  "result": [
      {
          "in": {
              "id": 77,
              "path": "test.probePipeline~impl~items~1",
              "profile": "%%",
              "data": "a",
              "vars": { v1 : 1, v2 : 2 }
          },
          "out": [
              "a"
          ],
          "counter": 0
      },
      {
          "in": {
              "id": 78,
              "path": "test.probePipeline~impl~items~1",
              "profile": "%%",
              "data": "b",
              "vars": { v1 : 1, v2 : 2 }
          },
          "out": [
              "b"
          ],
          "counter": 0
      }
  ]
}
})