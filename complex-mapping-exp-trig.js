function complexMappingExp() {
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

	app.R = Math.PI;
	app.gN = 15;
	app.N = 201;

	// Use colors from the Tableaux palette
	const [b1, b2] = [C5.C[0], C5.C[1]];
	const [c3, c4] = [C5.CS[2], C5.CS[3]];

	// Add control dots
	const A = ax1.addControlDot(0, 0.5, "A", { fillStyle: c3 });
	const B = ax1.addControlDot(0.5, 0, "B", { fillStyle: c4 });

	const exp = (x, y) => complexExp([x, y]);
	const cos = (x, y) => complexCos([x, y]);
	const sin = (x, y) => complexSin([x, y]);
	const cosh = (x, y) => complexCosh([x, y]);
	const sinh = (x, y) => complexSinh([x, y]);


	app.functionName = "exp";

	app.funcs = {
		"exp": {func: exp, latex: "\\exp(z)"},
		"cos": {func: cos, latex: "\\cos(z)"},
		"sin": {func: sin, latex: "\\sin(z)"},
		"cosh": {func: cosh, latex: "\\cosh(z)"},
		"sinh": {func: sinh, latex: "\\sinh(z)"},
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

		app.setAxes(app.R, app.R);
		app.f = app.funcs[app.functionName].func;

		ax1.beginClip();

		const xMesh = meshGrid2d([-app.R, -app.R], [0, 2 * app.R], [2 * app.R, 0], app.gN, app.N);
		const yMesh = meshGrid2d([-app.R, -app.R], [2 * app.R, 0], [0, 2 * app.R], app.gN, app.N);
		const hline = linRange2d([-app.R, A.y], [app.R, A.y], app.N);
		const vline = linRange2d([B.x, -app.R], [B.x, app.R], app.N);

		ax1.axisGrid({ grid: false, tick: false });

		ax1.strokePathArr(xMesh, { strokeStyle: b1 });
		ax1.strokePathArr(yMesh, { strokeStyle: b2 });
		ax1.strokePath(hline, { strokeStyle: c3, lineWidth: 3, alpha: 0.1 });
		ax1.strokePath(vline, { strokeStyle: c4, lineWidth: 3 });

		ax1.endClip();

		ax2.beginClip();

		const xMapped = genApply((zarr) => complexApply(app.f, zarr), xMesh);
		const yMapped = genApply((zarr) => complexApply(app.f, zarr), yMesh);
		const hMapped = complexApply(app.f, hline);
		const vMapped = complexApply(app.f, vline);

		ax2.axisGrid({ grid: false });

		ax2.strokePathArr(xMapped, { strokeStyle: b1 });
		ax2.strokePathArr(yMapped, { strokeStyle: b2 });
		ax2.strokePath(hMapped, { strokeStyle: c3, lineWidth: 3 });
		ax2.strokePath(vMapped, { strokeStyle: c4, lineWidth: 3 });
		ax2.drawDot(...app.f(A.x, A.y), 6, { label: "f(A)", fillStyle: c3 });
		ax2.drawDot(...app.f(B.x, B.y), 6, { label: "f(B)", fillStyle: c4 });


		ax2.endClip();

		this.debugInfo("Dots", [A, B]);
	}
	return app;
}
complexMappingExp();
