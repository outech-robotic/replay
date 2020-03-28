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
        let currentFrame = {
            'robots': {
                'ROBOT_A': {
                    "position": {},
                    "angle": 0,
                }
            }
        };
        socket.onmessage = function (event) {
            currentFrame = {'robots': {'ROBOT_A': JSON.parse(event.data)}};
        };
        robot_width = 240;
        robot_height = 380;
        getFrame = function () {
            return currentFrame;
        }
    } else if (replayURL.startsWith("http")) {
        const simulation = await loadReplay(replayURL);

        const initial_configuration = simulation.initial_configuration;
        const size_robot_a = initial_configuration.sizes['ROBOT_A'];
        robot_width = size_robot_a[0];
        robot_height = size_robot_a[1];

        let frames = simulation.frames;
        let start_time = Date.now();
        let replay_cursor = 0;
        getFrame = function () {
            const t = Date.now() - start_time;
            while (replay_cursor + 1 < frames.length && t > frames[replay_cursor + 1].time)
                replay_cursor += 1;
            return frames[replay_cursor];
        };
    }
    else {
        return
    }
    window.requestAnimationFrame(draw);
}

window.addEventListener('load', init);

function draw() {
    const current_frame = getFrame();


    const canvas = document.getElementById('robotField');
    if (!canvas.getContext) {
        return;
    }
    const ctx = canvas.getContext('2d');

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();

    drawBackground(ctx);

    const robot = current_frame.robots['ROBOT_A'];

    drawGrid(ctx, robot.obstacle_grid);

    var x_robot = robot.position.x;
    var y_robot = robot.position.y;
    drawRobot(ctx, x_robot, y_robot, robot.angle);

    var list_obstacles = robot['position_obstacles'];

    for (var obstacle of list_obstacles)  {
        drawObstacle(ctx, obstacle.x, obstacle.y);
    }

    ctx.restore();

    window.requestAnimationFrame(draw);
}

var plateau = new Image();
plateau.src = "plateau.svg";

function drawBackground(ctx) {
    ctx.drawImage(plateau, 0, 0, WIDTH, HEIGHT);
}

function drawGrid(ctx, grid=[]) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    for (var [x,row] of grid.entries()) {
        for (var y = 0; y < row.length; y++) {
            if (row[y] === '1') {
                ctx.fillRect(x * 10, y * 10,  10, 10);
            }
        }
    }
}

function drawRobot(ctx, posX, posY, angle) {
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
    ctx.arc(posX, HEIGHT - posY, 5, 0, 2*Math.PI, true);
    ctx.fillStyle = 'red';
    ctx.fill();

    ctx.strokeStyle = '#300000';
    ctx.stroke();

    ctx.restore();
}




