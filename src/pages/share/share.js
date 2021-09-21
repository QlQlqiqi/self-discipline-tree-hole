// src/pages/share/share.js
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 说说功能选项
		options: [
			{ icon: '/src/image/option-report.svg', content: '举报' },
			{ icon: '/src/image/option-power.svg', content: '权限' },
			{ icon: '/src/image/option-delete.svg', content: '删除' }
		]
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 发送评论
		handleEnsureComment(e) {
			console.log(e)
		}
	}
})
