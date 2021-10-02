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
		onLoad(options) {
			let {src, title} = options;
			wx.setNavigationBarTitle({
				title: JSON.parse(title)
			})
			this.setData({
				webViewSrc: JSON.parse(src)
			})
		}
	}
})
