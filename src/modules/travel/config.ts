import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		order: 90,
		views: [
			{
				path: '/travel/trip',
				meta: {
					label: '行程管理'
				},
				component: () => import('./views/trip.vue')
			},
			{
				path: '/travel/item',
				meta: {
					label: '事项管理'
				},
				component: () => import('./views/item.vue')
			}
		]
	};
};