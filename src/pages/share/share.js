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
		showDialog: true
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 关闭弹窗
		// 目前 share 功能未实现，点击后返回上一页面
		dialogClose: function(e) {
			wx.navigateBack({
				delta: 1,
			})
		}
	}
})
