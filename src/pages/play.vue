<script setup lang="ts">
import { ImageAnnotation } from '~/components/image-annotation/index'
import type { OperationType } from '~/components/image-annotation/index'
// import { ImageAnnotation } from '../../dist/image-annotation'
const imageAnnotationRef = ref<InstanceType<typeof ImageAnnotation> | null>(null)
const currentType = computed(() => imageAnnotationRef.value?.currentType)
const setCurrentType = (val: OperationType) => {
  imageAnnotationRef.value?.setCurrentType(val)
}
const rotateCanvas = (degree: number) => {
  imageAnnotationRef.value?.rotateCanvas(degree)
}
const zoomCanvas = (scale: number) => {
  imageAnnotationRef.value?.zoomCanvas(scale)
}
</script>

<template>
  <div>
    <div class="toolList">
      <button :disabled="currentType === 'rect'" class="m-3 text-sm btn" @click="setCurrentType('rect')">
        rect
      </button>
      <button :disabled="currentType === 'default'" class="m-3 text-sm btn" @click="setCurrentType('default')">
        select
      </button>
      <button class="m-3 text-sm btn" @click="rotateCanvas(-90)">
        &lt;=
      </button>
      <button class="m-3 text-sm btn" @click="rotateCanvas(90)">
        =>
      </button>
      <button class="m-3 text-sm btn" @click="zoomCanvas(-120)">
        +
      </button>
      <button class="m-3 text-sm btn" @click="zoomCanvas(120)">
        -
      </button>
      <br>
      当前状态: {{ currentType }}
    </div>
    <ImageAnnotation ref="imageAnnotationRef" src="https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg" />
  </div>
</template>
