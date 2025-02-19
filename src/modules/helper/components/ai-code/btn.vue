<template>
	<div class="cl-comm__icon" @click="toCode">
		<span class="mr-2">Ai</span>
		<cl-svg name="quick" />
		<span class="ml-2">{{ $t('极速编码') }}</span>
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

	.cl-svg {
		color: var(--el-color-primary);
	}

	span {
		font-size: 14px;
	}
}
</style>
