<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />
			<cl-flex1 />
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
defineOptions({ name: 'ai-provider' });

import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { service } = useCool();
const { t } = useI18n();

// 最简表格配置
const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '名称', prop: 'provider_name', minWidth: 150 },
		{ label: '类型', prop: 'provider_type', minWidth: 120 },
		{ label: '状态', prop: 'provider_status', minWidth: 100 },
		{ label: '创建时间', prop: 'provider_createTime', minWidth: 170 },
		{ type: 'op' }
	]
});

// 最简表单配置
const Upsert = useUpsert({
	items: [
		{ label: '名称', prop: 'provider_name', component: { name: 'el-input' }, required: true },
		{ label: '类型', prop: 'provider_type', component: { name: 'el-input' } }
	]
});

// CRUD配置 - 按用户页面的方式
const Crud = useCrud(
	{
		service: service.ai.provider
	},
	app => {
		console.log('CRUD app callback triggered');
		app.refresh();
	}
);
</script>
