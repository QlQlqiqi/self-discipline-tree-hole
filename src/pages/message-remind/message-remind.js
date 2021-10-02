const computedBehavior = require("miniprogram-computed").behavior;
const shareChatBehavior = require("../../behavior/share-chat-behavior");
const util = require("../../utils/util");
const store = require("../../store/store");
const app = getApp();
Component({
	behaviors: [computedBehavior, shareChatBehavior],
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
		chats: [{
			remind: {
				title: '小红评论你',
				content: '哈哈哈哈哈哈哈哈哈啊实打实的',
				contentShow: '哈哈哈哈哈哈哈...'
			},
			content: {
				title: '洞主回复你',
				content: '啊实打实大苏打实打实打算',
				contentShow: '啊实打实大...'
			},
			open: false,
			chat: {
				id: 1,
				owner: 1,
				pic: {
					headIcon: "/src/image/head-icon-yellow.svg",
					name: "黄黄",
					date: "2020-12-21T12:12:12Z",
					content: "说说",
				},
				reviewAbridge: {},
				options: [
					{ icon: '/src/image/option-power.svg', content: '权限' },
					{ icon: '/src/image/option-delete.svg', content: '删除' }
				],
				comments: [
					{ id: 1, title: "洞主", content: "哈哈" },
					{ id: 2, title: "洞主", content: "哈哈" },
				],
			}
		}],
		// 便于 share-chat-behavior 的使用
		pageNameCurrent: 0,
	},

	computed: {
		// chats(data) {
		// 	let {owner} = app.globalData;
		// 	return data.chats.map(chat => {
		// 		let obj = {};
		// 		// 自己的说说
		// 		if(chat.owner === owner) {
		// 			obj.remind = {
		// 				title = util.getCommentTitle(chat.owner, chat)
		// 			}
		// 		}
		// 	})
		// }
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 返回上一个页面
		handleBack() {
			wx.navigateBack();
		},
		// 点击缩略图后，打开说说具体内容
		handleSwitchChat(e) {
			if(typeof this._handleCloseSwitchChat === 'function')
				this._handleCloseSwitchChat();
			let {index} = e.currentTarget.dataset;
			let key = `chats[${index}].open`;
			this.setData({
				[key]: true,
				pageNameCurrent: +(this.data.chats[index].chat.owner === app.globalData.owner),
			})
			this._handleCloseSwitchChat = () => {
				this.setData({
					[key]: false
				})
				delete this._handleCloseSwitchChat;
			}
		},
		

		// 加载数据
		onLoad: function() {
			// 需要显示的 chats 
			let chats = JSON.parse(wx.getStorageSync('chats'));
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
				bottomLineHeight,
				chats,
			})
		}
	}
})
