<script setup lang="ts">
import { useImageAnnotation } from './useImageAnnotation'

const props = defineProps<{
  url: string
}>()

const canvasRef = ref()
const url = props.url
const currentType = useImageAnnotation(url, canvasRef)
</script>

<template>
  <div>
    <!-- <img ref="imageRef" :src="imageUrl" class="hidden"> -->
    <canvas id="c" ref="canvasRef" width="500" height="500" style="border: 1px solid #ccc;" />
    <div class="toolList">
      <button :disabled="currentType === 'rect'" class="m-3 text-sm btn" @click="() => currentType = 'rect'">
        rect
      </button>
      <button :disabled="currentType === 'default'" class="m-3 text-sm btn" @click="() => currentType = 'default'">
        select
      </button>
    </div>
    {{ currentType }}
  </div>
</template>
