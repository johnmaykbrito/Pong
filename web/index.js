var ws;
var ws2;
var play;
var room;
var sessionCounter;
var sessionDirection = [0, 0];
var sendCounter = 0;

function onMessage(evt) {

    sessionCounter = evt.data;

    if (evt.data === "2") {
        $('#buttons').hide();
        game();
    }

    var a = sessionDirection[1] = sessionDirection[0];
    var b = sessionDirection[0] = evt.data;
    if (evt.data < "2") {
        $('canvas').hide();
        $('svg').hide();
        $('#buttons').show();
        if (b < a) {
            location.reload();
        }
    }
}

function onOpen() {
    ws.send(room);
}

function run() {
    var wsUri = "ws://" + document.location.host + document.location.pathname + "sessions/" + room;
    ws = new WebSocket(wsUri);
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
}



$(document).ready(function () {
    nop = $('#nop');

    play = $('#play');
    play.click(function () {
        play.attr("disabled", true);
        run();
    });
});


function game() {
    var wsUriGame = "ws://" + document.location.host + document.location.pathname + "game";
    var wsGame = new WebSocket(wsUriGame);
    wsGame.onmessage = onMessageGame;
    wsGame.binaryType = "arraybuffer";

    function onMessageGame(event) {
        drawImageText(event.data);
    }

    function drawImageText(image) {
        var json = JSON.parse(image);
        switch (json.item) {
            case "ball":
                ctx.beginPath();
                ball.x = json.x;
                ball.y = json.y;
                break;
            case "ai":
                ctx.beginPath();
                ai.x = json.x;
                ai.y = json.y;
                break;
            case "player":
            default:
                player.x = json.x;
                player.y = json.y;
                break;
        }
    }

    /**
     * Scoreboard stuff
     *  _   0
     * |_| 123 <= coresponding indexes, ie. for 1 is 
     * |_| 456    bar 3 and 6 visible => 0 001 001
     * 
     */
    var NUMS = [
        "1 101 111",
        "0 001 001",
        "1 011 110",
        "1 011 011",
        "0 111 001",
        "1 110 011",
        "1 110 111",
        "1 001 001",
        "1 111 111",
        "1 111 011"
    ],
            POINTS = [
                [0, 0, 1, 0],
                [0, 0, 0, 1],
                [0, 1, 1, 1],
                [1, 0, 1, 1],
                [0, 1, 0, 2],
                [0, 2, 1, 2],
                [1, 1, 1, 2]
            ];
    // Convert the strings in NUMS to a boolean array
    for (var i = 0; i < NUMS.length; i++) {
        var n = NUMS[i].replace(/\s+/g, "");
        NUMS[i] = (function () {
            var l = [];
            for (var j = 0; j < n.length; j++) {
                l.push(n[j] === "1");
            }
            return l;
        })();
    }
    function pad(str, padding, width) {
        return (new Array(width || 2).join(padding || 0) + str).slice(-width)
    }
    function drawNumber(n, x, y, ralign) {
        n = n.toString(); // convert to string => possible to loop thru all digits
        var size = 32,
                padding = 16;

        ctx.save();
        ctx.strokeStyle = "#fff";
        ctx.lineCap = "square";
        ctx.lineWidth = padding / 2;
        if (ralign) { // if right aligned move x coord accordingly
            x -= (n.length * (padding + size) - padding);
        }
        ctx.translate(x, y);
        for (var i = 0; i < n.length; i++) {
            var num = NUMS[parseInt(n[i])];

            ctx.beginPath();
            for (var j = 0; j < num.length; j++) {
                if (num[j]) {
                    var p = POINTS[j];
                    ctx.moveTo(p[0] * size, p[1] * size);
                    ctx.lineTo(p[2] * size, p[3] * size);
                }
            }
            ctx.closePath();
            ctx.stroke();
            // fix anoying bug
            var p2 = padding / 2,
                    p4 = padding / 4;
            ctx.fillRect(size - p4, 2 * size - p4, p2, p2);
            ctx.translate(size + padding, 0);
        }
        ctx.restore();
        if (player.score === 5) {
            
            setTimeout(win, 200);
            
            function win() {
                alert("Player 1 (Azul) Ganhou");
                location.reload();
            }
        }
        if (ai.score === 5) {
            
            setTimeout(win, 200);
            
            function win() {
                alert("Player 2 (Vermelho) Ganhou");
                location.reload();
            }
        }
    }
    var
            /**
             * Constants
             */
            WIDTH = 700,
            HEIGHT = 600,
            pi = Math.PI,
            wArrow = 87,
            sArrow = 83,
            UpArrow = 38,
            DownArrow = 40,
            /**
             * Game elements
             */
            canvas,
            ctx,
            keystate,
            /**
             * The player paddle
             * 
             * @type {Object}
             */
            player = {
                x: null,
                y: null,
                score: null,
                width: 20,
                height: 100,
                /**
                 * Update the position depending on pressed keys
                 */
                update: function () {
                    if (keystate[wArrow]) {
                        this.y -= 7;
                        var json = JSON.stringify({
                            "item": "player",
                            "x": 20,
                            "y": this.y
                        });

                        wsGame.send(json);

                    }
                    if (keystate[sArrow]) {
                        this.y += 7;
                        var json = JSON.stringify({
                            "item": "player",
                            "x": 20,
                            "y": this.y
                        });

                        wsGame.send(json);

                    }
                    // keep the paddle inside of the canvas
                    this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
                },
                /**
                 * Draw the player paddle to the canvas
                 */
                draw: function () {
                    ctx.fillStyle = "blue";
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                }
            },
            /**
             * The ai paddle
             * 
             * @type {Object}
             */
            ai = {
                x: null,
                y: null,
                score: null,
                width: 20,
                height: 100,
                /**
                 * Update the position depending on the ball position
                 */
                update: function () {
                    if (keystate[UpArrow]) {
                        this.y -= 7;
                        var json = JSON.stringify({
                            "item": "ai",
                            "x": WIDTH - 40,
                            "y": this.y
                        });
                        wsGame.send(json);
                    }
                    if (keystate[DownArrow]) {
                        this.y += 7;
                        var json = JSON.stringify({
                            "item": "ai",
                            "x": WIDTH - 40,
                            "y": this.y
                        });

                        wsGame.send(json);
                    }
                    // keep the paddle inside of the canvas
                    this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
                },
                /**
                 * Draw the ai paddle to the canvas
                 */
                draw: function () {
                    ctx.fillStyle = "red";
                    ctx.fillRect(this.x, this.y, this.width, this.height);
                    ctx.fillStyle = "#fff";
                }
            },
            /**	
             * The ball object
             * 
             * @type {Object}
             */
            ball = {
                x: null,
                y: null,
                vel: null,
                side: 20,
                speed: 12,
                /**
                 * Serves the ball towards the specified side
                 * 
                 * @param  {number} side 1 right
                 *                       -1 left
                 */
                serve: function (side) {
                    // set the x and y position
                    var r = Math.random();
                    this.x = side === 1 ? player.x + player.width : ai.x - this.side;
                    this.y = (HEIGHT - this.side) * r;
                    // calculate out-angle, higher/lower on the y-axis =>
                    // steeper angle
                    var phi = 0.1 * pi * (1 - 2 * r);
                    // set velocity direction and magnitude
                    this.vel = {
                        x: side * this.speed * Math.cos(phi),
                        y: this.speed * Math.sin(phi)
                    }
                },
                /**
                 * Update the ball position and keep it within the canvas
                 */
                update: function () {
                    // update position with current velocity
                    this.x += this.vel.x;
                    this.y += this.vel.y;
                    // check if out of the canvas in the y direction
                    if (0 > this.y || this.y + this.side > HEIGHT) {
                        // calculate and add the right offset, i.e. how far
                        // inside of the canvas the ball is
                        var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y + this.side);
                        this.y += 2 * offset;
                        // mirror the y velocity
                        this.vel.y *= -1;
                    }
                    var json = JSON.stringify({
                        "item": "ball",
                        "x": this.x,
                        "y": this.y
                    });

                    if (sendCounter === 0) {
                        setTimeout(function () {
                            wsGame.send(json);
                            sendCounter++;
                        }, 50);
                    } else {
                        wsGame.send(json);
                    }

                    // helper function to check intesectiont between two
                    // axis aligned bounding boxex (AABB)
                    var AABBIntersect = function (ax, ay, aw, ah, bx, by, bw, bh) {
                        return ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;
                    };
                    // check againts target paddle to check collision in x
                    // direction
                    var pdle = this.vel.x < 0 ? player : ai;
                    if (AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height,
                            this.x, this.y, this.side, this.side)
                            ) {
                        // set the x position and calculate reflection angle
                        this.x = pdle === player ? player.x + player.width : ai.x - this.side;
                        var n = (this.y + this.side - pdle.y) / (pdle.height + this.side);
                        var phi = 0.25 * pi * (2 * n - 1); // pi/4 = 45
                        // calculate smash value and update velocity
                        var smash = Math.abs(phi) > 0.2 * pi ? 1.5 : 1;
                        this.vel.x = smash * (pdle === player ? 1 : -1) * this.speed * Math.cos(phi);
                        this.vel.y = smash * this.speed * Math.sin(phi);
                    }
                    // reset the ball when ball outside of the canvas in the
                    // x direction
                    if (0 > this.x + this.side || this.x > WIDTH) {
                        var isplayer = pdle === player;

                        this.serve(isplayer ? 1 : -1);
                        player.score += isplayer ? 0 : 1;
                        ai.score += isplayer ? 1 : 0;
                    }
                },
                /**
                 * Draw the ball to the canvas
                 */
                draw: function () {
                    ctx.fillRect(this.x, this.y, this.side, this.side);
                }
            };
    /**
     * Starts the game
     */
    function main() {
        // create, initiate and append game canvas
        canvas = document.createElement("canvas");
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.id = "canvas";
        ctx = canvas.getContext("2d");
        document.body.appendChild(canvas);
        keystate = {};
        // keep track of keyboard presses
        document.addEventListener("keydown", function (evt) {
            keystate[evt.keyCode] = true;
        });
        document.addEventListener("keyup", function (evt) {
            delete keystate[evt.keyCode];
        });
        init(); // initiate game objects
        function touchevt(evt) {
            var el = evt.target,
                    oy = 0;
            do {
                oy += el.offsetTop;
            } while (el = el.parentOffset)
            player.y = evt.touches[0].clientY - oy - player.height / 2;
        }
        canvas.addEventListener("touchmove", touchevt);
        canvas.addEventListener("touchstart", touchevt);
        // game loop function
        var loop = function () {
            update();
            draw();
            window.requestAnimationFrame(loop, canvas);
        };
        window.requestAnimationFrame(loop, canvas);
    }
    /**
     * Initatite game objects and set start positions
     */
    function init() {
        player.x = player.width;
        player.y = (HEIGHT - player.height) / 2;
        player.score = 0;
        ai.x = WIDTH - (player.width + ai.width);
        ai.y = (HEIGHT - ai.height) / 2;
        ai.score = 0;
        ball.serve(1);
    }
    /**
     * Update all game objects
     */
    function update() {
        ball.update();
        player.update();
        ai.update();
    }

    /**
     * Clear canvas and draw all game objects and net
     */
    function draw() {
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.save();
        ctx.fillStyle = "#fff";
        ball.draw();
        player.draw();
        ai.draw();
        // draw the net
        var w = 4;
        var x = (WIDTH - w) * 0.5;
        var y = 0;
        var step = HEIGHT / 20; // how many net segments
        while (y < HEIGHT) {
            ctx.fillRect(x, y + step * 0.25, w, step * 0.5);
            y += step;
        }
        // draw the scores
        var w2 = WIDTH / 2;
        drawNumber(pad(player.score), w2 - 20, 20, true);
        drawNumber(pad(ai.score), w2 + 20, 20);
        ctx.restore();
    }
    // start and run the game
    main();
}