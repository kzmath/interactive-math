function mapToUnit2d(z) {
	const d = norm2d(z);
	if (d == 0) return z;
	return [z[0]/d, z[1]/d];
}

function complexRootsApp() {
	const app = new C5();
	const axis = app.axis;
	axis.setLimits(-2, 2, -2, 2);

	c1 = C5.CS[0];
	const z = axis.addControlDot(0, 1, "z", {fillStyle: c1});
	
	let clamp = true;
	let n = 3;

	app.draw = function() {
		axis.axisGrid();
		if (clamp) [z.x, z.y] = mapToUnit2d([z.x, z.y]);

		axis.line(0, 0, z.x, z.y, {lineWidth: 3, strokeStyle: c1});
		let th = Math.atan2(z.y, z.x);
		let R = norm2d([z.x, z.y]);	
		let Rn = R ** (1/n);
		axis.strokeCircle(0, 0, Rn);
		for (let i = 0; i < n; i++) {
			let thi = (th + i*(2 * Math.PI))/n;
			axis.drawDot(Rn * Math.cos(thi), Rn * Math.sin(thi), 6, {label: "z" + i});
		}

		clamp = app.doSquareCheckBox(2001, clamp, 50, 650, {label: "Clamp z"});
		n = Math.floor(
			app.doSlider(2002, (n-1)/6, [200, 645], [350, 645], 
				{label: "n = " + n}) * 6) + 1; 
	}
}
complexRootsApp();
