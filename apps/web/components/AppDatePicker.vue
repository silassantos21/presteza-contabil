<template>
  <div ref="containerRef" class="relative">
    <!-- Trigger -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md bg-background transition-colors text-left focus:outline-none focus:ring-2 focus:ring-ring"
      :class="hasError ? 'border border-destructive' : 'border border-border'"
    >
      <CalendarIcon class="w-4 h-4 text-muted-foreground shrink-0" />
      <span :class="modelValue ? 'text-foreground' : 'text-muted-foreground'">
        {{ displayValue }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 bg-card border border-border rounded-xl shadow-xl p-4 w-72 origin-top-left"
      >
        <!-- Cabeçalho: mês + ano + navegação -->
        <div class="flex items-center justify-between mb-4">
          <button
            type="button"
            @click="prevMonth"
            class="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <span class="text-sm font-semibold capitalize select-none">
            {{ monthYearLabel }}
          </span>
          <button
            type="button"
            @click="nextMonth"
            class="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Cabeçalho dos dias da semana -->
        <div class="grid grid-cols-7 mb-1">
          <span
            v-for="d in dayLabels"
            :key="d"
            class="text-[11px] font-medium text-muted-foreground text-center py-1 select-none"
          >
            {{ d }}
          </span>
        </div>

        <!-- Grade de dias -->
        <div class="grid grid-cols-7 gap-0.5">
          <button
            v-for="(day, i) in calendarDays"
            :key="i"
            type="button"
            :disabled="day.disabled"
            @click="day.date && !day.disabled && selectDay(day.date)"
            class="h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-sm transition-colors select-none"
            :class="dayClass(day)"
          >
            {{ day.day }}
          </button>
        </div>

        <!-- Rodapé: limpar / hoje -->
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <button
            type="button"
            @click="clear"
            class="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar
          </button>
          <button
            type="button"
            @click="selectToday"
            :disabled="isTodayDisabled"
            class="text-xs font-medium transition-colors"
            :class="isTodayDisabled ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:text-primary/80'"
          >
            Hoje
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  min?: string
  max?: string
  hasError?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

// Mês/ano exibido no calendário (inicia no mês da data selecionada ou mês atual)
const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth())

// Sincroniza a view com a data selecionada ao abrir
watch(isOpen, (open) => {
  if (open && props.modelValue) {
    const [y, m] = props.modelValue.split('-').map(Number)
    viewYear.value = y
    viewMonth.value = m - 1
  }
})

// Fecha ao clicar fora
onClickOutside(containerRef, () => { isOpen.value = false })

// ── Labels ────────────────────────────────────────────────────────────────

const dayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const monthYearLabel = computed(() => {
  return new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
})

const displayValue = computed(() => {
  if (!props.modelValue) return 'Selecione uma data'
  const [y, m, d] = props.modelValue.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
})

// ── Geração dos dias do calendário ────────────────────────────────────────

interface CalendarDay {
  day: number
  date: string | null
  currentMonth: boolean
  disabled: boolean
  isToday: boolean
  isSelected: boolean
}

const todayStr = computed(() => {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
})

const calendarDays = computed((): CalendarDay[] => {
  const y = viewYear.value
  const m = viewMonth.value
  const firstWeekday = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const daysInPrevMonth = new Date(y, m, 0).getDate()
  const days: CalendarDay[] = []

  // Dias do mês anterior (padding)
  for (let i = firstWeekday - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, date: null, currentMonth: false, disabled: true, isToday: false, isSelected: false })
  }

  // Dias do mês atual
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const disabled =
      (!!props.min && dateStr < props.min) ||
      (!!props.max && dateStr > props.max)
    days.push({
      day: d,
      date: dateStr,
      currentMonth: true,
      disabled,
      isToday: dateStr === todayStr.value,
      isSelected: dateStr === props.modelValue,
    })
  }

  // Dias do próximo mês (padding até completar 42 células)
  let d = 1
  while (days.length < 42) {
    days.push({ day: d++, date: null, currentMonth: false, disabled: true, isToday: false, isSelected: false })
  }

  return days
})

// ── Navegação ─────────────────────────────────────────────────────────────

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}

function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

// ── Seleção ───────────────────────────────────────────────────────────────

function selectDay(dateStr: string) {
  emit('update:modelValue', dateStr)
  isOpen.value = false
}

function clear() {
  emit('update:modelValue', '')
  isOpen.value = false
}

const isTodayDisabled = computed(() =>
  (!!props.min && todayStr.value < props.min) ||
  (!!props.max && todayStr.value > props.max),
)

function selectToday() {
  if (isTodayDisabled.value) return
  emit('update:modelValue', todayStr.value)
  isOpen.value = false
}

// ── Classes dos dias ─────────────────────────────────────────────────────

function dayClass(day: CalendarDay) {
  if (!day.currentMonth) return 'invisible'
  if (day.isSelected) return 'bg-primary text-primary-foreground font-semibold'
  if (day.disabled) return 'text-muted-foreground/40 cursor-not-allowed'
  if (day.isToday) return 'ring-2 ring-primary text-primary font-semibold hover:bg-accent'
  return 'text-foreground hover:bg-accent cursor-pointer'
}
</script>
