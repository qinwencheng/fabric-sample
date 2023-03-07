<script setup lang="ts">
import { useImageAnnotation } from './useImageAnnotation'
import type { OperationType } from './useImageAnnotation'

const props = defineProps<{
  src: string
}>()

const canvasRef = ref<HTMLCanvasElement>()
const url = props.src
const { currentType, rotateCanvas, zoomCanvas } = useImageAnnotation(url, canvasRef)

defineExpose({
  currentType,
  setCurrentType: (val: OperationType) => currentType.value = val,
  rotateCanvas,
  zoomCanvas,
})
</script>

<template>
  <div>
    <canvas id="c" ref="canvasRef" width="500" height="500" style="border: 1px solid #ccc;" />
  </div>
</template>
