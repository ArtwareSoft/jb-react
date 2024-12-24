jb.dsl('zui')

jb.extension('zui', 'text', {
    async textToPng(canvas,font,size) {
        const ctx = canvas.getContext('2d')
        ctx.font = `${size}px "${font}"`

        const { actualBoundingBoxLeft, actualBoundingBoxRight, actualBoundingBoxAscent, actualBoundingBoxDescent, width,
        } = ctx.measureText(text)

        canvas.height = actualBoundingBoxAscent + actualBoundingBoxDescent

        // Take the larger of the width and the horizontal bounding box
        // dimensions to try to prevent cropping of the text.
        canvas.width = Math.max(width, Math.abs(actualBoundingBoxLeft) + actualBoundingBoxRight)

        // Set the font again, since otherwise, it's not correctly set when filling.
        ctx.font = `${size}px ${font}`
        ctx.textBaseline = 'top'
        ctx.fillText(text, 0, 0)
        const blob = await new Promise(resolve => canvasElem.toBlob(resolve))
        return blob
    }
})

jb.component('threejsCircles', {
  type: 'stage',
  params: [
    
  ],
  impl: ctx => ({
        fromZoom: 256, toZoom: 8,
        async prepare() {
            this.circleSprite = await new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzNFODM3NTZEM0MwMTFFN0I2MDI5RDBEODY4NkQ1ODUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzNFODM3NTdEM0MwMTFFN0I2MDI5RDBEODY4NkQ1ODUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozM0U4Mzc1NEQzQzAxMUU3QjYwMjlEMEQ4Njg2RDU4NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozM0U4Mzc1NUQzQzAxMUU3QjYwMjlEMEQ4Njg2RDU4NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmoYspsAAAUMSURBVHja7NxBdtswEETBaB7vf2VmmZUT2zFFEL/qApEITKNBx36d5/kLaBqPALoOj2BbP13tXh6pAGDfAf/ff09ACAAePuRXfVbhIADYcOi/852EgQBg84H/yvcVCALA0HsWwkAAGHrPSBgIAEOPMBAABp6PnqtAEACG3jMXBgLA4FsHQSAADL51EQQCwOAjCASAwUcQfIZfBzb8hTW0jgLAprGmuALYJNbXtUAAGHzrLQgEgMG3/ukgOAw+dIPgMPjQDYIx/NDdK4fFhG4bGMMP3T00Fg66e2ksGHT31Fgo6O6tw+LAt/bZFi8Hx/BDd8+NhYDu3hsLAN09eHjo0H0vMIYfuntzPGDo7tHxYKG7V8cDhe6ePTxEuHz/LvtycAw/dPeyPwsOYasGgNMfLSAaAIYfIRANAMOPEIgGgOFHCEQDwPCDKwBoAbUAcPojBKIBYPgRAtEAMPxw8yyM4YduCHgJCGF3BIDTHxaZjTH80A2BMfzQDYEx/NANgTH80A0BPwWAsKsDwOkPC8/QGH7QAIBgC5infWAQAhoAsGgAOP3hIS1AAwANwOkPxRagAYAG4PSHYgvQAEADcPpDsQWM4QcNAAi2gLn7AwD3zaAGAK4ATn8otgANADQApz8UW4AGABqA0x+KLUADAA3A6Q/FFqABgAYACABAALj/Q+M9gAYAGgAgANR/SF0DNADQAAABoP5D6hqgAYAGAAgA9R9S1wANADQAQACo/5C6BmgAoAEAAgAQAO7/0HgPoAGABgAIAPUfUtcADQA0AEAAAAIAEACAAAAqAeBHgLC3UwMABAAIAEAAAAIAEACAAAAyAeD/AIAGAGzuFACAAAABAAgAQAAAAgAQAIAAAAQAIAAAAQAIAEAAAAIAWNxLAAACAAQAIACAbgC8PA7QAAABAAgAQAAAAgB4tpcAAAQACIC/1ANAAwAEACAAAAEACABAAAC7BIAfBcKeXhoAIACAjwPANQA0AGDX+78AAA0AEADeA0Cq/msAoAEAAsA1AFL1XwMADQAQAK4BkKr/GgBoAIAAcA2AVP3XAEADAAQAkKr/Xw0A7wFAAwAEAJALANcA2OT+rwGABnBtwgBrnv4aAGgA70kaYK3TXwMADeC9iQOscfprAKAB3JM8wL2nvwYAGsC9CQTcN3uzygcB3j9zrgDgCqAFQO301wBAA1gzmYDrZ0wDAA1AC4Da6a8BgAbwjKQCp/9zAgAINwAtAB4wS/PUDw6G3xUAWDwAtABYdHZmly8Chn/tK4AQgMVmZXb9YmD41wsAYKEDcgpfElirAQgBWGAmpvaFwfCv8w5ACGD4g1cAIQAL7H0/BYCwVQJAC8DpH28AQgDDH78CCAEMf/wdgBDA8IcDQAhg+OMBAMQDQAvA6X+x4yEP7rSHMPjdK4A2gOGPvwMQAtir4QAQAtij8QAQAtibP+h4+IP2chCDH2sA2gD2oAAQAth7AkAIYM/l3gF4L4DB1wC0AewtASAEsKcEgBDAXhIAQgB76JOO0AJ6OYjBjzUAbQB7Jd4AtAEMvgAQBBh8ASAIMPgCQBBYbwSAIDD4af4s+McbxWYx/ALApkGYuwIIAdcC4S0AbChBYPAFgA0mCAy+ALDhBIHBFwA24B/CwNALABtTIBh4AYB2YOgFAMLA0AsAhIGhFwD8cwBOA48AEAg7hYGhFwD88OCcBhsBIByuCAiDLQBQu9mdXweGsN8CDAC5+LBapB9YdAAAAABJRU5ErkJggg==');
            this.disc = await new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sHDgwCEMBJZu0AAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAABM5JREFUWMO1V0tPG2cUPZ4Hxh6DazIOrjFNqJs0FIMqWFgWQkatsmvVbtggKlSVRVf5AWz4AWz4AUSKEChll19QJYSXkECuhFxsHjEhxCYm+DWGMZ5HF72DJq4bAzFXurI0M/I5997v3u9cC65vTJVn2lX/xHINQOYSBLTLEuIuCWw4Z3IGAEvf6ASmVHjNzHCXBG4A0AjACsAOwEbO0nsFQBnAGYASAIl+ZRMR7SolMEdsByD09fV5R0ZGgg8ePPjW5/N1iqLYpuu6RZblciKR2I9Go69evnwZnZ+fjwI4IS8AKBIRzeQfJWCANwKwh0KhtrGxsYehUOin1tbW+zzP23ietzY2NnIAoGmaLsuyUiqVyvl8XtrY2NiamZn589mzZxsAUgCOAeQAnFI2tI+VxIjaAeDzoaGh7xYWFuZOTk6OZVk+12uYqqq6JEnn0Wg0OT4+/geAXwGEAdwDIFJQXC1wO4DWR48e/RCPxxclSSroVzRFUbSDg4P848ePFwH8DuAhkWih83TRQWxFOXgAwvDwcOfo6OhvXV1d39tsNtuVBwTDWBwOh1UUxVsMw1hXVlbSdCgNV43uYSvrHg6H24aHh38eHBz85TrgF9FYLHA4HLzH43FvbW2d7u/vG+dANp8FpqIlbd3d3V8Fg8EfBUFw4BONZVmL3+9vHhkZCQL4AoAHgJPK8G+yzC0XDofdoVAo5PP5vkadTBAEtr+/39ff3x8gAp/RPOEqx2qjx+NpvXv3bk9DQ0NDvQgwDIOWlhZrMBj8kgi0UJdxRgYMArzL5XJ7vd57qLPZ7Xamp6fnNgBXtQxcjFuHw+Hyer3t9SYgCAITCAScAJoBNNEY/08GOFVVrfVMv7kMNDntFD1vjIAPrlRN0xjckOm6biFQ3jwNPwDMZrOnqVTqfb3Bi8Wivru7W/VCYkwPlKOjo0IikXh7EwQikYgE4Nw0CfXKDCipVCoTj8df3QABbW1tLUc6oUgkFPMkVACUNjc337148eKvw8PDbJ2jP1taWkoCyNDVXDSECmNSK4qiKNLq6urW8+fPI/UicHx8rD59+jSVy+WOAKSJhKENwFItLtoxk8mwsixzHR0dHe3t7c5PAU+n09rs7OzJkydPYqVSaQfANoDXALIk31S2smU1TWMPDg7K5XKZ7+3t9TudTut1U7+wsFCcmJiIpdPpbQBxADsAknQWymYCOukBHYCuKApisdhpMpnURFEU79y503TVyKenpzOTk5M7e3t7MQKPV0Zv1gNm+awB0MvlshqLxfLb29uyJElWURSbXC4XXyvqxcXFs6mpqeTc3Nzu3t7e3wQcA7BPZ8Cov1pNlJplmQtAG8MwHV6v95tAINA5MDBwPxAIuLu6upr8fr/VAN3c3JQjkcjZ+vp6fnl5+d2bN29SuVzuNYAEpf01CdRChUL+X1VskHACuA3Ay3Fcu9vt7nA6nZ7m5uYWQRCaNE3jVVW15PP580KhIGUymWw2m00DOAJwSP4WwPtq4LX2Ao6USxNlQyS/RcQcdLGwlNIz6vEMAaZpNzCk2Pll94LK/cDYimxERiBwG10sxjgvEZBE0UpE6vxj+0Ct5bTaXthgEhRmja8QWNkkPGsuIpfdjpkK+cZUWTC0KredVmtD/gdlSl6EG4AMvQAAAABJRU5ErkJggg==')
        },
        calcItemsPositions({items, pivots, scales, summaryLabel, DIM}) {
            const mat = Array(DIM**2)
            initMat()
            repulsion()

            return { mat, sparse: Array.from(Array(DIM**2).keys()).filter(i=>mat[i]).map(i=>
                [DIM - Math.floor(i/DIM), DIM - i%DIM, scales.greens(pivots.x.scale(mat[i][0])), summaryLabel(mat[i][0]) ]) 
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
        prepareGPU({ glCanvas, aspectRatio, itemsPositions }) {
            const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true })
            const items = itemsPositions.sparse
            const scene = new THREE.Scene()
            renderer.setClearColor(0x333333)
            const camera = new THREE.PerspectiveCamera( 75, aspectRatio, 0.1, 1000 );

            const pointsBuffer = new Float32Array( 3*items.length )
            const colorBuffer = new Float32Array( 3*items.length )
            items.forEach((item,i) => {
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
            const material1 = new THREE.PointsMaterial({
                vertexColors: true,
                color: "white",
                size: 3,
                transparent: true,
                map: this.circleSprite
                //sizeAttenuation: false
            })
            const src = [`attribute vec3 color;
			varying vec3 vColor;
            uniform float size;

			void main() {
				vColor = color;
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_PointSize = size;
				gl_Position = projectionMatrix * mvPosition;
			}`,
                `uniform sampler2D pointTexture;
                varying vec3 vColor;
    
                void main() {
                    vec4 color = vec4( vColor, 1.0 ) * texture2D( pointTexture, gl_PointCoord );
                    gl_FragColor = color;
                }`
            ]            
            const material = new THREE.ShaderMaterial( {
                uniforms: {
                    size: { value: 20.0 },
//                    color: { value: new THREE.Color( 0xffffff ) },
                    pointTexture: { value: this.disc }
                },
                vertexShader: src[0],
                fragmentShader: src[1],
                transparent: true
            })
            scene.add(new THREE.Points(geometry,material))
			// const cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) )
			// scene.add( cube )

            // we need this code to show the sprite on first draw...
            renderer.setAnimationLoop((x) => renderer.render(scene, camera))
            jb.delay(100).then(() => renderer.setAnimationLoop(null))

            return { renderer, scene, camera, uniforms: material.uniforms }
        },
        renderGPUFrame({buffers, zoom, center, DIM}) {
            const {scene, camera, renderer, uniforms} = buffers
            const [x,y] = center
            camera.position.z = zoom
            camera.position.x = x
            camera.position.y = y
            uniforms.size.value = 3 + 10 * Math.log(DIM/zoom)
//            console.log(uniforms.size.value)
//            camera.fov = (Math.atan(DIM/zoom) * 360 / 3.14)

            renderer.render(scene,camera)
        }
  })
})