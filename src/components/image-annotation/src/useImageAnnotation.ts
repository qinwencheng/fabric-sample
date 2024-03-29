import { fabric } from 'fabric'
import type { Ref } from 'vue'

const loadImageByUrl = (url: string): Promise<{ instance: HTMLImageElement; width: number; height: number }> => {
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

export type OperationType = 'default' | 'rect'

export const useImageAnnotation = (imageUrl: string, canvasRef: Ref<HTMLCanvasElement | null>) => {
  let canvas: fabric.Canvas | null = null
  let fabricImage: fabric.Image | null = null

  let downPoint: fabric.Point | null = null // 按下鼠标时的坐标
  let upPoint: fabric.Point | null = null // 松开鼠标时的坐标

  const currentType = ref<OperationType>('default') // 当前操作模式（默认 || 创建矩形）
  watch(currentType, (opt) => {
    switch (opt) {
      case 'default': // 默认框选模式
        canvas!.selection = true // 允许框选
        canvas!.skipTargetFind = false // 允许选中
        break
      case 'rect': // 创建矩形模式）
        canvas!.skipTargetFind = true // 禁止选中
        break
    }
  })

  // 创建矩形
  function createRect() {
    // 如果点击和松开鼠标，都是在同一个坐标点，不会生成矩形
    const isSamePoint = (JSON.stringify(downPoint) === JSON.stringify(upPoint))
    // 如果起点或终点不合法，不会生成矩形
    if (isSamePoint || !downPoint || !upPoint)
      return

    // 创建矩形
    // 计算矩形的 top、left、width、height 覆盖不同画法
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
      strokeUniform: true, // 边框不变形
    })

    // 将矩形添加到画布上
    canvas!.add(rect)

    // 创建完矩形，清空 downPoint 和 upPoint。当然，你也可以不做这步。
    downPoint = null
    upPoint = null
  }

  const canvasMouseDown = (e: fabric.IEvent) => {
    // 鼠标点击创建的起点是否合法
    const isRightPoint = ((e.target === null) || (e.target!.type === 'image'))
    if (isRightPoint && currentType.value === 'rect') {
      // 按下鼠标左键时，将当前坐标 赋值给 downPoint
      downPoint = e.absolutePointer ?? null
    }
    else {
      downPoint = null
    }
  }

  const canvasMouseUp = (e: fabric.IEvent) => {
    // 需要额外判断起点是否成功赋值
    if (currentType.value === 'rect' && downPoint) {
      // 松开鼠标左键时，将当前坐标 赋值给 upPoint
      upPoint = e.absolutePointer ?? null

      // 调用 创建矩形 的方法
      createRect()

      // 每创建一次就切换回默认模式
      currentType.value = 'default'
    }
  }

  const zoomCanvas = (zoomRate: number) => {
    if (canvas === null)
      return

    if (zoomRate === 0)
      canvas?.zoomToPoint(new fabric.Point(canvas.width! / 2, canvas.height! / 2), 1)

    let zoom = canvas.getZoom()
    zoom *= 0.999 ** zoomRate
    if (zoom > 20)
      zoom = 20
    if (zoom < 0.01)
      zoom = 0.01

    canvas?.zoomToPoint(new fabric.Point(canvas.width! / 2, canvas.height! / 2), zoom)
  }

  const canvasMouseWheel = (opt: fabric.IEvent<WheelEvent>) => {
    const delta = opt.e.deltaY
    zoomCanvas(delta)
    opt.e.preventDefault()
    opt.e.stopPropagation()
  }

  const initCanvas = async () => {
    if (canvasRef.value === null)
      throw new Error('canvasRef is null')

    canvas = new fabric.Canvas(canvasRef.value, {})
    const { instance, width, height } = await loadImageByUrl(imageUrl)
    fabricImage = new fabric.Image(instance, {
      width,
      height,
    })

    // 设置画布宽高为全屏
    canvas.setWidth(window.innerWidth ?? 500)
    canvas.setHeight(window.innerHeight ?? 500)

    canvas.add(fabricImage)
    // 初始时图片相对画布垂直居中
    canvas.centerObjectH(fabricImage)
    canvas.centerObjectV(fabricImage)

    // 在图片上新建图形时使得新图形在图片的上层
    canvas.preserveObjectStacking = true
    canvas.on('mouse:down', canvasMouseDown) // 鼠标在画布上按下
    canvas.on('mouse:up', canvasMouseUp) // 鼠标在画布上松开
    canvas.on('mouse:wheel', canvasMouseWheel) // 鼠标滚轮事件
  }

  // 累计旋转的角度
  let totalRotate = 0

  const rotateCanvas = (degrees: number) => {
    if (canvas === null || fabricImage == null)
      return

    totalRotate += degrees
    console.log('totalRotate', totalRotate)
    if (totalRotate >= 360)
      totalRotate -= 360

    if (totalRotate <= -360)
      totalRotate += 360

    console.log('totalRotate', totalRotate)

    if (degrees === 0)
      degrees = -1 * totalRotate

    // 阻止多激活状态下的旋转会导致中心点偏移的bug
    canvas?.setActiveObject(fabricImage)

    // 找到旋转的中心点，这里以图片作为中心点
    const { x, y } = fabricImage.getCenterPoint()
    // 旋转中心点
    const imageCenter = new fabric.Point(x, y)
    // 将角度转换为弧度
    const radians = fabric.util.degreesToRadians(degrees)

    // 遍历每个对象让他们都旋转 degrees 度
    canvas.getObjects().forEach((obj) => {
      // 跳过没有angle的obj
      if (obj.angle === undefined)
        return

      // 元素左上角的点
      const objectOriginPoint = new fabric.Point(obj.left ?? 0, obj.top ?? 0)

      // 把左上角的点绕着图片中心点旋转指定度数后得到的新点
      const rotatedPoint = fabric.util.rotatePoint(objectOriginPoint, imageCenter, radians)

      obj.top = rotatedPoint.y
      obj.left = rotatedPoint.x
      obj.angle += degrees

      // 重新计算obj的坐标
      obj.setCoords()
    })

    canvas.renderAll()
  }

  const resetOperation = () => {
    zoomCanvas(0)
    rotateCanvas(0)
    totalRotate = 0
  }

  onMounted(() => {
    initCanvas()
  })

  return { currentType, rotateCanvas, zoomCanvas, resetOperation }
}
