<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />
			<cl-flex1 />
			<cl-search-key :placeholder="$t('搜索名称')" />
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
defineOptions({ name: 'ai-provider' });
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';

const { service } = useCool();
const { t } = useI18n();

const typeOptions = [
	{ label: 'OpenAI', value: 'openai' },
	{ label: 'Claude', value: 'claude' },
	{ label: 'Gemini', value: 'gemini' },
	{ label: 'Qwen', value: 'qwen' },
	{ label: t('其他'), value: 'other' }
];

const statusOptions = [
	{ label: t('禁用'), value: 0 },
	{ label: t('启用'), value: 1 }
];

const Upsert = useUpsert({
	dialog: { width: '780px' },
	props: { labelWidth: '100px' },
	items: [
		{ label: t('服务商名称'), prop: 'name', component: { name: 'el-input' }, required: true },
		{ label: t('服务商类型'), prop: 'type', component: { name: 'el-select', options: typeOptions }, required: true },
		{ label: t('API基础URL'), prop: 'baseUrl', component: { name: 'el-input' } },
		{ label: t('API密钥'), prop: 'apiKey', component: { name: 'el-input', props: { type: 'password', 'show-password': true } } },
		{ label: t('扩展配置'), prop: 'config', component: { name: 'el-input', props: { type: 'textarea', rows: 6 } }, hook: {
			bind(value) { try { return value ? JSON.stringify(value, null, 2) : ''; } catch { return String(value || ''); } },
			submit(value) { try { return value ? JSON.parse(value) : {}; } catch { return value; } }
		}},
		{ label: t('状态'), prop: 'status', component: { name: 'el-radio-group', options: statusOptions } },
		{ label: t('排序'), prop: 'sort', component: { name: 'el-input-number', props: { min: 0 } } },
		{ label: t('备注'), prop: 'remark', component: { name: 'el-input', props: { type: 'textarea', rows: 3 } } }
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection' },
		{ label: t('服务商名称'), prop: 'name', align: 'left', minWidth: 180 },
		{ label: t('服务商类型'), prop: 'type', minWidth: 120, formatter: ({ row }) => typeOptions.find(e => e.value === row.type)?.label || row.type },
		{ label: t('API基础URL'), prop: 'baseUrl', minWidth: 200, showOverflowTooltip: true },
		{ label: t('状态'), prop: 'status', width: 100, formatter: ({ row }) => statusOptions.find(e => e.value === row.status)?.label || row.status },
		{ label: t('排序'), prop: 'sort', width: 80 },
		{ label: t('备注'), prop: 'remark', minWidth: 200, showOverflowTooltip: true },
		{ label: t('创建时间'), prop: 'createTime', sortable: 'custom', minWidth: 170 },
		{ type: 'op', width: 280, buttons: [
			{ label: t('测试连接'), type: 'primary', onClick: ({ row }) => testProvider(row) },
			{ label: t('同步模型'), type: 'success', onClick: ({ row }) => syncModels(row) }
		] }
	]
});

const Crud = useCrud({
	service: service.ai.provider,
	onRefresh(params, { render, next }) {
		next(params).then(res => {
			render(res?.list || []);
		});
	}
});

const testProvider = (row: any) => {
	service.ai.provider.test({ id: row.id }).then((res: any) => {
		if (res.success) {
			ElMessage.success(t('连接测试成功'));
		} else {
			ElMessage.error(`${t('连接测试失败')}: ${res.message}`);
		}
	});
};

const syncModels = (row: any) => {
	service.ai.provider.syncModels({ id: row.id }).then((res: any) => {
		if (res.success) {
			ElMessage.success(t('模型同步成功'));
		} else {
			ElMessage.error(`${t('模型同步失败')}: ${res.message}`);
		}
	});
};
</script>