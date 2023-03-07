"use strict";

class Color {
    constructor(r, g, b) { this.set(r, g, b); }
    toString() { return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`; }

    set(r, g, b) {
        this.r = this.clamp(r);
        this.g = this.clamp(g);
        this.b = this.clamp(b);
    }

    hueRotate(angle = 0) {
        angle = angle / 180 * Math.PI;
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);

        this.multiply([
            0.213 + cos * 0.787 - sin * 0.213, 0.715 - cos * 0.715 - sin * 0.715, 0.072 - cos * 0.072 + sin * 0.928,
            0.213 - cos * 0.213 + sin * 0.143, 0.715 + cos * 0.285 + sin * 0.140, 0.072 - cos * 0.072 - sin * 0.283,
            0.213 - cos * 0.213 - sin * 0.787, 0.715 - cos * 0.715 + sin * 0.715, 0.072 + cos * 0.928 + sin * 0.072
        ]);
    }

    grayscale(value = 1) {
        this.multiply([
            0.2126 + 0.7874 * (1 - value), 0.7152 - 0.7152 * (1 - value), 0.0722 - 0.0722 * (1 - value),
            0.2126 - 0.2126 * (1 - value), 0.7152 + 0.2848 * (1 - value), 0.0722 - 0.0722 * (1 - value),
            0.2126 - 0.2126 * (1 - value), 0.7152 - 0.7152 * (1 - value), 0.0722 + 0.9278 * (1 - value)
        ]);
    }

    sepia(value = 1) {
        this.multiply([
            0.393 + 0.607 * (1 - value), 0.769 - 0.769 * (1 - value), 0.189 - 0.189 * (1 - value),
            0.349 - 0.349 * (1 - value), 0.686 + 0.314 * (1 - value), 0.168 - 0.168 * (1 - value),
            0.272 - 0.272 * (1 - value), 0.534 - 0.534 * (1 - value), 0.131 + 0.869 * (1 - value)
        ]);
    }

    saturate(value = 1) {
        this.multiply([
            0.213 + 0.787 * value, 0.715 - 0.715 * value, 0.072 - 0.072 * value,
            0.213 - 0.213 * value, 0.715 + 0.285 * value, 0.072 - 0.072 * value,
            0.213 - 0.213 * value, 0.715 - 0.715 * value, 0.072 + 0.928 * value
        ]);
    }

    multiply(matrix) {
        let newR = this.clamp(this.r * matrix[0] + this.g * matrix[1] + this.b * matrix[2]);
        let newG = this.clamp(this.r * matrix[3] + this.g * matrix[4] + this.b * matrix[5]);
        let newB = this.clamp(this.r * matrix[6] + this.g * matrix[7] + this.b * matrix[8]);
        this.r = newR;
        this.g = newG;
        this.b = newB;
    }

    brightness(value = 1) { this.linear(value); }
    contrast(value = 1) { this.linear(value, -(0.5 * value) + 0.5); }

    linear(slope = 1, intercept = 0) {
        this.r = this.clamp(this.r * slope + intercept * 255);
        this.g = this.clamp(this.g * slope + intercept * 255);
        this.b = this.clamp(this.b * slope + intercept * 255);
    }

    invert(value = 1) {
        this.r = this.clamp((value + (this.r / 255) * (1 - 2 * value)) * 255);
        this.g = this.clamp((value + (this.g / 255) * (1 - 2 * value)) * 255);
        this.b = this.clamp((value + (this.b / 255) * (1 - 2 * value)) * 255);
    }

    hsl() { // Code taken from https://stackoverflow.com/a/9493060/2688027, licensed under CC BY-SA.
        let r = this.r / 255;
        let g = this.g / 255;
        let b = this.b / 255;
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return {
            h: h * 100,
            s: s * 100,
            l: l * 100
        };
    }

    clamp(value) {
        if (value > 255) { value = 255; } else if (value < 0) { value = 0; }
        return value;
    }
}

class Solver {
    constructor(target) {
        this.target = target;
        this.targetHSL = target.hsl();
        this.reusedColor = new Color(0, 0, 0); // Object pool
    }

    solve() {
        let result = this.solveNarrow(this.solveWide());
        return {
            values: result.values,
            loss: result.loss,
            filter: this.css(result.values)
        };
    }

    solveWide() {
        const A = 5;
        const c = 15;
        const a = [60, 180, 18000, 600, 1.2, 1.2];

        let best = { loss: Infinity };
        for (let i = 0; best.loss > 25 && i < 3; i++) {
            let initial = [50, 20, 3750, 50, 100, 100];
            let result = this.spsa(A, a, c, initial, 1000);
            if (result.loss < best.loss) { best = result; }
        }
        return best;
    }

    solveNarrow(wide) {
        const A = wide.loss;
        const c = 2;
        const A1 = A + 1;
        const a = [0.25 * A1, 0.25 * A1, A1, 0.25 * A1, 0.2 * A1, 0.2 * A1];
        return this.spsa(A, a, c, wide.values, 500);
    }

    spsa(A, a, c, values, iters) {
        const alpha = 1;
        const gamma = 0.16666666666666666;

        let best = null;
        let bestLoss = Infinity;
        let deltas = new Array(6);
        let highArgs = new Array(6);
        let lowArgs = new Array(6);

        for (let k = 0; k < iters; k++) {
            let ck = c / Math.pow(k + 1, gamma);
            for (let i = 0; i < 6; i++) {
                deltas[i] = Math.random() > 0.5 ? 1 : -1;
                highArgs[i] = values[i] + ck * deltas[i];
                lowArgs[i] = values[i] - ck * deltas[i];
            }

            let lossDiff = this.loss(highArgs) - this.loss(lowArgs);
            for (let i = 0; i < 6; i++) {
                let g = lossDiff / (2 * ck) * deltas[i];
                let ak = a[i] / Math.pow(A + k + 1, alpha);
                values[i] = fix(values[i] - ak * g, i);
            }

            let loss = this.loss(values);
            if (loss < bestLoss) {
                best = values.slice(0);
                bestLoss = loss;
            }
        }
        return { values: best, loss: bestLoss };

        function fix(value, idx) {
            let max = 100;
            if (idx === 2 /* saturate */ ) { max = 7500; } else if (idx === 4 /* brightness */ || idx === 5 /* contrast */ ) { max = 200; }

            if (idx === 3 /* hue-rotate */ ) {
                if (value > max) { value = value % max; } else if (value < 0) { value = max + value % max; }
            } else if (value < 0) { value = 0; } else if (value > max) { value = max; }
            return value;
        }
    }

    loss(filters) { // Argument is array of percentages.
        let color = this.reusedColor;
        color.set(0, 0, 0);

        color.invert(filters[0] / 100);
        color.sepia(filters[1] / 100);
        color.saturate(filters[2] / 100);
        color.hueRotate(filters[3] * 3.6);
        color.brightness(filters[4] / 100);
        color.contrast(filters[5] / 100);

        let colorHSL = color.hsl();
        return Math.abs(color.r - this.target.r) +
            Math.abs(color.g - this.target.g) +
            Math.abs(color.b - this.target.b) +
            Math.abs(colorHSL.h - this.targetHSL.h) +
            Math.abs(colorHSL.s - this.targetHSL.s) +
            Math.abs(colorHSL.l - this.targetHSL.l);
    }

    css(filters) {
        function fmt(idx, multiplier = 1) { return Math.round(filters[idx] * multiplier); }
        return `filter: invert(${fmt(0)}%) sepia(${fmt(1)}%) saturate(${fmt(2)}%) hue-rotate(${fmt(3, 3.6)}deg) brightness(${fmt(4)}%) contrast(${fmt(5)}%);`;
    }
}

var select = "";

function choose(e) {
    select = e.currentTarget.id;
}

let delete_status = false;

function eraser_pointer() {

    if (delete_status == true) {
        delete_status = false;
        $(".image img").css({ 'cursor': 'move' });
        $(".image canvas").css({ 'cursor': "url('./assets/image/pen.png'), auto" });
    } else if (delete_status == false) {
        delete_status = true;
        $(".image img").css({ 'cursor': "url('./assets/image/eraser.cur'), auto" });
        $(".image canvas").css({ 'cursor': "url('./assets/image/eraser.cur'), auto" });

    }
}


function color_pan_position() {
    var drag1 = document.getElementById('drag1');
    document.getElementById('can').style.display = "block";
    var drag1_X = drag1.offsetLeft;
    var drag1_Y = drag1.offsetTop;
    var color_pan = document.getElementById('colorpattern');
    color_pan.style.left = drag1_X - 50 + "px";
    color_pan.style.top = drag1_Y - 100 + "px";
    color_pan.style.visibility = "visible";
    $(".image canvas").css({ 'cursor': "url('./assets/image/pen.png'), auto" });
}



let colorWell;
const defaultColor = "#0000ff";

window.addEventListener("load", startup, false);

function startup() {
    colorWell = document.querySelector("#colorWell");
    colorWell.value = defaultColor;
    colorWell.addEventListener("input", execute, false);

    colorWell.select();
}



function execute() {
    const hexToDecimal = hex => parseInt(hex, 16);
    let hex = $("input.target").val();
    let hex1 = hex.slice(1, 3);
    let hex2 = hex.slice(3, 5);
    let hex3 = hex.slice(5, 7);
    let r = hexToDecimal(hex1);
    let g = hexToDecimal(hex2);
    let b = hexToDecimal(hex3);

    let rgb = [r, g, b];

    if (rgb.length !== 3) { alert("Invalid format!"); return; }

    let color = new Color(rgb[0], rgb[1], rgb[2]);
    let solver = new Solver(color);
    let result = solver.solve();

    let lossMsg;
    if (result.loss < 1) {
        lossMsg = "This is a perfect result.";
    } else if (result.loss < 5) {
        lossMsg = "The is close enough.";
    } else if (result.loss < 15) {
        lossMsg = "The color is somewhat off. Consider running it again.";
    } else {
        lossMsg = "The color is extremely off. Run it again!";
    }

    $(".realPixel").css("background-color", color.toString());
    $(".filterPixel").attr("style", result.filter);
    $(".filterDetail").text(result.filter);
    $(".lossDetail").html(`Loss: ${result.loss.toFixed(1)}. <b>${lossMsg}</b>`);

    const element = document.getElementById(select);
    const left = element.style.left;
    const top = element.style.top;
    const width = element.style.width;
    const height = element.style.height;

    $(".image #" + select).attr("style", result.filter + "position:absolute; z-index:1000;left:" + left + ";top:" + top + ";width:" + width + ";height:" + height + ";");
};

let element11 = "";
let original_height = 0;
let original_width = 0;
let original_x = 0;
let original_y = 0;
let original_mouse_x = 0;
let original_mouse_y = 0;

function resizable() {
    const style = $(".image #" + select).attr("style");
    console.log(select);
    $(".image #" + select).attr("style", style + "border:2px dotted black;");

    $(".context-menu").hide();
    $(".resizer").show();

    let elem = document.getElementById(select);
    element11 = document.getElementById(select);

    let left = document.getElementById(select).style.left;
    let top = document.getElementById(select).style.top;
    let top_left_x = parseFloat(left) - 4;
    let top_left_y = parseFloat(top) - 3;
    let top_right_x = parseFloat(left) + elem.getBoundingClientRect().width - 5;
    let top_right_y = parseFloat(top) - 3;
    let bottom_left_x = parseFloat(left) - 4;
    let bottom_left_y = parseFloat(top) + elem.getBoundingClientRect().height - 5;
    let bottom_right_x = parseFloat(left) + elem.getBoundingClientRect().width - 5;
    let bottom_right_y = parseFloat(top) + elem.getBoundingClientRect().height - 5;

    original_height = element11.getBoundingClientRect().height;
    original_width = element11.getBoundingClientRect().width;
    original_x = element11.getBoundingClientRect().left;
    original_y = element11.getBoundingClientRect().top;

    document.getElementById('top_left').style.left = top_left_x + "px";
    document.getElementById('top_left').style.top = top_left_y + "px";
    document.getElementById('top_right').style.left = top_right_x + "px";
    document.getElementById('top_right').style.top = top_right_y + "px";
    document.getElementById('bottom_left').style.left = bottom_left_x + "px";
    document.getElementById('bottom_left').style.top = bottom_left_y + "px";
    document.getElementById('bottom_right').style.left = bottom_right_x + "px";
    document.getElementById('bottom_right').style.top = bottom_right_y + "px";

    document.getElementById('top_left').style.zIndex = "100000";
    document.getElementById('top_right').style.zIndex = "100000";
    document.getElementById('bottom_left').style.zIndex = "100000";
    document.getElementById('bottom_right').style.zIndex = "100000";


    let b_right = document.getElementById('bottom_right');
    let b_left = document.getElementById('bottom_left');
    let t_right = document.getElementById('top_right');
    let t_left = document.getElementById('top_left');
    b_right.addEventListener('mousedown', function(e) {
        original_mouse_x = e.pageX;
        original_mouse_y = e.pageY;
        document.addEventListener('mousemove', move_b_r);
        document.addEventListener('mouseup', stopResize);
    });
    b_left.addEventListener('mousedown', function(e) {
        original_mouse_x = e.pageX;
        original_mouse_y = e.pageY;
        document.addEventListener('mousemove', move_b_l);
        document.addEventListener('mouseup', stopResize);
    });
    t_right.addEventListener('mousedown', function(e) {
        original_mouse_x = e.pageX;
        original_mouse_y = e.pageY;
        document.addEventListener('mousemove', move_t_r);
        document.addEventListener('mouseup', stopResize);
    });
    t_left.addEventListener('mousedown', function(e) {
        original_mouse_x = e.pageX;
        original_mouse_y = e.pageY;
        document.addEventListener('mousemove', move_t_l);
        document.addEventListener('mouseup', stopResize);
    });
}



const resizers = document.querySelectorAll('.resizer');



function move_b_r(e) {
    console.log(original_height);
    const width = original_width + (e.pageX - original_mouse_x);
    const height = original_height + (e.pageY - original_mouse_y);
    if (width > 95) {
        element11.style.width = width + 'px';
        document.getElementById('top_right').style.left = e.pageX + "px";
        document.getElementById('bottom_left').style.left = e.pageX - width;
        document.getElementById('bottom_right').style.left = e.pageX + "px";

    }
    if (height > 95) {
        element11.style.height = height + 'px';
        document.getElementById('top_right').style.top = e.pageY - height;
        document.getElementById('bottom_left').style.top = e.pageY + "px";
        document.getElementById('bottom_right').style.top = e.pageY + "px";
    }
}

function move_b_l(e) {
    const height = original_height + (e.pageY - original_mouse_y);
    const width = original_width - (e.pageX - original_mouse_x);
    if (width > 95) {
        element11.style.width = width + 'px';
        element11.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
        document.getElementById('top_left').style.left = e.pageX + "px";
        document.getElementById('bottom_right').style.left = e.pageX - width;
        document.getElementById('bottom_left').style.left = e.pageX + "px";
    }
    if (height > 95) {
        element11.style.height = height + 'px';
        document.getElementById('top_left').style.top = e.pageY - height;
        document.getElementById('bottom_right').style.top = e.pageY + "px";
        document.getElementById('bottom_left').style.top = e.pageY + "px";
    }
}

function move_t_r(e) {
    const width = original_width + (e.pageX - original_mouse_x);
    const height = original_height - (e.pageY - original_mouse_y);

    if (width > 95) {
        document.getElementById('bottom_right').style.left = e.pageX + "px";
        document.getElementById('top_left').style.left = e.pageX - width;
        document.getElementById('top_right').style.left = e.pageX + "px";
        element11.style.width = width + 'px';
    }
    if (height > 95) {
        element11.style.height = height + 'px';
        element11.style.top = e.pageY + 'px';

        document.getElementById('bottom_right').style.top = e.pageY + height;
        document.getElementById('top_left').style.top = e.pageY + "px";
        document.getElementById('top_right').style.top = e.pageY + "px";
    }
}


function move_t_l(e) {
    const width = original_width - (e.pageX - original_mouse_x);
    const height = original_height - (e.pageY - original_mouse_y);
    if (width > 95) {
        document.getElementById('bottom_left').style.left = e.pageX + "px";
        document.getElementById('top_right').style.left = e.pageX + width;
        document.getElementById('top_left').style.left = e.pageX + "px";
        element11.style.width = width + 'px';
        element11.style.left = original_x + (e.pageX - original_mouse_x) + 'px';
    }
    if (height > 95) {
        element11.style.height = height + 'px';
        element11.style.top = e.pageY + 'px';
        document.getElementById('bottom_left').style.top = e.pageY + height;
        document.getElementById('top_right').style.top = e.pageY + "px";
        document.getElementById('top_left').style.top = e.pageY + "px";
    }
}

function stopResize() {
    document.removeEventListener('mousemove', move_b_r);
    document.removeEventListener('mousemove', move_b_l);
    document.removeEventListener('mousemove', move_t_r);
    document.removeEventListener('mousemove', move_t_l);
}



function del_elem(e) {
    if (delete_status == true) {
        if (e.currentTarget.id != "can") {
            $("#" + e.currentTarget.id).remove();
        } else if (e.currentTarget.id == "can") {
            canvas = document.getElementById('can');
            ctx = canvas.getContext("2d");
            w = canvas.width;
            h = canvas.height;
            ctx.clearRect(0, 0, w, h);
        }
    }
}

function change_png(obj) {
    var string = select;
    var png_num = string.match(/\d/g);
    png_num = png_num.join("");

    switch (obj.id) {
        case "green":
            $("#" + select).attr('src', './assets/image/' + png_num + '_g.png ');
            break;

        case "red":
            $("#" + select).attr('src', './assets/image/' + png_num + '_r.png ');
            break;

        case "black":
            $("#" + select).attr('src', './assets/image/' + png_num + '.png ');
            break;
    }
}