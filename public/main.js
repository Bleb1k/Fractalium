"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let cnvMain = document.getElementById('fractal');
let tb = [], ta = [], w = cnvMain.width, h = cnvMain.height, within, offset = 0, len, temp;
resizeWindow();
let ctxMain = cnvMain.getContext("2d");
ctxMain.fillRect(0, 0, w, h);
let pict = ctxMain.createImageData(w, h);
let datMain = ctxMain.getImageData(0, 0, w, h);
let frame = document.getElementById('frame');
let resol = [window.innerWidth / window.innerHeight, window.innerHeight / window.innerWidth];
let dot = { x: -2, y: -2 * resol[0], w: 2, h: 2 * resol[0] };
let fr = { x: 0, y: 0 };
let iterations = 500;
let ok = [true, true];
function map(num, d1s, d1f, d2s, d2f) {
    let d1 = d1f - d1s;
    let d2 = d2f - d2s;
    let nm = num - d1s;
    let foo = nm / d1;
    let bar = foo * d2;
    return bar + d2s;
}
function resizeWindow() {
    cnvMain.width = window.innerWidth;
    cnvMain.height = window.innerHeight;
    w = cnvMain.width;
    h = cnvMain.height;
}
function resizeCanvas(w, h) {
    cnvMain.width = w;
    cnvMain.height = h;
    if (w < window.innerWidth) {
        offset = (window.innerWidth - w) / 2;
    }
}
// function resize(w: number, h: number) {
// }
let find = function (dot, it, w, h, list) {
    for (let iy = 0; iy < h; iy++) {
        for (let ix = 0; ix < w; ix++) {
            let yn = map(iy, 0, h, dot.x, dot.w);
            let xn = map(ix, 0, w, dot.y, dot.h);
            iterate(w, xn, yn, ix, iy, it, list).catch;
        }
    }
};
let iterate = function (w, xn, yn, ix, iy, it, list) {
    return __awaiter(this, void 0, void 0, function* () {
        let yo = yn;
        let xo = xn;
        for (let iter = it; iter > 0; iter--) {
            let xt = (xn * xn) - (yn * yn) + xo;
            yn = (2 * xn * yn) + yo;
            xn = xt;
            let m = (yn * yn) + (xn * xn);
            if (m > 4) {
                list[(iy * w + ix) * 4 + 0] = ((Math.sin((iter + 0) / 10) + 1) * 100);
                list[(iy * w + ix) * 4 + 1] = ((Math.sin((iter + 120) / 9) + 1) * 100);
                list[(iy * w + ix) * 4 + 2] = ((Math.sin((iter + 240) / 8) + 1) * 100);
                list[(iy * w + ix) * 4 + 3] = 255;
                break;
            }
            if (iter == 1) {
                list[(iy * w + ix) * 4 + 0] = 0;
                list[(iy * w + ix) * 4 + 1] = 0;
                list[(iy * w + ix) * 4 + 2] = 0;
                list[(iy * w + ix) * 4 + 3] = 255;
                break;
            }
        }
    });
};
function press(evt) {
    frame.style.border = '1px rgb(255, 240, 243) double';
    frame.style.left = '0px';
    frame.style.top = '0px';
    frame.style.width = '0px';
    frame.style.height = '0px';
    fr.x = evt.offsetX;
    fr.y = evt.offsetY;
    if (evt.path[0] = cnvMain) {
        ok[0] = true;
    }
    within = evt.offsetX < w && evt.offsetY < h;
    if (within) {
        ta = [
            map(evt.offsetY, 0, h, dot.x, dot.w),
            map(evt.offsetX, 0, w, dot.y, dot.h)
        ];
    }
    if (w < window.innerWidth) {
        offset = (window.innerWidth - w) / 2;
    }
}
function unpress(evt) {
    frame.style.left = '0px';
    frame.style.top = '0px';
    frame.style.width = '0px';
    frame.style.height = '0px';
    frame.style.border = '0px white double';
    within = evt.offsetX < w && evt.offsetY < h;
    if (evt.path[0] = cnvMain) {
        ok[1] = true;
    }
    if (within && evt.offsetX < w && evt.offsetY < h) {
        tb = [
            map(evt.offsetY, 0, h, dot.x, dot.w),
            map(evt.offsetX, 0, w, dot.y, dot.h)
        ];
        dot.x = Math.min(ta[0], tb[0]);
        dot.y = Math.min(ta[1], tb[1]);
        dot.w = Math.max(ta[0], tb[0]);
        dot.h = Math.max(ta[1], tb[1]);
        len = ((Math.abs(Math.max(fr.x, evt.offsetX) - Math.min(fr.x, evt.offsetX)) / Math.abs(Math.max(fr.y, evt.offsetY) - Math.min(fr.y, evt.offsetY))));
        w = Math.floor(len * h);
        resizeCanvas(w, h);
    }
    offset = 0;
}
function move(evt) {
    frame.style.left = (Math.min(fr.x, evt.offsetX) + offset) + 'px';
    frame.style.top = Math.min(fr.y, evt.offsetY) + 'px';
    frame.style.width = (Math.max(fr.x, evt.offsetX) - Math.min(fr.x, evt.offsetX)) + 'px';
    frame.style.height = (Math.max(fr.y, evt.offsetY) - Math.min(fr.y, evt.offsetY)) + 'px';
}
function attempt() {
    if (ok[0] && ok[1]) {
        console.log("calculating");
        let list = new Uint8ClampedArray(w * h * 4);
        find(dot, iterations, w, h, list);
        pict = ctxMain.createImageData(w, h);
        console.log(list, pict);
        for (let i = 0; i < list.length; i++) {
            pict.data[i] = list[i];
        }
        ok = [false, false];
    }
}
(function loop() {
    ctxMain.clearRect(0, 0, w, h);
    attempt();
    ctxMain.putImageData(pict, 0, 0);
    requestAnimationFrame(loop);
})();