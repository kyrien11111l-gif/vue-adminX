<template>
  <el-form
    ref="formRef"
    :model="formModel"
    :label-position="labelPosition"
    :label-width="labelWidth"
    @submit.prevent="submit"
  >
    <el-row class="query-form__row" v-bind="resolvedRowProps">
      <el-col
        v-for="field in visibleFields"
        :key="field.prop"
        :xs="24"
        :sm="12"
        :xl="4"
        v-bind="field.colProps"
      >
        <el-form-item class="query-form__item" :label="field.label" :prop="field.prop" v-bind="field.formItemProps">
          <slot
            v-if="field.type === 'custom'"
            :name="`field-${field.slotName}`"
            :field="field"
            :model="formModel"
          />

          <component
            :is="getFieldComponent(field)"
            v-else
            :model-value="formModel[field.prop]"
            class="w-full"
            v-bind="getFieldProps(field)"
            v-on="getFieldListeners(field)"
          >
            <el-option
              v-for="option in field.type === 'select' ? getOptions(field) : []"
              :key="String(option.value)"
              :label="option.label"
              :value="option.value"
              :disabled="option.disabled"
            />
          </component>

          <div
            v-if="field.type === 'select' && optionStates[field.prop]?.error"
            class="mt-1 text-xs text-[var(--el-color-danger)]"
            role="alert"
          >
            {{ optionStates[field.prop]?.error }}，再次展开可重试
          </div>
        </el-form-item>
      </el-col>

      <el-col
        class="query-form__actions"
        :xs="24"
        :sm="12"
        :xl="6"
        v-bind="actionColProps"
      >
        <div class="flex h-full items-center justify-end gap-2 whitespace-nowrap">
          <slot name="extra-actions" />
          <el-button :icon="RefreshLeft" :disabled="loading" @click="reset">
            {{ resetText }}
          </el-button>
          <el-button native-type="submit" type="primary" :icon="Search" :loading="loading">
            {{ submitText }}
          </el-button>
          <el-button
            v-if="fields.length > collapsedCount"
            link
            type="primary"
            :aria-expanded="isExpanded"
            @click="toggleExpanded"
          >
            <span>{{ isExpanded ? '收起' : '展开' }}</span>
            <el-icon class="ml-1"><ArrowUp v-if="isExpanded" /><ArrowDown v-else /></el-icon>
          </el-button>
        </div>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ArrowDown, ArrowUp, RefreshLeft, Search } from '@element-plus/icons-vue'
import { ElDatePicker, ElInput, ElSelect } from 'element-plus'
import type { Component } from 'vue'
import type { FormInstance, RowProps } from 'element-plus'
import type {
  QueryFormField,
  QueryFormModel,
  QueryFormProps,
  QueryOption,
  QueryFormValue,
  SelectQueryField
} from './types'

interface OptionState {
  loading: boolean
  loaded: boolean
  options: QueryOption[]
  error: string
  pending?: Promise<void>
}

const props = withDefaults(defineProps<QueryFormProps>(), {
  initialValues: () => ({}),
  collapsedCount: 3,
  defaultExpanded: false,
  labelPosition: 'right',
  labelWidth: 'auto',
  loading: false,
  submitText: '查询',
  resetText: '重置',
  rowProps: () => ({}),
  actionColProps: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: QueryFormModel]
  'expanded-change': [value: boolean]
  submit: [value: QueryFormModel]
  reset: [value: QueryFormModel]
  'values-change': [value: QueryFormModel]
  'options-error': [payload: { field: SelectQueryField; error: Error }]
}>()

const formRef = ref<FormInstance>()
const formModel = reactive<QueryFormModel>({ ...props.modelValue })
const isExpanded = ref(props.defaultExpanded)
const optionStates = reactive<Record<string, OptionState>>({})

const visibleFields = computed(() =>
  isExpanded.value ? props.fields : props.fields.slice(0, props.collapsedCount)
)
const resolvedRowProps = computed<Partial<RowProps>>(() => ({
  gutter: 24,
  ...props.rowProps
}))
const fieldComponents = {
  input: ElInput,
  select: ElSelect,
  date: ElDatePicker,
  dateRange: ElDatePicker
} satisfies Record<Exclude<QueryFormField['type'], 'custom'>, Component>

function getFieldComponent(
  field: Exclude<QueryFormField, { type: 'custom' }>
): Component {
  return fieldComponents[field.type]
}

function snapshot(): QueryFormModel {
  return { ...formModel }
}

function replaceModel(value: QueryFormModel) {
  Object.keys(formModel).forEach((key) => delete formModel[key])
  Object.assign(formModel, value)
}

function valuesEqual(left: QueryFormValue, right: QueryFormValue): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) &&
      left.length === right.length && left.every((item, index) => item === right[index])
  }
  return left === right
}

function modelsEqual(left: QueryFormModel, right: QueryFormModel): boolean {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => Object.hasOwn(right, key) && valuesEqual(left[key], right[key]))
}

watch(
  () => props.modelValue,
  (value) => {
    if (!modelsEqual(formModel, value)) replaceModel(value)
  },
  { deep: true }
)

watch(
  formModel,
  () => {
    const value = snapshot()
    if (modelsEqual(value, props.modelValue)) return
    emit('update:modelValue', value)
    emit('values-change', value)
  },
  { deep: true }
)

function getOptions(field: SelectQueryField): QueryOption[] {
  return optionStates[field.prop]?.options ?? field.options ?? []
}

function getFieldProps(field: Exclude<QueryFormField, { type: 'custom' }>) {
  const shared = { clearable: true, ...field.props }
  if (field.type === 'select') {
    return { ...shared, loading: optionStates[field.prop]?.loading ?? field.props?.loading }
  }
  if (field.type === 'date') {
    return { type: 'date', valueFormat: 'YYYY-MM-DD', ...shared }
  }
  if (field.type === 'dateRange') {
    return {
      type: 'daterange',
      valueFormat: 'YYYY-MM-DD',
      rangeSeparator: '至',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      ...shared
    }
  }
  return shared
}

function updateFieldValue(prop: string, value: QueryFormValue) {
  formModel[prop] = value
}

function getFieldListeners(field: Exclude<QueryFormField, { type: 'custom' }>) {
  const updateModelValue = (value: QueryFormValue) => updateFieldValue(field.prop, value)
  if (field.type === 'input') {
    return {
      'update:modelValue': updateModelValue,
      keyup: (event: KeyboardEvent) => {
        if (event.key === 'Enter') void submit()
      }
    }
  }
  if (field.type === 'select') {
    return {
      'update:modelValue': updateModelValue,
      visibleChange: (visible: boolean) => void onSelectVisible(field, visible)
    }
  }
  return { 'update:modelValue': updateModelValue }
}

async function onSelectVisible(field: SelectQueryField, visible: boolean) {
  if (!visible || !field.loadOptions) return
  const state = (optionStates[field.prop] ??= {
    loading: false,
    loaded: false,
    options: field.options ?? [],
    error: ''
  })
  if (state.loaded) return
  if (state.pending) return state.pending

  state.loading = true
  state.error = ''
  state.pending = field
    .loadOptions()
    .then((options) => {
      state.options = options
      state.loaded = true
    })
    .catch((cause: unknown) => {
      const error = cause instanceof Error ? cause : new Error('选项加载失败')
      state.error = error.message
      emit('options-error', { field, error })
    })
    .finally(() => {
      state.loading = false
      state.pending = undefined
    })
  return state.pending
}

function toggleExpanded() {
  const next = !isExpanded.value
  isExpanded.value = next
  emit('expanded-change', next)
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (valid === false) return
  emit('submit', snapshot())
}

function reset() {
  formRef.value?.clearValidate()
  replaceModel({ ...props.initialValues })
  const value = snapshot()
  emit('reset', value)
}

defineExpose({ reset, submit })
</script>

<style scoped lang="scss">
.query-form__row {
  row-gap: 16px;
}

.query-form__item {
  margin-bottom: 0;
}

.query-form__actions {
  margin-inline-start: auto;
}
</style>
