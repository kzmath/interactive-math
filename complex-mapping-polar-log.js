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

	app.setAxes(1.5, 1.2*Math.PI);
	app.R = 3;
	app.gN = 15;
	app.N = 201;

	// Use colors from the Tableaux palette
	const [b1, b2] = [C5.C[0], C5.C[1]];
	const [c3, c4] = [C5.CS[2], C5.CS[3]];

	// Add control dots
	const A = ax1.addControlDot(0, 0.5, "A", { fillStyle: c3 });
	const B = ax1.addControlDot(0.5, 0, "B", { fillStyle: c4 });
	const C = ax2.addControlDot(0, 1, "λ", {fillStyle: "blue"});

	let lb = [0, 1];

	const polarToCart = (R, th) => [R * Math.cos(th), R*Math.sin(th)];

	// Functions to be applied
	const z = (x, y)=> [x, y];
	const log = (x, y) => complexLog([x, y]);
	const lb_pz = (x, y)=> complexExp(complexMult([x, y], complexLog(lb)));
	const z_plb = (x, y)=> complexExp(complexMult(lb, complexLog([x, y])));

	app.functionName = "z";

	app.funcs = {
		"z": {func: z, latex: "z"},
		"log": {func: log, latex: "\\mathrm{Log}(z)"},
		"lb_pz": {func: lb_pz, latex: "p.v.  \\lambda^z"},
		"z_plb": {func: z_plb, latex: "p.v.  z^\\lambda"},
	}

	app.buttonClicked = function() {
		app.setCaption("Mapping: " + app.katexM("f(z) = " + app.funcs[app.functionName].latex)); 
	}
	app.setCaption("Mapping: " + app.katexM("f(z) = " + app.funcs[app.functionName].latex)); 

	for (const fname in app.funcs) {
		app.addHTMLButton(app.katexM(app.funcs[fname].latex), () => {app.functionName = fname});
	}

	// app.addHTMLButton("Toggle Debug", (app) => { app.toggleDebug() });
	app.addHTMLButton("Toggle Resolution", (app) => {
		if (app.gN == 15) { app.gN = 31; } else { app.gN = 15; }
	});

	app.draw = function() {
		let R = app.R
		lb = [C.x, C.y];

		app.f = app.funcs[app.functionName].func;

		ax1.beginClip();

		const RMesh = genApply(
			(arr) => complexApply(polarToCart, arr), 
			meshGrid2d([0, - Math.PI], [0, 2*Math.PI - 1e-5], [app.R, 0], app.gN, app.N)
		);
		const thMesh = genApply(
			(arr) => complexApply(polarToCart, arr), 
			meshGrid2d([0,  - Math.PI], [app.R, 0], [0,  2*Math.PI - 1e-5], app.gN, app.N)
		);

		const A_th = Math.atan2(A.y, A.x);
		// let A_R = norm2d([A.x, A.y]);
		// let B_th = Math.atan2(B.y, B.x);
		const B_R = norm2d([B.x, B.y]);

		const RLine = complexApply(
			polarToCart, linRange2d([0, A_th], [R, A_th], app.N)
		);
		const thLine = complexApply(
			polarToCart, linRange2d([B_R, -Math.PI], [B_R, Math.PI - 1e-5], app.N)
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
