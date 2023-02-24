<script setup lang="ts">
import { useImageAnnotation } from './useImageAnnotation'
const canvasRef = ref()
const url = 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'
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
