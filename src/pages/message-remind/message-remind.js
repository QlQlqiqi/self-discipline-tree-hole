const computedBehavior = require("miniprogram-computed").behavior;
const util = require("../../utils/util");
const store = require("../../store/store");
const app = getApp();
Component({
	behaviors: [computedBehavior],
	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 格式如下
		// {
		// 	// 提醒的内容
		// 	remind: {
		// 		title: String,
		// 		content: String
		// 		contentShow: String
		// 	},
		// 	// 是否展开
		// 	open: Boolean,
		// 	// 展开说说所需的字段
		// 	chat: Object
		// }
		messageRemind: [{
			remind: {
				title: '小红评论你',
				content: '哈哈哈哈哈哈哈哈哈啊实打实的',
				contentShow: '哈哈哈哈哈哈哈...'
			},
			open: true,
			chat: {
				options: [
					{ icon: '/src/image/option-power.svg', content: '权限' },
					{ icon: '/src/image/option-delete.svg', content: '删除' }
				],
				headIcon: '/src/image/head-icon-yellow.svg',
				name: '黄黄',
				date: '2020-12-21T12:12:12Z',
				content: '说说说说说说说说说说说说说说说说说说',
				contentShow: '说说说说说说说说...',
				comments: [
					{title: '洞主', content: '哈哈'},
					{title: '洞主', content: '哈哈'}
				]
			}
		}]
	},

	/**
	 * 组件的方法列表
	 */
	methods: {

		// 加载数据
		onLoad: function() {
			// 设置机型相关信息
			let {navHeight, navTop, windowHeight, windowWidth, bottomLineHeight} = app.globalData;
			// 从后端拉取数据
			// this.getDataFromSql();
			this.setData({
				navHeight,
				navTop,
				windowHeight,
				windowWidth,
				ratio: 750 / windowWidth,
				bottomLineHeight
			})
		}
	}
})
