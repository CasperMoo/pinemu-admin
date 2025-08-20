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
defineOptions({ name: 'travel-item' });
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { service } = useCool();
const { t } = useI18n();

const typeOptions = [
	{ label: t('交通-主'), value: 'major_transport' },
	{ label: t('交通-辅'), value: 'minor_transport' },
	{ label: t('景点'), value: 'attraction' },
	{ label: t('住宿'), value: 'accommodation' },
	{ label: t('餐饮'), value: 'restaurant' },
	{ label: t('其他'), value: 'other' }
];

const statusOptions = [
	{ label: t('待定'), value: 'pending' },
	{ label: t('已确认'), value: 'confirmed' },
	{ label: t('已取消'), value: 'cancelled' }
];

const Upsert = useUpsert({
	dialog: { width: '780px' },
	props: { labelWidth: '100px' },
	items: [
		{
			label: t('行程ID'),
			prop: 'tripId',
			component: { name: 'el-input-number', props: { min: 1 } },
			required: true
		},
		{
			label: t('类型'),
			prop: 'type',
			component: { name: 'el-select', options: typeOptions },
			required: true
		},
		{ label: t('名称'), prop: 'name', component: { name: 'el-input' }, required: true },
		{
			label: t('第几天'),
			prop: 'dayNumber',
			component: { name: 'el-input-number', props: { min: 1 } },
			required: true
		},
		{
			label: t('当天序'),
			prop: 'orderInDay',
			component: { name: 'el-input-number', props: { min: 1 } },
			required: true
		},
		{
			label: t('开始时间'),
			prop: 'startTime',
			component: {
				name: 'el-date-picker',
				props: { type: 'datetime', 'value-format': 'YYYY-MM-DD HH:mm:ss' }
			}
		},
		{
			label: t('结束时间'),
			prop: 'endTime',
			component: {
				name: 'el-date-picker',
				props: { type: 'datetime', 'value-format': 'YYYY-MM-DD HH:mm:ss' }
			}
		},
		{
			label: t('详情JSON'),
			prop: 'details',
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
			label: t('状态'),
			prop: 'status',
			component: { name: 'el-select', options: statusOptions }
		},
		{
			label: t('备注'),
			prop: 'notes',
			component: { name: 'el-input', props: { type: 'textarea', rows: 3 } }
		}
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection' },
		{ label: t('行程ID'), prop: 'tripId', width: 100 },
		{
			label: t('类型'),
			prop: 'type',
			minWidth: 130,
			formatter: row => typeOptions.find(e => e.value === row.type)?.label || row.type
		},
		{ label: t('名称'), prop: 'name', align: 'left', minWidth: 180 },
		{ label: t('第几天'), prop: 'dayNumber', width: 90 },
		{ label: t('当天序'), prop: 'orderInDay', width: 90 },
		{ label: t('开始时间'), prop: 'startTime', minWidth: 170 },
		{ label: t('结束时间'), prop: 'endTime', minWidth: 170 },
		{
			label: t('状态'),
			prop: 'status',
			minWidth: 110,
			formatter: row => statusOptions.find(e => e.value === row.status)?.label || row.status
		},
		{ label: t('备注'), prop: 'notes', minWidth: 200, showOverflowTooltip: true },
		{ label: t('创建时间'), prop: 'createTime', sortable: 'custom', minWidth: 170 },
		{ type: 'op', width: 200 }
	]
});

const Crud = useCrud(
	{
		service: service.travel.item,
		onRefresh(params, { next }) {
			// 若未选择行程，自动尝试使用最近的一个行程ID
			if (!params?.tripId) {
				return service.travel.trip.page({ page: 1, size: 1 }).then(res => {
					const first = res?.list?.[0];
					if (first?.id) {
						return next({ ...params, tripId: first.id });
					}
					return next({ ...params, tripId: -1 }); // 返回空数据
				});
			}

			return next(params);
		}
	},
	app => {
		app.refresh();
	}
);
</script>
