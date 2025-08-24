# AI模块Provider接口数据展示问题排查经验

## 问题表象

AI模块下的provider接口请求正常（返回200状态码），但前端表格数据不显示，只显示"共 X 条"的分页信息，表格行内容为空。

## 根本原因

前端表格列的 `prop` 属性与后端接口返回的字段名不匹配。

### 具体不匹配字段：

- 前端配置：`name` → 后端字段：`provider_name`
- 前端配置：`type` → 后端字段：`provider_type`
- 前端配置：`status` → 后端字段：`provider_status`
- 前端配置：`createTime` → 后端字段：`provider_createTime`

## 解决方案

修改 `src/modules/ai/views/provider.vue` 文件中的表格列配置，将 `prop` 属性改为与后端字段名完全匹配的值。

## 排查步骤

1. 确认接口请求正常（200状态码）
2. 检查前端配置是否正确（service、columns等）
3. 对比接口返回数据与前端字段映射
4. 修改表格列配置中的 `prop` 属性

## 经验总结

**接口请求成功但数据不显示 = 字段映射不匹配**，优先检查前端表格列的 `prop` 属性与后端返回字段的一致性。
