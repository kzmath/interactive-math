/**
 * @typedef {import('./lib/C5.js').C5} C5
 */

function clampToCircle(z, c, R) {
	const d = norm2d(minus2d(z, c));
	if (d == 0) return z;
	return [(z[0] - c[0])/d * R + c[0], (z[1] - c[1])/d * R + c[1]];
}

function circlePropApp() {
	const app = new C5();
	const axis = app.axis;
	axis.setLimits(-2.5, 2.5, -2.5, 2.5);

	const [c1, c2] = [C5.CS[0], C5.CS[1]];
	const A = axis.addControlDot(0.5, 1, "A", {fillStyle: c1});
	const B = axis.addControlDot(0.5, -1, "B", {fillstyle: c2});

	const caption = "The blue circle is the locus of all points satisfying the relation $|z-1|=\\alpha|z+1|$ for some $\\alpha \\in (0, 1)$. Drag the point A to set the ratio $\\alpha$ and drag the point B to move along the locus.";

	console.log(caption);
	console.log(convertTeX(caption));

	app.setCaption(convertTeX(caption));
	app.draw = function() {
		axis.axisGrid();
		

		let al = norm2d([A.x - 1, A.y])/norm2d([A.x + 1, A.y]);
		let center = (1 + al**2)/(1-al**2);
		let R = norm2d([A.x - center, A.y]);


		axis.line(A.x, A.y, 1, 0);
		axis.line(A.x, A.y, -1, 0);
		axis.drawDot(center, 0, 6, {fillStyle: "blue", label:"C"});
		axis.drawText("|A-1|/|A+1|=" + al.toPrecision(3), A.x, A.y, {xOffset: 20, yOffset: 10, font:"18px sans-serif"});

		if (Math.abs(A.x) > 0.005) {
			[B.x, B.y] = clampToCircle([B.x, B.y], [center, 0], R);
		} else { B.x = 0; }

		axis.line(B.x, B.y, 1, 0);
		axis.line(B.x, B.y, -1, 0);
		axis.drawText("|B-1|/|B+1|=" + al.toPrecision(3), B.x, B.y, {xOffset: 20, yOffset: 10, font:"18px sans-serif"});

		if (Math.abs(A.x) < 0.005) {
			axis.line(0, axis.ymin, 0, axis.ymax, {lineWidth: 4, strokeStyle: c1});
		} else {
			axis.strokeCircle(center, 0, R, {lineWidth: 3, strokeStyle: c1});
		}
		axis.drawDot(1, 0, 6, {label: "1", fillStyle: "green"});
		axis.drawDot(-1, 0, 6, {label: "-1", fillStyle: "green"});

		app.debugInfo("alpha", al);
		app.debugInfo("center", center);
		app.debugInfo("A", [A.x, A.y]);

	}
}

circlePropApp();
