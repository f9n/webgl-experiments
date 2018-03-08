"use strict"
let gl;

const turnXYobject = (vertice) => {
	return {
		'X': vertice[0],
		'Y': vertice[1],
	};
}

const findCenterOfGravity = (triangle) => {
	let xg = (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3
	let yg = (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3
	return vec2(xg, yg);
}

const twist = (triangle, angle) => {
	let twistedTriangle = []
	let centerVertice = findCenterOfGravity(triangle)
	let center = turnXYobject(centerVertice);
	console.log(center)

	for(let vertice of triangle) {
		let vertice_object = turnXYobject(vertice);
		let distanceX = vertice_object.X - center.X;
		let distanceY = vertice_object.Y - center.Y;
		let cosAngle = Math.cos(angle);
		let sinAngle = Math.sin(angle);
		let newX = center.X + ( cosAngle * distanceX + sinAngle * distanceY)
		let newY = center.Y + (-sinAngle * distanceX + cosAngle * distanceY)
		let newVertice = vec2(newX, newY)
		twistedTriangle.push(newVertice)
	}
	return twistedTriangle;
}

const init = () => {
    const canvas = document.getElementById('gl-canvas');

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) alert("Webgl isn't avaliable!");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

		// Vertices
    let triangle_vertices = [
			vec2( -0.5, -0.5 ),
      vec2( -0.5,  0.5 ),
      vec2(  0.5,  0.5 ),
		]
		let angle = 90

		console.log(triangle_vertices)
		let twisted_triangle = twist(triangle_vertices, angle);
		console.log(twisted_triangle)

    // Load the data into the GPU
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangle_vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    const vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);
		render(triangle_vertices.length);
}

const render = (size) => {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.LINE_LOOP, 0, size);
}

window.onload = init;