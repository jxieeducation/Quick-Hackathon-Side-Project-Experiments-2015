"use strict";

(function() {

    ////////// DISPLAY RELATED //////////
    var c = document.getElementById("c");
    var ctx = c.getContext("2d");

    function resizeCanvas() {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    var ms = 10;
    var originalX = 300;
    var period = 999999;
    var periodCount = 0;
    var periodOutput = document.getElementById("periodOutput");
    ////////// PID //////////
    var x = 300;
    var y = 200;
    var vx = 0;
    var prevVX = 0;
    var vy = 0;

    var setpointX = 200;
    var setpointY = y;
    var prevErrorX = 0;
    var integralX = 0;
    var maxIntegralX = 100;

    var kp = 3.0;
    var ki = 0;
    var kd = 0;

    var history = [];
    var historyTick = 0;

    function pid() {
        var errorX = setpointX - x;
        integralX += errorX;
        integralX = Math.max(Math.min(integralX, maxIntegralX), -maxIntegralX);
        var derivativeX = errorX - prevErrorX;
        prevErrorX = errorX;
        return (kp * errorX + ki * integralX + kd * derivativeX);
    }

    function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

    function update() {
        var a = pid();
        var ax = a;
        var maxA = 2;
        ax = Math.max(Math.min(ax, maxA), -maxA);
        prevVX = vx;
        vx += ax;
        x += vx;
        periodCount += 1;

        if(sign(prevVX) != sign(vx) && ki == 0 && kd == 0){
            period = periodCount;
            periodCount = 0;
            periodOutput.innerHTML = "Period (num updates): " + period.toString();
        }

        if (Math.abs(setpointX - x) > 0.01){
            console.log("Period: " + periodCount.toString());
            console.log("X: " + x.toString());
            console.log("VX: " + vx.toString());
            console.log("AX: " + ax.toString());
            console.log("\n\n");
        }

        if (++historyTick == 5) {
            historyTick = 0;

            if (history.length >= 50) {
                history.shift();
            }
            history.push([x, y])
        }

        ctx.fillStyle = "#E7D492";
        //background
        ctx.fillRect(0, 0, c.width, c.height);

        //circle
        for (var i = 0; i < history.length; ++i) {
            ctx.fillStyle = "rgba(96,185,154,"+(i/history.length)+")";
            ctx.beginPath();
            ctx.arc(history[i][0], history[i][1], 5, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.fill();
        }

        // dash
        ctx.strokeStyle = "#60B99A";
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 14]);
        ctx.beginPath()
        ctx.moveTo(setpointX, setpointY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);

        //ball
        ctx.fillStyle = "#7B5747";
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();

        //markers 
        ctx.fillStyle = "#7B5747";
        ctx.beginPath(); // start
        ctx.arc(originalX, y + 100, 20, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath(); // target
        ctx.arc(setpointX, y + 100, 20, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath(); // end
        ctx.arc(originalX + 2 * (setpointX - originalX), y + 100, 20, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();

        setTimeout(update, ms);
    }

    update(0);

    ////////// FORM //////////
    var msInput = document.getElementById("ms");
    var kpInput = document.getElementById("kp");
    var kiInput = document.getElementById("ki");
    var kdInput = document.getElementById("kd");

    function updateCoefficients() {
        ms = parseFloat(msInput.value);
        kp = parseFloat(kpInput.value);
        ki = parseFloat(kiInput.value);
        kd = parseFloat(kdInput.value);
        x = 300;
        y = 200;
        vx = 0;
        vy = 0;
        setpointX = 200;
        prevErrorX = 0;
        integralX = 0;
        periodCount = 0;
    }

    msInput.addEventListener("blur", updateCoefficients);
    kpInput.addEventListener("blur", updateCoefficients);
    kiInput.addEventListener("blur", updateCoefficients);
    kdInput.addEventListener("blur", updateCoefficients);

    msInput.value = ms;
    kpInput.value = kp;
    kiInput.value = ki;
    kdInput.value = kd;

})();