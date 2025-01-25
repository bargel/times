<script setup>
import { ref, computed, watch } from "vue";
import moment from "moment";

const mainTime = ref(24);
const date = ref(moment().format("YYYY-MM-DD"));
const disFormatted = computed(() => {
  return `<t:${moment(date.value)
    .add(mainTime.value * 30, "minutes")
    .unix()}:f>`;
});
const showCopied = ref(false);

const canadaTime = computed(() => {
  let canadaTime = mainTime.value - 16;

  if (canadaTime < 0) {
    canadaTime = canadaTime + 48;
  }

  return canadaTime;
});

const polandTime = computed(() => {
  let polandTime = parseInt(mainTime.value) + 2;

  if (polandTime > 48) {
    polandTime = polandTime - 48;
  }

  return polandTime;
});

const ukraineTime = computed(() => {
  let ukraineTime = parseInt(mainTime.value) + 4;

  if (ukraineTime > 48) {
    ukraineTime = ukraineTime - 48;
  }

  return ukraineTime;
});

function formatScaleTime(t) {
  if (t === 0 || t === 24) {
    return "12:00AM";
  } else if (t < 12) {
    return `${t}:00AM`;
  } else if (t == 12) {
    return "12:00PM";
  } else {
    return `${t - 12}:00PM`;
  }
}

watch(mainTime, (val) => {
  if (val < 0) {
    mainTime.value = 48 + val;
  }

  if (val > 48) {
    mainTime.value = val - 48;
  }
});

function copy() {
  console.log(event.target.select());
  // textBox.select();
  document.execCommand("copy");
  showCopied.value = true;

  setTimeout(() => {
    showCopied.value = false;
  }, 1000);
}
</script>

<template>
  <div class="center">
    <input type="date" min="2025-01-01" class="date" v-model="date" />
  </div>

  <div class="wrapper">
    <div class="scale">
      <div class="scale-line-flag" v-for="i in 49" :key="i">
        <div
          v-if="
            (mainTime < 47 && mainTime == i - 3) ||
            (mainTime >= 47 && mainTime - 48 == i - 3)
          "
          class="scale-line-flag-time"
        >
          <div>🇵🇱</div>
        </div>

        <div
          v-if="
            (mainTime < 45 && mainTime == i - 5) ||
            (mainTime >= 45 && mainTime - 48 == i - 5)
          "
          class="scale-line-flag-time"
        >
          <div>🇺🇦</div>
        </div>

        <div v-if="parseInt(mainTime) === i - 1" class="scale-line-flag-time">
          <div class="scale-line-date-time">{{ date }}</div>
        </div>

        <div
          v-if="
            (mainTime < 16 && parseInt(mainTime) + 48 == i + 15) ||
            (mainTime >= 16 && mainTime == i + 15)
          "
          class="scale-line-flag-time"
        >
          <div>🇨🇦</div>
        </div>
      </div>
    </div>

    <div class="scale">
      <div class="scale-line" v-for="i in 25" :key="i">
        <div class="scale-line-time">
          {{ i - 1 }}:00
          {{ formatScaleTime(i - 1) }}
        </div>
      </div>
    </div>
    <input type="range" class="main-input" max="48" v-model="mainTime" />
    <input
      type="range"
      class="main-input canada"
      max="48"
      :value="canadaTime"
      @input="mainTime = parseInt($event.target.value) + 16"
    />
    <input
      type="range"
      class="main-input poland"
      max="48"
      :value="polandTime"
      @input="mainTime = parseInt($event.target.value) - 2"
    />
    <input
      type="range"
      class="main-input ukraine"
      max="48"
      :value="ukraineTime"
      @input="mainTime = parseInt($event.target.value) - 4"
    />
  </div>

  <div class="center">
    <input class="dis" type="text" v-model="disFormatted" @click="copy" />
    <Transition name="bounce">
      <div class="copied" v-show="showCopied">Copied!</div>
    </Transition>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
}

.main-input {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

input[type="range"] {
  height: 0px;
  background: rgba(255 255 255 / 0.1);
  border: none;
  -webkit-appearance: none;
}

input[type="range"]:focus::-webkit-slider-runnable-track {
  background: rgba(255 255 255 / 0.1) !important;
}

input[type="range"]::-webkit-slider-runnable-track {
  height: 0px;
  background: rgba(255 255 255 / 0.1);
  border: none;
  -webkit-appearance: none;
}

input[type="range"].canada::-webkit-slider-thumb {
  background-color: rgba(172 9 9);
}

input[type="range"].poland::-webkit-slider-thumb {
  background-color: rgba(200 200 200);
}

input[type="range"].ukraine::-webkit-slider-thumb {
  background-color: rgba(9 68 129);
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  border: none;
  height: 25px;
  width: 20px;
  border-top-left-radius: 100%;
  border-top-right-radius: 100%;
  background-color: rgba(255 255 255 / 0.3);
  cursor: pointer;
  margin-top: 20px;
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]:focus::-webkit-slider-runnable-track {
  background: #ccc;
}

.scale {
  display: flex;
  position: absolute;
  width: 100%;
  height: 20px;
  background-color: rgba(255 255 255 / 0.1);
  top: 5px;
  justify-content: space-between;
  padding: 0 11px;
}

.scale-line {
  font-size: 9px;
  content: "";
  height: 10px;
  width: 1px;
  background-color: rgba(255 255 255 / 0.6);
  position: relative;
}

.scale-line-flag {
  font-size: 9px;
  content: "";
  height: 7px;
  width: 1px;
  background-color: rgba(255 255 255 / 0.2);
  position: relative;
}

.scale-line-time {
  text-align: center;
  position: absolute;
  top: 0;
  left: -50%;
  transform: translate(-50%, -100%);
}

.scale-line-flag-time {
  text-align: center;
  position: absolute;
  font-size: 20px;
  top: 20px;
  width: 1px;
  background-color: white;
  height: 50px;

  & > div:not(.scale-line-date-time) {
    position: absolute;
    bottom: 0;
    left: 5px;
    line-height: 0.8;
  }
}

.date {
  margin-bottom: 40px;
}

.center {
  text-align: center;
}

.scale-line-date-time {
  font-size: 12px;
  text-align: center;
  position: absolute;
  top: 50px;
  width: max-content;
  transform: translateX(-50%);
}

.dis {
  margin-top: 150px;
  width: 120px;
  text-align: center;
  cursor: pointer;
}

.copied {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: translateX(-50%) scale(0);
  }
  50% {
    transform: translateX(-50%) scale(1.25);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}
</style>
