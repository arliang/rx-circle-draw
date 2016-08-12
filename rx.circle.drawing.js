var canvas = document.querySelector('canvas')
var button = document.querySelector('button')
var ctx = canvas.getContext('2d')

var drag = Rx.Observable.fromEvent(canvas, 'mousedown')
var move = Rx.Observable.fromEvent(document, 'mousemove')
var drop = Rx.Observable.fromEvent(canvas, 'mouseup')

var gameStart = () => {
  button.style.display = 'none'

  canvas.width = canvas.width
  canvas.height = canvas.height

  dragging = drag.flatMap(downEvent => {
    return move.filter(moveEvent => {
      return moveEvent.buttons == 1
    }).map(moveEvent => {
      var { offsetX: x, offsetY: y } = moveEvent

      moveEvent.preventDefault()
      return [x, y]
    }).distinctUntilChanged()
  }).takeUntil(drop)

  dragging
    .scan(([x0, y0], [x1, y1]) => {
      drawLine([x0, y0, x1, y1])
      return [
        x1,
        y1
      ]
    }).subscribe(_ => _)

  dragging
    .reduce(([x0, y0, count], [x1, y1]) => {
      return [
        x0 + x1,
        y0 + y1,
        (count || 0) + 1
      ]
    })
    .subscribe(([x, y, count]) => {
      drawDot([x / count, y / count])
    })
}

var drawDot = ([x, y, fillStyle = 'blue']) => {
  ctx.moveTo(x - 1, y - 1)
  ctx.fillStyle = fillStyle
  ctx.fillRect(x - 1, y - 1, 3, 3)
}

var drawLine = ([x0, y0, x1, y1, strokeStyle = 'red']) => {
  console.log([x0, y0, x1, y1, strokeStyle])
  ctx.moveTo(x0, y0)
  ctx.strokeStyle = strokeStyle
  ctx.lineTo(x1, y1)
  ctx.stroke()
}

var finish = () => {
  button.style.display = 'block'
}

drop.subscribe(finish)

Rx.Observable.fromEvent(button, 'click').subscribe(gameStart)
Rx.Observable.fromEvent(window, 'load').subscribe(gameStart)