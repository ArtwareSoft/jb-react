jb.dsl('zui')

jb.component('threejsCircles', {
  type: 'stage',
  params: [
    
  ],
  impl: ctx => ({
        fromZoom: 1000, toZoom: 8,
        async prepare() {
            const sprite = await new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzNFODM3NTZEM0MwMTFFN0I2MDI5RDBEODY4NkQ1ODUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzNFODM3NTdEM0MwMTFFN0I2MDI5RDBEODY4NkQ1ODUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozM0U4Mzc1NEQzQzAxMUU3QjYwMjlEMEQ4Njg2RDU4NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozM0U4Mzc1NUQzQzAxMUU3QjYwMjlEMEQ4Njg2RDU4NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmoYspsAAAUMSURBVHja7NxBdtswEETBaB7vf2VmmZUT2zFFEL/qApEITKNBx36d5/kLaBqPALoOj2BbP13tXh6pAGDfAf/ff09ACAAePuRXfVbhIADYcOi/852EgQBg84H/yvcVCALA0HsWwkAAGHrPSBgIAEOPMBAABp6PnqtAEACG3jMXBgLA4FsHQSAADL51EQQCwOAjCASAwUcQfIZfBzb8hTW0jgLAprGmuALYJNbXtUAAGHzrLQgEgMG3/ukgOAw+dIPgMPjQDYIx/NDdK4fFhG4bGMMP3T00Fg66e2ksGHT31Fgo6O6tw+LAt/bZFi8Hx/BDd8+NhYDu3hsLAN09eHjo0H0vMIYfuntzPGDo7tHxYKG7V8cDhe6ePTxEuHz/LvtycAw/dPeyPwsOYasGgNMfLSAaAIYfIRANAMOPEIgGgOFHCEQDwPCDKwBoAbUAcPojBKIBYPgRAtEAMPxw8yyM4YduCHgJCGF3BIDTHxaZjTH80A2BMfzQDYEx/NANgTH80A0BPwWAsKsDwOkPC8/QGH7QAIBgC5infWAQAhoAsGgAOP3hIS1AAwANwOkPxRagAYAG4PSHYgvQAEADcPpDsQWM4QcNAAi2gLn7AwD3zaAGAK4ATn8otgANADQApz8UW4AGABqA0x+KLUADAA3A6Q/FFqABgAYACABAALj/Q+M9gAYAGgAgANR/SF0DNADQAAABoP5D6hqgAYAGAAgA9R9S1wANADQAQACo/5C6BmgAoAEAAgAQAO7/0HgPoAGABgAIAPUfUtcADQA0AEAAAAIAEACAAAAqAeBHgLC3UwMABAAIAEAAAAIAEACAAAAyAeD/AIAGAGzuFACAAAABAAgAQAAAAgAQAIAAAAQAIAAAAQAIAEAAAAIAWNxLAAACAAQAIACAbgC8PA7QAAABAAgAQAAAAgB4tpcAAAQACIC/1ANAAwAEACAAAAEACABAAAC7BIAfBcKeXhoAIACAjwPANQA0AGDX+78AAA0AEADeA0Cq/msAoAEAAsA1AFL1XwMADQAQAK4BkKr/GgBoAIAAcA2AVP3XAEADAAQAkKr/Xw0A7wFAAwAEAJALANcA2OT+rwGABnBtwgBrnv4aAGgA70kaYK3TXwMADeC9iQOscfprAKAB3JM8wL2nvwYAGsC9CQTcN3uzygcB3j9zrgDgCqAFQO301wBAA1gzmYDrZ0wDAA1AC4Da6a8BgAbwjKQCp/9zAgAINwAtAB4wS/PUDw6G3xUAWDwAtABYdHZmly8Chn/tK4AQgMVmZXb9YmD41wsAYKEDcgpfElirAQgBWGAmpvaFwfCv8w5ACGD4g1cAIQAL7H0/BYCwVQJAC8DpH28AQgDDH78CCAEMf/wdgBDA8IcDQAhg+OMBAMQDQAvA6X+x4yEP7rSHMPjdK4A2gOGPvwMQAtir4QAQAtij8QAQAtibP+h4+IP2chCDH2sA2gD2oAAQAth7AkAIYM/l3gF4L4DB1wC0AewtASAEsKcEgBDAXhIAQgB76JOO0AJ6OYjBjzUAbQB7Jd4AtAEMvgAQBBh8ASAIMPgCQBBYbwSAIDD4af4s+McbxWYx/ALApkGYuwIIAdcC4S0AbChBYPAFgA0mCAy+ALDhBIHBFwA24B/CwNALABtTIBh4AYB2YOgFAMLA0AsAhIGhFwD8cwBOA48AEAg7hYGhFwD88OCcBhsBIByuCAiDLQBQu9mdXweGsN8CDAC5+LBapB9YdAAAAABJRU5ErkJggg==')
            this.circleSprite = sprite
        },
        calcItemsPositions({items, pivots, scales, summaryLabel, DIM}) {
            const mat = Array(DIM**2)
            initMat()
            repulsion()

            return { mat, sparse: Array.from(Array(DIM**2).keys()).filter(i=>mat[i]).map(i=>
                [Math.floor(i/DIM), i%DIM, scales.greens(pivots.x.scale(mat[i][0])), summaryLabel(mat[i][0]) ]) 
            }

            function initMat() {
                items.forEach(item => {
                    const [x,y] = [Math.floor(DIM*pivots.x.scale(item)), Math.floor(DIM*pivots.y.scale(item))]
                    mat[DIM*x + y] = mat[DIM*x + y] || []
                    mat[DIM*x + y].push(item)
                    //const sortAtt = `scale_${xPivot.att}`
                    //mat[DIM*x + y].sort((i1,i2) => i1[sortAtt] - i2[sortAtt] )
                })
            }
    
            function repulsion() {
                for (let i=0;i<DIM**2;i++)
                    if (mat[i] && mat[i].length > 1)
                        spreadItems(i)
    
                function spreadItems(i) {
                    const items = mat[i]
                    mat[i] = [items.pop()]
                    const [x,y] = [Math.floor(i/DIM),i%DIM]
    
                    for (const [_x,_y,distance] of areaIterator(x,y)) {
                        if (! mat[DIM*_x+ _y]) {
                            mat[DIM*_x+ _y] = [items.pop()]
                            if (items.length == 0) return
                        }
                    }
                }    
            }
    
            function* areaIterator(x,y) {
                let distance = 2, tooFar = false
                while (!tooFar) {
                    tooFar = true
                    const n = noOfNeighbours(distance)
                    for(_w=0;_w<n;_w++) {
                        const w = _w*2*3.14/n || 0.001
                        const nx = x + floor(distance*(Math.cos(w))), ny = y + floor(distance*(Math.sin(w)))
                        if (nx > -1 && nx < DIM && ny > -1 && ny < DIM) {
                            tooFar = false
                            yield [nx,ny,distance]
                        }
                    }
                    distance++
                }
                function noOfNeighbours(distance) {
                    return 4*distance
                }
                function floor(num) {
                    return Math.sign(num) == -1 ? Math.floor(num+1) : Math.floor(num)
                }
            }
        },
        prepareGPU({ glCanvas, aspectRatio, itemsPositions, zoom, center }) {
            const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true })
            const items = itemsPositions.sparse
            const scene = new THREE.Scene()
            renderer.setClearColor(0x333333)
            const camera = new THREE.PerspectiveCamera( 75, aspectRatio, 0.1, 1000 );
            // const [x,y] = center
            // camera.position.z = zoom
            // camera.position.x = x
            // camera.position.y = y

            const points = new Array(items.length)
            const pointsBuffer = new Float32Array( 3*items.length )
            const colorBuffer = new Float32Array( 3*items.length )
            items.forEach((item,i) => {
                points[i] = new THREE.Vector3(item[0],item[1],0)
                pointsBuffer[3*i] = item[0]
                pointsBuffer[3*i+1] = item[1]
                pointsBuffer[3*i+2] = 0
                colorBuffer[3*i] = item[2].r/ 256
                colorBuffer[3*i+1] = item[2].g/ 256
                colorBuffer[3*i+2] = item[2].b/ 256
            })
            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute("position", new THREE.BufferAttribute(pointsBuffer,3))
            geometry.setAttribute("color", new THREE.BufferAttribute(colorBuffer,3))
            geometry.setDrawRange(0,items.length)
            const material = new THREE.PointsMaterial({
                    vertexColors: true,
                    color: "white",
                    size: 1.2,
                    transparent: true,
                    map: this.circleSprite
                    //sizeAttenuation: false
            })
            scene.add(new THREE.Points(geometry,material))
			const cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
			scene.add( cube );

            return { renderer, scene, camera }
        },
        renderGPUFrame({buffers, zoom, center}) {
            const {scene, camera, renderer} = buffers
            const [x,y] = center
            camera.position.z = zoom
            camera.position.x = x
            camera.position.y = y
//            camera.fov = (Math.atan(DIM/zoom) * 360 / 3.14)

            renderer.render(scene,camera)
        }
  })
})