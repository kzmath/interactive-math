function complexLimitApp() {
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

	const polarToCart = (R, th) => [R * Math.cos(th), R*Math.sin(th)];

	// Functions to be applied

		const zNormalize = function(x, y) {
				const d = norm2d([x, y]);
				if (d < 1e-7) return [0, 0];
				return [x/d, y/d];
		} 

		const zSquareOverZNorm = function(x, y) {
				const d = norm2d([x, y]);
				if (d < 1e-7) return [0, 0];
				return scale2d(1/d, complexMult([x, y], [x, y]));
		} 
 

	app.functionName = "zNormalize";

	app.funcs = {
		"zNormalize": {func: zNormalize, latex: "\\frac{z}{|z|}"},
		"zSquareOverZNorm": {func: zSquareOverZNorm, latex: "\\frac{z^2}{|z|}"},
				
	}

	app.buttonClicked = function() {
		app.setCaption("Mapping: " + app.katexM("f(z) = " + app.funcs[app.functionName].latex)); 
	}
	app.setCaption("Mapping: " + app.katexM("f(z) = " + app.funcs[app.functionName].latex)); 
  app.addHTMLButton(app.katexM("\\frac{z}{|z|}"), () => {app.functionName = "zNormalize"});
  app.addHTMLButton(app.katexM("\\frac{z^2}{|z|}"), () => {app.functionName = "zSquareOverZNorm"});

	// app.addHTMLButton("Toggle Debug", (app) => { app.toggleDebug() });
	app.addHTMLButton("Toggle Resolution", (app) => {
		if (app.gN == 15) { app.gN = 31; } else { app.gN = 15; }
	});

	app.draw = function() {
		let R = app.R

		switch (app.functionName) {
						case "zNormalize": app.f = zNormalize; break;
						case "zSquareOverZNorm": app.f = zSquareOverZNorm; break;
		}

		ax1.beginClip();

		const RMesh = genApply(
			(arr) => complexApply(polarToCart, arr), 
			meshGrid2d([1e-5, 0], [1e-5, 2 * Math.PI], [app.R, 0], app.gN, app.N)
		);
		const thMesh = genApply(
			(arr) => complexApply(polarToCart, arr), 
			meshGrid2d([1e-5, 0], [app.R, 0], [1e-5, 2 * Math.PI], app.gN, app.N)
		);

		const A_th = Math.atan2(A.y, A.x);
		const B_R = norm2d([B.x, B.y]);

		const RLine = complexApply(
			polarToCart, linRange2d([1e-5, A_th], [R, A_th], app.N)
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
let app = complexLimitApp();
