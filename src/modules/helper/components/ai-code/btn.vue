<template>
	<div class="cl-comm__icon" @click="toCode">
		Ai
		<cl-svg name="quick" class="ml-2 mr-2" />
		{{ $t('极速编码') }}
	</div>
</template>

<script setup lang="ts">
import { useCool } from '/@/cool';

const { router } = useCool();

function toCode() {
	router.push('/helper/ai-code');
}
</script>

<style lang="scss" scoped>
.cl-comm__icon {
	width: auto;
	padding: 0 10px;
	border-color: var(--el-color-primary);
	color: var(--el-color-primary);
	font-size: 14px;
	line-height: 1;

	.cl-svg {
		color: var(--el-color-primary);
	}
}
</style>
