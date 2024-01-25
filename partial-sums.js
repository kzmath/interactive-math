function paritialSumsApp() {
	const axHeight = 300;
   const app = new C5({width: 700, height: 2*axHeight + 50});

	const N = 30;

   const ax1 = app.addAxis();
   ax1.setCrop(0, 0, 700, axHeight);
	ax1.setLimits(0, N, -0.2, 1.2);

   const ax2 = app.addAxis();
   ax2.setCrop(0, axHeight + 50, 700, 2*axHeight + 50);
	ax2.setLimits(0, N, -0.2, 3);

	const a = (n) => (1/(n**2));
	const b = (n) => (1/n);

	seqs = {"a": a, "b": b};
	app.seqName = "a";

	let n = 1;

	app.addHTMLButton(katexM("a(n) = \\frac{1}{n^2}"), (app) => {app.seqName = "a"});
	app.addHTMLButton(katexM("b(n) = \\frac{1}{n}"), (app) => {app.seqName = "b"});

	app.draw = function() {
	    let f = seqs[app.seqName];	
		if (app.seqName == "a") { app.ax2Height = 1.8} else {app.ax2Height = 4};

		ax2.setLimits(0, N, -0.2, app.ax2Height);
		ax1.axisGrid();
		ax2.axisGrid();


		let t = app.doSlider(3001, (n-1)/(N-1), [20, axHeight + 25], [630, axHeight + 25], {label:"n = " + n, });
		n = Math.floor(t*(N-1) + 1);

		// Draw bar graph for a(n)
		
		for (let i=1; i<n; i++) {
			ax1.fillRect(i, 0, 0.8, f(i), {fillStyle: C5.C[0], stroke: true, strokeStyle: C5.CS[0]});
		}

		for (let i=1; i<n; i++) {
			let s = 0;
			for (let j = 1; j < i+1; j++) {
				ax2.fillRect(i, s, 0.8, f(j), {fillStyle: C5.C[1], stroke: true, strokeStyle: C5.CS[1]});
				s += f(j);
			}
		}

	}
}

paritialSumsApp();
