<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />
			<cl-flex1 />
			<cl-search-key :placeholder="$t('搜索模型名称')" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
		</cl-row>

		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({ name: 'ai-model' });
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const { service } = useCool();
const { t } = useI18n();

const providerOptions = ref<{ label: string; value: any }[]>([]);
const capabilityOptions = [
	{ label: t('文本生成'), value: 'text-generation' },
	{ label: t('对话聊天'), value: 'chat' },
	{ label: t('图像理解'), value: 'image-understanding' },
	{ label: t('图像生成'), value: 'image-generation' },
	{ label: t('代码生成'), value: 'code-generation' },
	{ label: t('函数调用'), value: 'function-calling' }
];

const statusOptions = [
	{ label: t('禁用'), value: 0 },
	{ label: t('启用'), value: 1 }
];

const Upsert = useUpsert({
	dialog: { width: '880px' },
	props: { labelWidth: '100px' },
	items: [
		{
			label: t('服务商'),
			prop: 'model_providerId',
			component: { name: 'el-select', options: providerOptions },
			required: true
		},
		{
			label: t('模型名称'),
			prop: 'model_name',
			component: { name: 'el-input' },
			required: true
		},
		{
			label: t('模型标识'),
			prop: 'model_modelKey',
			component: { name: 'el-input' },
			required: true
		},
		{
			label: t('模型能力'),
			prop: 'model_capabilities',
			component: {
				name: 'el-select',
				props: { multiple: true, 'collapse-tags': true },
				options: capabilityOptions
			}
		},
		{
			label: t('默认参数'),
			prop: 'model_params',
			component: { name: 'el-input', props: { type: 'textarea', rows: 6 } },
			hook: {
				bind(value) {
					try {
						return value ? JSON.stringify(value, null, 2) : '';
					} catch {
						return String(value || '');
					}
				},
				submit(value) {
					try {
						return value ? JSON.parse(value) : {};
					} catch {
						return value;
					}
				}
			}
		},
		{
			label: t('最大Token数'),
			prop: 'model_maxTokens',
			component: { name: 'el-input-number', props: { min: 1 } }
		},
		{
			label: t('输入成本'),
			prop: 'model_costInput',
			component: { name: 'el-input-number', props: { min: 0, step: 0.000001, precision: 6 } }
		},
		{
			label: t('输出成本'),
			prop: 'model_costOutput',
			component: { name: 'el-input-number', props: { min: 0, step: 0.000001, precision: 6 } }
		},
		{
			label: t('状态'),
			prop: 'model_status',
			component: { name: 'el-radio-group', options: statusOptions }
		},
		{
			label: t('排序'),
			prop: 'model_sort',
			component: { name: 'el-input-number', props: { min: 0 } }
		},
		{
			label: t('备注'),
			prop: 'model_remark',
			component: { name: 'el-input', props: { type: 'textarea', rows: 3 } }
		}
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection' },
		{ label: t('服务商'), prop: 'model_providerId', minWidth: 120 },
		{ label: t('模型名称'), prop: 'model_name', align: 'left', minWidth: 180 },
		{ label: t('模型标识'), prop: 'model_modelKey', minWidth: 180 },
		{
			label: t('能力标签'),
			prop: 'model_capabilities',
			minWidth: 200,
			formatter: (row: any, column: any, cellValue: any, index: number) => {
				return row?.model_capabilities
					? row.model_capabilities
							.map(
								(cap: string) =>
									capabilityOptions.find(e => e.value === cap)?.label || cap
							)
							.join(', ')
					: '';
			}
		},
		{ label: t('最大Token'), prop: 'model_maxTokens', width: 100 },
		{
			label: t('输入成本'),
			prop: 'model_costInput',
			width: 100,
			formatter: (row: any, column: any, cellValue: any, index: number) =>
				row?.model_costInput ? row.model_costInput.toFixed(6) : '0'
		},
		{
			label: t('输出成本'),
			prop: 'model_costOutput',
			width: 100,
			formatter: (row: any, column: any, cellValue: any, index: number) =>
				row?.model_costOutput ? row.model_costOutput.toFixed(6) : '0'
		},
		{
			label: t('状态'),
			prop: 'model_status',
			width: 80,
			formatter: (row: any, column: any, cellValue: any, index: number) =>
				statusOptions.find(e => e.value === row?.model_status)?.label ||
				row?.model_status ||
				'-'
		},
		{ label: t('排序'), prop: 'model_sort', width: 70 },
		{ label: t('创建时间'), prop: 'model_createTime', sortable: 'custom', minWidth: 170 },
		{
			type: 'op',
			width: 200,
			buttons: [
				{
					label: t('测试模型'),
					type: 'primary',
					onClick: (row: any) => testModel(row)
				}
			]
		}
	]
});

const Crud = useCrud({
	service: service.ai.model,
	onRefresh(params, { render, next }) {
		Promise.all([next(params), service.ai.provider.list()]).then(([res, providers]) => {
			const models = res?.list || [];
			const providerMap = {};
			(providers || []).forEach((p: any) => {
				providerMap[p.provider_id] = p.provider_name;
			});

			models.forEach((model: any) => {
				model.providerName = providerMap[model.model_providerId] || '';
			});

			providerOptions.value = (providers || []).map((p: any) => ({
				label: p.provider_name,
				value: p.provider_id
			}));

			render(models);
		});
	}
});

const testModel = (row: any) => {
	service.ai.model.test({ id: row.model_id }).then((res: any) => {
		if (res.success) {
			ElMessage.success(t('模型测试成功'));
		} else {
			ElMessage.error(`${t('模型测试失败')}: ${res.message}`);
		}
	});
};
</script>
