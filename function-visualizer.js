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

// Function to map 2D grid to 3D using f(x, y)
function map2DTo3D(grid, f) {
    const result = [];
    for (let i = 0; i < grid.length; i++) {
        const path = [];
        for (let j = 0; j < grid[i].length; j += 2) {
            const x = grid[i][j];
            const y = grid[i][j + 1];
            const z = f(x, y); // Apply f(x, y) to get z
            path.push(x, y, z);
        }
        result.push(path);
    }
    return result;
}

// ========================================
// Main App
// ========================================

function scalarMappingApp() {
    // Calculate dimensions for two panel layout
    const width = 900;
    const margin = 15;
    const axSize = (width - 4 * margin) / 2;

    const app = new C5({ width: width, height: axSize + 2 * margin});

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

    // Functions to be applied (maps from R^2 to R)
    const linearMap = (x, y) => x + y;
    const quadraticMap = (x, y) => x * x + y * y;
    const cubicMap = (x, y) => x * x * x + y * y * y;
    const exponentialMap = (x, y) => (Math.exp(x) + Math.exp(y)) / 2; // Updated exponential function

    app.functionName = "linearMap";

    app.funcs = {
        "linearMap": { func: linearMap, latex: "f(x, y) = x + y" },
        "quadraticMap": { func: quadraticMap, latex: "f(x, y) = x^2 + y^2" },
        "cubicMap": { func: cubicMap, latex: "f(x, y) = x^3 + y^3" },
        "exponentialMap": { func: exponentialMap, latex: "f(x, y) = \\dfrac{e^x + e^y}{2}" }
    }

    // Toggle for 3D mode
    app.is3DMode = false;

    app.buttonClicked = function () {
        app.setCaption("Mapping: " + app.katexM(app.funcs[app.functionName].latex));
    }
    app.setCaption("Mapping: " + app.katexM(app.funcs[app.functionName].latex));

    app.addHTMLButton(app.katexM("f(x, y) = x + y"), () => { app.functionName = "linearMap" });
    app.addHTMLButton(app.katexM("f(x, y) = x^2 + y^2"), () => { app.functionName = "quadraticMap" });
    app.addHTMLButton(app.katexM("f(x, y) = x^3 + y^3"), () => { app.functionName = "cubicMap" });
    app.addHTMLButton(app.katexM("f(x, y) = \\dfrac{e^x + e^y}{2}"), () => { app.functionName = "exponentialMap" });

    app.addHTMLButton("Toggle Resolution", (app) => {
        if (app.gN == 15) { app.gN = 31; } else { app.gN = 15; }
    });

    // Button to toggle 3D mode
    app.addHTMLButton("Toggle Graph Mode", (app) => {
        app.is3DMode = !app.is3DMode;
    });

    app.draw = function () {
        app.setAxes(app.R, app.R);

        switch (app.functionName) {
            case "linearMap": app.R = 3; app.f = linearMap; break;
            case "quadraticMap": app.R = 3; app.f = quadraticMap; break;
            case "cubicMap": app.R = 3; app.f = cubicMap; break;
            case "exponentialMap": app.R = 6; app.f = exponentialMap; break;
        }

        ax1.beginClip();

        const xMesh = meshGrid2d([-app.R, -app.R], [0, 2 * app.R], [2 * app.R, 0], app.gN, app.N);
        const yMesh = meshGrid2d([-app.R, -app.R], [2 * app.R, 0], [0, 2 * app.R], app.gN, app.N);
        const hline = linRange2d([-app.R, A.y], [app.R, A.y], app.N);
        const vline = linRange2d([B.x, -app.R], [B.x, app.R], app.N);

        ax1.axisGrid({ grid: false, tick: false });

        ax1.strokePathArr(xMesh, { strokeStyle: b1 });
        ax1.strokePathArr(yMesh, { strokeStyle: b2 });
        ax1.strokePath(hline, { strokeStyle: c3, lineWidth: 3 });
        ax1.strokePath(vline, { strokeStyle: c4, lineWidth: 3 });

        ax1.endClip();

        ax2.beginClip();

        if (app.is3DMode) {
            // Adjust ax2 limits for better visual presentation in 3D mode
			const ax2R = app.R/2;
            ax2.setLimits(-ax2R, ax2R, -ax2R / 2, ax2R);

            // Draw 3D axes in the right panel
            draw3DAxes(ax2);

            // Map the 2D grid to 3D using f(x, y)
            const xMesh3D = map2DTo3D(xMesh, app.f);
            const yMesh3D = map2DTo3D(yMesh, app.f);

            // Project the 3D paths to 2D
            const xMeshProjected = project3DPathArr(xMesh3D);
            const yMeshProjected = project3DPathArr(yMesh3D);

            // Draw the projected grid paths
            ax2.strokePathArr(xMeshProjected, { strokeStyle: b1, alpha: 0.5 });
            ax2.strokePathArr(yMeshProjected, { strokeStyle: b2, alpha: 0.5});

            // Map the horizontal and vertical lines to 3D
            const hline3D = map2DTo3D([hline], app.f)[0];
            const vline3D = map2DTo3D([vline], app.f)[0];

            // Project the lines to 2D
            const hlineProjected = project3DPath(hline3D);
            const vlineProjected = project3DPath(vline3D);

            // Draw the projected lines
            ax2.strokePath(hlineProjected, { strokeStyle: c3, lineWidth: 3 });
            ax2.strokePath(vlineProjected, { strokeStyle: c4, lineWidth: 3 });

            // Plot the images of the dots A and B in 3D mode
            const A3D = [A.x, A.y, app.f(A.x, A.y)];
            const B3D = [B.x, B.y, app.f(B.x, B.y)];

            const AProjected = project3DTo2D(...A3D);
            const BProjected = project3DTo2D(...B3D);

            ax2.drawDot(...AProjected, 6, { label: "f(A)", fillStyle: c3 });
            ax2.drawDot(...BProjected, 6, { label: "f(B)", fillStyle: c4 });
        } else {
            // Map the horizontal and vertical lines to (0, f(x, y))
            const hlineMapped = complexApply((x, y) => [0, app.f(x, y)], hline);
            const vlineMapped = complexApply((x, y) => [0, app.f(x, y)], vline);

            // Draw the mapped lines
            ax2.strokePath(hlineMapped, { strokeStyle: c3, lineWidth: 3 });
            ax2.strokePath(vlineMapped, { strokeStyle: c4, lineWidth: 3 });

            // Draw the function values as dots on the vertical axis
            ax2.drawDot(0, app.f(A.x, A.y), 6, { label: "f(A)", fillStyle: c3 });
            ax2.drawDot(0, app.f(B.x, B.y), 6, { label: "f(B)", fillStyle: c4 });
        }

        ax2.endClip();

        this.debugInfo("Dots", [A, B]);
    }
    return app;
}

scalarMappingApp();
