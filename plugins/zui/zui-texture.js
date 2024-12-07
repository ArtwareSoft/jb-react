extension('zui','texture', {
    bwBitMapToTexture(gl, packRatio, base64Data, width, height) {
        const binaryString = atob(base64Data)
        const bitmapWidth = Math.ceil(width / packRatio)
        
        if (binaryString.length != bitmapWidth * height* 4)
            jb.logError('bwBitMapToTexture wrong binary data',{bitmapWidth, base64Data, width, height})

        const bitmapData = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) bitmapData[i] = binaryString.charCodeAt(i)
        //console.log(jb.zui.xImageOfData(bitmapData, bitmapWidth*packRatio,height))
        
        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  bitmapWidth, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, bitmapData)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST) // No interpolation
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE) // Clamp edges
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindTexture(gl.TEXTURE_2D, null)

        // const testData = jb.zui.readTexture(gl, packRatio, texture, width, height)
        // const compareUint8Arrays = (a, b) => a.length === b.length && a.every((val, i) => val === b[i]);
        // if (!compareUint8Arrays(testData,bitmapData))
        //     jb.logError('bwBitMapToTexture texture distortion',{ testData,bitmapData, width, height})

        return texture
    },
    readTexture(gl, packRatio,texture, width, height) {
        const framebuffer = gl.createFramebuffer()
        const bitmapWidth = Math.ceil(width / packRatio)
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
        const pixels = new Uint8Array(bitmapWidth * height * 4)
        gl.readPixels(0, 0, bitmapWidth, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.deleteFramebuffer(framebuffer)
    
        return pixels; 
    }
})