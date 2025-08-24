<template>
	<div class="ai-chat">
		<el-row :gutter="20" style="height: calc(100vh - 200px);">
			<!-- 左侧配置面板 -->
			<el-col :span="6">
				<el-card shadow="hover" style="height: 100%;">
					<template #header>
						<div style="display: flex; justify-content: space-between; align-items: center;">
							<span>{{ $t('配置面板') }}</span>
							<el-button size="small" type="danger" @click="clearChat">
								{{ $t('清空对话') }}
							</el-button>
						</div>
					</template>
					
					<el-form :model="chatConfig" label-width="80px" size="small">
						<el-form-item :label="$t('服务商')" required>
							<el-select 
								v-model="chatConfig.providerId" 
								:placeholder="$t('请选择服务商')"
								@change="onProviderChange"
								style="width: 100%"
							>
								<el-option 
									v-for="provider in providers" 
									:key="provider.id" 
									:label="provider.name" 
									:value="provider.id" 
								/>
							</el-select>
						</el-form-item>
						
						<el-form-item :label="$t('模型')" required>
							<el-select 
								v-model="chatConfig.modelId" 
								:placeholder="$t('请选择模型')"
								:disabled="!chatConfig.providerId"
								style="width: 100%"
							>
								<el-option 
									v-for="model in availableModels" 
									:key="model.id" 
									:label="model.name" 
									:value="model.id" 
								/>
							</el-select>
						</el-form-item>
						
						<el-form-item :label="$t('温度')">
							<el-slider 
								v-model="chatConfig.temperature" 
								:min="0" 
								:max="2" 
								:step="0.1"
								show-input
								:show-input-controls="false"
								style="width: 100%"
							/>
						</el-form-item>
						
						<el-form-item :label="$t('最大Token')">
							<el-input-number 
								v-model="chatConfig.maxTokens" 
								:min="1" 
								:max="32000"
								style="width: 100%"
							/>
						</el-form-item>
						
						<el-form-item :label="$t('流式输出')">
							<el-switch v-model="chatConfig.stream" />
						</el-form-item>
					</el-form>
					
					<!-- 统计信息 -->
					<el-divider />
					<div class="chat-stats">
						<h4>{{ $t('本次对话统计') }}</h4>
						<p>{{ $t('消息数量') }}: {{ messages.length }}</p>
						<p>{{ $t('总Token数') }}: {{ totalTokens }}</p>
						<p>{{ $t('总成本') }}: {{ totalCost.toFixed(6) }}</p>
					</div>
				</el-card>
			</el-col>
			
			<!-- 右侧聊天区域 -->
			<el-col :span="18">
				<el-card shadow="hover" style="height: 100%; display: flex; flex-direction: column;">
					<template #header>
						<div style="display: flex; justify-content: space-between; align-items: center;">
							<span>{{ $t('AI聊天调试') }}</span>
							<el-tag v-if="selectedModel" type="success">
								{{ selectedModel.providerName }} - {{ selectedModel.name }}
							</el-tag>
						</div>
					</template>
					
					<!-- 聊天历史 -->
					<div class="chat-history" ref="chatHistory">
						<div v-if="messages.length === 0" class="empty-chat">
							<el-empty :description="$t('开始您的AI对话吧')" />
						</div>
						
						<div v-for="(message, index) in messages" :key="index" class="message-item">
							<div :class="['message', message.role]">
								<div class="message-avatar">
									<el-avatar v-if="message.role === 'user'" :size="32">
										<el-icon><User /></el-icon>
									</el-avatar>
									<el-avatar v-else :size="32" style="background: var(--el-color-primary)">
										<el-icon><Avatar /></el-icon>
									</el-avatar>
								</div>
								<div class="message-content">
									<div class="message-header">
										<span class="message-role">
											{{ message.role === 'user' ? $t('用户') : $t('AI助手') }}
										</span>
										<span class="message-time">{{ formatTime(message.timestamp) }}</span>
									</div>
									<div class="message-text">{{ message.content }}</div>
									<div v-if="message.tokens" class="message-meta">
										<el-tag size="small">{{ $t('Token') }}: {{ message.tokens }}</el-tag>
										<el-tag v-if="message.cost" size="small" type="warning">
											{{ $t('成本') }}: {{ message.cost.toFixed(6) }}
										</el-tag>
										<el-tag v-if="message.duration" size="small" type="info">
											{{ $t('耗时') }}: {{ message.duration }}ms
										</el-tag>
									</div>
								</div>
							</div>
						</div>
						
						<!-- 加载中显示 -->
						<div v-if="isLoading" class="message-item">
							<div class="message assistant">
								<div class="message-avatar">
									<el-avatar :size="32" style="background: var(--el-color-primary)">
										<el-icon><Avatar /></el-icon>
									</el-avatar>
								</div>
								<div class="message-content">
									<div class="message-header">
										<span class="message-role">{{ $t('AI助手') }}</span>
									</div>
									<div class="message-text">
										<el-icon class="is-loading"><Loading /></el-icon>
										{{ $t('思考中...') }}
									</div>
								</div>
							</div>
						</div>
					</div>
					
					<!-- 消息输入区域 -->
					<div class="chat-input">
						<el-input
							v-model="currentMessage"
							type="textarea"
							:rows="3"
							:placeholder="$t('请输入您的消息...')"
							@keydown.ctrl.enter="sendMessage"
							:disabled="isLoading || !chatConfig.modelId"
						/>
						<div class="input-actions">
							<div class="input-tips">
								<el-text size="small" type="info">{{ $t('Ctrl + Enter 发送') }}</el-text>
							</div>
							<el-button
								type="primary"
								@click="sendMessage"
								:loading="isLoading"
								:disabled="!currentMessage.trim() || !chatConfig.modelId"
							>
								{{ $t('发送') }}
							</el-button>
						</div>
					</div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'ai-chat' });

import { ref, reactive, computed, nextTick, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, Avatar, Loading } from '@element-plus/icons-vue';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { service } = useCool();
const { t } = useI18n();

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
	tokens?: number;
	cost?: number;
	duration?: number;
}

interface Provider {
	id: string;
	name: string;
	type: string;
	status: number;
}

interface Model {
	id: string;
	name: string;
	modelKey: string;
	providerId: string;
	providerName?: string;
	maxTokens?: number;
	costInput?: number;
	costOutput?: number;
	status: number;
}

const chatHistory = ref<HTMLElement>();
const currentMessage = ref('');
const isLoading = ref(false);
const messages = ref<ChatMessage[]>([]);

const providers = ref<Provider[]>([]);
const models = ref<Model[]>([]);

const chatConfig = reactive({
	providerId: '',
	modelId: '',
	temperature: 0.7,
	maxTokens: 2000,
	stream: true
});

const availableModels = computed(() => {
	return models.value.filter(model => 
		model.providerId === chatConfig.providerId && model.status === 1
	);
});

const selectedModel = computed(() => {
	return models.value.find(model => model.id === chatConfig.modelId);
});

const totalTokens = computed(() => {
	return messages.value.reduce((sum, msg) => sum + (msg.tokens || 0), 0);
});

const totalCost = computed(() => {
	return messages.value.reduce((sum, msg) => sum + (msg.cost || 0), 0);
});

const loadProviders = async () => {
	try {
		const result = await service.ai.provider.list();
		console.log('Providers API response:', result);
		
		// 处理不同的数据结构
		const list = result?.list || result?.data?.list || result?.data || result || [];
		providers.value = (Array.isArray(list) ? list : []).filter((p: Provider) => p?.status === 1);
		
		console.log('Available providers:', providers.value);
	} catch (error) {
		console.error('Load providers error:', error);
		ElMessage.error(t('加载服务商列表失败'));
	}
};

const loadModels = async () => {
	try {
		const [modelResult, providerResult] = await Promise.all([
			service.ai.model.list(),
			service.ai.provider.list()
		]);
		
		console.log('Models API response:', modelResult);
		console.log('Providers API response for models:', providerResult);
		
		// 处理不同的数据结构
		const modelList = modelResult?.list || modelResult?.data?.list || modelResult?.data || modelResult || [];
		const providerList = providerResult?.list || providerResult?.data?.list || providerResult?.data || providerResult || [];
		
		const providerMap = {};
		(Array.isArray(providerList) ? providerList : []).forEach((p: any) => {
			if (p?.id && p?.name) {
				providerMap[p.id] = p.name;
			}
		});
		
		models.value = (Array.isArray(modelList) ? modelList : []).map((model: any) => ({
			...model,
			providerName: providerMap[model?.providerId] || ''
		})).filter(model => model?.status === 1);
		
		console.log('Available models:', models.value);
	} catch (error) {
		console.error('Load models error:', error);
		ElMessage.error(t('加载模型列表失败'));
	}
};

const onProviderChange = () => {
	chatConfig.modelId = '';
};

const scrollToBottom = async () => {
	await nextTick();
	if (chatHistory.value) {
		chatHistory.value.scrollTop = chatHistory.value.scrollHeight;
	}
};

const sendMessage = async () => {
	if (!currentMessage.value.trim() || !chatConfig.modelId || isLoading.value) {
		return;
	}

	const userMessage: ChatMessage = {
		role: 'user',
		content: currentMessage.value,
		timestamp: Date.now()
	};

	messages.value.push(userMessage);
	const messageToSend = currentMessage.value;
	currentMessage.value = '';
	
	await scrollToBottom();
	
	isLoading.value = true;
	const startTime = Date.now();

	try {
		const params = {
			modelId: chatConfig.modelId,
			prompt: messageToSend,
			params: {
				temperature: chatConfig.temperature,
				max_tokens: chatConfig.maxTokens,
				stream: chatConfig.stream
			}
		};

		const result = await service.ai.call.invoke(params);
		
		if (result.success) {
			const assistantMessage: ChatMessage = {
				role: 'assistant',
				content: result.data?.response || result.message || t('收到回复'),
				timestamp: Date.now(),
				tokens: result.data?.totalTokens,
				cost: result.data?.cost,
				duration: Date.now() - startTime
			};

			messages.value.push(assistantMessage);
			await scrollToBottom();
		} else {
			throw new Error(result.message || t('调用失败'));
		}
	} catch (error: any) {
		ElMessage.error(`${t('发送消息失败')}: ${error.message || error}`);
		
		const errorMessage: ChatMessage = {
			role: 'assistant',
			content: `${t('错误')}: ${error.message || error}`,
			timestamp: Date.now(),
			duration: Date.now() - startTime
		};
		
		messages.value.push(errorMessage);
		await scrollToBottom();
	} finally {
		isLoading.value = false;
	}
};

const clearChat = async () => {
	try {
		await ElMessageBox.confirm(
			t('确定要清空所有对话记录吗？'),
			t('确认清空'),
			{
				confirmButtonText: t('确定'),
				cancelButtonText: t('取消'),
				type: 'warning',
			}
		);
		messages.value = [];
		ElMessage.success(t('对话已清空'));
	} catch {
		// 用户取消
	}
};

const formatTime = (timestamp: number) => {
	return new Date(timestamp).toLocaleTimeString();
};

onMounted(() => {
	loadProviders();
	loadModels();
});
</script>

<style lang="scss" scoped>
.ai-chat {
	padding: 20px;
	height: 100%;

	.chat-stats {
		font-size: 14px;
		
		h4 {
			margin: 0 0 12px 0;
			font-size: 14px;
			font-weight: bold;
		}
		
		p {
			margin: 6px 0;
			color: var(--el-text-color-secondary);
		}
	}

	.chat-history {
		flex: 1;
		overflow-y: auto;
		padding: 20px 0;
		
		.empty-chat {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
		}

		.message-item {
			margin-bottom: 20px;

			.message {
				display: flex;
				gap: 12px;

				&.user {
					flex-direction: row-reverse;
					
					.message-content {
						text-align: right;
						
						.message-text {
							background: var(--el-color-primary);
							color: white;
						}
					}
				}

				&.assistant {
					.message-text {
						background: var(--el-fill-color-lighter);
						color: var(--el-text-color-primary);
					}
				}

				.message-avatar {
					flex-shrink: 0;
				}

				.message-content {
					flex: 1;
					min-width: 0;

					.message-header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 8px;

						.message-role {
							font-weight: bold;
							font-size: 14px;
						}

						.message-time {
							font-size: 12px;
							color: var(--el-text-color-secondary);
						}
					}

					.message-text {
						padding: 12px 16px;
						border-radius: 12px;
						line-height: 1.5;
						word-break: break-word;
						white-space: pre-wrap;
					}

					.message-meta {
						margin-top: 8px;
						display: flex;
						gap: 8px;
						flex-wrap: wrap;
					}
				}
			}
		}
	}

	.chat-input {
		border-top: 1px solid var(--el-border-color-lighter);
		padding-top: 16px;

		.input-actions {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 12px;

			.input-tips {
				color: var(--el-text-color-secondary);
			}
		}
	}
}

.is-loading {
	animation: rotating 2s linear infinite;
}

@keyframes rotating {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>