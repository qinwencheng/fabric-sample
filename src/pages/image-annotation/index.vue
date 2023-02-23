<script setup lang="ts">
import { fabric } from 'fabric'

const imageUrl = 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'
const canvasRef = ref<HTMLCanvasElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
let canvas: fabric.Canvas | null = null

const getImageSizebyUrl = (url: string): Promise<{ instance: HTMLImageElement; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url
    img.onload = () => {
      resolve({
        instance: img,
        width: img.width,
        height: img.height,
      })
    }
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
  })
}

const initCanvas = async () => {
  canvas = new fabric.Canvas(canvasRef.value!, {
  })
  const { instance, width, height } = await getImageSizebyUrl(imageUrl)
  const fabricImage = new fabric.Image(instance, {
    width,
    height,
  })
  canvas.setWidth(width)
  canvas.setHeight(height)
  canvas.setBackgroundImage(fabricImage, canvas.renderAll.bind(canvas), {
  })
  canvas.on('mouse:down', canvasMouseDown) // 鼠标在画布上按下
  canvas.on('mouse:up', canvasMouseUp) // 鼠标在画布上松开
  canvas.on('mouse:wheel', (opt) => {
    const delta = opt.e.deltaY
    let zoom = canvas.getZoom()
    zoom *= 0.999 ** delta
    if (zoom > 20)
      zoom = 20
    if (zoom < 0.01)
      zoom = 0.01
    canvas.setZoom(zoom)
    opt.e.preventDefault()
    opt.e.stopPropagation()
  })
}

// const init = () => {
//   canvas = new fabric.Canvas(canvasRef.value!, {
//     width: 300, // 画布宽度
//     height: 300, // 画布高度
//     backgroundColor: '#eee', // 画布背景色
//   })

//   // 圆形
//   const circle = new fabric.Circle({
//     radius: 30, // 圆的半径
//     top: 20, // 距离容器顶部 20px
//     left: 20, // 距离容器左侧 20px
//     fill: 'pink', // 填充 粉色
//   })

//   const rect = new fabric.Rect({
//     width: 260,
//     height: 270,
//     fill: 'yellow',
//     stroke: 'red',
//     strokeWidth: 1,
//     selectable: true,
//     lockScalingX: false,
//   })

//   canvas.add(circle, rect) // 将圆形添加到 canvas 画布里
// }

onMounted(() => {
  initCanvas()
  // init()
})

let currentType = 'rect' // 当前操作模式（默认 || 创建矩形）

let downPoint: fabric.Point | null = null // 按下鼠标时的坐标
let upPoint: fabric.Point | null = null // 松开鼠标时的坐标

// // 画布操作类型切换
// const typeChange = (opt) => {
//   currentType = opt
//   switch (opt) {
//     case 'default': // 默认框选模式
//       canvas!.selection = true // 允许框选
//       canvas!.selectionColor = 'rgba(100, 100, 255, 0.3)' // 选框填充色：半透明的蓝色
//       canvas!.selectionBorderColor = 'rgba(255, 255, 255, 0.3)' // 选框边框颜色：半透明灰色
//       canvas!.skipTargetFind = false // 允许选中
//       break
//     case 'rect': // 创建矩形模式
//       canvas!.selectionColor = 'transparent' // 选框填充色：透明
//       canvas!.selectionBorderColor = 'rgba(0, 0, 0, 0.2)' // 选框边框颜色：透明度很低的黑色（看上去是灰色）
//       canvas!.skipTargetFind = true // 禁止选中
//       break
//   }
// }

// 创建矩形
function createRect() {
  // 如果点击和松开鼠标，都是在同一个坐标点，不会生成矩形
  if (JSON.stringify(downPoint) === JSON.stringify(upPoint))
    return

  // 创建矩形
  // 矩形参数计算（前面总结的4条公式）
  const top = Math.min(downPoint.y, upPoint.y)
  const left = Math.min(downPoint.x, upPoint.x)
  const width = Math.abs(downPoint.x - upPoint.x)
  const height = Math.abs(downPoint.y - upPoint.y)

  if (width < 10 || height < 10)
    return

  // 矩形对象
  const rect = new fabric.Rect({
    top,
    left,
    width,
    height,
    fill: 'transparent', // 填充色：透明
    stroke: 'red', // 边框颜色：黑色
    strokeWidth: 1, // 边框宽度：1
    selectable: true, // 允许选中
  })

  // 将矩形添加到画布上
  canvas!.add(rect)

  // 创建完矩形，清空 downPoint 和 upPoint。当然，你也可以不做这步。
  downPoint = null
  upPoint = null
}

const canvasMouseDown = (e: fabric.IEvent) => {
  // 如果当前鼠标已经选中了一个已有的元素，不做任何操作
  if (e.target) {
    currentType = 'default'
    return
  }
  // 按下鼠标左键时，将当前坐标 赋值给 downPoint
  currentType = 'rect'
  downPoint = e.absolutePointer
}

const canvasMouseUp = (e: fabric.IEvent) => {
  if (currentType === 'rect') {
    // 松开鼠标左键时，将当前坐标 赋值给 upPoint
    upPoint = e.absolutePointer
    // 调用 创建矩形 的方法
    createRect()
    currentType = 'default'
  }
}
</script>

<template>
  <div>
    <img ref="imageRef" :src="imageUrl" class="hidden">
    <canvas id="c" ref="canvasRef" width="500" height="500" style="border: 1px solid #ccc;" />
  </div>
</template>
