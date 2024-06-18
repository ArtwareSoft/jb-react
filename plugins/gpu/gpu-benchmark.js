dsl('gpu')

extension('gpu', 'basic', {
    typeRules: [ { same: ['data<gpu>','data<>']} ],
    async test2() { return 'hello' },
    async test1() {
        const _gl = require('gl');
        const DIM = 8;
        const gl = _gl(DIM,DIM,{
            alpha: false,
            depth: true,
            stencil: false,
            antialias: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false,
            desynchronized: true
        });

        // Create a shader program
        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
        precision highp float;
        uniform int y;
        uniform sampler2D textureArray;
        void main() {
            vec4 texture = texture2D(textureArray, gl_FragCoord.xy);
            gl_FragColor = vec4(texture.r, 0.0, 0.0, 255.0);
        }`;

                        //float _input = ${DIM}.0 * floor(gl_FragCoord.y) + floor(gl_FragCoord.x);
                //vec4 texValue = texture2D(textureArray, gl_FragCoord.xy);
                // float _input = texValue.a * 256.0 * 256.0 * 256.0 + texValue.b * 256.0 * 256.0 + texValue.g * 256.0 + texValue.r;                
                // float res = _input * float(y);
                // float r = mod(res, 256.0); 
                // float g = mod(res / 256.0, 256.0);
                // float b = mod(res / (256.0 * 256.0), 256.0);
                // float h = mod(res / (256.0 * 256.0 * 256.0), 256.0);
                // gl_FragColor = vec4(r / 256.0, g / 256.0, b / 256.0, h/256.0); // result wrapped as color
                //gl_FragColor = texValue;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) 
            return jb.logError(`compile vertex shader: ${gl.getShaderInfoLog(vertexShader)}`,{})

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) 
            return jb.logError(`compile fg shader: ${gl.getShaderInfoLog(fragmentShader)}`,{})

        const prog = gl.createProgram();
        gl.attachShader(prog, vertexShader);
        gl.attachShader(prog, fragmentShader);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
            return jb.logError(`Unable to initialize the shader program: ${gl.getProgramInfoLog(prog,)}`,{})

        gl.useProgram(prog);

        const triangles = new Float32Array([-1.0, -1.0,1.0, -1.0,-1.0, 1.0,1.0, 1.0 ]);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW);

        // Get attribute location
        const positionAttributeLocation = gl.getAttribLocation(prog, 'position');
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Set the uniform value for 'y'
        const yLocation = gl.getUniformLocation(prog, 'y');
        gl.uniform1i(yLocation, 2);

        const textureArray = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureArray);
        const textureData = new Uint8Array(Array.from({ length: DIM * DIM }, 
            (_, i) => i).flatMap(i=>[i, (i >> 8), (i >> 16), (i >> 24)].map(i=>i& 0xFF)));
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, DIM, DIM, 0, gl.RGBA, gl.UNSIGNED_BYTE, textureData);
        const isPowerOf2 = value => (value & (value - 1)) === 0
        if (isPowerOf2(DIM)) {
            gl.generateMipmap(gl.TEXTURE_2D)
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        }
  
        gl.uniform1i(gl.getUniformLocation(prog, 'textureArray'), 0);

        // Render
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const start = jbHost.isNode ? process.hrtime.bigint() : new Date().getTime()
        const gpuRun = jb.gpu.calcDuration(()=>gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4))
        
        let res = [], r;
        const bufferOut = jb.gpu.calcDuration(() => {
            r = new Uint8Array(DIM * DIM * 4); // RGBA format
            gl.readPixels(0, 0, DIM, DIM, gl.RGBA, gl.UNSIGNED_BYTE, r);
        })
        const buildRes = jb.gpu.calcDuration(() => {
            res = [...new Array(400)].map((_,i) => r[i*4] + r[i*4+1]*0xFF + + r[i*4+2]*0xFFFF + + r[i*4+3]*0xFFFFFF )
        })
        return { canvas: [...r], textureData: [...textureData], res, gpuRun, bufferOut, buildRes}

    },
    calcDuration(f) {
        const start = jbHost.isNode ? process.hrtime.bigint() : new Date().getTime()
        f();
        const end = jbHost.isNode ? process.hrtime.bigint() : new Date().getTime()
        const dur = end - start
        const duration = dur > 1000000n ? (Number(dur) / 1000000) : dur
        const unit = jbHost.isNode && dur === duration ? 'nanoSec' : 'mSec'
        return {duration: '' + duration, unit }
    }

})
