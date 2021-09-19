let safe, tb, ta, w, h, within, len, temp
let iterations = 500
let ok = [true, true];
let resol = [window.innerWidth / window.innerHeight, window.innerHeight / window.innerWidth]
let da = [-2, -2 * resol[0]];
let db = [2, 2 * resol[0]];
let frame = document.getElementById('frame')


let cnvMain = document.getElementById('fractal');
resizeWindow()
let ctxMain = cnvMain.getContext("2d");
ctxMain.fillRect(0, 0, w, h);
let pict = ctxMain.createImageData(w, h);
let datMain = ctxMain.getImageData(0, 0, w, h)

function map(num = Number(), d1s = Number(), d1f = Number(), d2s = Number(), d2f = Number()) {
  let d1 = d1f - d1s
  let d2 = d2f - d2s
  let nm = num - d1s
  let foo = nm / d1
  let bar = foo * d2
  return bar + d2s
}


function resizeWindow() {
  cnvMain.width = window.innerWidth;
  cnvMain.height = window.innerHeight;
  w = cnvMain.width
  h = cnvMain.height
}

function resizeCanvas(w, h) {
  cnvMain.width = w
  cnvMain.height = h
}

let find = function(dotA, dotB, it, w, h, list) {
  for (let iy = 0; iy < h; iy++) {
    for (let ix = 0; ix < w; ix++) {
      yn = map(iy, 0, h, dotA[0], dotB[0]);
      xn = map(ix, 0, w, dotA[1], dotB[1]);
      iterate(w, h, xn, yn, ix, iy, it, list);
    }
  }
}

let iterate = async function(w, h, xn, yn, ix, iy, it, list) {
  yo = yn;
  xo = xn;
  for (let iter = it; iter > 0; iter--) {
    let xt = (xn * xn) - (yn * yn) + xo
    yn = (2 * xn * yn) + yo
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
}

function press(evt) {
  frame.style.top = (evt.y + 2) + 'px'
  frame.style.left = (evt.x + 2) + 'px'
  temp = [evt.x, evt.y]
  frame.style.border = '1px rgb(255, 240, 243) double'
  if (evt.path[0] = cnvMain) { ok[0] = true }
  within = evt.x < w && evt.y < h;
  if (within) {
    ta = [
      map(evt.y, 0, h, da[0], db[0]),
      map(evt.x, 0, w, da[1], db[1])
    ]
  }
}

function unpress(evt) {
  frame.style.border = '0px rgb(255, 240, 243) double'
  frame.style.width = '0px';
  frame.style.height = '0px';
  frame.style.top = '0px';
  frame.style.left = '0px';
  if (evt.path[0] = cnvMain) { ok[1] = true }
  within = evt.x < w && evt.y < h;
  if (within && evt.x < w && evt.y < h) {
    tb = [
      map(evt.y, 0, h, da[0], db[0]),
      map(evt.x, 0, w, da[1], db[1])
    ]
    da = [
      Math.min(ta[0], tb[0]),
      Math.min(ta[1], tb[1])
    ]
    db = [
      Math.max(ta[0], tb[0]),
      Math.max(ta[1], tb[1])
    ]
    len = (Math.abs(db[1] - da[1])) / (Math.abs(db[0] - da[0]));
    w = Math.floor(len * h);
    resizeCanvas(w, h);
  }
}

function move(evt) {
  if (ok[0]) {
    frame.style.height = (evt.y - temp[1] - 2) + 'px'
    frame.style.width = (evt.x - temp[0] - 2) + 'px'
  }
}

function attempt() {
  if (ok[0] && ok[1]) {
    console.log("calculating")
    let list = new Uint8ClampedArray(w * h * 4)
    find(da, db, iterations, w, h, list);
    pict = ctxMain.createImageData(w, h)
    console.log(list, pict)
    for (let i = 0; i < list.length; i++) {
      pict.data[i] = list[i]
    }
    ok = [false, false]
  }
}


(function loop() {
  ctxMain.clearRect(0, 0, w, h);

  attempt()

  ctxMain.putImageData(pict, 0, 0);
  requestAnimationFrame(loop);
})();