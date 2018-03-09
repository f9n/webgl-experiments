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
			return vec2(vertice[0]-0.5, vertice[1]);
		},
		Y: (vertice) => {
			return vec2(vertice[0], vertice[1]-0.5);
		},
	},
	increment: {
		X: (vertice) => {
			return vec2(vertice[0]+0.5, vertice[1]);
		},
		Y: (vertice) => {
			return vec2(vertice[0], vertice[1]+0.5);
		},
	},
};

const findCenterOfGravity = (triangle) => {
	let xg = (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3
	let yg = (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3
	return vec2(xg, yg);
}

const twistWithoutTesselation = (triangle, centerVertice, angle) => {
	let twistedTriangle = []
	let center = turnXYobject(centerVertice);

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

const twistWithTesselation = (triangle, centerVertice, angle) => {
	let twistedTriangle = []
	let center = turnXYobject(centerVertice)
	let newAngle = angle * RAD

	for(let vertice of triangle) {
		let vertice_object = turnXYobject(vertice);
		let distance = Math.sqrt(Math.pow(vertice_object.X - center.X, 2) + Math.pow(vertice_object.Y - center.Y, 2))
		let distanceX = vertice_object.X - center.X;
		let distanceY = vertice_object.Y - center.Y;
		let cosAngle = Math.cos(angle * RAD * distance);
		let sinAngle = Math.sin(angle * RAD * distance);
		let newX = center.X + ( cosAngle * distanceX + sinAngle * distanceY)
		let newY = center.Y + (-sinAngle * distanceX + cosAngle * distanceY)
		let newVertice = vec2(newX, newY)
		twistedTriangle.push(newVertice)
	}
	return twistedTriangle
}

const createTriangle = (vertice1, vertice2, vertice3) => {
	return [vertice1, vertice2, vertice3];
}

const getMiddleVertice = (first, second) => {
	return vec2((first[0] + second[0])/2, (first[1] + second[1])/2)
}

const divideTriangleAndReturnMiniTriangle = (triangle) => {
	let a = triangle[0]
	let b = triangle[1]
	let c = triangle[2]
	let ab = getMiddleVertice(a, b);
	let ac = getMiddleVertice(a, c);
	let bc = getMiddleVertice(b, c);
	return [
		createTriangle(a, ab, ac),
		createTriangle(b, ab, bc),
		createTriangle(c, ac, bc),
		createTriangle(ab, bc, ac),
	];
}

const getTessalation = (triangle, isTwist, centerVertice, angle) => {
	console.log(`isTwist = ${isTwist}`)
	let triangles = divideTriangleAndReturnMiniTriangle(triangle)
	if (isTwist == false) {
		return triangles;
	}
	let twistedtriangles = []
	for(let _triangle of triangles) {
		let twistedtriangle = twistWithTesselation(_triangle, centerVertice, angle);
		twistedtriangles.push(twistedtriangle);
	}

	return twistedtriangles;
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
	console.log("Single Triangle: ")
	console.log(triangle)
	triangle = triangle.map(MathOps.decrement.X);

	/*
	let dividedTriangle = divideTriangleAndReturnMiniTriangle(triangle);
	console.log("Divided Triangle")
	console.log(...dividedTriangle);
	*/

	let centerVerticeForSingle = findCenterOfGravity(triangle)
	let twisted_triangle = twistWithoutTesselation(triangle, centerVerticeForSingle, ANGLE);
	twisted_triangle = twisted_triangle.map(MathOps.decrement.Y).map(MathOps.decrement.Y)
	console.log("Single Twisted Triangle: ")
	console.log(twisted_triangle)

	let triangleForTesselation = triangle.map(MathOps.increment.X).map(MathOps.increment.X)
	let centerVerticeForTesselation = findCenterOfGravity(triangleForTesselation)
	let tesselation =  getTessalation(triangleForTesselation, false, centerVerticeForTesselation, ANGLE);
	console.log("Mini Triangle, Tesselation: ")
	console.log(...tesselation)
	let triangleForTwistedTesselation = tesselation.map(MathOps.decrement.Y).map(MathOps.decrement.Y).map(MathOps.decrement.Y)
	let centerVerticeForTwistedTesselation = findCenterOfGravity(triangleForTwistedTesselation)
	let twisted_tesselation = getTessalation(triangleForTwistedTesselation, true, centerVerticeForTwistedTesselation, ANGLE)
	console.log("Mini Triangle, Tesselation with Twist: ")
	console.log(...twisted_tesselation)
	vertices = vertices.concat(triangle, ...tesselation, twisted_triangle, ...twisted_tesselation)
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