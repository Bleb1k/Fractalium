import { GPU, IKernelRunShortcut, KernelOutput, Pixel, Texture } from 'gpu.js'

class DrawingApp {
  private gpu: GPU
  private canvas: HTMLCanvasElement

  private fractFn: IKernelRunShortcut
  private redraw: IKernelRunShortcut
  public update: Function

  private pressed: boolean = false
  private lmb: boolean = true
  private clickX: number
  private clickY: number

  private settings = [
    -0.5,
    0,
    2,
    window.innerWidth,
    window.innerHeight,
    Math.random() * 0.01 + 0.995,
    Math.random() * 0.01 + 0.995,
    Math.random() * 0.01 + 0.995,
  ]

  constructor() {
    let body = document.getElementsByTagName('body')[0]
    let canvas = document.createElement('canvas')
    let context = canvas.getContext('webgl2')
    let gpu = new GPU({ canvas, context })

    body.style.margin = '0px'
    body.style.overflow = 'hidden'
    body.appendChild(canvas)

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    this.canvas = canvas
    this.gpu = gpu

    this.createUserEvents()
    this.createGraphics()
  }

  private createFractFn() {
    return this.gpu
      .createKernel(function (data: number[]) {
        let x = data[0]
        let y = data[1]
        let w = data[3]
        let h = data[4]
        let dx = data[2]
        let dy = dx * (h / w)
        let rMult = data[5]
        let gMult = data[6]
        let bMult = data[7]

        let xn = map(this.thread.x, 0, w, x - dx, x + dx)
        let yn = map(this.thread.y, 0, h, y - dy, y + dy)
        let xo = xn
        let yo = yn
        let mo = xo ** 2 + yo ** 2
        let smallest = 2.1
        for (let iter = 150; iter > 0; iter--) {
          let xt = xn * xn - yn * yn + xo
          yn = 2 * xn * yn + yo
          xn = xt
          let m = yn * yn + xn * xn
          if (Math.sqrt(m) < smallest) smallest = Math.sqrt(m)
          if (m > 4) {
            this.color(
              (Math.sin(rMult * iter + 0) + 1) / 2 - m / 64,
              (Math.sin(gMult * iter + 1) + 1) / 2 - m / 64,
              (Math.sin(bMult * iter + 2) + 1) / 2 - m / 64,
              1
            )
            break
          }
          if (iter == 1) {
            this.color(
              1 - Math.sinh(Math.abs(smallest ** 0.5)),
              1 - Math.sinh(Math.abs(smallest ** 0.5)),
              1 - Math.sinh(Math.abs(smallest ** 0.5)),
              1
            )
            // this.color(0.36, 1, 0.33, 1)
            break
          }
        }
      })
      .setDynamicArguments(true)
      .setOptimizeFloatMemory(false)
      .setFunctions([map])
      .setPipeline(true)
      .setOutput([this.canvas.width, this.canvas.height])
      .setDynamicOutput(true)
      .setGraphical(true)
  }

  private createGraphics() {
    this.fractFn = this.createFractFn()
    this.redraw = this.gpu
      .createKernel(function (fract) {
        let px = (fract as Pixel[][])[this.thread.y][this.thread.x]
        this.color(px.r, px.g, px.b, px.a)
      })
      .setDynamicArguments(true)
      .setOutput([this.canvas.width, this.canvas.height])
      .setDynamicOutput(true)
      .setGraphical(true)

    this.update = () => {
      // console.log(this.settings)
      const frRes = this.fractFn(this.settings)
      this.redraw(frRes)
    }
    this.update()
  }

  private createUserEvents() {
    let canvas = this.canvas

    canvas.oncontextmenu = (e) => {
      e.preventDefault()
    }

    canvas.addEventListener('mousedown', this.pressEventHandler)
    canvas.addEventListener('mousemove', this.dragEventHandler)
    canvas.addEventListener('mouseup', this.releaseEventHandler)
    canvas.addEventListener('mouseout', this.cancelEventHandler)

    canvas.addEventListener('touchstart', this.pressEventHandler)
    canvas.addEventListener('touchmove', this.dragEventHandler)
    canvas.addEventListener('touchend', this.releaseEventHandler)
    canvas.addEventListener('touchcancel', this.cancelEventHandler)

    window.addEventListener('resize', this.resizeEventHandler)
    window.addEventListener('waiting', this.focusEventHandler)
  }

  private focusEventHandler = () => {
    // this.redraw()
  }

  private resizeEventHandler = () => {
    this.fractFn.setOutput([window.innerWidth, window.innerHeight])
    this.redraw.setOutput([window.innerWidth, window.innerHeight])
    this.settings[3] = window.innerWidth
    this.settings[4] = window.innerHeight
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    requestAnimationFrame(() => this.update())
  }

  private releaseEventHandler = () => {
    this.pressed = false
  }

  private cancelEventHandler = () => {
    this.pressed = false
  }

  private pressEventHandler = (e: MouseEvent | TouchEvent) => {
    let mouseX = (e as TouchEvent).changedTouches
      ? (e as TouchEvent).changedTouches[0].pageX
      : (e as MouseEvent).pageX
    let mouseY = (e as TouchEvent).changedTouches
      ? (e as TouchEvent).changedTouches[0].pageY
      : (e as MouseEvent).pageY
    let lmb = (e as TouchEvent).changedTouches
      ? true
      : (e as MouseEvent).button == 0
      ? true
      : false

    mouseX -= this.canvas.offsetLeft
    mouseY -= this.canvas.offsetTop

    this.pressed = true
    this.lmb = lmb
    this.clickX = mouseX
    this.clickY = mouseY

    this.holdHandler()
    e.preventDefault()
  }

  private dragEventHandler = (e: MouseEvent | TouchEvent) => {
    let mouseX = (e as TouchEvent).changedTouches
      ? (e as TouchEvent).changedTouches[0].pageX
      : (e as MouseEvent).pageX
    let mouseY = (e as TouchEvent).changedTouches
      ? (e as TouchEvent).changedTouches[0].pageY
      : (e as MouseEvent).pageY
    mouseX -= this.canvas.offsetLeft
    mouseY -= this.canvas.offsetTop

    if (this.pressed) {
      this.clickX = mouseX
      this.clickY = mouseY
    }
    // requestAnimationFrame(this.redraw)
    e.preventDefault()
  }

  private holdHandler() {
    if (this.pressed) requestAnimationFrame(() => this.holdHandler())

    let x = this.settings[0]
    let y = this.settings[1]
    let w = this.settings[3]
    let h = this.settings[4]
    let dx = this.settings[2]
    let dy = dx * (h / w)

    if (this.lmb) {
      this.settings[0] -= map(this.clickX, 0, w, +dx, -dx) * 0.01
      this.settings[1] -= map(this.clickY, 0, h, -dy, +dy) * 0.01
      this.settings[2] *= 0.99
    } else {
      this.settings[0] -= map(this.clickX, 0, w, -dx, +dx) * 0.01
      this.settings[1] -= map(this.clickY, 0, h, +dy, -dy) * 0.01
      this.settings[2] *= 1.01
    }

    requestAnimationFrame(() => this.update())
  }
}

function map(num: number, d1s: number, d1f: number, d2s: number, d2f: number) {
  let d1 = d1f - d1s
  let d2 = d2f - d2s
  let nm = num - d1s
  let foo = nm / d1
  let bar = foo * d2
  return bar + d2s
}

function dist(x: number, y: number) {
  return Math.sqrt(x * x + y * y)
}

const game = new DrawingApp()

// тут был луп, он был медленный
