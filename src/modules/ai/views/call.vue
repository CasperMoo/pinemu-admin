<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-multi-delete-btn />
			<cl-flex1 />
			<el-button type="primary" @click="openInvokeDialog">{{ $t('调用AI模型') }}</el-button>
			<el-button type="success" @click="testAllModels">{{ $t('测试所有模型') }}</el-button>
			<cl-search-key :placeholder="$t('搜索请求内容')" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
		</cl-row>

		<cl-upsert ref="Upsert" />
		
		<!-- AI调用对话框 -->
		<el-dialog v-model="invokeDialog" :title="$t('调用AI模型')" width="900px">
			<el-form :model="invokeForm" label-width="100px">
				<el-form-item :label="$t('选择模型')" required>
					<el-select v-model="invokeForm.modelId" :placeholder="$t('请选择模型')" style="width: 100%">
						<el-option v-for="model in availableModels" :key="model.id" :label="`${model.providerName} - ${model.name}`" :value="model.id" />
					</el-select>
				</el-form-item>
				<el-form-item :label="$t('请求内容')" required>
					<el-input v-model="invokeForm.prompt" type="textarea" :rows="8" :placeholder="$t('请输入要发送给AI的内容')" />
				</el-form-item>
				<el-form-item :label="$t('参数配置')">
					<el-input v-model="invokeForm.params" type="textarea" :rows="4" :placeholder="$t('可选的JSON参数配置')" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="invokeDialog = false">{{ $t('取消') }}</el-button>
				<el-button type="primary" @click="invokeAI" :loading="invoking">{{ $t('发送') }}</el-button>
			</template>
		</el-dialog>
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({ name: 'ai-call' });
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const { service } = useCool();
const { t } = useI18n();

const statusOptions = [
	{ label: t('失败'), value: 0 },
	{ label: t('成功'), value: 1 }
];

const invokeDialog = ref(false);
const invoking = ref(false);
const availableModels = ref([]);
const invokeForm = ref({
	modelId: '',
	prompt: '',
	params: ''
});

const Upsert = useUpsert({
	dialog: { width: '1000px' },
	props: { labelWidth: '100px' },
	items: [
		{ label: t('用户ID'), prop: 'userId', component: { name: 'el-input-number' } },
		{ label: t('模型'), prop: 'modelName', component: { name: 'el-input' }, props: { readonly: true } },
		{ label: t('请求ID'), prop: 'requestId', component: { name: 'el-input' }, props: { readonly: true } },
		{ label: t('请求内容'), prop: 'prompt', component: { name: 'el-input', props: { type: 'textarea', rows: 6, readonly: true } } },
		{ label: t('响应内容'), prop: 'response', component: { name: 'el-input', props: { type: 'textarea', rows: 8, readonly: true } } },
		{ label: t('输入Token'), prop: 'inputTokens', component: { name: 'el-input-number' }, props: { readonly: true } },
		{ label: t('输出Token'), prop: 'outputTokens', component: { name: 'el-input-number' }, props: { readonly: true } },
		{ label: t('调用成本'), prop: 'cost', component: { name: 'el-input-number' }, props: { readonly: true, precision: 6 } },
		{ label: t('耗时(ms)'), prop: 'duration', component: { name: 'el-input-number' }, props: { readonly: true } },
		{ label: t('状态'), prop: 'status', component: { name: 'el-select', options: statusOptions }, props: { readonly: true } },
		{ label: t('错误信息'), prop: 'errorMsg', component: { name: 'el-input', props: { type: 'textarea', rows: 3, readonly: true } } }
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection' },
		{ label: t('用户ID'), prop: 'userId', width: 80 },
		{ label: t('服务商'), prop: 'providerName', minWidth: 120 },
		{ label: t('模型'), prop: 'modelName', minWidth: 180 },
		{ label: t('请求内容'), prop: 'prompt', minWidth: 300, showOverflowTooltip: true },
		{ label: t('输入Token'), prop: 'inputTokens', width: 100 },
		{ label: t('输出Token'), prop: 'outputTokens', width: 100 },
		{ label: t('成本'), prop: 'cost', width: 100, formatter: ({ row }) => row.cost ? row.cost.toFixed(6) : '0' },
		{ label: t('耗时(ms)'), prop: 'duration', width: 100 },
		{ label: t('状态'), prop: 'status', width: 80, formatter: ({ row }) => statusOptions.find(e => e.value === row.status)?.label || row.status },
		{ label: t('创建时间'), prop: 'createTime', sortable: 'custom', minWidth: 170 },
		{ type: 'op', width: 120, buttons: [
			{ label: t('查看详情'), type: 'info' }
		] }
	]
});

const Crud = useCrud({
	service: service.ai.call.log,
	onRefresh(params, { render, next }) {
		Promise.all([
			next(params),
			service.ai.provider.list(),
			service.ai.model.list()
		]).then(([res, providers, models]) => {
			const logs = res?.list || [];
			const providerMap = {};
			const modelMap = {};
			
			(providers || []).forEach((p: any) => {
				providerMap[p.id] = p.name;
			});
			
			(models || []).forEach((m: any) => {
				modelMap[m.id] = {
					name: m.name,
					providerId: m.providerId
				};
			});
			
			logs.forEach((log: any) => {
				const model = modelMap[log.modelId];
				if (model) {
					log.modelName = model.name;
					log.providerName = providerMap[model.providerId] || '';
				}
			});
			
			availableModels.value = (models || []).filter((m: any) => m.status === 1).map((m: any) => ({
				id: m.id,
				name: m.name,
				providerId: m.providerId,
				providerName: providerMap[m.providerId] || ''
			}));
			
			render(logs);
		});
	}
});

const openInvokeDialog = () => {
	invokeForm.value = {
		modelId: '',
		prompt: '',
		params: ''
	};
	invokeDialog.value = true;
};

const invokeAI = async () => {
	if (!invokeForm.value.modelId || !invokeForm.value.prompt) {
		ElMessage.error(t('请选择模型并输入请求内容'));
		return;
	}
	
	invoking.value = true;
	try {
		const params = {
			modelId: invokeForm.value.modelId,
			prompt: invokeForm.value.prompt
		};
		
		if (invokeForm.value.params) {
			try {
				params.params = JSON.parse(invokeForm.value.params);
			} catch {
				ElMessage.error(t('参数配置格式错误，请输入有效的JSON'));
				return;
			}
		}
		
		const res = await service.ai.call.invoke(params);
		if (res.success) {
			ElMessage.success(t('AI调用成功'));
			invokeDialog.value = false;
			Crud.value.refresh();
		} else {
			ElMessage.error(`${t('AI调用失败')}: ${res.message}`);
		}
	} catch (error) {
		ElMessage.error(t('调用过程中发生错误'));
	} finally {
		invoking.value = false;
	}
};

const testAllModels = async () => {
	try {
		const res = await service.ai.call.testAll();
		if (res.success) {
			ElMessage.success(t('批量测试完成，请查看日志详情'));
			Crud.value.refresh();
		} else {
			ElMessage.error(`${t('批量测试失败')}: ${res.message}`);
		}
	} catch (error) {
		ElMessage.error(t('测试过程中发生错误'));
	}
};
</script>