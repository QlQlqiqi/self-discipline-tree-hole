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

	computed: {
		// chatFilter(data) {
		// 	let owner = app.globalData.owner;
		// 	let chat = JSON.parse(JSON.stringify(data.chat));
		// 	let idx = 0;
		// 	chat.comments.forEach(item => {
		// 		item.title = util.getCommentTitle(chat.owner, item.fromUser, item.toUser, owner);
		// 		item.oldIndex = idx++;
		// 	});
		// 	chat.comments = chat.comments.filter(item => {
		// 		return chat.owner === owner 
		// 			|| item.fromUser === owner
		// 			|| item.toUser === owner
		// 			|| (item.fromUser === item.toUser && item.fromUser === chat.owner);
		// 	})
		// 	return chat;
		// }
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
		chatsRemind: [{
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
				id: 11,
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

	watch: {
		
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 返回上一个页面
		handleBack() {
			wx.navigateBack();
		},
		// 配合 share-chat-behavior 使用
		_changeChatsRemind(chat) {
			let chatsRemind = this.data.chatsRemind;
			for(let i = 0, chatRemind; i < chatsRemind.length; i++) {
				chatRemind = chatsRemind[i];
				if(chatRemind.chat.id === chat.id) {
					let key = `chatsRemind[${i}].chat`;
					this.setData({
						[key]: chat
					})
					// break;
				}
			}
		},
		// 配合 share-chat-behavior 使用
		_removeChatsRemind(chat) {
			let chatsRemind = this.data.chatsRemind;
			for(let i = 0, chatRemind; i < chatsRemind.length; i++) {
				chatRemind = chatsRemind[i];
				console.log(chatRemind, chat)
				if(chatRemind.chat.id === chat.id) {
					console.log(chatsRemind)
					chatsRemind.splice(i, 1);
					this.setData({
						chatsRemind
					})
					i--;
					// break;
				}
			}
		},
		// 点击缩略图后，打开说说具体内容
		handleSwitchChat(e) {
			if(typeof this._handleCloseSwitchChat === 'function')
				this._handleCloseSwitchChat();
			let {index} = e.currentTarget.dataset;
			let key = `chatsRemind[${index}].open`;
			this.setData({
				[key]: true,
				pageNameCurrent: +(this.data.chatsRemind[index].chat.owner === app.globalData.owner),
			})
			this._handleCloseSwitchChat = () => {
				this.setData({
					[key]: false
				})
				delete this._handleCloseSwitchChat;
			}
		},
		
		// 加载数据
		onLoad: async function() {
			let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
			let chatsRemind = [];
			let anames = app.globalData.anames;
			console.log(JSON.parse(wx.getStorageSync('chatsRemind') || JSON.stringify([])))
			// 主动 delete 跟自己有关的消息
			JSON.parse(wx.getStorageSync('chatsRemind') || JSON.stringify([])).forEach(item => {
				let chat = item.chat;
				console.log(item)
				if(chat.pic.owner !== owner && item.toUser !== owner)
					return;
				util.myRequest({
					url: item.url,
					header: {Authorization: 'Token ' + token},
					method: 'DELETE'
				})
				.then(res => console.log(res));
				let res = {};
				res.remind = {
					title: anames[item.fromUser % anames.length].name + ['评论', '回复'][+(item.toUser === owner)] + '你',
					content: item.content,
					contentShow: item.content.length < 10? item.content: item.content.substr(0, 10) + '...',
				}
				res.content = {
					title: '洞主',
					content: chat.pic.content,
					contentShow: chat.pic.content.length < 10? chat.pic.content: chat.pic.content.substr(0, 10) + '...',
				}
				res.open = false;
				let idx = 0;
				chat.comments.forEach(item => {
					item.title = util.getCommentTitle(chat.owner, item.fromUser, item.toUser, owner);
					item.oldIndex = idx++;
				});
				chat.comments = chat.comments.filter(item => {
					return chat.owner === owner 
						|| item.fromUser === owner
						|| item.toUser === owner
						|| (item.fromUser === item.toUser && item.fromUser === chat.owner);
				})
				chat.options = chat.owner === owner
					? [
						{ icon: "/src/image/option-power.svg", content: "权限" },
						{ icon: "/src/image/option-delete.svg", content: "删除" },
					]
					: [
						{ icon: "/src/image/option-report.svg", content: "举报" },
					];
				res.chat = chat;
				console.log(res)
				chatsRemind.push(res);
			});
			wx.setStorageSync('chatsRemind', JSON.stringify([]));
			console.log(chatsRemind)

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
				chatsRemind,
				chats: JSON.parse(wx.getStorageSync('chats'))
			})
		}
	}
})
