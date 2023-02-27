<script setup lang="ts">
import { useImageAnnotation } from './useImageAnnotation'
import type { OperationType } from './useImageAnnotation'

const props = defineProps<{
  src: string
}>()

const canvasRef = ref()
const url = props.src
const currentType = useImageAnnotation(url, canvasRef)

defineExpose({
  currentType,
  setCurrentType: (val: OperationType) => currentType.value = val,
})
</script>

<template>
  <div>
    <!-- <img ref="imageRef" :src="imageUrl" class="hidden"> -->
    <canvas id="c" ref="canvasRef" width="500" height="500" style="border: 1px solid #ccc;" />
  </div>
</template>
