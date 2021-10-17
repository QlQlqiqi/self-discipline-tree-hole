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
		chatsRemind: [],
		// chatsRemind: [{
		// 	remind: {
		// 		title: '小红评论你',
		// 		content: '哈哈哈哈哈哈哈哈哈啊实打实的',
		// 		contentShow: '哈哈哈哈哈哈哈...'
		// 	},
		// 	content: {
		// 		title: '洞主回复你',
		// 		content: '啊实打实大苏打实打实打算',
		// 		contentShow: '啊实打实大...'
		// 	},
		// 	open: false,
		// 	chat: {
		// 		id: 11,
		// 		owner: 1,
		// 		pic: {
		// 			headIcon: "/src/image/head-icon-yellow.svg",
		// 			name: "黄黄",
		// 			date: "2020-12-21T12:12:12Z",
		// 			content: "说说",
		// 		},
		// 		reviewAbridge: {},
		// 		options: [
		// 			{ icon: '/src/image/option-power.svg', content: '权限' },
		// 			{ icon: '/src/image/option-delete.svg', content: '删除' }
		// 		],
		// 		comments: [
		// 			{ id: 1, title: "洞主", content: "哈哈" },
		// 			{ id: 2, title: "洞主", content: "哈哈" },
		// 		],
		// 	}
		// }],
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
				console.log(chatRemind, chat)
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
		// 获取数据
		async _getChatsAndChatsRemindFromSql() {
			let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
			let anames = app.globalData.anames;
			// 说说
			let chatsSql = await store.getDataFromSqlByUrl(app.globalData.url + 'community/blog/', {owner, token});
			let chats = util.formatChatsFromSqlToLocal(chatsSql);
			chats.forEach(item => {
				item.id = util.getUniqueId();
			});
			// 消息提示
			let chatsRemindSql = await store.getDataFromSqlByUrl(app.globalData.url + 'notice/notice/', {owner, token});
			let chatsRemind = chatsRemindSql.filter(item => {
				return item.report_json.receiver === owner;
			}).map(item => {
				return {
					fromUser: item.report_from_user,
					toUser: item.report_to_user,
					chat: item.report_json.chat,
					content: item.report_json.content,
					url: item.url,
				}
			})
			wx.setStorageSync('chatsRemind', JSON.stringify(chatsRemind));
			wx.setStorageSync('chats', JSON.stringify(chats));
		},
		// 处理并删除消息提示
		async _formatAndDeleteChatsRemind() {
			let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
			let chatsRemind = JSON.parse(wx.getStorageSync('chatsRemind'));
			console.log(chatsRemind)
			let anames = app.globalData.anames;
			// 主动 delete 跟自己有关的消息，并转化为本地格式
			chatsRemind.forEach(item => {
				let chat = item.chat;
				util.myRequest({
					url: item.url,
					header: {Authorization: 'Token ' + token},
					method: 'DELETE'
				})
				.then(res => console.log(res));
				item.remind = {
					title: anames[item.fromUser % anames.length].name + ['评论', '回复'][+(item.toUser === owner)] + '你',
					content: item.content,
					contentShow: item.content.length < 10? item.content: item.content.substr(0, 10) + '...',
				}
				item.content = {
					title: '洞主',
					content: chat.pic.content,
					contentShow: chat.pic.content.length < 10? chat.pic.content: chat.pic.content.substr(0, 10) + '...',
				}
				item.open = false;
				let idx = 0;
				chat.comments.forEach(item => {
					item.title = util.getCommentTitle(chat.owner, item.fromUser, item.toUser, owner, chat.pic.name);
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
					item.chat = chat;
				console.log(item)
			});
			wx.setStorageSync('chatsRemind', JSON.stringify(chatsRemind));
			console.log(chatsRemind)
		},
		// 删除评论 dialog
		handleDeleteDialogShow(e) {
			let {deleteShow, chatId, commentId} = e.detail;
			this.setData({
				deleteShow,
				deleteChatId: chatId,
				deleteCommentId: commentId,
			})
		},
		// 删除评论 dialog buttons
		handleDeleteDialog(e) {
			let {deleteChatId, deleteCommentId} = this.data;
			if(e.detail.index)
				this.handleDeleteComment({chatId: deleteChatId, commentId: deleteCommentId});
			this.setData({
				deleteShow: false
			})
		},
		
		// 加载数据
		onLoad: async function(options) {
			let refresh = JSON.parse(options.refresh || JSON.stringify(false));
			// 强制重新获取 chats 和 chatsRemind
			if(refresh) {
				wx.showLoading({
					title: '正在读取数据...',
					mask: true,
				})
				await this._getChatsAndChatsRemindFromSql();
				wx.hideLoading({
					success: () => {
						wx.showToast({
							title: "已完成",
							duration: 800,
						});
					},
				});
			}
			// 格式化 chatsRemind
			await this._formatAndDeleteChatsRemind();

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
				chatsRemind: JSON.parse(wx.getStorageSync('chatsRemind')),
				chats: JSON.parse(wx.getStorageSync('chats')),
			})
			wx.setStorageSync('chatsRemind', JSON.stringify([]));
		}
	}
})
