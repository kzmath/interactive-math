/**
 * @typedef {import('./lib/C5.js').C5} C5
 */

// ========================================
// 3D Visualization Functions (Global Scope)
// ========================================

// Projection matrix for 3D to 2D
const projectionMatrix = [
    [1, -1, 0],  // x' = x - y
    [0, -1/2, 1]   // y' = -y + z
];

// Function to project 3D points to 2D
function project3DTo2D(x, y, z) {
    const x2d = projectionMatrix[0][0] * x + projectionMatrix[0][1] * y + projectionMatrix[0][2] * z;
    const y2d = projectionMatrix[1][0] * x + projectionMatrix[1][1] * y + projectionMatrix[1][2] * z;
    return [x2d, y2d];
}

// Function to project a 3D path to 2D
function project3DPath(path) {
    const projectedPath = [];
    for (let i = 0; i < path.length; i += 3) {
        const [x2d, y2d] = project3DTo2D(path[i], path[i + 1], path[i + 2]);
        projectedPath.push(x2d, y2d);
    }
    return projectedPath;
}

// Function to project a collection of 3D paths to 2D
function project3DPathArr(pathArr) {
    return pathArr.map(path => project3DPath(path));
}

// Function to draw 3D axes in 2D space
function draw3DAxes(axis) {
    const axes3D = [
        [0, 0, 0, 6, 0, 0], // x-axis (length 6)
        [0, 0, 0, 0, 6, 0], // y-axis (length 6)
        [0, 0, 0, 0, 0, 6]  // z-axis (length 6)
    ];

    const projectedAxes = project3DPathArr(axes3D);

    axis.strokePath(projectedAxes[0], { strokeStyle: "black", lineWidth: 2 });   // x-axis
    axis.strokePath(projectedAxes[1], { strokeStyle: "black", lineWidth: 2 }); // y-axis
    axis.strokePath(projectedAxes[2], { strokeStyle: "black", lineWidth: 2 });  // z-axis
}

// Function to apply a 3D function to a 2D path and flatten the array
function apply3DFunctionTo2DPath(path, func) {
    const result = [];
    for (let i = 0; i < path.length; i += 2) {
        const u = path[i];
        const v = path[i + 1];
        const [x, y, z] = func(u, v);
        result.push(x, y, z);
    }
    return result;
}

// ========================================
// Main App
// ========================================

function parametricSurface() {
    // Calculate dimensions for two panel layout
    const width = 900;
    const margin = 15;
    const axSize = (width - 4 * margin) / 2;

    const app = new C5({ width: width, height: axSize + 2 * margin });

    const ax1 = app.addAxis();
    ax1.setCrop(margin, margin, margin + axSize, margin + axSize);
    const ax2 = app.addAxis();
    ax2.setCrop(app.width / 2 + margin, margin, app.width - margin, margin + axSize);

    app.setAxes = function (R1, R2) {
        ax1.setLimits(-R1, R1, -R1, R1);
        ax2.setLimits(-R2, R2, -R2, R2);
    }

    app.R = 3;
    app.gN = 15;
    app.N = 201;

    // Use colors from the Tableau palette
    const [b1, b2] = [C5.C[0], C5.C[1]];
    const [c3, c4] = [C5.CS[2], C5.CS[3]];

    // Add control dots
    const A = ax1.addControlDot(0, 0.5, "A", { fillStyle: c3 });
    const B = ax1.addControlDot(0.5, 0, "B", { fillStyle: c4 });

    // Define the mapping functions
    const cylindricalMapping = (u, v) => {
        const x = u * Math.cos(v);
        const y = u * Math.sin(v);
        const z = u;
        return [x, y, z];
    };

    const sphereMapping = (u, v) => {
        const x = Math.cos(u) * Math.cos(v);
        const y = Math.cos(u) * Math.sin(v);
        const z = Math.sin(u);
        return [x, y, z];
    };

    const hyperboloidMapping = (u, v) => {
        const x = Math.cosh(u) * Math.cos(v);
        const y = Math.cosh(u) * Math.sin(v);
        const z = Math.sinh(u);
        return [x, y, z];
    };

    app.functionName = "cylindricalMapping";

    app.funcs = {
        "cylindricalMapping": { func: cylindricalMapping, latex: "f(u, v) = (u \\cos v, u \\sin v, u)" },
        "sphereMapping": { func: sphereMapping, latex: "f(u, v) = (\\cos u \\cos v, \\cos u \\sin v, \\sin u)" },
        "hyperboloidMapping": { func: hyperboloidMapping, latex: "f(u, v) = (\\cosh u \\cos v, \\cosh u \\sin v, \\sinh u)" }
    }

    app.buttonClicked = function () {
        app.setCaption("Mapping: " + app.katexM(app.funcs[app.functionName].latex));
    }
    app.setCaption("Mapping: " + app.katexM(app.funcs[app.functionName].latex));

    app.addHTMLButton(app.katexM("f(u, v) = (u \\cos v, u \\sin v, u)"), () => { app.functionName = "cylindricalMapping" });
    app.addHTMLButton(app.katexM("f(u, v) = (\\cos u \\cos v, \\cos u \\sin v, \\sin u)"), () => { app.functionName = "sphereMapping" });
    app.addHTMLButton(app.katexM("f(u, v) = (\\cosh u \\cos v, \\cosh u \\sin v, \\sinh u)"), () => { app.functionName = "hyperboloidMapping" });

    app.addHTMLButton("Toggle Resolution", (app) => {
        if (app.gN == 15) { app.gN = 31; } else { app.gN = 15; }
    });

    app.draw = function () {
        app.setAxes(app.R, app.R);

        switch (app.functionName) {
            case "cylindricalMapping": app.R = 3; app.f = cylindricalMapping; break;
            case "sphereMapping": app.R = Math.PI; app.f = sphereMapping; break;
            case "hyperboloidMapping": app.R = 2; app.f = hyperboloidMapping; break; // Adjusted R for hyperboloid
        }

		[A.x, A.y] = [clamp(A.x, ax1.xmin, ax1.xmax), clamp(A.y, ax1.ymin, ax1.ymax)];
		[B.x, B.y] = [clamp(B.x, ax1.xmin, ax1.xmax), clamp(B.y, ax1.ymin, ax1.ymax)];

        ax1.beginClip();

        // Define the range for v as (-pi, pi)
        const xMesh = meshGrid2d([-app.R, -Math.PI], [0, 2 * Math.PI], [2 * app.R, 0], app.gN, app.N);
        const yMesh = meshGrid2d([-app.R, -Math.PI], [2 * app.R, 0], [0, 2 * Math.PI], app.gN, app.N);
        const hline = linRange2d([-app.R, A.y], [app.R, A.y], app.N);
        const vline = linRange2d([B.x, -Math.PI], [B.x, Math.PI], app.N);

        ax1.axisGrid({ grid: false, tick: false });

        ax1.strokePathArr(xMesh, { strokeStyle: b1 });
        ax1.strokePathArr(yMesh, { strokeStyle: b2 });
        ax1.strokePath(hline, { strokeStyle: c3, lineWidth: 3 });
        ax1.strokePath(vline, { strokeStyle: c4, lineWidth: 3 });

        ax1.endClip();

        ax2.beginClip();

        // Draw 3D axes in the right panel
        draw3DAxes(ax2);

        // Map the 2D grid to 3D using the selected mapping function
        const xMesh3D = xMesh.map(path => apply3DFunctionTo2DPath(path, app.f));
        const yMesh3D = yMesh.map(path => apply3DFunctionTo2DPath(path, app.f));

        // Project the 3D paths to 2D
        const xMeshProjected = project3DPathArr(xMesh3D);
        const yMeshProjected = project3DPathArr(yMesh3D);

        // Draw the projected grid paths with alpha: 0.5
        ax2.strokePathArr(xMeshProjected, { strokeStyle: b1, alpha: 0.5 });
        ax2.strokePathArr(yMeshProjected, { strokeStyle: b2, alpha: 0.5 });

        // Map the horizontal and vertical lines to 3D
        const hline3D = apply3DFunctionTo2DPath(hline, app.f);
        const vline3D = apply3DFunctionTo2DPath(vline, app.f);

        // Project the lines to 2D
        const hlineProjected = project3DPath(hline3D);
        const vlineProjected = project3DPath(vline3D);

        // Draw the projected lines
        ax2.strokePath(hlineProjected, { strokeStyle: c3, lineWidth: 3 });
        ax2.strokePath(vlineProjected, { strokeStyle: c4, lineWidth: 3 });

        // Plot the images of the dots A and B
        const A3D = app.f(A.x, A.y);
        const B3D = app.f(B.x, B.y);

        const AProjected = project3DTo2D(...A3D);
        const BProjected = project3DTo2D(...B3D);

        ax2.drawDot(...AProjected, 6, { label: "f(A)", fillStyle: c3 });
        ax2.drawDot(...BProjected, 6, { label: "f(B)", fillStyle: c4 });

        ax2.endClip();

        this.debugInfo("Dots", [A, B]);
    }
    return app;
}

parametricSurface();
