<script setup lang="ts" generic="T extends any, O extends any">
defineOptions({
  name: 'IndexPage',
})

const router = useRouter()
const pageList = router.options.routes
  .filter(r => r.path !== '/' && r.path !== ':all(.*)*')

// const pageList =
const go = (path: string) => {
  if (path)
    router.push(path)
}
</script>

<template>
  <div>
    <div i-carbon-campsite text-4xl inline-block />
    <p>
      <a rel="noreferrer" href="https://github.com/antfu/vitesse-lite" target="_blank">
        Vitesse Lite
      </a>
    </p>
    <p>
      <em text-sm op75>Opinionated Vite Starter Template</em>
    </p>

    <div py-4 />

    <div>
      <button
        v-for="page in pageList"
        :key="page.path"
        class="m-3 text-sm btn"
        @click="go(page.path)"
      >
        {{ page.name }}
      </button>
    </div>
  </div>
</template>
