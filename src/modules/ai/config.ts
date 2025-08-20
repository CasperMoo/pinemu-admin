import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		order: 90,
		views: [
			{
				path: '/ai/provider',
				meta: {
					label: '服务商管理'
				},
				component: () => import('./views/provider.vue')
			},
			{
				path: '/ai/model',
				meta: {
					label: '模型管理'
				},
				component: () => import('./views/model.vue')
			},
			{
				path: '/ai/call',
				meta: {
					label: '调用管理'
				},
				component: () => import('./views/call.vue')
			}
		]
	};
};