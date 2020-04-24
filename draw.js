"use strict";

const WIDTH = 3000;
const HEIGHT = 2000;

import {loadReplay} from "./util.js";


let robot_width = 0;
let robot_height = 0;

let getFrame = null;

async function init() {
    const params = new URLSearchParams(window.location.search);
    const replayURL = params.get('replay');
    if (!replayURL) {
        return
    }
    if (replayURL.startsWith('ws://')) {
        let socket = new WebSocket(replayURL);
        let position = {
            "x": 0,
            "y": 0,
        }
        let angle = 0;
        socket.onmessage = function (event) {
            let currentFrame = JSON.parse(event.data);
            console.log(currentFrame)
            for(let f of currentFrame) {
                if (f.key === "position") {
                    position = f.value;
                }
                if (f.key === "angle") {
                    angle = f.value;
                }
            }
        };
        robot_width = 240;
        robot_height = 380;
        getFrame = function () {
            return {
                "position": position,
                "angle": angle,
            }
        }
    } else if (replayURL.startsWith("http")) {
        const simulation = await loadReplay(replayURL);

        const config = simulation.events.find(e => e.key == 'configuration').value;
        robot_width = config.robot_length;
        robot_height = config.robot_width;

        let frames = simulation.events;
        let start_time = Date.now();
        let replay_cursor = 0;
        let position = {
            "x": 0,
            "y": 0,
        }
        let angle = 0;
        getFrame = function () {
            const t = Date.now() - start_time;
            while (replay_cursor + 1 < frames.length && t > frames[replay_cursor + 1].time * 1000) {
                let f = frames[replay_cursor];
                if (f.key === "position") {
                    position = f.value;
                }
                if (f.key === "angle") {
                    angle = f.value;
                }
                replay_cursor += 1;
            }
            return {
                "position": position,
                "angle": angle,
            }
        };
    } else {
        return
    }
    window.requestAnimationFrame(draw);
}

window.addEventListener('load', init);

function draw() {
    const robot = getFrame();

    const canvas = document.getElementById('robotField');
    if (!canvas.getContext) {
        return;
    }
    const ctx = canvas.getContext('2d');

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();

    drawBackground(ctx);

    drawGrid(ctx, robot.obstacle_grid);

    drawRobot(ctx, robot.position, robot.angle);

    var list_obstacles = robot['position_obstacles'];

    if (list_obstacles !== undefined) {
        for (var obstacle of list_obstacles) {
            drawObstacle(ctx, obstacle.x, obstacle.y);
        }
    }

    ctx.restore();

    window.requestAnimationFrame(draw);
}

var plateau = new Image();
plateau.src = "plateau.svg";

function drawBackground(ctx) {
    ctx.drawImage(plateau, 0, 0, WIDTH, HEIGHT);
}

function drawGrid(ctx, grid = []) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    for (var [x, row] of grid.entries()) {
        for (var y = 0; y < row.length; y++) {
            if (row[y] === '1') {
                ctx.fillRect(x * 10, HEIGHT - y * 10, 10, 10);
            }
        }
    }
}

function drawRobot(ctx, pos, angle) {
    if (pos === undefined) {
        return
    }
    const posX = pos.x;
    const posY = pos.y;
    ctx.save();

    ctx.translate(posX, HEIGHT - posY);
    ctx.rotate(-angle);

    ctx.fillStyle = '#300000';
    ctx.fillRect(-robot_width / 2, -robot_height / 2, robot_width, robot_height);


    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = "5";
    ctx.rect(-robot_width / 2, -robot_height / 2, robot_width, robot_height);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.fillRect(robot_width / 2 - 60, -25 - 50, 50, 50);
    ctx.fillRect(robot_width / 2 - 60, -25 + 50, 50, 50);

    ctx.restore();
}

function drawObstacle(ctx, posX, posY) {
    ctx.save();

    ctx.beginPath();
    ctx.arc(posX, HEIGHT - posY, 5, 0, 2 * Math.PI, true);
    ctx.fillStyle = 'red';
    ctx.fill();

    ctx.strokeStyle = '#300000';
    ctx.stroke();

    ctx.restore();
}




