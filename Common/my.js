
const my = {
    initShader: (gl, shaderId, shaderType) => {
        let shader;
        let shaderElement = document.getElementById( shaderId );
        let shaderSource = ""
        if ( !shaderElement ) { 
            alert( `Unable to load vertex shader ${shaderId} ` );
            return -1;
        } else {
            shaderSource = shaderElement.text;
            shader = gl.createShader( shaderType );
            gl.shaderSource( shader, shaderSource );
            gl.compileShader( shader );
           
            if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
                let msg = `Shader failed to compile.  The error log is: <pre> ${gl.getShaderInfoLog( shader )} </pre>`;
                alert( msg );
                return -1;
            }
        }
        return shader;
    },
    initProgram: (gl, vertexShaderId, fragmentShaderId) => {
        let vertexShader = my.initShader(gl, vertexShaderId, gl.VERTEX_SHADER);
        let fragmentShader = my.initShader(gl, fragmentShaderId, gl.FRAGMENT_SHADER);

        var program = gl.createProgram();
        gl.attachShader( program, vertexShader );
        gl.attachShader( program, fragmentShader );
        gl.linkProgram( program );
        
        if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
            let msg = `Shader program failed to link.  The error log is: <pre> ${gl.getProgramInfoLog( program )} </pre>`;
            alert( msg );
            return -1;
        }

        return program;
    }
}