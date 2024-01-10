function mapToUnit2d(z) {
	const d = norm2d(z);
	if (d == 0) return z;
	return [z[0]/d, z[1]/d];
}

function complexMultApp() {
	const app = new C5();
	const axis = app.axis;
	axis.setLimits(-2, 2, -2, 2);

	c1 = C5.CS[0];
	c2 = C5.CS[1];
	c3 = C5.CS[2];
	const z = axis.addControlDot(1, 0, "z", {fillStyle: c1});
	const w = axis.addControlDot(0, 1, "w", {fillStyle: c2});
	app.clampZ = true;
	app.clampW = true;

	app.draw = function() {
		axis.axisGrid();

		if (app.clampZ) [z.x, z.y] = mapToUnit2d([z.x, z.y]);
		if (app.clampW) [w.x, w.y] = mapToUnit2d([w.x, w.y]);
		if (app.clampZ || app.clampW) axis.strokeCircle(0, 0, 1);

		axis.strokePath([0, 0, z.x, z.y], {strokeStyle: c1});
		axis.strokePath([0, 0, w.x, w.y], {strokeStyle: c2});

		let zw = complexMult([z.x, z.y], [w.x, w.y]);
		axis.strokePath([0, 0, zw[0], zw[1]], {strokeStyle: c3});
		axis.drawDot(zw[0], zw[1], 6, {label: "zw", fillStyle: c3});

		app.clampZ = app.doSquareCheckBox(2001, app.clampZ, 50, 600, {label: "Clamp z"});
		app.clampW = app.doSquareCheckBox(2002, app.clampW, 50, 650, {label: "Clamp w"});
	}
}
complexMultApp();
