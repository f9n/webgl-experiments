"use strict"
// Global Variables
const SQRT_3 = Math.sqrt(3);
const RAD = Math.PI / 180;

// Functions
const Util = {
	TurnXYobject: (vertice) => {
		return {
			'X': vertice[0],
			'Y': vertice[1],
		};
	},
	FindCenterOfGravityAndReturnVertice: (triangle) => {
		console.log('[+] Util.FindCenterOfGravityAndReturnVertice:')
		let xg = (triangle[0][0] + triangle[1][0] + triangle[2][0]) / 3
		let yg = (triangle[0][1] + triangle[1][1] + triangle[2][1]) / 3
		return vec2(xg, yg);
	},
	getMainTriagle: (center, size) => {
		let center_object = Util.TurnXYobject(center);
		let height = SQRT_3 * size;
		return [
			vec2(center_object.X - size, center_object.Y - (height / 3.0)      ),//left
			vec2(center_object.X       , center_object.Y + (height * 2.0 / 3.0)),//top
			vec2(center_object.X + size, center_object.Y - (height / 3.0)      ),//right
		];
	},
	CreateTriangle: (vertice1, vertice2, vertice3) => {
		console.log('[+] Util.CreateTriangle:')
		return [vertice1, vertice2, vertice3];
	},
	GetMiddleVertice: (first, second) => {
		console.log('[+] Util.GetMiddleVertice:')
		return vec2((first[0] + second[0])/2, (first[1] + second[1])/2)
	},
	DivideTriangleAndReturn4MiniTriangle: (triangle) => {
		console.log('[+] Util.DivideTriangleAndReturn4MiniTriangle:')
		let [a, b, c] = triangle
		let ab = Util.GetMiddleVertice(a, b);
		let ac = Util.GetMiddleVertice(a, c);
		let bc = Util.GetMiddleVertice(b, c);
		return [
			Util.CreateTriangle(a, ab, ac),
			Util.CreateTriangle(b, ab, bc),
			Util.CreateTriangle(c, ac, bc),
			Util.CreateTriangle(ab, bc, ac),
		];
	},
	TwistWithTesselation: (triangle, centerVertice, angle) => {
		console.log('[+] Util.TwistWithTesselation:')
		let twisted_triangle = []
		let center = Util.TurnXYobject(centerVertice)
		let new_angle = angle * RAD
		let vertice_object;
		let distance, distanceX, distanceY;
		let cosAngle, sinAngle;
		let newX, newY;
		let newVertice;
		console.log(triangle)
		for(let vertice of triangle) {
			vertice_object = Util.TurnXYobject(vertice);
			distance = Math.sqrt(Math.pow(vertice_object.X - center.X, 2) + Math.pow(vertice_object.Y - center.Y, 2))
			distanceX = vertice_object.X - center.X;
			distanceY = vertice_object.Y - center.Y;
			cosAngle = Math.cos(new_angle * distance);
			sinAngle = Math.sin(new_angle * distance);
			newX = center.X + ( cosAngle * distanceX + sinAngle * distanceY)
			newY = center.Y + (-sinAngle * distanceX + cosAngle * distanceY)
			newVertice = vec2(newX, newY)
			twisted_triangle.push(newVertice)
		}
		return twisted_triangle
	},
	TwistWithoutTesselation: (triangle, center_vertice, angle) => {
		console.log('[+] Util.TwistWithoutTesselation:')
		let twisted_triangle = []
		let center = Util.TurnXYobject(center_vertice);
		let cosAngle = Math.cos(angle * RAD);
		let sinAngle = Math.sin(angle * RAD);
		let vertice_object;
		let distanceX, distanceY;
		let newX, newY;
		let newVertice;
		console.log(triangle)
		for(let vertice of triangle) {
			vertice_object = Util.TurnXYobject(vertice);
			distanceX = vertice_object.X - center.X;
			distanceY = vertice_object.Y - center.Y;
			newX = center.X + ( cosAngle * distanceX - sinAngle * distanceY)
			newY = center.Y + ( sinAngle * distanceX + cosAngle * distanceY)
			newVertice = vec2(newX, newY)
			twisted_triangle.push(newVertice)
		}
		return twisted_triangle;
	},
	GetTessalation: (all, triangle, count) => {
		console.log('[+] Util.GetTessalation:')
		if (count == 0) {
			all.push(triangle)
		} else {
			count--
			let [triangle1, triangle2, triangle3, triangle4] = Util.DivideTriangleAndReturn4MiniTriangle(triangle)
			Util.GetTessalation(all, triangle1, count)
			Util.GetTessalation(all, triangle2, count)
			Util.GetTessalation(all, triangle3, count)
			Util.GetTessalation(all, triangle4, count)
		}
	},

	// Convert triangle array to vertice array
	ConvertTriangleArr2NormalArr: (triangles) => {
		console.log('[+] Util.ConvertTriangleArr2NormalArr:')
		let clean_triangles = triangles.reduce((clean, triangle) => {
			clean.push(triangle[0], triangle[1], triangle[2])
			return clean
		}, [])
		return clean_triangles
	},

}
const Canvas = (canvasId, vertices, isFill) => {
	console.log("[|] Canvas:")
	const canvas = document.getElementById(canvasId);

	let gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) alert("Webgl isn't avaliable!");

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	const program = my.initProgram(gl, 'vertex-shader', 'fragment-shader');
	gl.useProgram(program);

	// Displaying Vertices
	console.log("Vertices:")
	console.log(vertices)

	// Load the data into the GPU
	const bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

	// Associate out shader variables with our data buffer
	const vPos = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPos);
	render(gl, isFill, vertices.length);
}

const render = (gl, isFill, size) => {
	console.log("[-] render:")
	gl.clear(gl.COLOR_BUFFER_BIT);
	if (isFill == false) {
		for(let i=0; i < size; i+=3)
			gl.drawArrays(gl.LINE_LOOP, i, 3)
	} else {
		for(let i=0; i < size; i+=3)
			gl.drawArrays(gl.TRIANGLE_FAN, i, 3)
	}
}

const SingleTriangle = (triangle) => {
	console.log("[/] SingleTriangle:")
	console.log(triangle)
	Canvas('gl-canvas-single-triangle', triangle, false);
}

const SingleTwistedTriangle = (triangle, angle) => {
	console.log("[/] SingleTwistedTriangle:")
	let center_vertice = Util.FindCenterOfGravityAndReturnVertice(triangle)
	console.log(`Center Vertice: ${center_vertice}`)
	let twisted_triangle = Util.TwistWithoutTesselation(triangle, center_vertice, angle);
	console.log(twisted_triangle)
	Canvas('gl-canvas-twist-single-triangle', twisted_triangle, true);
}

const Tesselation = (triangle) => {
	console.log("[/] Tesselation:")
	let triangles = []
	Util.GetTessalation(triangles, triangle, 2)
	let vertices = Util.ConvertTriangleArr2NormalArr(triangles)
	Canvas('gl-canvas-tesselation', vertices, false);
}

const TwistedTesselation = (triangle, angle) => {
	console.log("[/] TwistedTesselation:")
	let triangles = []
	let twisted_triangles = []
	let center_vertice = Util.FindCenterOfGravityAndReturnVertice(triangle)
	let twisted_triangle;
	Util.GetTessalation(triangles, triangle, 2)
	for(let _triangle of triangles) {
		console.log(_triangle)
		twisted_triangle = Util.TwistWithTesselation(_triangle, center_vertice, angle)
		console.log(twisted_triangle)
		twisted_triangles.push(twisted_triangle)
	}
	console.log(twisted_triangles)
	let vertices = Util.ConvertTriangleArr2NormalArr(twisted_triangles)
	Canvas('gl-canvas-twist-tesselation', vertices, true);
}

const init = () => {
	console.log("[-] init:")
	// Example equilateral triangle
	/*
	let triangle = [
		vec2( -0.85, 0.29792740578363097),
		vec2( -0.5, 0.9041451884327381 ),
		vec2( -0.15000000000000002, 0.29792740578363097),
	]
	*/
	let triangle = Util.getMainTriagle(vec2(0, 0), 0.5);
	SingleTriangle(triangle)
	SingleTwistedTriangle(triangle, 120)
	Tesselation(triangle)
	TwistedTesselation(triangle, 120)
}

window.onload = init;