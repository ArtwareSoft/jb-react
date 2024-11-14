dsl('zui')
/*
extension('zui','paragraph', {
    calculateLineBreaksAndSpacing(text, lineWidth, font = '16px Arial') {
        const canvas = jb.zui.createCanvas(1, 1)
        const cnvCtx = canvas.getContext('2d')
        cnvCtx.font = font
    
        const lines = []
        let currentLine = []
        let currentLineWidth = 0
        const spaceWidth = cnvCtx.measureText(' ').width
    
        text.split(' ').forEach(word=> {
            const wordWidth = cnvCtx.measureText(word).width
    
            if (currentLineWidth + wordWidth + (currentLine.length > 0 ? spaceWidth : 0) > lineWidth) {
                const remainingSpace = lineWidth - currentLineWidth + (currentLine.length - 1) * spaceWidth
                const wordSpacing = currentLine.length > 1 ? remainingSpace / (currentLine.length - 1) : 0
    
                lines.push({ words: currentLine, wordSpacing, width: currentLineWidth })
                currentLine = [word]
                currentLineWidth = wordWidth
            } else {
                if (currentLine.length > 0) currentLineWidth += spaceWidth
                currentLine.push(word)
                currentLineWidth += wordWidth
            }
        })
        lines.push({ words: currentLine, wordSpacing: 0 })
    
        return lines
    }
    
    function drawParagraphOnCanvas(text, lineWidth, font = '16px Arial', lineHeight = 20) {
        // Calculate line breaks and spacing
        const lines = calculateLineBreaksAndSpacing(text, lineWidth, font)
    
        // Create a canvas and set its dimensions
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        cnvCtx.font = font
    
        // Calculate canvas height based on line count
        const canvasHeight = lines.length * lineHeight
        canvas.width = lineWidth
        canvas.height = canvasHeight
    
        // Set text styles
        cnvCtx.fillStyle = 'black'
        cnvCtx.textBaseline = 'top'
    
        // Draw each line with calculated word spacing
        lines.forEach((line, index) => {
            let x = 0 // Start drawing at the beginning of the line
            const y = index * lineHeight // Set y position for each line
    
            line.words.forEach((word, i) => {
                // Draw the word
                cnvCtx.fillText(word, x, y)
                x += cnvCtx.measureText(word).width + line.wordSpacing // Move x position for the next word
            })
        })
    
        document.body.appendChild(canvas) // Append the canvas to the body for display
    }
    
    // Example usage
    const text = "This is an example paragraph that we want to break into lines and calculate word spacing.";
    const lineWidth = 300; // Maximum line width in pixels
    const font = '16px Arial';
    const lineHeight = 24;
    
    drawParagraphOnCanvas(text, lineWidth, font, lineHeight);
    
})
*/