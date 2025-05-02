class Point {
    constructor(x, y, radius="5", color="red"){
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.color = color;
    }
}

class Spline {
    constructor(){
        this.points = [];
        this.maximumNearValue = 25;
        this.path;
        this.catMullRomWeight = 0.5;
    }

    // Add a point only if not too near to others.
    AddPoint(point){
        if (!this.checkPointColision(point)){
            this.points.push(point);
            return true;
        }
        return false;
    }

    // Check for other points near the one being added. Uses just a simple calculation of pitagoros theorem
    checkPointColision(point){
        for(let otherPoint of this.points){
            const dx = point.x - otherPoint.x;
            const dy = point.y - otherPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= this.maximumNearValue){
                return true;
            }
        }
        return false;
    }

    // currently just call catmullrom spline method but maybe in the future it will contain other splines
    generateSplinePath(){
        let length = this.points.length;

        if (length < 2) {
            console.log('At least 2');
            return;
        }
        
        let dxStart = this.points[0].x - this.points[1].x;
        let dyStart = this.points[0].y - this.points[1].y;
        let firstPhantomPoint = new Point(this.points[0].x + dxStart, this.points[0].y + dyStart);

        let len = this.points.length;
        let dxEnd = this.points[len - 1].x - this.points[len - 2].x;
        let dyEnd = this.points[len - 1].y - this.points[len - 2].y;
        let lastPhantomPoint = new Point(this.points[len - 1].x + dxEnd, this.points[len - 1].y + dyEnd);

        
        let copyPoints = this.points.slice();
        copyPoints.unshift(firstPhantomPoint);
        copyPoints.push(lastPhantomPoint);

        return this.CatmullRomSpline(copyPoints);
    }

    // generate a catmull-rom Spline from all the current Points on the canvas
    CatmullRomSpline(copyPoints) {

        let catMullRom = [];

        for (let i = 1; i < copyPoints.length-2; i++) {
            const p1 = copyPoints[i-1];
            const p2 = copyPoints[i];
            const p3 = copyPoints[i+1];
            const p4 = copyPoints[i+2];

            for (let t = 0; t <= 1; t += 0.01) { 
                const t2 = t * t;
                const t3 = t2 * t;
                
                const q1 = -t3 + 2*t2 - t;
                const q2 = 3*t3 - 5*t2 + 2;
                const q3 = -3*t3 + 4*t2 + t;
                const q4 = t3 - t2;
                
                const x = this.catMullRomWeight * (p1.x * q1 + p2.x * q2 + p3.x * q3 + p4.x * q4);
                const y = this.catMullRomWeight * (p1.y * q1 + p2.y * q2 + p3.y * q3 + p4.y * q4);
                
                catMullRom.push(new Point(x,y, 2.5, "green"));
            }
        }
        
        return catMullRom;
    }

}

class DrawOnMe {
    
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = canvas.getContext("2d");
    }

    // Draw point/dot using ARC on specific position on the Canvas
    drawPoint(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    // Draw the spline as a lot of lines (smooth cause there is not a method in JS for Catmull-rom splines/curves)
    drawSpline(curvePoints, color = "green", width = "2"){
        if (curvePoints.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(curvePoints[0].x, curvePoints[0].y);

        for(let i = 1; i < curvePoints.length; i++) {
            this.ctx.lineTo(curvePoints[i].x, curvePoints[i].y)
        }

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
    }
}


function animateDot(controlPoints, path, drawOnMe, speed = 1) {
    let index = 0;

    function frame() {
        drawOnMe.ctx.clearRect(0, 0, drawOnMe.canvas.width, drawOnMe.canvas.height);

        for (let point of controlPoints){
            drawOnMe.drawPoint(point.x, point.y, point.radius, point.color);
        }

        // redesenha a spline
        drawOnMe.drawSpline(path);

        // desenha o ponto animado
        let p = path[index];
        drawOnMe.drawPoint(p.x, p.y, 4, "blue");

        index += speed;
        if (index < path.length) {
            requestAnimationFrame(frame);
        }
    }

    frame();
}

const height = 500;
const width = 500;
const canvas = document.getElementById("draw-on-me");
let drawOnMe = new DrawOnMe(canvas, width, height);
let spline = new Spline();

canvas.addEventListener("click", function(e) {
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    let point = new Point(x, y);
    if (spline.AddPoint(point)){
        drawOnMe.drawPoint(x, y, point.radius, point.color);
    } else {
        console.log("Cannot add to near to other point");
    }

});