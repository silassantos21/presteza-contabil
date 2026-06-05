<template>
  <Transition name="splash">
    <div
      v-if="show"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none pointer-events-none"
      style="background: linear-gradient(135deg, #60a5fa 0%, #1e40af 100%)"
    >
      <div class="splash-logo">
        <svg viewBox="0 0 397 436" class="w-28 h-32" fill="white">
          <g transform="translate(0,436) scale(0.1,-0.1)" fill="white" stroke="none">
            <path d="M1285 3959 c-184 -10 -301 -62 -418 -189 -67 -72 -98 -125 -134 -226
l-28 -79 0 -835 c0 -827 0 -835 20 -838 21 -3 65 34 427 355 l207 184 3 459 3
458 24 26 24 26 490 0 c528 0 553 -2 657 -55 124 -63 240 -202 282 -338 49
-159 19 -346 -80 -498 -94 -143 -219 -226 -384 -253 -31 -6 -52 -25 -159 -149
-68 -78 -190 -217 -272 -309 -95 -108 -147 -174 -145 -185 3 -17 26 -18 313
-21 182 -2 344 2 393 8 387 51 740 311 923 681 88 179 129 358 129 570 0 497
-267 926 -689 1109 -95 41 -198 71 -316 91 -76 13 -1055 19 -1270 8z"/>
            <path d="M1702 2283 c-25 -5 -33 -12 -608 -560 -210 -200 -385 -370 -388 -379
-8 -20 -8 -958 0 -978 16 -43 57 -17 339 209 154 124 287 235 295 247 11 16
15 63 16 217 0 108 2 206 2 218 2 21 160 213 406 494 134 151 395 437 425 463
29 26 27 54 -5 66 -24 10 -435 12 -482 3z"/>
          </g>
        </svg>
      </div>
      <p class="text-white font-semibold text-lg tracking-widest mt-5 splash-text">
        Presteza Contábil
      </p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const show = ref(false)

onMounted(() => {
  if (sessionStorage.getItem('p_splash')) return
  sessionStorage.setItem('p_splash', '1')
  show.value = true
  setTimeout(() => { show.value = false }, 2000)
})
</script>

<style scoped>
.splash-logo {
  animation: popIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.splash-text {
  animation: fadeUp 0.5s ease 0.25s both;
}
@keyframes popIn {
  from { transform: scale(0.4); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.splash-leave-active { transition: opacity 0.45s ease; }
.splash-leave-to     { opacity: 0; }
</style>
