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
            console.log(currentFrame);
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

    var x_robot = robot.position.x;
    var y_robot = robot.position.y;
    drawRobot(ctx, x_robot, y_robot, robot.angle);

    var list_obstacles = robot['position_obstacles'];
    for(let i = 0; i < list_obstacles.length; i++) {
        drawObstacle(ctx, list_obstacles[i][0], list_obstacles[i][1], x_robot, y_robot, robot.angle);
    }

    ctx.restore();

    window.requestAnimationFrame(draw);
}

var plateau = new Image();
plateau.src = "plateau.svg";

function drawBackground(ctx) {
    //plateau.onload = function() {
    ctx.drawImage(plateau, 0, 0, WIDTH, HEIGHT);
    //}

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

function drawObstacle(ctx, posX, posY, robot_x, robot_y, angle) {
    ctx.save();

    ctx.translate(robot_x, HEIGHT - robot_y);
    ctx.rotate(-angle)

    ctx.beginPath();
    ctx.arc(posX, posY, 5, 0, 2*Math.PI, true);
    ctx.fillStyle = 'red';
    ctx.fill();

    ctx.strokeStyle = '#300000';
    ctx.stroke();

    ctx.restore();
}




