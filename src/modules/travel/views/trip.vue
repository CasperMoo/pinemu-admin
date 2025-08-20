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
			<cl-pagination />
		</cl-row>

		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({ name: 'travel-trip' });
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { service } = useCool();
const { t } = useI18n();

const statusOptions = [
	{ label: t('计划中'), value: 'planning' },
	{ label: t('已确认'), value: 'confirmed' },
	{ label: t('已完成'), value: 'completed' },
	{ label: t('已取消'), value: 'cancelled' }
];

const Upsert = useUpsert({
	dialog: { width: '680px' },
	props: { labelWidth: '90px' },
	items: [
		{ label: t('名称'), prop: 'name', component: { name: 'el-input' }, required: true },
		{
			label: t('描述'),
			prop: 'description',
			component: { name: 'el-input', props: { type: 'textarea', rows: 4 } }
		},
		{
			label: t('开始日期'),
			prop: 'startDate',
			component: {
				name: 'el-date-picker',
				props: { type: 'date', 'value-format': 'YYYY-MM-DD' }
			},
			required: true
		},
		{
			label: t('结束日期'),
			prop: 'endDate',
			component: {
				name: 'el-date-picker',
				props: { type: 'date', 'value-format': 'YYYY-MM-DD' }
			},
			required: true
		},
		{
			label: t('状态'),
			prop: 'status',
			component: { name: 'el-select', options: statusOptions }
		}
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection' },
		{ label: t('名称'), prop: 'name', align: 'left', minWidth: 180 },
		{ label: t('描述'), prop: 'description', minWidth: 200, showOverflowTooltip: true },
		{ label: t('开始日期'), prop: 'startDate', minWidth: 130 },
		{ label: t('结束日期'), prop: 'endDate', minWidth: 130 },
		{ label: t('天数'), prop: 'totalDays', width: 90 },
		{
			label: t('状态'),
			prop: 'status',
			minWidth: 110,
			formatter: row => statusOptions.find(e => e.value === row.status)?.label || row.status
		},
		{ label: t('创建时间'), prop: 'createTime', sortable: 'custom', minWidth: 170 },
		{ type: 'op', width: 200 }
	]
});

const Crud = useCrud(
	{
		service: service.travel.trip
	},
	app => {
		app.refresh();
	}
);
</script>
