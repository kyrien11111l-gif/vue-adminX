import type {
  ColProps,
  DatePickerProps,
  FormProps,
  FormItemProps,
  InputProps,
  RowProps,
  SelectProps
} from 'element-plus'

export type QueryFormValue = string | number | boolean | string[] | null | undefined
export type QueryFormModel = Record<string, QueryFormValue>

export interface QueryOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

interface QueryFieldBase {
  prop: string
  label: string
  colProps?: Partial<ColProps>
  formItemProps?: Partial<FormItemProps>
}

export interface InputQueryField extends QueryFieldBase {
  type: 'input'
  props?: Partial<InputProps>
}

export interface SelectQueryField extends QueryFieldBase {
  type: 'select'
  options?: QueryOption[]
  loadOptions?: () => Promise<QueryOption[]>
  props?: Partial<SelectProps>
}

export interface DateQueryField extends QueryFieldBase {
  type: 'date'
  props?: Partial<DatePickerProps>
}

export interface DateRangeQueryField extends QueryFieldBase {
  type: 'dateRange'
  props?: Partial<DatePickerProps>
}

export interface CustomQueryField extends QueryFieldBase {
  type: 'custom'
  slotName: string
}

export type QueryFormField =
  | InputQueryField
  | SelectQueryField
  | DateQueryField
  | DateRangeQueryField
  | CustomQueryField

export interface QueryFormProps {
  fields: QueryFormField[]
  modelValue: QueryFormModel
  initialValues?: QueryFormModel
  collapsedCount?: number
  defaultExpanded?: boolean
  labelPosition?: FormProps['labelPosition']
  labelWidth?: string | number
  loading?: boolean
  submitText?: string
  resetText?: string
  rowProps?: Partial<RowProps>
  actionColProps?: Partial<ColProps>
}
