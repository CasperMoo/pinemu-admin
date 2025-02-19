import { useCrud, useForm } from '@cool-vue/crud';
import { isEmpty, isString } from 'lodash-es';
import { computed, defineComponent, type PropType, type Ref, toValue, useModel } from 'vue';
import { parsePx } from '/@/cool/utils';
import { useI18n } from 'vue-i18n';
import { useCool } from '/@/cool';
import { CrudProps } from '../../comm';

export default defineComponent({
	name: 'cl-select',

	props: {
		...CrudProps,
		modelValue: [String, Number, Array],
		options: {
			type: [Array, Object] as PropType<any[] | Ref<any[]>>,
			default: () => []
		},
		prop: String,
		labelKey: {
			type: String,
			default: 'label'
		},
		valueKey: {
			type: String,
			default: 'value'
		},
		width: [String, Number],
		// 是否树形
		tree: Boolean,
		// 是否返回选中层级下的所有值
		allLevelsId: Boolean,
		// 是否父子不互相关联
		checkStrictly: Boolean,
		// 值变化刷新
		refreshOnChange: {
			type: Boolean,
			default: true
		}
	},

	emits: ['update:modelValue', 'change'],

	setup(props, { emit, expose }) {
		const { refs, setRefs } = useCool();
		const { t } = useI18n();

		// cl-crud
		const Crud = useCrud();

		// cl-form
		const Form = useForm();

		// 是否用于搜索
		const isSearch = computed(() => !Form.value || Form.value?.name === 'search');

		// 选中值
		const value = useModel(props, 'modelValue');

		// 列表
		const list = computed(() => toValue(props.options) || []);

		// 获取值
		function getValue(val: any): any | any[] {
			if (props.allLevelsId) {
				const ids: any[] = [];

				// 获取所有的值
				const deep = (arr: Dict.Item[], f: boolean) => {
					arr.forEach(e => {
						const f2 = e[props.valueKey] == val;

						if (f || f2) {
							ids.push(e[props.valueKey]);
						}

						if (e.children) {
							deep(e.children, f || f2);
						}
					});
				};

				deep(list.value, false);

				return isEmpty(ids) ? undefined : ids;
			} else {
				return val === '' ? undefined : val;
			}
		}

		// 值改变
		function onChange(val: any) {
			const v = getValue(val);

			emit('update:modelValue', v);
			emit('change', v);

			if (isSearch.value) {
				if (props.prop && props.refreshOnChange) {
					Crud.value?.refresh({ page: 1, [props.prop]: v });
				}
			}
		}

		// 聚焦
		function focus() {
			refs.select?.focus();
			refs.select?.$.proxy.$el?.querySelector('.el-select__wrapper')?.click();
		}

		expose({
			focus
		});

		return () => {
			// 样式
			const style = {
				width: parsePx(props.width!)
			};

			// 占位符
			const placeholder = isSearch.value ? t('全部') : t('请选择');

			// 树形下拉框
			const TreeSelect = (
				<el-tree-select
					v-model={value.value}
					clearable
					filterable
					placeholder={placeholder}
					data={list.value}
					checkStrictly={props.allLevelsId || props.checkStrictly}
					props={{
						label: props.labelKey,
						value: props.valueKey
					}}
					style={style}
					onChange={onChange}
					ref={setRefs('select')}
				/>
			);

			// 普通下拉框
			const Select = (
				<el-select
					v-model={value.value}
					clearable
					filterable
					placeholder={placeholder}
					style={style}
					onChange={onChange}
					ref={setRefs('select')}
				>
					{list.value?.map(e => {
						return isString(e) ? (
							<el-option label={e} value={e} />
						) : (
							<el-option
								disabled={e.disabled}
								label={e[props.labelKey]}
								value={e[props.valueKey]}
							/>
						);
					})}
				</el-select>
			);

			return props.tree ? TreeSelect : Select;
		};
	}
});
