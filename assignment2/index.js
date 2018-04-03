"use strict"
let gl;
let vertexCode = `
    attribute vec4 aVertexPosition;
    uniform mat4 aVertexUniformModel;
    uniform vec4 aVertexUniformColor;

    varying vec4 aVertexColor;
    void main() {
        gl_PointSize = 1.0; 
        gl_Position = aVertexUniformModel * aVertexPosition;
        aVertexColor = aVertexUniformColor; 
    }
`;

let fragmentCode = `
    precision mediump float;

    varying vec4 aVertexColor;
    void main() {
        gl_FragColor = aVertexColor;
    }
`;

let GENERAL_SCALE = vec3(0.3, 0.3, 0.3);
let CUBE_COLOR = vec4(1.0, 0.0, 0.0, 1.0);
const createCube = () => {
    let i, cubeVertices = [];
    const cubeCords = [
        vec4(-1, -1, 1, 1),
        vec4(-1, 1, 1, 1),
        vec4(1, 1, 1, 1),
        vec4(1, -1, 1, 1),
        vec4(-1, -1, -1, 1),
        vec4(-1, 1, -1, 1),
        vec4(1, 1, -1, 1),
        vec4(1, -1, -1, 1)
    ];
    const cubeIndices = [
        //a, b, c, a, c, d
        1, 0, 3, 1, 3, 2,
        2, 3, 7, 2, 7, 6,
        3, 0, 4, 3, 4, 7,
        6, 5, 1, 6, 1, 2,
        4, 5, 6, 4, 6, 7,
        5, 4, 0, 5, 0, 1
    ];

    for (i = 0; i < cubeIndices.length; ++i) {
        cubeVertices.push(cubeCords[cubeIndices[i]]);
    }

    return cubeVertices;
}

const init = () => {
    let canvas = document.getElementById('gl-canvas');

    gl = WebGLUtils.setupWebGL(canvas, { preserveDrawingBuffer: true });
    if (!gl) alert("Webgl isn't avaliable!");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    const program = my.initProgramWithCodes(gl, vertexCode, fragmentCode);
    gl.useProgram(program);

    let vertices = createCube();
    console.log(vertices);

    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // 
    const aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    gl.vertexAttribPointer(aVertexPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);

    let aVertexUniformModel = gl.getUniformLocation(program, "aVertexUniformModel");
    let aVertexUniformColor = gl.getUniformLocation(program, 'aVertexUniformColor');
    render(aVertexUniformModel, aVertexUniformColor, vertices.length);
}

const render = (uModel, uColor, length) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let scaleMtr = scalem(GENERAL_SCALE);
    let modelMtr = scaleMtr;
    console.log(modelMtr);
    gl.uniformMatrix4fv(uModel, false, flatten(modelMtr));
    gl.uniform4fv(uColor, CUBE_COLOR);
    gl.drawArrays(gl.TRIANGLES, 0, length);
}

window.onload = init;