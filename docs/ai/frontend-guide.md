# AI模块前端开发指南

## 1. 模块概述

AI模块是一个统一的AI模型管理平台，提供多服务商AI模型的接入、管理、测试和调用功能。本文档为前端开发者提供完整的接口调用指南和数据结构说明。

### 1.1 核心功能
- **服务商管理**：管理OpenAI、Anthropic、Google、百度等AI服务商
- **模型管理**：管理各服务商的AI模型配置
- **调用功能**：统一的AI模型调用接口
- **监控统计**：调用日志记录和使用统计

### 1.2 权限说明
- 模块仅支持Admin管理端访问
- 需要相应的权限才能执行操作
- 所有接口都需要认证Token

## 2. 菜单结构

AI模块在管理后台的菜单结构如下：

```
AI模型管理 (/ai)
├── 服务商管理 (/ai/provider)
├── 模型管理 (/ai/model)  
└── 调用管理 (/ai/call)
```

### 2.1 权限列表

| 功能模块 | 权限标识 | 说明 |
|---------|---------|------|
| 服务商管理 | `ai:provider:page` | 查看服务商列表 |
| | `ai:provider:add` | 新增服务商 |
| | `ai:provider:update` | 修改服务商 |
| | `ai:provider:delete` | 删除服务商 |
| | `ai:provider:info` | 查看服务商详情 |
| | `ai:provider:test` | 测试服务商连接 |
| | `ai:provider:sync` | 同步服务商模型 |
| 模型管理 | `ai:model:page` | 查看模型列表 |
| | `ai:model:add` | 新增模型 |
| | `ai:model:update` | 修改模型 |
| | `ai:model:delete` | 删除模型 |
| | `ai:model:info` | 查看模型详情 |
| | `ai:model:test` | 测试模型 |
| 调用管理 | `ai:call:page` | 查看调用管理页面 |
| | `ai:call:invoke` | 调用AI模型 |
| | `ai:call:test-all` | 批量测试模型 |
| | `ai:call:stats` | 查看统计信息 |
| | `ai:call:log` | 查看调用日志 |

## 3. 服务商管理 API

### 3.1 服务商数据结构

```typescript
interface AiProvider {
  id: number;
  name: string;           // 服务商名称
  type: string;           // 服务商类型: openai|anthropic|google|baidu|alibaba|custom
  baseUrl?: string;       // API基础URL
  apiKey?: string;        // API密钥（前端显示时需脱敏）
  config?: object;        // 扩展配置
  status: 0 | 1;          // 状态：0=禁用，1=启用
  sort: number;           // 排序
  remark?: string;        // 备注
  createTime: string;     // 创建时间
  updateTime: string;     // 更新时间
}
```

### 3.2 服务商管理接口

#### 3.2.1 分页查询服务商
```typescript
POST /admin/ai/provider/page

// 请求参数
interface ProviderPageParams {
  keyWord?: string;     // 关键词搜索（名称、类型、备注）
  type?: string;        // 服务商类型筛选
  status?: 0 | 1;       // 状态筛选
  page: number;         // 页码
  size: number;         // 每页数量
  order?: string;       // 排序字段
  sort?: 'asc' | 'desc'; // 排序方向
}

// 响应数据
interface ProviderPageResponse {
  list: AiProvider[];
  pagination: {
    page: number;
    size: number;
    total: number;
  }
}
```

#### 3.2.2 新增服务商
```typescript
POST /admin/ai/provider/add

// 请求参数
interface AddProviderParams {
  name: string;           // 必填：服务商名称
  type: string;           // 必填：服务商类型
  baseUrl?: string;       // API基础URL
  apiKey?: string;        // API密钥
  config?: object;        // 扩展配置
  status?: 0 | 1;         // 状态，默认1
  sort?: number;          // 排序，默认0
  remark?: string;        // 备注
}
```

#### 3.2.3 更新服务商
```typescript
POST /admin/ai/provider/update

// 请求参数
interface UpdateProviderParams {
  id: number;             // 必填：服务商ID
  name?: string;          // 服务商名称
  type?: string;          // 服务商类型
  baseUrl?: string;       // API基础URL
  apiKey?: string;        // API密钥
  config?: object;        // 扩展配置
  status?: 0 | 1;         // 状态
  sort?: number;          // 排序
  remark?: string;        // 备注
}
```

#### 3.2.4 删除服务商
```typescript
POST /admin/ai/provider/delete

// 请求参数
interface DeleteProviderParams {
  ids: number | number[]; // 要删除的服务商ID（支持批量删除）
}
```

#### 3.2.5 查询服务商详情
```typescript
GET /admin/ai/provider/info?id={id}

// 响应数据：AiProvider对象
```

#### 3.2.6 测试服务商连接
```typescript
POST /admin/ai/provider/test

// 请求参数
interface TestProviderParams {
  id: number; // 服务商ID
}

// 响应数据
interface TestProviderResponse {
  success: boolean;   // 测试是否成功
  duration: number;   // 响应时间（毫秒）
  message: string;    // 成功信息
  error?: string;     // 错误信息（失败时）
}
```

#### 3.2.7 同步服务商模型
```typescript
POST /admin/ai/provider/sync-models

// 请求参数
interface SyncModelsParams {
  id: number; // 服务商ID
}

// 响应数据
interface SyncModelsResponse {
  syncCount: number;  // 同步的模型数量
  models: string[];   // 同步的模型列表
}
```

## 4. 模型管理 API

### 4.1 模型数据结构

```typescript
interface AiModel {
  id: number;
  providerId: number;       // 关联的服务商ID
  name: string;             // 模型名称
  modelKey: string;         // 模型标识（调用时使用）
  capabilities: string[];   // 模型能力标签
  params?: object;          // 默认参数配置
  maxTokens?: number;       // 最大token数
  costInput?: number;       // 输入成本（每1K token）
  costOutput?: number;      // 输出成本（每1K token）
  status: 0 | 1;            // 状态：0=禁用，1=启用
  sort: number;             // 排序
  remark?: string;          // 备注
  createTime: string;       // 创建时间
  updateTime: string;       // 更新时间
}
```

### 4.2 常用模型能力标签

```typescript
const ModelCapabilities = {
  TEXT_GENERATION: 'text-generation',    // 文本生成
  CHAT: 'chat',                         // 对话聊天
  CODE_GENERATION: 'code-generation',   // 代码生成
  TRANSLATION: 'translation',           // 翻译
  SUMMARIZATION: 'summarization',       // 摘要
  QUESTION_ANSWERING: 'question-answering', // 问答
  IMAGE_GENERATION: 'image-generation', // 图像生成
  IMAGE_ANALYSIS: 'image-analysis',     // 图像分析
  VOICE_SYNTHESIS: 'voice-synthesis',   // 语音合成
  VOICE_RECOGNITION: 'voice-recognition' // 语音识别
}
```

### 4.3 模型管理接口

#### 4.3.1 分页查询模型
```typescript
POST /admin/ai/model/page

// 请求参数
interface ModelPageParams {
  keyWord?: string;         // 关键词搜索（名称、模型标识、备注）
  providerId?: number;      // 服务商筛选
  capabilities?: string[];  // 能力标签筛选
  status?: 0 | 1;           // 状态筛选
  page: number;             // 页码
  size: number;             // 每页数量
  order?: string;           // 排序字段
  sort?: 'asc' | 'desc';    // 排序方向
}

// 响应数据
interface ModelPageResponse {
  list: AiModel[];
  pagination: {
    page: number;
    size: number;
    total: number;
  }
}
```

#### 4.3.2 新增模型
```typescript
POST /admin/ai/model/add

// 请求参数
interface AddModelParams {
  providerId: number;       // 必填：服务商ID
  name: string;             // 必填：模型名称
  modelKey: string;         // 必填：模型标识
  capabilities?: string[];  // 模型能力标签
  params?: object;          // 默认参数配置
  maxTokens?: number;       // 最大token数
  costInput?: number;       // 输入成本
  costOutput?: number;      // 输出成本
  status?: 0 | 1;           // 状态，默认1
  sort?: number;            // 排序，默认0
  remark?: string;          // 备注
}
```

#### 4.3.3 更新模型
```typescript
POST /admin/ai/model/update

// 请求参数：同AddModelParams，但增加必填的id字段
interface UpdateModelParams extends Omit<AddModelParams, 'providerId' | 'name' | 'modelKey'> {
  id: number;               // 必填：模型ID
  providerId?: number;      // 服务商ID
  name?: string;            // 模型名称
  modelKey?: string;        // 模型标识
}
```

#### 4.3.4 删除模型
```typescript
POST /admin/ai/model/delete

// 请求参数
interface DeleteModelParams {
  ids: number | number[]; // 要删除的模型ID（支持批量删除）
}
```

#### 4.3.5 查询模型详情
```typescript
GET /admin/ai/model/info?id={id}

// 响应数据：AiModel对象
```

#### 4.3.6 测试模型
```typescript
POST /admin/ai/model/test

// 请求参数
interface TestModelParams {
  id: number;               // 模型ID
  testMessage: string;      // 测试消息
  temperature?: number;     // 温度参数（0-2）
  maxTokens?: number;       // 最大token数
}

// 响应数据
interface TestModelResponse {
  success: boolean;         // 测试是否成功
  content?: string;         // AI响应内容
  inputTokens?: number;     // 输入token数
  outputTokens?: number;    // 输出token数
  duration: number;         // 响应时间（毫秒）
  error?: string;           // 错误信息（失败时）
}
```

#### 4.3.7 根据能力获取模型
```typescript
POST /admin/ai/model/by-capabilities

// 请求参数
interface GetModelsByCapabilitiesParams {
  capabilities: string[]; // 需要的能力标签
}

// 响应数据
interface GetModelsByCapabilitiesResponse {
  models: AiModel[];      // 匹配的模型列表
}
```

## 5. 调用管理 API

### 5.1 调用相关数据结构

```typescript
// AI调用消息格式
interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI调用参数
interface AiCallParams {
  model: string;            // 模型标识（modelKey）
  messages: AiMessage[];    // 消息数组
  temperature?: number;     // 温度参数（0-2），默认0.7
  maxTokens?: number;       // 最大token数
  stream?: boolean;         // 是否流式返回，默认false
}

// AI调用结果
interface AiCallResult {
  content: string;          // AI响应内容
  inputTokens: number;      // 输入token数
  outputTokens: number;     // 输出token数
  duration: number;         // 响应时间（毫秒）
  requestId?: string;       // 请求ID
}

// 调用日志数据结构
interface AiCallLog {
  id: number;
  userId?: number;          // 调用用户ID
  providerId: number;       // 服务商ID
  modelId: number;          // 模型ID
  requestId?: string;       // 请求ID
  prompt?: string;          // 请求内容
  response?: string;        // 响应内容
  inputTokens: number;      // 输入token数
  outputTokens: number;     // 输出token数
  cost: number;             // 调用成本
  duration: number;         // 耗时（毫秒）
  status: 0 | 1;            // 状态：0=失败，1=成功
  errorMsg?: string;        // 错误信息
  createTime: string;       // 创建时间
}
```

### 5.2 调用管理接口

#### 5.2.1 调用AI模型
```typescript
POST /admin/ai/call/invoke

// 请求参数
interface InvokeAiParams {
  model: string;            // 必填：模型标识
  messages: AiMessage[];    // 必填：消息数组
  temperature?: number;     // 温度参数（0-2）
  maxTokens?: number;       // 最大token数
  stream?: boolean;         // 是否流式返回
}

// 响应数据：AiCallResult对象
```

#### 5.2.2 批量测试所有模型
```typescript
POST /admin/ai/call/test-all

// 请求参数
interface TestAllModelsParams {
  testMessage: string;      // 测试消息
  temperature?: number;     // 温度参数
  maxTokens?: number;       // 最大token数
}

// 响应数据
interface TestAllModelsResponse {
  results: Array<{
    modelId: number;
    modelName: string;
    success: boolean;
    content?: string;
    duration: number;
    error?: string;
  }>;
  summary: {
    total: number;          // 总数
    success: number;        // 成功数
    failed: number;         // 失败数
    avgDuration: number;    // 平均响应时间
  };
}
```

#### 5.2.3 获取调用统计
```typescript
GET /admin/ai/call/stats

// 请求参数（Query参数）
interface GetStatsParams {
  startTime?: string;       // 开始时间（YYYY-MM-DD）
  endTime?: string;         // 结束时间（YYYY-MM-DD）
  providerId?: number;      // 服务商筛选
  modelId?: number;         // 模型筛选
  userId?: number;          // 用户筛选
}

// 响应数据
interface GetStatsResponse {
  overview: {
    totalCalls: number;     // 总调用次数
    successCalls: number;   // 成功调用次数
    failedCalls: number;    // 失败调用次数
    totalCost: number;      // 总成本
    avgDuration: number;    // 平均响应时间
    successRate: number;    // 成功率（百分比）
  };
  trends: Array<{
    date: string;           // 日期
    calls: number;          // 调用次数
    cost: number;           // 当日成本
    avgDuration: number;    // 当日平均响应时间
  }>;
  topModels: Array<{
    modelId: number;
    modelName: string;
    calls: number;
    cost: number;
  }>;
  topProviders: Array<{
    providerId: number;
    providerName: string;
    calls: number;
    cost: number;
  }>;
}
```

#### 5.2.4 调用日志分页查询
```typescript
POST /admin/ai/call/log/page

// 请求参数
interface CallLogPageParams {
  userId?: number;          // 用户筛选
  providerId?: number;      // 服务商筛选
  modelId?: number;         // 模型筛选
  status?: 0 | 1;           // 状态筛选
  startTime?: string;       // 开始时间
  endTime?: string;         // 结束时间
  page: number;             // 页码
  size: number;             // 每页数量
  order?: string;           // 排序字段
  sort?: 'asc' | 'desc';    // 排序方向
}

// 响应数据
interface CallLogPageResponse {
  list: AiCallLog[];
  pagination: {
    page: number;
    size: number;
    total: number;
  }
}
```

## 6. 前端实现建议

### 6.1 状态管理

```typescript
// 使用Pinia或Vuex管理AI模块状态
interface AiModuleState {
  providers: AiProvider[];     // 服务商列表
  models: AiModel[];           // 模型列表
  currentProvider?: AiProvider; // 当前选中的服务商
  currentModel?: AiModel;      // 当前选中的模型
  callLogs: AiCallLog[];       // 调用日志
  stats: GetStatsResponse;     // 统计数据
  loading: {
    providers: boolean;
    models: boolean;
    calling: boolean;
    testing: boolean;
  };
}
```

### 6.2 通用组件建议

#### 6.2.1 服务商类型选择器
```vue
<template>
  <el-select v-model="selectedType" placeholder="选择服务商类型">
    <el-option
      v-for="type in providerTypes"
      :key="type.value"
      :label="type.label"
      :value="type.value"
    />
  </el-select>
</template>

<script>
const providerTypes = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google Gemini' },
  { value: 'baidu', label: '百度文心' },
  { value: 'alibaba', label: '阿里通义千问' },
  { value: 'custom', label: '自定义' }
];
</script>
```

#### 6.2.2 模型能力标签组件
```vue
<template>
  <div class="capabilities-tags">
    <el-tag
      v-for="capability in capabilities"
      :key="capability"
      :type="getTagType(capability)"
      size="small"
    >
      {{ getCapabilityLabel(capability) }}
    </el-tag>
  </div>
</template>

<script>
const capabilityLabels = {
  'text-generation': '文本生成',
  'chat': '对话聊天',
  'code-generation': '代码生成',
  'translation': '翻译',
  'summarization': '摘要',
  'question-answering': '问答',
  'image-generation': '图像生成',
  'image-analysis': '图像分析',
  'voice-synthesis': '语音合成',
  'voice-recognition': '语音识别'
};
</script>
```

#### 6.2.3 API密钥脱敏显示
```vue
<template>
  <span class="api-key-display">
    {{ maskedApiKey }}
    <el-button
      @click="toggleVisibility"
      :icon="visible ? 'Hide' : 'View'"
      size="small"
      text
    />
  </span>
</template>

<script>
export default {
  props: {
    apiKey: String
  },
  data() {
    return {
      visible: false
    };
  },
  computed: {
    maskedApiKey() {
      if (!this.apiKey) return '';
      if (this.visible) return this.apiKey;
      const len = this.apiKey.length;
      if (len <= 8) return '*'.repeat(len);
      return this.apiKey.substr(0, 4) + '*'.repeat(len - 8) + this.apiKey.substr(-4);
    }
  }
};
</script>
```

### 6.3 错误处理

```typescript
// 统一的错误处理
interface ApiError {
  code: number;
  message: string;
  data?: any;
}

const handleApiError = (error: ApiError) => {
  switch (error.code) {
    case 401:
      // 未授权，跳转登录
      break;
    case 403:
      // 权限不足
      ElMessage.error('权限不足，无法执行此操作');
      break;
    case 10000: // AI服务商连接失败
      ElMessage.error('AI服务商连接失败，请检查配置');
      break;
    case 10001: // 模型调用失败
      ElMessage.error('模型调用失败，请重试');
      break;
    default:
      ElMessage.error(error.message || '操作失败');
  }
};
```

### 6.4 数据验证

```typescript
// 表单验证规则
const providerRules = {
  name: [
    { required: true, message: '请输入服务商名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择服务商类型', trigger: 'change' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ]
};

const modelRules = {
  providerId: [
    { required: true, message: '请选择服务商', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ],
  modelKey: [
    { required: true, message: '请输入模型标识', trigger: 'blur' }
  ]
};
```

## 7. 注意事项

### 7.1 安全考虑
- API密钥需要脱敏显示，避免泄露
- 调用日志中的敏感信息需要适当处理
- 确保用户只能看到自己权限范围内的数据

### 7.2 性能优化
- 列表数据使用分页加载，避免一次性加载大量数据
- 统计图表数据可以使用缓存，减少频繁请求
- 长时间的AI调用可以显示进度或加载状态

### 7.3 用户体验
- 提供清晰的错误信息和操作反馈
- 重要操作需要确认对话框
- 支持批量操作以提高效率
- 提供快捷测试功能，方便验证配置

### 7.4 测试建议
- 使用测试环境的API密钥进行开发
- 实现mock数据以支持离线开发
- 添加适当的loading状态和错误边界

## 8. 示例代码

### 8.1 服务商管理页面示例
```vue
<template>
  <div class="ai-provider-management">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <el-form :model="searchForm" inline>
        <el-form-item>
          <el-input
            v-model="searchForm.keyWord"
            placeholder="搜索服务商名称、类型或备注"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.type" placeholder="选择类型" clearable>
            <el-option label="全部" value="" />
            <el-option
              v-for="type in providerTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="loadProviders" type="primary">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="actions">
        <el-button @click="showAddDialog" type="primary">新增服务商</el-button>
        <el-button @click="batchDelete" :disabled="!selectedProviders.length">
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 服务商列表 -->
    <el-table
      :data="providers"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="服务商名称" />
      <el-table-column prop="type" label="类型">
        <template #default="{ row }">
          <el-tag>{{ getProviderTypeLabel(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="updateProviderStatus(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button @click="testProvider(row)" size="small">测试</el-button>
          <el-button @click="editProvider(row)" size="small">编辑</el-button>
          <el-button @click="deleteProvider(row)" size="small" type="danger">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadProviders"
      @current-change="loadProviders"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { aiProviderApi } from '@/api/ai';

const loading = ref(false);
const providers = ref([]);
const selectedProviders = ref([]);

const searchForm = reactive({
  keyWord: '',
  type: '',
  status: null
});

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
});

// 加载服务商列表
const loadProviders = async () => {
  loading.value = true;
  try {
    const response = await aiProviderApi.page({
      ...searchForm,
      page: pagination.page,
      size: pagination.size
    });
    providers.value = response.data.list;
    pagination.total = response.data.pagination.total;
  } catch (error) {
    ElMessage.error('加载失败');
  } finally {
    loading.value = false;
  }
};

// 测试服务商连接
const testProvider = async (provider) => {
  try {
    const response = await aiProviderApi.test({ id: provider.id });
    if (response.data.success) {
      ElMessage.success(`连接成功，响应时间: ${response.data.duration}ms`);
    } else {
      ElMessage.error(`连接失败: ${response.data.error}`);
    }
  } catch (error) {
    ElMessage.error('测试失败');
  }
};

onMounted(() => {
  loadProviders();
});
</script>
```

这份文档提供了完整的AI模块前端开发指南，包括所有API接口、数据结构、权限说明和实现建议，可以帮助前端开发者快速上手AI模块的开发工作。