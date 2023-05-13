
var select = "";

function choose(e) {
    select = e.currentTarget.id;
    return select;
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
    if (delete_status == true) {
        delete_status = false;
    }
}


document.addEventListener('keydown', function(event) {

    if (event.keyCode == 27) {
        if (delete_status == true) {
            delete_status = false;
            $(".image img").css({ 'cursor': 'move' });

        }
        // $(".image canvas").css({ 'cursor': "pointer" });
        // document.getElementById('can').style.display = "none";
    }
});

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
            canvas.style.display = "none";
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