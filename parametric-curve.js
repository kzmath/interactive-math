/**
 * @typedef {import('./lib/C5.js').C5} C5
 */

// ========================================
// Global Scope Helper Functions
// ========================================

/**
 * Maps a 1D range to a flattened array of 2D coordinates.
 * @param {function} f - A function that maps a number to a 2D array [x, y].
 * @param {Array<number>} tRange - An array of numbers (1D range).
 * @returns {Array<number>} - A flattened array of 2D coordinates [x1, y1, x2, y2, ...].
 */
function float2DApply(f, tRange) {
    const result = [];
    for (let i = 0; i < tRange.length; i++) {
        const [x, y] = f(tRange[i]);
        result.push(x, y);
    }
    return result;
}

/**
 * Maps a 1D range to a flattened array of 3D coordinates.
 * @param {function} f - A function that maps a number to a 2D array [x, y].
 * @param {Array<number>} tRange - An array of numbers (1D range).
 * @returns {Array<number>} - A flattened array of 3D coordinates [x1, y1, z1, x2, y2, z2, ...].
 */
function float3DApply(f, tRange) {
    const result = []
    for (let i = 0; i < tRange.length; i++) {
        const [x, y] = f(tRange[i]);
        result.push(tRange[i], x, y); // [t, x, y]
    }
    return result;
}

// ========================================
// 3D Visualization Functions (Global Scope)
// ========================================

// Projection matrix for 3D to 2D
const projectionMatrix = [
    [1, -1, 0],  // x' = x - y
    [0, -1, 1]   // y' = -y + z
];

/**
 * Projects a 3D point to 2D using the projection matrix.
 * @param {number} x - The x-coordinate in 3D space.
 * @param {number} y - The y-coordinate in 3D space.
 * @param {number} z - The z-coordinate in 3D space.
 * @returns {Array<number>} - The projected 2D coordinates [x2d, y2d].
 */
function project3DTo2D(x, y, z) {
    const x2d = projectionMatrix[0][0] * x + projectionMatrix[0][1] * y + projectionMatrix[0][2] * z;
    const y2d = projectionMatrix[1][0] * x + projectionMatrix[1][1] * y + projectionMatrix[1][2] * z;
    return [x2d, y2d];
}

/**
 * Projects a 3D path to 2D.
 * @param {Array<number>} path - A flattened array of 3D coordinates [x1, y1, z1, x2, y2, z2, ...].
 * @returns {Array<number>} - A flattened array of 2D coordinates [x1, y1, x2, y2, ...].
 */
function project3DPath(path) {
    const projectedPath = [];
    for (let i = 0; i < path.length; i += 3) {
        const [x2d, y2d] = project3DTo2D(path[i], path[i + 1], path[i + 2]);
        projectedPath.push(x2d, y2d);
    }
    return projectedPath;
}

/**
 * Projects a collection of 3D paths to 2D.
 * @param {Array<Array<number>>} pathArr - An array of 3D paths.
 * @returns {Array<Array<number>>} - An array of projected 2D paths.
 */
function project3DPathArr(pathArr) {
    return pathArr.map(path => project3DPath(path));
}

/**
 * Draws 3D axes in 2D space.
 * @param {Axis} axis - The axis object to draw on.
 */
function draw3DAxes(axis) {
    const axes3D = [
        [0, 0, 0, 18, 0, 0], // x-axis (length 6)
        [0, 0, 0, 0, 6, 0], // y-axis (length 6)
        [0, 0, 0, 0, 0, 6]  // z-axis (length 6)
    ];

    const projectedAxes = project3DPathArr(axes3D);

    axis.strokePath(projectedAxes[0], { strokeStyle: "black", lineWidth: 2 });   // x-axis
    axis.strokePath(projectedAxes[1], { strokeStyle: "black", lineWidth: 2 }); // y-axis
    axis.strokePath(projectedAxes[2], { strokeStyle: "black", lineWidth: 2 });  // z-axis
}

// ========================================
// Main App
// ========================================

function parametricCurveApp() {
    // Calculate dimensions for two panel layout
    const width = 900;
    const margin = 15;
    const axSize = (width - 4 * margin) / 2;

    const app = new C5({ width: width, height: axSize + 2 * margin });

    const ax1 = app.addAxis();
    ax1.setCrop(margin, margin, margin + axSize, margin + axSize);
    const ax2 = app.addAxis();
    ax2.setCrop(app.width / 2 + margin, margin, app.width - margin, margin + axSize);

    // Set the range for t to (0, 4π)
    app.R = 4 * Math.PI;
    app.N = 201;

    // Use colors from the Tableau palette
    const [b1, b2] = [C5.C[0], C5.C[1]];
    const [c3, c4] = [C5.CS[2], C5.CS[3]];

    // Add control dot (initially at y = 0)
    const A = ax1.addControlDot(0, 0, "A", { fillStyle: c3 });

    // Functions to be applied (maps from R to R^2)
    const circleMap = (t) => [Math.cos(t), Math.sin(t)];
    const circleMapDerivative = (t) => [-Math.sin(t), Math.cos(t)];

    const circleMap2 = (t) => [Math.cos(t + t**2/10), Math.sin(t + t**2/10)];
    const circleMap2Derivative = (t) => [-Math.sin(t + t**2/10) * (1 + t/5), Math.cos(t + t**2/10) * (1 + t/5)];

    const spiralMap = (t) => [t * Math.cos(t)/2, t * Math.sin(t)/2];
    const spiralMapDerivative = (t) => [(Math.cos(t) - t * Math.sin(t))/2, (Math.sin(t) + t * Math.cos(t))/2];

    const lissajousMap = (t) => [Math.sin(2 * t), Math.sin(3 * t)];
    const lissajousMapDerivative = (t) => [2 * Math.cos(2 * t), 3 * Math.cos(3 * t)];

    app.functionName = "circleMap";

    app.funcs = {
        "circleMap": { func: circleMap, derivative: circleMapDerivative, latex: "f(t) = (\\cos(t), \\sin(t))" },
        "circleMap2": { func: circleMap2, derivative: circleMap2Derivative, latex: "f(t) = (\\cos(t + t^2/10), \\sin(t + t^2/10))" },
        "spiralMap": { func: spiralMap, derivative: spiralMapDerivative, latex: "f(t) = (t \\cos(t)/2, t \\sin(t))/2" },
        "lissajousMap": { func: lissajousMap, derivative: lissajousMapDerivative, latex: "f(t) = (\\sin(2t), \\sin(3t))" }
    }

    // Toggle for 3D mode
    app.is3DMode = false;

    app.buttonClicked = function () {
        app.setCaption("Mapping: " + app.katexM(app.funcs[app.functionName].latex));
    }
    app.setCaption("Mapping: " + app.katexM(app.funcs[app.functionName].latex));

    for (const k in app.funcs) {
        app.addHTMLButton(app.katexM(app.funcs[k].latex), (app) => { app.functionName = k });
    }

    // Button to toggle 3D mode
    app.addHTMLButton("Toggle Graph Mode", (app) => {
        app.is3DMode = !app.is3DMode;
    });

    app.draw = function () {
        app.debugInfo("function name", app.functionName);
        app.f = app.funcs[app.functionName].func;
        app.fDerivative = app.funcs[app.functionName].derivative;

        ax1.setLimits(0, app.R, -2, 2); // Left panel: x range (0, 2π), y range (-2, 2)
        // Pin the dot A to y = 0
        A.y = 0;
        A.x = clamp(A.x, 0, app.R);

        ax1.beginClip();

        const tRange = linRange(-app.R/2, app.R, app.N); // t range (0, 4π)
        const horizontalLine = float2DApply(x => [x, 0], tRange); // Pin y to 0

        ax1.axisGrid({ grid: false, tick: false });

        ax1.strokePath(horizontalLine, { strokeStyle: c3, lineWidth: 3 });

        ax1.endClip();

        ax2.beginClip();

        if (app.is3DMode) {
            ax2.setLimits(-2, 4*Math.PI, -4, 4); // Left panel: x range (0, 2π), y range (-2, 2)
            // Draw 3D axes in the right panel
            draw3DAxes(ax2);

            // Map the t range to 3D using f(t)
            const curve3D = float3DApply(app.f, tRange);

            // Project the 3D curve to 2D
            const curveProjected = project3DPath(curve3D);

            // Draw the projected curve
            ax2.strokePath(curveProjected, { strokeStyle: c3, lineWidth: 3 });

            // Plot the image of the dot A in 3D mode
            const A3D = [A.x, ...app.f(A.x)];
            const AProjected = project3DTo2D(...A3D);

            ax2.drawDot(...AProjected, 6, { label: "f(A)", fillStyle: c3 });

            // Draw tangent vector in 3D mode
            const tangent3D = [A.x, ...app.f(A.x)];
            const tangentDerivative3D = app.fDerivative(A.x);
            const tangentEnd3D = [tangent3D[0] + tangentDerivative3D[0], tangent3D[1] + tangentDerivative3D[1], tangent3D[2] + tangentDerivative3D[1]];
            const tangentEndProjected = project3DTo2D(...tangentEnd3D);

            ax2.strokePath([AProjected[0], AProjected[1], tangentEndProjected[0], tangentEndProjected[1]], { strokeStyle: c4, lineWidth: 2 });
            ax2.drawDot(tangentEndProjected[0], tangentEndProjected[1], 6, { fillStyle: c4 });

        } else {
            ax2.setLimits(-4, 4, -4, 4); // Left panel: x range (0, 2π), y range (-2, 2)
            ax2.axisGrid();

            // Map the t range to 2D using f(t)
            const curve2D = float2DApply(app.f, tRange);

            // Draw the mapped curve
            ax2.strokePath(curve2D, { strokeStyle: c3, lineWidth: 3 });

            // Draw the function values as dots on the curve
            const [xA, yA] = app.f(A.x);
            ax2.drawDot(xA, yA, 6, { label: "f(A)", fillStyle: c3 });

            // Draw tangent vector in 2D mode
            const tangentDerivative = app.fDerivative(A.x);
            const tangentEnd = [xA + tangentDerivative[0], yA + tangentDerivative[1]];

            ax2.strokePath([xA, yA, tangentEnd[0], tangentEnd[1]], { strokeStyle: c4, lineWidth: 2 });
            ax2.drawDot(tangentEnd[0], tangentEnd[1], 6, { fillStyle: c4 });
        }

        ax2.endClip();

        this.debugInfo("Dot", [A]);
    }
    return app;
}


parametricCurveApp();
