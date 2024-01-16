function clampToCircle(z, c, R) {
	const d = norm2d(minus2d(z, c));
	if (d == 0) return z;
	return [(z[0] - c[0])/d * R + c[0], (z[1] - c[1])/d * R + c[1]];
}

function circlePropApp() {
	const app = new C5();
	const axis = app.axis;
	axis.setLimits(-2.5, 2.5, -2.5, 2.5);

	const [b1, b2] = [C5.CL[0], C5.CL[1]];
	const [c1, c2] = [C5.CS[0], C5.CS[1]];
	const A = axis.addControlDot(0.5, 1, "A", {fillStyle: c1});
	const B = axis.addControlDot(0, -1, "B", {fillStyle: c2});

	const caption = "The two family of circles, one defined by $|A - 1| = \\alpha |A + 1|$ for $\\alpha > 0$ and $\\alpha \\ne 1$, the other defined by $|z - B| = |B - 1|$ for $B$ on the vertical axis, are always orthogonal to each other.";

	console.log(caption);
	console.log(convertTeX(caption));

	const drawAlphaCircle = function(axis, al) {
		const center = (1 + al**2)/(1-al**2);
		if (Math.abs(al - 1) < 0.005) {
			axis.line(0, axis.ymin, 0, axis.ymax, {lineWidth: 1, strokeStyle: b1});
		} else {
			const R = 2*al/Math.abs(1-al**2)
			axis.strokeCircle(center, 0, R, {lineWidth: 1, strokeStyle: b1});
		}
	}

	/** @param {Axis} axis */
	const drawBisectCircle = function(axis, y, args) {
		style = {lineWidth: 1, strokeStyle: b2};
		mergeArgs(style, args);
		if (Math.abs(y) < 0.005) {
			axis.line(-1, 0, 1, 0, style);
		} else {
			const R = Math.sqrt(y**2 + 1)
			axis.strokeCircle(0, y, R, style);
		}
	}

	const alArr = linRange(0.1, 0.9, 8);
	const yArr = linRange(-2, 2, 10);

	app.setCaption(convertTeX(caption));
	app.draw = function() {
		axis.axisGrid({grid:false});
		
		B.x = 0;

		let al = norm2d([A.x - 1, A.y])/norm2d([A.x + 1, A.y]);
		let center = (1 + al**2)/(1-al**2);
		let R = norm2d([A.x - center, A.y]);


		for (let i = 0; i<alArr.length; i++) {
			drawAlphaCircle(axis, alArr[i]);
			drawAlphaCircle(axis, 1/(alArr[i]));
		}

		for (let i = 0; i<yArr.length; i++) {
			drawBisectCircle(axis, yArr[i]);
		}

		axis.line(A.x, A.y, 1, 0);
		axis.line(A.x, A.y, -1, 0);

		axis.line(0, B.y, 1, 0);
		axis.line(0, B.y, -1, 0);

		axis.drawText("|z-B| = |1-B|", B.x, B.y, {xOffset: 20, yOffset: 10, font:"18px sans-serif"});

		axis.drawDot(center, 0, 6, {fillStyle: "blue", label:"C"});
		axis.drawText("|A-1|/|A+1|=" + al.toPrecision(3), A.x, A.y, {xOffset: 20, yOffset: 10, font:"18px sans-serif"});

		if (Math.abs(A.x) < 0.005) {
			axis.line(0, axis.ymin, 0, axis.ymax, {lineWidth: 4, strokeStyle: c1});
		} else {
			axis.strokeCircle(center, 0, R, {lineWidth: 4, strokeStyle: c1});
		}
		axis.drawDot(1, 0, 6, {label: "1", fillStyle: "green"});
		axis.drawDot(-1, 0, 6, {label: "-1", fillStyle: "green"});

		drawBisectCircle(axis, B.y, {lineWidth: 4, strokeStyle: c2});

		app.debugInfo("alpha", al);
		app.debugInfo("center", center);
		app.debugInfo("A", [A.x, A.y]);

	}
}

circlePropApp();
