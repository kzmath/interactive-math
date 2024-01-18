function complexMappingApp() {
	// Calulate dimensions for two panel layout
	const width = 900;
	const margin = 15;
	const axSize = (width - 4 * margin) / 2;

	const app = new C5({width: width, height: axSize + 2 * margin});

	const ax1 = app.addAxis();
	ax1.setCrop(margin, margin, margin + axSize, margin + axSize);
	const ax2 = app.addAxis();
	ax2.setCrop(app.width / 2 + margin, margin, app.width - margin, margin + axSize)

	app.setAxes = function(R1, R2) {
		ax1.setLimits(-R1, R1, -R1, R1);
		ax2.setLimits(-R2, R2, -R2, R2);
	}

	app.setAxes(1.5, 1.5);
	app.R = 3;
	app.gN = 15;
	app.N = 201;

	// Use colors from the Tableaux palette
	const [b1, b2] = [C5.C[0], C5.C[1]];
	const [c3, c4] = [C5.CS[2], C5.CS[3]];

	// Add control dots
	const A = ax1.addControlDot(0, 0.5, "A", { fillStyle: c3 });
	const B = ax1.addControlDot(0.5, 0, "B", { fillStyle: c4 });
	const C = ax2.addControlDot(1, 0, "λ", {fillStyle: "blue"});

	const polarToCart = (R, th) => [R * Math.cos(th), R*Math.sin(th)];

	// Functions to be applied
	const lbz = (x, y) => complexMult([C.x, C.y], [x, y]);
	const z2 = (x, y) => [x ** 2 - y ** 2, 2 * x * y];
	const z3 = (x, y) => complexIntPower([x, y], 3);
	const zinv = (x, y) => complexDiv([1, 0], [x, y]);
	const z2inv = (x, y) => complexDiv([1, 0], complexIntPower([x, y], 2));
	const mobius = (x, y) => complexDiv([0.5 - x, - y], [1 - 0.5 * x, - 0.5 * y]);

	app.functionName = "z2";

	app.funcs = {
		"lbz": {func: lbz, latex: "\\lambda z"},
		"z2": {func: z2, latex: "z^2"},
		"z3": {func: z3, latex: "z^3"},
		"zinv": {func: zinv, latex: "\\dfrac{1}{z}"},
		"z2inv": {func: z2inv, latex: "\\dfrac{1}{z^2}"},
		"mobius": {func: mobius, latex: "\\dfrac{\\frac12 - z}{1 - \\frac{z}{2}}"}
	}

	app.buttonClicked = function() {
		app.setCaption("Mapping: " + app.katexM("f(z) = " + app.funcs[app.functionName].latex)); 
	}
	app.setCaption("Mapping: " + app.katexM("f(z) = " + app.funcs[app.functionName].latex)); 

	app.addHTMLButton(app.katexM("\\lambda z"), () => {app.functionName = "lbz"});
	app.addHTMLButton(app.katexM("z^2"), () => { app.functionName = "z2" });
	app.addHTMLButton(app.katexM("z^3"), () => (app.functionName = "z3"));
	app.addHTMLButton(app.katexM("\\dfrac{1}{z}"), () => (app.functionName = "zinv"));
	app.addHTMLButton(app.katexM("\\dfrac{1}{z^2}"), () => (app.functionName = "z2inv"));
	app.addHTMLButton(app.katexM("\\dfrac{\\frac12 - z}{1 - \\frac{z}{2}}"), () => (app.functionName = "mobius"));
	// app.addButton("exp(z)", (app) => (app.fText = "exp"));

	// app.addHTMLButton("Toggle Debug", (app) => { app.toggleDebug() });
	app.addHTMLButton("Toggle Resolution", (app) => {
		if (app.gN == 15) { app.gN = 31; } else { app.gN = 15; }
	});

	app.draw = function() {
		let R = app.R


		switch (app.functionName) {
			case "lbz": app.f = lbz; break;
			case "z2": app.f = z2; break;
			case "z3": app.f = z3; break;
			case "zinv": app.f = zinv; break;
			case "z2inv": app.f = z2inv; break;
			case "mobius": app.f = mobius; break;
			// case "exp": app.f = exp; break;
		}
		if (app.f == lbz) { C.visible = true } else { C.visible = false };

		ax1.beginClip();

		const RMesh = genApply(
			(arr) => complexApply(polarToCart, arr), 
			meshGrid2d([0, 0], [0, 2 * Math.PI], [app.R, 0], app.gN, app.N)
		);
		const thMesh = genApply(
			(arr) => complexApply(polarToCart, arr), 
			meshGrid2d([0, 0], [app.R, 0], [0, 2 * Math.PI], app.gN, app.N)
		);

		const A_th = Math.atan2(A.y, A.x);
		// let A_R = norm2d([A.x, A.y]);
		// let B_th = Math.atan2(B.y, B.x);
		const B_R = norm2d([B.x, B.y]);

		const RLine = complexApply(
			polarToCart, linRange2d([0, A_th], [R, A_th], app.N)
		);
		const thLine = complexApply(
			polarToCart, linRange2d([B_R, 0], [B_R, 2*Math.PI], app.N)
		);

		ax1.axisGrid({ grid: false, tick: false });

		ax1.strokePathArr(RMesh, { strokeStyle: b1 });
		ax1.strokePathArr(thMesh, { strokeStyle: b2 });
		ax1.strokePath(RLine, { strokeStyle: c3, lineWidth: 3 });
		ax1.strokePath(thLine, { strokeStyle: c4, lineWidth: 3 });

		ax1.endClip();

		ax2.beginClip();

		const xMapped = genApply((zarr) => complexApply(app.f, zarr), RMesh);
		const yMapped = genApply((zarr) => complexApply(app.f, zarr), thMesh);
		const hMapped = complexApply(app.f, RLine);
		const vMapped = complexApply(app.f, thLine);

		ax2.axisGrid({ grid: false });

		if (app.f == lbz) {
			ax2.strokePath([0, 0, C.x, C.y], {lineWidth: 3})
			ax2.drawText("λ = " + C.x.toPrecision(2) + " + " + C.y.toPrecision(2) + "i", -2, -2, {xOffset: 20, font: "20px sans-serif"});
		};


		ax2.strokePathArr(xMapped, { strokeStyle: b1 });
		ax2.strokePathArr(yMapped, { strokeStyle: b2 });
		ax2.strokePath(hMapped, { strokeStyle: c3, lineWidth: 3 });
		ax2.strokePath(vMapped, { strokeStyle: c4, lineWidth: 3 });
		ax2.drawDot(...app.f(A.x, A.y), 6, { label: "f(A)", fillStyle: c3 });
		ax2.drawDot(...app.f(B.x, B.y), 6, { label: "f(B)", fillStyle: c4 });


		ax2.endClip();
	}
	return app;
}
complexMappingApp();
