const app = getApp();
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

	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		
	},
	pageLifetimes: {
		show: function() {
			this.setData({
				navHeight: app.globalData.navHeight,
				safeAreaBottom: app.globalData.bottomLineHeight
			})
		}
	}
})
