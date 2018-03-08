"use strict"
let gl;
const ANGLE = 190;
const SQRT_3 = Math.sqrt(3);
const RAD = Math.PI / 180;

const turnXYobject = (vertice) => {
	return {
		'X': vertice[0],
		'Y': vertice[1],
	};
}

const MathOps = {
	decrement: {
		X: (vertice) => {
			return vec2(vertice[0]-1.0, vertice[1]);
		},
		Y: (vertice) => {
			return vec2(vertice[0], vertice[1]-1.0);
		},
	},
	increase: {
		X: (vertice) => {
			return vec2(vertice[0]+1.0, vertice[1]);
		},
		Y: (vertice) => {
			return vec2(vertice[0], vertice[1]+1.0);
		},
	},
};

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
		let cosAngle = Math.cos(angle * RAD);
		let sinAngle = Math.sin(angle * RAD);
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
		let vertices = []

		// Example equilateral triangle
		let triangle = [
			vec2( -1/3, -1/3+0.7),
			vec2(  1/3, -1/3+0.7),
			vec2(  0/3, (SQRT_3-1)/3+0.7),
		]
		console.log(triangle)
		
		let twisted_triangle = twist(triangle, ANGLE);
		twisted_triangle = twisted_triangle.map(MathOps.decrement.Y)
		console.log(twisted_triangle)

		vertices = vertices.concat(triangle, twisted_triangle)
		console.log(vertices)

    // Load the data into the GPU
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    const vPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPos);
		render(vertices.length);
}

const render = (size) => {
	gl.clear(gl.COLOR_BUFFER_BIT);
	console.log(size);
	for (let i = 0; i < size / 2; i += 3) {
		gl.drawArrays(gl.LINE_LOOP, i, 3);
	}
	for (let i = size / 2; i < size; i += 3) {
		gl.drawArrays(gl.TRIANGLE_FAN, i, 3);
	}
	//gl.drawArrays(gl.LINE_LOOP, 0, 3);
	//gl.drawArrays(gl.TRIANGLE_FAN, 3, 3);
}

window.onload = init;