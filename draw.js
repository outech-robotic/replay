"use strict";

const WIDTH = 3000;
const HEIGHT = 2000;

import {loadReplay} from "./util.js";

let frames = null;
let start_time = null;
let replay_cursor = 0;

let robot_width = 0;
let robot_height = 0;

async function init() {
    const params = new URLSearchParams(window.location.search);
    const replayURL = params.get('replay');
    if (!replayURL) {
        return
    }
    const simulation = await loadReplay(replayURL);
    frames = simulation.frames;
    const initial_configuration = simulation.initial_configuration;
    const size_robot_a = initial_configuration.sizes['ROBOT_A'];
    robot_width = size_robot_a[0];
    robot_height = size_robot_a[1];
    start_time = Date.now();
    window.requestAnimationFrame(draw);
}

window.addEventListener('load', init)

function draw() {
    const t = Date.now() - start_time;
    while (replay_cursor + 1 < frames.length && t > frames[replay_cursor + 1].time)
        replay_cursor += 1;


    const current_frame = frames[replay_cursor];


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
    drawRobot(ctx, robot.position.x, robot.position.y, robot.angle);

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




