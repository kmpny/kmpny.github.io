//import 'bulma'
import './main.scss';
import p5 from './lib/p5.js';

function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(function () {

    const sketch = (p) => {
        p.setup = () => {
            var canvas = p.createCanvas(48, 48)
            canvas.parent('canvas-wrapper')
            p.noStroke()
            p.noiseDetail(1)
        }
        p.draw = () => {
            p.blendMode(p.NORMAL)
            p.background('white')
            p.blendMode(p.MULTIPLY)
            let time = p.frameCount / 200,
                pos = p.mouseX / 100,
                timeSplit = 0,
                posSplit = 10,
                yK = p.height * p.noise(time, pos, 100) * 1.5,
                v1 = p5.Vector.fromAngle(p.radians(45), p.width * 2),
                v2 = p5.Vector.fromAngle(p.radians(-45), p.width * 2)
            p.drawK(time, pos, 'cyan', yK, v1, v2)
            p.drawK(time + timeSplit, pos + posSplit, 'yellow', yK, v1, v2)
            p.drawK(time + 2 * timeSplit, pos + 2 * posSplit, 'magenta', yK, v1, v2)
        }
        p.drawK = (time, pos, color, yK, v1, v2) => {
            p.fill(color)
            let widthK = p.width * p.noise(time, pos, 0) * 1.5,
                crossPos = p.createVector(widthK, yK),
                armPos = crossPos.copy().add(v1),
                legPos = crossPos.copy().add(v2)
            p.point(crossPos.x, crossPos.y)
            p.rect(0, 0, widthK, p.height)
            p.beginShape()
            p.vertex(armPos.x, armPos.y)
            p.vertex(crossPos.x, crossPos.y)
            p.vertex(legPos.x, legPos.y)
            p.endShape(p.CLOSE)
        }
    }
    let myp5 = new p5(sketch)


})
