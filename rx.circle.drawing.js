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

var drawCircle = ([x, y, r, strokeStyle = 'pink']) => {
  //开始一个新的绘制路径
  ctx.beginPath();
  //设置弧线的颜色
  ctx.strokeStyle = strokeStyle;
  //沿着坐标点(x, y)为圆心、半径为r的圆的顺时针方向绘制弧线
  ctx.arc(x, y, r, 0, Math.PI / 2, false);    
  //按照指定的路径绘制弧线
  ctx.stroke();
}

var finish = () => {
  button.style.display = 'block'
}

drop.subscribe(finish)

Rx.Observable.fromEvent(button, 'click').subscribe(gameStart)
Rx.Observable.fromEvent(window, 'load').subscribe(gameStart)