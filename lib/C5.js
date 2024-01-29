// Use a structure similar to q5.js
// Code name c5
// Release 0.1

"use strict";

// export {C5};
// export {C5Array};

class C5 {

	mainDiv;
	canvas;
	debugDiv;
	uiDiv;
	captionDiv;
	hasKaTeX = false;
	showDebug = false;
	loaded = false;

	width = 700;
	height = 700;

	pmouseX = 0;
	pmouseY = 0;
	mouseX = 0;
	mouseY = 0;
	mouseIsPressed = false;
	mouseIsDragged = false;
	mouseButton = "";

	// Event placeholders
	_setup = function() { };
	_drawFn = function() { };
	_mouseDraggedFn = function() { };
	_mouseMovedFn = function() { };
	_mousePressedFn = function() { };
	_mouseReleasedFn = function() { };
	_mouseClickedFn = function() { };
	_keyPressedFn = function() { };
	_keyReleasedFn = function() { };
	_keyTypedFn = function() { };
	_buttonClickedFn = function() {};

	set draw(fun) { this._drawFn = fun; }
	set buttonClicked(fun) {this._buttonClickedFn = fun ;}

	// Hot and dragged UI item
	hot = -1;
	dragged = -1;
	active = -1;

	// List of axes and the default axis
	/** @type{Array.Axis} */
	axes = [];
	/** @type{Axis} */
	axis;

	timeStamp = 0;
	frameTime = 0;
	frameCounter = 0;

	debugTable = {};
	maxDrawTime = 0;
	// save the draw time of last 180 frames
	drawTimeArray = Array(180);

	// Constants
	CENTER = "center";
	LEFT = "left";
	RIGHT = "right";
	TOP = "top";
	BOTTOM = "bottom";
	BASELINE = "alphabetic";

	static defaultSettings = {
		lineJoin: "round",
	}

	// Tableau colors
	static C = [
		"#4e79a7", // Blue
		"#f28e2b", // Orange
		"#e15759", // Red
		"#76b7b2", // Teal
		"#59a14f", // Green
		"#edc948", // Yellow
		"#b07aa1", // Purple
		"#ff9da7", // Pink
		"#9c755f", // Brown
		"#bab0ab"  // Gray
	]
	// Saturated version of Tableau colors
	static CS = [
		"#1b4e87", // Saturated Blue
		"#ff7f00", // Saturated Orange
		"#d62020", // Saturated Red
		"#00857d", // Saturated Teal
		"#008e00", // Saturated Green
		"#f5cc00", // Saturated Yellow
		"#8700a3", // Saturated Purple
		"#ff4d4d", // Saturated Pink
		"#804d33", // Saturated Brown
		"#8a8a85"  // Saturated Gray
	];
	// Light version of Tableau colors
	static CL = [
		"#8cbce8", // Light Blue
		"#f7c99c", // Light Orange
		"#e8a3a5", // Light Red
		"#b2d3cc", // Light Teal
		"#a2cda2", // Light Green
		"#f2e8c2", // Light Yellow
		"#d8c1d4", // Light Purple
		"#ffd5da", // Light Pink
		"#c3b4aa", // Light Brown
		"#d9d5d1"  // Light Gray
	];

	constructor(args) {

		// if (width) { this.width = width; }
		// if (height) { this.height = height; }

		const c5 = this;
		if (args) {
			if ("width" in args) { this.width = args.width; }
			if ("height" in args) { this.height = args.height; }
			if ("showDebug" in args) { this.showDebug = args.showDebug; }
		}

		const mainDiv = this.mainDiv = document.createElement("div");
		const canvas = this.canvas = document.createElement("canvas");
		const uiDiv = this.uiDiv = document.createElement("div");
		const captionDiv = this.captionDiv = document.createElement("div");
		const debugDiv = this.debugDiv = document.createElement("div");

		mainDiv.appendChild(canvas);
		mainDiv.appendChild(uiDiv);
		mainDiv.appendChild(captionDiv);
		mainDiv.appendChild(debugDiv);

		mainDiv.classList.add("c5");
		uiDiv.classList.add("c5ui");
		captionDiv.classList.add("c5caption");
		captionDiv.style.margin = "20px 10px";
		mainDiv.style.width = "min-content";
		mainDiv.style.margin = "20px auto";
		canvas.style.border = "1px solid LightGray";
		canvas.style.boxShadow = "0px 0px 3px 3px rgba(0, 0, 0, 5%)";
		debugDiv.style.margin = "20px 10px";
		debugDiv.style.fontFamily = "sans-serif";

		// UI and Caption are hidden at first, will show if elements are added to it.
		uiDiv.style.display = "none";
		captionDiv.style.display = "none";
		if (this.showDebug) {
			debugDiv.style.display = "block";
		} else {
			debugDiv.style.display = "none";
		}

		const ctx = this.ctx = this.canvas.getContext("2d", {
			desynchronized: true,
			preserveDrawingBuffer: true
		});
		ctx.canvas.width = this.width;
		ctx.canvas.height = this.height;
		mergeArgs(ctx, C5.defaultSettings);

		this.addAxis();
		this.axis = this.axes[0];

		for (let i = 0; i < this.drawTimeArray.length; i++) {
			this.drawTimeArray[i] = 0;
		}

		// Create a manual load event for the app
		window.addEventListener("loadC5", () => {
			c5.load();
			c5.loaded = true;
		});

		window.addEventListener("load", () => {
			c5.load();
			c5.loaded = true;
		});

	}


	// ========================================   
	// EVENTS
	// ========================================   
	
	load() {
		const c5 = this;
		if (c5.loaded) return;
		document.body.appendChild(c5.mainDiv);
		// c5.setEvents();
		c5.setUpInputs();
		// If 
		if ("katex" in window) {
			if (!document.getElementById("c5UpdateMath")) {
				const updateMath = document.createElement("script");
				updateMath.type = "text/javascript";
				updateMath.text = updateMathScript;
				updateMath.id = "c5UpdateMath";
				document.body.appendChild(updateMath);
			}
			// Insert css  
			if (!document.getElementById("c5Css")) {
				const css = document.createElement("style");
				css.innerHTML = c5css;
				css.id = "c5Css";
				document.head.appendChild(css);
			}
			c5.hasKaTeX = true;
			// The script seems immediately loaded. Is document.body.appendChild synchronous?
			if (window.hasOwnProperty("updateMath")) updateMath();
		}
		c5._draw();
	}

	setEvents() {
		let $ = this;
		let eventNames = [
			"setup", "draw", "preload",
			"mouseMoved", "mousePressed", "mouseReleased", "mouseDragged", "mouseClicked",
			"keyPressed", "keyReleased", "keyTyped",
			"touchStarted", "touchEnded",
		];
		for (let k of eventNames) {
			let intern = "_" + k + "Fn";
			// $[intern] = function() { };
			// $[intern].isPlaceHolder = true;
			if ($[k]) {
				$[intern] = $[k];
			} else {
				Object.defineProperty($, k, {
					set: function(fun) { $[intern] = fun; },
				});
			}
		}
	}

	_draw() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		const now = performance.now();
		this.frameTime = now - this.timeStamp;
		this.timeStamp = now;
		if (this.frameCounter % 59 == 0) {
			this.debugTable["FPS"] = Math.round(1000 / this.frameTime);
		}
		this.debugTable["Mouse Position"] = String(this.mouseX) + ", " + String(this.mouseY)

		requestAnimationFrame(() => { this._draw() });

		for (let i = 0; i < this.axes.length; i++) {
			this.axes[i].doControlDots();
		}

		const t1 = performance.now();
		this._drawFn();
		const dt = performance.now() - t1;

		for (let i = 0; i < this.axes.length; i++) {
			this.axes[i].drawControlDots();
		}

		// Get the running maximum draw time in the last 180 frames
		if (dt > this.maxDrawTime) {
			this.lastMaxTime = this.frameCounter;
			this.maxDrawTime = dt
		}

		this.drawTimeArray[this.frameCounter % 180] = dt;
		this.maxDrawTime = 0;
		for (let i = 0; i < this.drawTimeArray.length; i++) {
			if (this.drawTimeArray[i] > this.maxDrawTime) this.maxDrawTime = this.drawTimeArray[i];
		}
		this.debugInfo("draw time", dt);
		this.debugInfo("Max draw time in the last 180 frames (ms)", this.maxDrawTime);

		// Render debug Info
		let debugHTML = this.renderDebugInfo();
		if (debugHTML.localeCompare(this.debugDiv.innerHTML) != 0) {
			this.debugDiv.innerHTML = debugHTML;
		}

		this.frameCounter += 1;
	}

	// ======================================== 
	// Input
	// ======================================== 
	//
	setUpInputs() {
		this.canvas.onmousemove = (event) => {
			this.pmouseX = this.mouseX;
			this.pmouseY = this.mouseY;
			this.mouseX = event.offsetX;
			this.mouseY = event.offsetY;
			if (this.mouseIsPressed) {
				this.mouseIsDragged = true;
				this._mouseDraggedFn(event);
			} else {
				this._mouseMovedFn(event);
			}
		}
		this.canvas.onmousedown = (event) => {
			this.pmouseX = this.mouseX;
			this.pmouseY = this.mouseY;
			this.mouseX = event.offsetX;
			this.mouseY = event.offsetY;
			if (this.mouseIsPressed) {
				this.mouseIsDragged = true;
			}
			this.mouseIsPressed = true;
			this.mouseButton = [this.LEFT, this.CENTER, this.RIGHT][event.button];
			this._mousePressedFn(event);
		}
		this.canvas.onmouseup = (event) => {
			this.pmouseX = this.mouseX;
			this.pmouseY = this.mouseY;
			this.mouseX = event.offsetX;
			this.mouseY = event.offsetY;
			this.mouseIsPressed = false;
			this.mouseIsDragged = false;
			this._mouseReleasedFn(event);
		}
		this.canvas.onclick = (event) => {
			this.pmouseX = this.mouseX;
			this.pmouseY = this.mouseY;
			this.mouseX = event.offsetX;
			this.mouseY = event.offsetY;
			this.mouseIsPressed = true;
			this._mouseClickedFn(event);
			this.mouseIsPressed = false;
			this.mouseIsDragged = false;
		}
	}

	// ======================================== 
	// Axes
	// ======================================== 

	addAxis() {
		const newAxis = new Axis(this, this.axes.length + 1);
		this.axes.push(newAxis);
		return newAxis;

	}

	// ======================================== 
	// UI
	// ======================================== 
	
	
	addHTMLButton(text, callback) {
		if (this.uiDiv.style.display == "none") this.uiDiv.style.display = "flex";
		const button = document.createElement("span");
		this.uiDiv.appendChild(button);
		const app = this;
		button.onclick = () => { callback(app); app._buttonClickedFn() };
		button.innerHTML = text;
		button.classList.add("c5button");
		if (this.hasKaTeX) updateMath();
		return button;
	}

	setCaption(text) {
		if (this.captionDiv.style.display == "none") this.captionDiv.style.display = "block";
		this.captionDiv.innerHTML = text;
		if (this.hasKaTeX) updateMath();
	}

	// Wrap text in a math span
	katexM(text) {
		return `<span class='math'>${text}</span>`;
	}

	mouseInDistance(x, y, R) {
		return (this.mouseX - x) ** 2 + (this.mouseY - y) ** 2 < R ** 2
	}

	/** 
	 * @param{number} id - A unique id for the UI element 
	 * @param{function} isInRangeCallback - Return true if item is in range of interaction
	 * @returns{object} interaction - Result of the interaction
	 * Abstraction for common code for the clickable UI interface. Will interact
	 * according to the "hot/active" rules and returns the interaction result.
	 * */
	doClickableUI(id, isInRangeCallback) {
		const result = {
			uiPressed: false,
			uiClicked: false,
		}
		if (this.active == id) {
			if (this.mouseIsPressed) {
				result.uiPressed = true;
			} else {
				this.active = -1;
				result.uiClicked = true;
				// console.log("UI item " + id + " Clicked");
			}
		} else {
			if (id == this.hot) {
				if (this.mouseIsPressed) {
					this.active = id;
				}
				if (!isInRangeCallback()) {
					this.hot = - 1;
				}
			}
			if (isInRangeCallback() && this.active == -1) {
				this.hot = id;
			}
		}
		return result;
	}

	/** 
	 * @param{number} id - A unique id for the UI element 
	 * @param{number} t - initial value between 0 and 1
	 * @param{Array.number} v1 - 2d vector: starting point of the slider
	 * @param{Array.number} v2 - 2d vector: ending point of the slider 
	 * @returns {number} sliderValue
	 * */
	doSlider(id, t, v1, v2, args) {
		const style = {
			label: "",
			label_font: "16px sans-serif",
			label_fill: "black"
		};
		mergeArgs(style, args);
		this.ctx.font = style.label_font;
		this.ctx.fillStyle = style.label_fill;
		this.strokeLine(v1[0], v1[1], v2[0], v2[1], { strokeStyle: "black", lineWidth: 2 });
		if (style.label) {
			this.ctx.fillText(style.label, v2[0] + 20, v2[1] + 5);
		}
		let [dotx, doty] = v2lerp(v1, v2, t);
		let sliderValue = t;
		const result = this.doClickableUI(id, () => this.mouseInDistance(dotx, doty, 6));
		if (result.uiPressed) {
			[dotx, doty, sliderValue] = clamp2d([this.mouseX, this.mouseY], v1, v2);
		}
		if (id == this.hot) this.drawCircle(dotx, doty, 6, { strokeStyle: "Gray" });
		else this.drawCircle(dotx, doty, 6);
		return sliderValue;
	}

	// A simple square color button. (x, y) is the lower left coordinates.
	doSquareColorButton(id, x, y, side, fillStyle) {
		const result = this.doClickableUI(id,
			() => Math.max(Math.abs(this.mouseX - x - side / 2), Math.abs(this.mouseY - y + side / 2)) < side / 2);
		const ctx = this.ctx;
		ctx.fillStyle = fillStyle;
		if (result.uiClicked) ctx.fillStyle = "Yellow";
		if (id == this.hot) { ctx.strokeStyle = "Gray"; }
		else { ctx.strokeStyle = "Black" }

		ctx.fillRect(x, y - side, side, side);
		ctx.strokeRect(x, y - side, side, side);
		this.debugInfo(id + " x y", [x, y]);
		this.debugInfo(id + " in range", Math.max(Math.abs(this.mouseX - x), Math.abs(this.mouseY - y)) < side / 2);
		return result.uiClicked;
	}

	doSquareCheckBox(id, checked, x, y, args) {
		const style = {
			side: 16,
			label: "",
		}
		mergeArgs(style, args);
		const side = style.side;
		let boxChecked = checked;
		const result = this.doClickableUI(id,
			() => Math.max(Math.abs(this.mouseX - x - side / 2), Math.abs(this.mouseY - y + side / 2)) < side / 2);
		const ctx = this.ctx;
		ctx.fillStyle = "LightGray";
		ctx.strokeStyle = "Black";
		if (id == this.hot) { ctx.strokeStyle = "Gray"; }
		if (result.uiClicked) boxChecked = !boxChecked;
		ctx.fillRect(x, y - side, side, side);
		ctx.strokeRect(x, y - side, side, side);
		if (boxChecked) {
			ctx.fillStyle = "Black";
			ctx.fillRect(x + side / 2 - side / 6, y - side / 2 - side / 6, side / 3, side / 3);
		}
		if (style.label) {
			ctx.fillText(style.label, x + 2 * side, y);
		}
		return boxChecked;
	}

	// ======================================== 
	// Drawing primatives
	// ======================================== 

	static defaultStroke = {
		strokeStyle: "black",
		lineWidth: 1.03,
	}

	strokeLine(x1, y1, x2, y2, args) {
		const style = Object.assign({}, C5.defaultStroke);
		Object.assign(style, args);
		const ctx = this.ctx;
		// This is unsafe. Should not allow arbitrary properties to be set.
		mergeArgs(ctx, style);
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	drawCircle(x, y, R, args) {
		const style = { filled: true, fillStyle: "LightGray" };
		Object.assign(style, args);
		const ctx = this.ctx;
		mergeArgs(ctx, style);
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		if (style.filled) {
			ctx.fill();
		}
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.stroke();
	}

	drawPoly(arr, args) {
		if (arr.length < 4) return;
		const style = { filled: true, fillStyle: "LightGray" };
		Object.assign(style, args);
		const ctx = this.ctx;
		mergeArgs(ctx, style);

		ctx.beginPath();
		ctx.moveTo[arr[0], arr[1]];
		for (let i = 2; i < arr.length - 1; i += 2) {
			ctx.lineTo(arr[i], arr[i + 1])
			if (style.filled) {
				ctx.fill();
			}
		}
		ctx.beginPath();
		ctx.moveTo[arr[0], arr[1]];
		for (let i = 2; i < arr.length - 1; i += 2) {
			ctx.lineTo(arr[i], arr[i + 1])
			ctx.stroke();
		}
	}

	// ======================================== 
	// DEBUG
	// ======================================== 

	debugInfo(name, info) {
		this.debugTable[name] = info;
	}

	renderDebugInfo() {
		let debugHTML = "";
		for (const k in this.debugTable) {
			debugHTML += k + "&nbsp;&nbsp;" + JSON.stringify(this.debugTable[k]) + "&nbsp;&nbsp;<br>";
		}
		return debugHTML;
	}

	toggleDebug() {
		if (this.debugDiv.style.display == "none") {
			this.debugDiv.style.display = "block";
		}
		else this.debugDiv.style.display = "none";
	}

	defaultStyle() {
		this.ctx.linewidth = 1.03273;
		this.ctx.strokeStyle = "black";
	}
}

// KaTeX render math script
const updateMathScript = `
function updateMath(){
	const mathElements = document.getElementsByClassName("math");
	for (let i = 0; i < mathElements.length; i++) {
	if (!mathElements[i].classList.contains('updated'))
	{
		katex.render(mathElements[i].textContent, mathElements[i], {
		displayMode: mathElements[i].classList.contains('display'),
		throwOnError: false,
		fleqn: false,
		});
	}
		mathElements[i].classList.add("updated");
	}
	console.log("Updated Math.")
}`;

// Default css
const c5css = `
	:root {
		--bg: #f8f8ff;
	  --shade: #f0f0ff;
		--line-color: #d3d3d3;
		--text-color: #808080;
	}
	.c5ui {
		display: flex;
		flex-wrap: wrap;
		padding: 1em;
		justify-content: center;
		align-items: center;
		margin: 0.5em 0;
		flex-item: 0 0;
	}
	.c5ui .c5button  {
	  background-color: var(--bg);
	  border-radius: 3px;
	  border: 1px solid var(--line-color);
	  box-sizing: border-box;
	  color: var(--text-color);
	  cursor: pointer;
	  display: inline-block;
	  font-family: sans-serif;
	  font-size: 1em;
	  font-weight: 400;
	  padding: 8px 1em;
		margin: 0px 1em;
		user-select: none;
	}
	.c5ui .c5button:hover {
	  background-color: var(--shade);
	  color: #2c5777;
	}
	.c5ui .c5button:active {
	  box-shadow: 0 0 3px 3px rgba(128, 128, 128, .10);
	}
	.c5caption {
	  font-family: sans-serif;
	}
`;


// Axis class

class Axis {

	g;
	id;

	xmin = -4;
	xmax = 4;
	ymin = -4;
	ymax = 4;

	cropLeft = 0;
	cropTop = 0;
	cropRight;
	cropBottom;

	xScale;
	yScale;
	ox;
	oy;

	controlDots = [];

	// The preset default style is defined as static properties (search for static properties)
	// This is the instanced version that allows overriding per axis
	defaultGridStyle = {};
	defaultStroke = {};

	/**
	 * @constructor
	* @param {C5} graphics - Current C5 app 
	* @param {number} id - Unique id for this axis (an app can contain multiple axes)
	*/
	constructor(graphics, id) {
		this.g = graphics;
		this.id = id;

		this.cropRight = this.g.width;
		this.cropBottom = this.g.height;
		this.xScale = (this.cropRight - this.cropLeft) / (this.xmax - this.xmin);
		this.yScale = (this.cropBottom - this.cropTop) / (this.ymax - this.ymin);
		this.ox = Math.round(this.cropLeft - this.xmin * this.xScale);
		this.oy = Math.round(this.cropTop + this.ymax * this.yScale);

		Object.assign(this.defaultGridStyle, Axis.defaultGridStyle);
		Object.assign(this.defaultStroke, Axis.defaultStroke);
	}


	// Get mouse positions in logical coordinates
	get mouseX() {
		return (this.g.mouseX - this.ox) / this.xScale;
	}
	get mouseY() {
		return -(this.g.mouseY - this.oy) / this.yScale;
	}
	get pmouseX() {
		return (this.g.pmouseX - this.ox) / this.xScale;
	}
	get pmouseY() {
		return -(this.g.pmouseY - this.oy) / this.yScale;
	}

	updateScale() {
		this.xScale = (this.cropRight - this.cropLeft) / (this.xmax - this.xmin);
		this.yScale = (this.cropBottom - this.cropTop) / (this.ymax - this.ymin);
		this.ox = Math.round(this.cropLeft - this.xmin * this.xScale);
		this.oy = Math.round(this.cropTop + this.ymax * this.yScale);
	}

	setLimits(xmin, xmax, ymin, ymax) {
		this.xmin = xmin;
		this.xmax = xmax;
		this.ymin = ymin;
		this.ymax = ymax;
		this.updateScale();
	}

	setCrop(cropLeft, cropTop, cropRight, cropBottom) {
		this.cropLeft = cropLeft;
		this.cropTop = cropTop;
		this.cropRight = cropRight;
		this.cropBottom = cropBottom;
		this.updateScale();
	}

	// Helpers
	dotIsHot(dot) {
		return (Math.sqrt((dot.x - this.mouseX) ** 2 + (dot.y - this.mouseY) ** 2) * this.xScale < dot.size)
	}

	toScreenXY(x, y) {
		return [this.ox + x * this.xScale, this.oy - y * this.yScale];
	}

	// Control dots
	addControlDot(x, y, name, args) {
		const newDot = new ControlDot(x, y, name, this.id * 100 + this.controlDots.length + 1);
		mergeArgs(newDot, args);
		this.controlDots.push(newDot);
		return newDot;
	}

	doControlDots() {
		this.g.debugInfo("Active", this.g.active);
		this.g.debugInfo("Hot", this.g.hot);
		this.g.debugInfo("Mouse pressed", this.g.mouseIsPressed);
		for (let i = 0; i < this.controlDots.length; i++) {
			/** @type{ControlDot} */
			let dot = this.controlDots[i];
			if (dot.visible) {
				if (dot.id == this.g.active) {
					if (!this.g.mouseIsPressed) {
						this.g.active = -1;
					} else {
						dot.x = this.mouseX;
						dot.y = this.mouseY;
					}
				} else { // dot is not active
					if (dot.id == this.g.hot) { // dot was hot last frame
						if (this.g.mouseIsPressed) {
							this.g.active = dot.id;
						}
						if (!this.dotIsHot(dot)) {
							this.g.hot = - 1;
						}
					}
					if (this.dotIsHot(dot) && (this.g.active == -1)) {
						this.g.hot = dot.id;
					}
				}
			}
		}
	}

	drawControlDots() {
		for (let i = 0; i < this.controlDots.length; i++) {
			let dot = this.controlDots[i];
			if (dot.visible) {
				if (dot.id == this.g.hot) {
					this.drawDot(dot.x, dot.y, dot.size, { fillStyle: dot.fillStyle, strokeStyle: "yellow", label: dot.name });
				} else {
					this.drawDot(dot.x, dot.y, dot.size, { fillStyle: dot.fillStyle, label: dot.name });
				}
			}
		}
	}

	// *Axis Drawing* 
	// Drawing stuff to an axis

	beginClip() {
		const ctx = this.g.ctx;
		ctx.beginPath();
		ctx.rect(this.cropLeft, this.cropTop, this.cropRight - this.cropLeft, this.cropBottom - this.cropTop);
		ctx.save();
		ctx.clip();
	}

	endClip() {
		const ctx = this.g.ctx;
		ctx.restore();
	}

	_getStep(width) {
		const power = Math.ceil(Math.log(width) / Math.log(10)) - 1;
		if (width / (10 ** power) > 6) {
			return 10 ** power
		}
		if (width / (10 ** power) > 3) {
			return 10 ** power / 2
		}
		if (width / (10 ** power) > 1.3) {
			return 10 ** power / 5
		}
		return 10 ** (power - 1)
	}

	static defaultGridStyle = {
		N: 8,
		M: 8,
		fill: true,
		fillStyle: "GhostWhite",
		grid: true,
		lineWidth: 1,
		strokeStyle: "LightGray",
		label: true,
		labelColor: "Gray",
		labelFont: "10px san-serif",
		labelXOffset: 3,
		labelYOffest: 3,
		tick: true,
	}

	axisGrid(args) {
		// Set styles
		const style = Object.assign({}, this.defaultGridStyle);
		Object.assign(style, args);
		const strokeArgs = { lineWidth: style.lineWidth, strokeStyle: style.strokeStyle };
		const textArgs = { color: style.labelColor, font: style.labelFont, xOffset: style.labelXOffset, yOffset: style.labelYOffest };

		const xStep = this._getStep(this.xmax - this.xmin);
		const yStep = this._getStep(this.ymax - this.ymin);
		// this.g.debugInfo("steps", [this.xmin, this.xmax, xStep, this.ymin, this.ymax, yStep]);

		// Fill background
		const ctx = this.g.ctx;
		if (style.fill) this.fillRect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin, {fillStyle: style.fillStyle});
		for (let i = Math.floor(this.xmin / xStep) + 1; i * xStep < this.xmax; i++) {
			if (style.grid) this.strokePath([i * xStep, this.ymin, i * xStep, this.ymax], strokeArgs);
			if (style.label) this.drawText((i * xStep).toPrecision(2), i * xStep, this.ymin, textArgs);
			if (style.label && (!style.grid) && style.tick) this.drawTick(i * xStep, this.ymin, 10, 0, 1, { lineWidth: style.lineWidth });
		}
		for (let i = Math.floor(this.ymin / yStep) + 1; i * yStep < this.ymax; i++) {
			if (style.grid) this.strokePath([this.xmin, i * yStep, this.xmax, i * yStep], strokeArgs);
			if (style.label) this.drawText((i * yStep).toPrecision(2), this.xmin, i * yStep, textArgs);
			if (style.label && (!style.grid) && style.tick) this.drawTick(this.xmin, i * yStep, 10, 1, 0, { lineWidth: style.lineWidth });
		}
	}

	static defaultStroke = {
		strokeStyle: "black",
		lineWidth: 1.03,
	}

	setStrokeStyle(args) {
		const style = Object.assign({}, this.defaultStroke);
		Object.assign(style, args);
		this.g.ctx.lineWidth = style.lineWidth;
		this.g.ctx.strokeStyle = style.strokeStyle;
		return style;
	}


	/**
	 * @param {Array.number} arr
	 * @param {Object} args
	 */
	strokePath(arr, args) {
		const ctx = this.g.ctx;
		this.setStrokeStyle(args);
		const n = arr.length;
		if (n < 2) {
			return;
		}
		ctx.beginPath();
		ctx.moveTo(this.ox + arr[0] * this.xScale, this.oy - arr[1] * this.yScale);
		for (let i = 2; i + 1 < n; i += 2) {
			ctx.lineTo(this.ox + arr[i] * this.xScale, this.oy - arr[i + 1] * this.yScale);
		}
		ctx.stroke();
	}

	line(x1, y1, x2, y2, args) {
		this.strokePath([x1, y1, x2, y2], args);
	}

	/**
	 * @param {Array.Array.number} collection
	 * @param {Object} args
	 */
	strokePathArr(collection, args) {
		const M = collection.length;
		for (let i = 0; i < M; i++) {
			this.strokePath(collection[i], args);
		}
	}

	/**
	 * @param {Array.number} arr
	 * @param {object} args
	 */
	lines(arr, args) {
		const ctx = this.g.ctx;
		this.setStrokeStyle(args);
		const n = arr.length;
		if (n < 4) {
			return;
		}
		ctx.beginPath();
		ctx.moveTo(this.ox + arr[0] * this.xScale, this.oy - arr[1] * this.yScale);
		ctx.lineTo(this.ox + arr[2] * this.xScale, this.oy - arr[3] * this.yScale);
		for (let i = 4; i + 1 < n; i += 4) {
			ctx.moveTo(this.ox + arr[i] * this.xScale, this.oy - arr[i + 1] * this.yScale);
			ctx.lineTo(this.ox + arr[i + 2] * this.xScale, this.oy - arr[i + 3] * this.yScale);
		}
		ctx.stroke();
	}

	polygon(arr) {
		let ctx = this.g.ctx;
		let n = arr.length;
		if (n < 2) {
			return;
		}
		ctx.beginPath();
		ctx.moveTo(this.ox + arr[0] * this.xScale, this.oy - arr[1] * this.yScale);
		for (let i = 2; i + 1 < n; i += 2) {
			ctx.lineTo(this.ox + arr[i] * this.xScale, this.oy - arr[i + 1] * this.yScale);
		}
		ctx.closePath();
		ctx.fill();
	}

	strokeRect(x, y, width, height, args) {
		this.setStrokeStyle(args);
		this.strokePath([x, y, x + width, y, x + width, y + height, x, y + height, x, y]);
	}

	fillRect(x, y, width, height, args) {
		let style = {
			fillStyle: "Gray",
			stroke: false,
			strokeStyle: "black" 
		}
		mergeArgs(style, args);
		this.g.ctx.fillStyle = style.fillStyle;
		this.polygon([x, y, x + width, y, x + width, y + height, x, y + height, x, y]);
		if (style.stroke) {
			this.strokeRect(x, y, width, height, {strokeStyle: style.strokeStyle});
		}
	}

	strokeCircle(x, y, R, args) {
		const ctx = this.g.ctx;
		this.setStrokeStyle(args);
		ctx.beginPath();
		const screenX = this.ox + x * this.xScale;
		const screenY = this.oy - y * this.yScale;
		ctx.arc(screenX, screenY, R * this.xScale, 0, 2 * Math.PI);
		ctx.stroke();
	}


	// Draw dot at axis coordinates, but size is given in screen pixels

	drawDot(x, y, size, args) {
		const style = {
			fill: true,
			fillStyle: "red",
			stroke: true,
			lineWidth: 1,
			strokeStyle: "black",
			label: "",
			labelXOffset: 3,
			labelYOffset: 3,
		}
		Object.assign(style, args);
		const ctx = this.g.ctx;
		ctx.beginPath();
		const screenX = this.ox + x * this.xScale;
		const screenY = this.oy - y * this.yScale;
		if (style.fill) {
			ctx.fillStyle = style.fillStyle;
			ctx.arc(screenX, screenY, size, 0, 2 * Math.PI);
			ctx.fill();
		}
		if (style.stroke) {
			ctx.strokeStyle = style.strokeStyle;
			ctx.lineWidth = style.lineWidth;
			ctx.arc(screenX, screenY, size, 0, 2 * Math.PI);
			ctx.stroke();
		}
		if (style.label != "") this.label(style.label, x, y, args);
	}

	drawTick(x, y, size, dx, dy, args) {
		const style = {
			lineWidth: 1,
			strokeStyle: "Grey",
		}
		Object.assign(style, args);
		const screenX = this.ox + x * this.xScale;
		const screenY = this.oy - y * this.yScale;
		const ctx = this.g.ctx;
		ctx.strokeStyle = style.strokeStyle;
		ctx.lineWidth = style.lineWidth;
		ctx.beginPath();
		ctx.moveTo(screenX, screenY);
		ctx.lineTo(screenX + dx * size, screenY - dy * size);
		ctx.stroke();
	}

	// Draw label 
	label(text, x, y) {
		// Drawing text 18 pixels below x, y
		if (text) {
			let ctx = this.g.ctx;
			ctx.fillStyle = "black";
			ctx.font = '16px sans-serif';
			ctx.fillText(text, this.ox + x * this.xScale, this.oy - y * this.yScale + 22);
		}
	}

	// Draw text
	drawText(text, x, y, args) {
		const ctx = this.g.ctx;
		const textArgs = {
			color: "black",
			font: "14px sans-serif",
			xOffset: 0,
			yOffset: 20
		};
		mergeArgs(textArgs, args);
		ctx.fillStyle = textArgs.color;
		ctx.font = textArgs.font;
		ctx.fillText(text, this.ox + x * this.xScale + textArgs.xOffset, this.oy - y * this.yScale - textArgs.yOffset);
	}

	// Plotting 
	plot(x, y, args) {
		this.setStrokeStyle(args);
		const n = Math.min(x.length, y.length);
		const ctx = this.g.ctx;
		if (n < 2) {
			return;
		}
		ctx.beginPath();
		ctx.moveTo(this.ox + x[0] * this.xScale, this.oy - y[0] * this.yScale);
		for (let i = 1; i + 1 < n; i += 1) {
			ctx.lineTo(this.ox + x[i] * this.xScale, this.oy - y[i] * this.yScale);
		}
		ctx.stroke();
	}
}

class ControlDot {
	x;
	y;
	size = 6;
	fillStyle = "red";
	name;
	id;
	visible = true;
	constructor(x, y, name, id) {
		this.x = x;
		this.y = y;
		this.name = name;
		this.id = id;
	}
}


// ========================================   
// General helpers
// ========================================   


// Assign the properties of the src object to dst, but only if
// they already exists in dst.

function mergeArgs(dst, src) {
	if (!src) return;
	const srcKeys = Object.keys(src)
	for (let i in srcKeys) {
		if (srcKeys[i] in dst) {
			dst[srcKeys[i]] = src[srcKeys[i]];
		}
	}
}

// Array helpers

// An object containing all json helpers
const C5Array = {
	linRange: linRange,
	linRange2d: linRange2d,
	meshGrid2d: meshGrid2d,
	meshGrid: meshGrid,
	genApply: genApply,
	floatApply: floatApply,
	complexApply: complexApply,
	addVec2: addVec2,
}

function linRange(beg, end, N) {
	if (N <= 0) return;
	const arr = new Float64Array(N);
	const step = (end - beg) / (N - 1);
	for (let i = 0; i < N; i += 1) {
		arr[i] = beg + step * i;
	}
	return arr;
}

function linRange2d(v1, v2, N) {
	if (N < 1) return;
	const arr = new Float64Array(2 * N);
	const stepx = (v2[0] - v1[0]) / (N - 1);
	const stepy = (v2[1] - v1[1]) / (N - 1);
	for (let i = 0; i < 2 * N - 1; i += 2) {
		arr[i] = v1[0] + stepx * i / 2;
		arr[i + 1] = v1[1] + stepy * i / 2;
	}
	return arr;
}

function meshGrid2d(z, v, w, N, M) {
	if (N < 1 || M < 1) return;
	const result = [];
	const varr = linRange2d(z, [z[0] + v[0], z[1] + v[1]], N);
	for (let i = 0; i < 2 * N - 1; i += 2) {
		result.push(
			linRange2d([varr[i], varr[i + 1]], [varr[i] + w[0], varr[i + 1] + w[1]], M)
		);
	}
	return result;
}

/**
 * @param {Array.number} xr
 * @param {Array.number} yr
 * @param {boolean} horizontal
 * Make a mesh grid and returns as array of arrays. If horizontal = true:
 * [x[0], y[0], x[1], y[0], ..., x[N-1], y[0]],
 * ...
 * [x[0], y[M-1], x[1], y[M-1], ..., x[N-1], y[M-1]].
 * Other wise return its transpose: 
 * [x[0], y[0], x[0], y[1], ..., ] etc
 */

function meshGrid(xr, yr, horizontal) {
	const N = xr.length;
	const M = yr.length;
	result = [];
	if (horizontal) {
		for (let i = 0; i < M; i++) {
			let iRow = new Float64Array(N * 2);
			for (let j = 0; j < N; j++) {
				iRow[2 * j] = xr[j];
				iRow[2 * j + 1] = yr[i];
			}
			result.push(iRow);
		}
	}
	else {
		for (let i = 0; i < N; i++) {
			let iCol = new Float64Array(M * 2);
			for (let j = 0; j < M; j++) {
				iCol[2 * j] = xr[i];
				iCol[2 * j + 1] = yr[j];
			}
			result.push(iCol);
		}
	}
	return result;
}

function genApply(f, arr) {
	const result = []
	const N = arr.length;
	for (let i = 0; i < N; i += 1) {
		result.push(f(arr[i]));
	}
	return result;
}

function floatApply(f, xarr) {
	const N = xarr.length;
	const yarr = new Float64Array(N);
	for (let i = 0; i < N; i += 1) {
		yarr[i] = f(xarr[i]);
	}
	return yarr;
}

function complexApply(f, zarr) {
	const N = zarr.length;
	const result = new Float64Array(N);
	for (let i = 0; i < N - 1; i += 2) {
		let tmp = f(zarr[i], zarr[i + 1]);
		result[i] = tmp[0];
		result[i + 1] = tmp[1];
	}
	return result;
}

function addVec2(arr, x, y) {
	const narr = new Array(arr.length);
	for (let i = 0; i < arr.length - 1; i += 2) {
		narr[i] = arr[i] + x;
		narr[i + 1] = arr[i + 1] + y;
	}
	return narr;
}

// ========================================   
// Math
// ========================================   

function complexMult(z1, z2) {
	return [z1[0] * z2[0] - z1[1] * z2[1], z1[1] * z2[0] + z1[0] * z2[1]];
}

function complexMultTo(z1, z2) {
	const z10 = z1[0];
	z1[0] = z1[0] * z2[0] - z1[1] * z2[1];
	z1[1] = z1[1] * z2[0] + z10 * z2[1];
	return z1;
}

function complexIntPower(z, n) {
	// Does not support power larger than 100
	if (n > 100) return;
	const result = [z[0], z[1]];
	if (n == 1) return result;
	for (let i = 1; i < n; i++) {
		complexMultTo(result, z);
	}
	return result;
}

function complexDiv(z1, z2) {
	const z2mod = z2[0] ** 2 + z2[1] ** 2;
	return [(z1[0] * z2[0] + z1[1] * z2[1]) / z2mod, (z1[1] * z2[0] - z1[0] * z2[1]) / z2mod];
}

function complexExp(z) {
	return [Math.exp(z[0]) * Math.cos(z[1]), Math.exp(z[0]) * Math.sin(z[1])];
}

function complexCos(z) {
	const r = Math.exp(- z[1]);
	const vx = Math.cos(z[0]);
	const vy = Math.sin(z[0]);
	return [(r + 1/r)/2*vx, (r - 1/r)/2*vy];
}

function complexSin(z) {
	const r = Math.exp(- z[1]);
	const vx = Math.cos(z[0]);
	const vy = Math.sin(z[0]);
	return [(r + 1/r)/2*vy, -(r - 1/r)/2*vx];
}

function complexCosh(z) {
	const r = Math.exp(z[0]);
	const vx = Math.cos(z[1]);
	const vy = Math.sin(z[1]);
	return [(r + 1/r)/2*vx, (r - 1/r)/2*vy];
}

function complexSinh(z) {
	const r = Math.exp(z[0]);
	const vx = Math.cos(z[1]);
	const vy = Math.sin(z[1]);
	return [(r - 1/r)/2*vx, (r + 1/r)/2*vy];
}

function complexLog(z) {
	return [Math.log(norm2d(z)), Math.atan2(z[1], z[0])];
}

// ============================
//    2d Geometry helpers
// ============================

function clamp(x, min, max) {
	if (x < min) return min;
	if (x > max) return max;
	return x;
}

function dot(v1, v2) {
	return v1[0] * v2[0] + v1[1] * v2[1];
}

function norm2d(v) {
	return Math.sqrt(dot(v, v));
}

function add2d(v1, v2) {
	return [v1[0] + v2[0], v1[1] + v2[1]];
}

function minus2d(v1, v2) {
	return [v1[0] - v2[0], v1[1] - v2[1]];
}

function scale2d(t, v) {
	return [t * v[0], t * v[1]];
}

function equal2d(v1, v2) {
	return (v1[0] == v2[0] && v1[1] == v2[1]);
}

function clamp2d(v, v1, v2) {
	if (equal2d(v1, v2)) return v;
	const dist = norm2d(minus2d(v2, v1));
	const t = clamp(dot(minus2d(v, v1), minus2d(v2, v1)) / (dist ** 2), 0, 1);
	return [...v2lerp(v1, v2, t), t];
}

function v2lerp(v1, v2, t) {
	return [(1 - t) * v1[0] + t * v2[0], (1 - t) * v1[1] + t * v2[1]];
}

// ============================
//    LaTeX helpers
// ============================

// Wrap text in a math span
function katexM(text) {
	return `<span class='math'>${text}</span>`;
}

function convertTeX(src) {
	const list = src.split(/(\$[^\$]+\$)/);
	let result = "";
	for (const i in list) {
		if (list[i].startsWith('$') && list[i].startsWith('$')) {
			result += katexM(list[i].slice(1, -1));
		} else { result += list[i]; }
	}
	return result;
}



