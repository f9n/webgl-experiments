"use strict"
let gl;
let vertexCode = `
    attribute vec4 aVertexPosition;
    uniform mat4 aVertexUniformModel;
    uniform vec4 aVertexUniformColor;

    varying vec4 vColor;
    void main() {
        gl_PointSize = 1.0; 
        gl_Position = aVertexUniformModel * aVertexPosition;
        vColor = aVertexUniformColor;
    }
`;

let fragmentCode = `
    precision mediump float;

    varying vec4 vColor;
    void main() {
        gl_FragColor = vColor;
    }
`;

let GENERAL = {
    scale: vec3(0.1, 0.1, 0.1),
    rotate: vec3(40, 0, 0),
    scaleMatrix: 0,
    rotateMatrix: 0
}

let CUBE = {
    color: vec4(1.0, 0.0, 0.0, 1.0),
    translate: vec3(-0.8, 0, 0),
    translateMatrix: 0,
    vertices: () => {
        let _vertices = [];
        const cords = [
            vec4(-1, -1,  1, 1),
            vec4(-1,  1,  1, 1),
            vec4( 1,  1,  1, 1),
            vec4( 1, -1,  1, 1),
            vec4(-1, -1, -1, 1),
            vec4(-1,  1, -1, 1),
            vec4( 1,  1, -1, 1),
            vec4( 1, -1, -1, 1)
        ];
        const indices = [
            // a, b, c, a, c, d
            1, 0, 3, 1, 3, 2,
            2, 3, 7, 2, 7, 6,
            3, 0, 4, 3, 4, 7,
            6, 5, 1, 6, 1, 2,
            4, 5, 6, 4, 6, 7,
            5, 4, 0, 5, 0, 1
        ];

        for (let i = 0; i < indices.length; ++i) {
            _vertices.push(cords[indices[i]]);
        }

        return _vertices;
    }
}

let TETRAHEDRON = {
    color: vec4(0.0, 1.0, 1.0, 1.0),
    translate: vec3(0.8, 0, 0),
    translateMatrix: 0,
    vertices: () => {
        let _vertices = [];
        const cords = [
            vec4( 1.0,  1.0,  1.0), //right top front
            vec4(-1.0, -1.0,  1.0), //left bottom front
            vec4(-1.0,  1.0, -1.0), //left top back
            vec4( 1.0, -1.0, -1.0)  //right bottom back
        ];
        const indices = [
            0, 1, 2,
            0, 2, 3,
            0, 1, 3,
            1, 2, 3
        ];
        for (let i = 0; i < indices.length; i++) {
            _vertices.push(cords[indices[i]]);
        }
        return _vertices;
    },
}

const init = () => {
    let canvas = document.getElementById('gl-canvas');

    canvas.addEventListener("mousedown", detectCubeOrTetrahedron);

    gl = WebGLUtils.setupWebGL(canvas, { preserveDrawingBuffer: true });
    if (!gl) alert("Webgl isn't avaliable!");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    const program = my.initProgramWithCodes(gl, vertexCode, fragmentCode);
    gl.useProgram(program);

    let cube_vertices = CUBE.vertices();
    let tetrahedron_vertices = TETRAHEDRON.vertices();
    let vertices = cube_vertices.concat(tetrahedron_vertices);

    // Initialization
    GENERAL.scaleMatrix = scalem(GENERAL.scale);
    CUBE.translateMatrix = translate(CUBE.translate);
    TETRAHEDRON.translateMatrix = translate(TETRAHEDRON.translate);

    // Vertices Buffer
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Attrib
    const aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    gl.vertexAttribPointer(aVertexPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);

    // Uniform
    let VertexUniform = {
        Model: 0,
        Color: 0
    }
    VertexUniform.Model = gl.getUniformLocation(program, "aVertexUniformModel");
    VertexUniform.Color = gl.getUniformLocation(program, "aVertexUniformColor");

    // Rendering
    render(VertexUniform, cube_vertices.length, tetrahedron_vertices.length);
}

const render = (VertexUniform, cubeLength, tetrahedronLength) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let model_matrix;
    // General
    GENERAL.rotateMatrix = mult(rotate(GENERAL.rotate[0],vec3(1,0,0)),rotate(GENERAL.rotate[1],vec3(0,1,0)))

    // Cube Stuff
    model_matrix = mult(GENERAL.rotateMatrix, mult(CUBE.translateMatrix, GENERAL.scaleMatrix))

    gl.uniformMatrix4fv(VertexUniform.Model, false, flatten(model_matrix));
    gl.uniform4fv(VertexUniform.Color, CUBE.color);
    gl.drawArrays(gl.TRIANGLES, 0, cubeLength);

    // TetraHedron Stuff
    model_matrix = mult(GENERAL.rotateMatrix, mult(TETRAHEDRON.translateMatrix, GENERAL.scaleMatrix))

    gl.uniformMatrix4fv(VertexUniform.Model, false, flatten(model_matrix));
    gl.uniform4fv(VertexUniform.Color, TETRAHEDRON.color);
    gl.drawArrays(gl.TRIANGLES, cubeLength, tetrahedronLength);

    // Rotate increase
    GENERAL.rotate[1] ++;

    // Loop
    requestAnimFrame( () => render(VertexUniform, cubeLength, tetrahedronLength));
}

const isSameColor = (pixels, colors) => {
    if (pixels[0] === colors[0] * 255 &&
        pixels[1] === colors[1] * 255 &&
        pixels[2] === colors[2] * 255) {
        return true;
    }
    return false;
}

const detectCubeOrTetrahedron = (e) => {
    let mouseX = e.pageX - gl.canvas.offsetLeft;
    let mouseY = e.pageY - gl.canvas.offsetTop;
    let pixels = new Uint8Array(4);
    gl.readPixels(mouseX, gl.drawingBufferHeight - mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    if (isSameColor(pixels, CUBE.color)) {
        alert("Cube!!!");
        return;
    }
    if (isSameColor(pixels, TETRAHEDRON.color)) {
        alert("Tetrahedron!!!");
        return;
    }
    return;
}

window.onload = init;