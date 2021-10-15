// 仅用于配合 share-message 组件的使用
const computedBehavior = require("miniprogram-computed").behavior;
const app = getApp();
const util = require("../utils/util");
const store = require("../store/store");
module.exports = Behavior({
	behaviors: [computedBehavior],
	computed: {
		
	},
	methods: {
		// 说说的功能区，根据当前页面决定功能
		handleSelectOption(e) {
			let { pageNameCurrent } = this.data;
			let {index, chatId} = e.detail;
			// “树洞区”则[举报]功能
			if (!pageNameCurrent) {
				if (!index) {
					this._handleReport(chatId);
				}
			}
			// “个人空间”则[权限，删除]功能
			else if (pageNameCurrent === 1) {
				if (!index) {
					this._handleChangePower(chatId);
				} else if (index === 1) {
					this._handleDeleteMessage(chatId);
				}
			}
		},
		// 举报说说
		_handleReport(chatId) {
			// 确认
			let ensure = async () => {
				// 发送数据到后端
				let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
				let chats = this.data.chats, idx;
				for(let i = 0; i < chats.length; i++) {
					if(chats[i].id === chatId) {
						idx = i;
						break;
					}
				}
				// 这块是为了 message-remind 页面
				if(typeof this._changeChatsRemind === 'function')
					this._changeChatsRemind(chats[idx]);
				console.log(JSON.stringify({
					report_from_user: owner,
					report_to_user: chats[idx].owner,
					report_pic_url: chats[idx].urlSql,
					reoprt_text: chats[idx].pic.content,
				}))
				util.myRequest({
					url: app.globalData.url + 'notice/report/',
					header: {Authorization: 'Token ' + token},
					method: 'POST',
					data: {
						report_from_user: owner,
						report_to_user: chats[idx].owner,
						report_pic_url: chats[idx].urlSql,
						reoprt_text: chats[idx].pic.content,
					}
				})
				.then(res => console.log(res))
				this.setData({
					optionShow: false,
				});
				wx.setStorageSync('chats', JSON.stringify(this.data.chats));
			};
			let cancel = async () => {
				this.setData({
					optionShow: false,
				});
			};
			this._optionButtons = [cancel, ensure];
			this.setData({
				optionShow: true,
				optionButton: [{ text: "取消" }, { text: "确认" }],
				optionDialogContent: "你确定要举报该状态违规吗？",
			});
		},
		// 改变说说分享范围
		_handleChangePower(chatId) {
			// 确认
			let ensure = async () => {
				wx.showLoading({
					title: '正在同步数据...',
					mask: true
				})
				let chats = this.data.chats, idx;
				for(let i = 0; i < chats.length; i++) {
					if(chats[i].id === chatId) {
						idx = i;
						if(this._currentShareRangeIndex == undefined)
							this._currentShareRangeIndex = 0;
						chats[idx].pic.shareRange = this._currentShareRangeIndex;
						break;
					}
				}
				// 这块是为了 message-remind 页面
				if(typeof this._changeChatsRemind === 'function')
					this._changeChatsRemind(chats[idx]);

				// put / post
				let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
				await store.saveChatsToSql([chats[idx]], {owner, token});
				// 改变选中的
				this.setData({
					shareRangeShow: false,
					[`chats[${idx}].pic.shareRange`]: this._currentShareRangeIndex
				});
				wx.setStorageSync('chats', JSON.stringify(chats));
				wx.hideLoading({
					success: () => {
						wx.showToast({
							title: "已完成",
							duration: 800,
						});
					},
				});
			};
			let cancel = async () => {
				this.setData({
					shareRangeShow: false,
				});
			};
			this._optionButtons = [cancel, ensure];
			this.setData({
				shareRangeShow: true,
				optionButton: [
					{ text: "取消", type: "default" },
					{ text: "确定", type: "primary" },
				],
				optionDialogContent: ["大家的树洞", "仅自己可见"],
			});
		},
		// 删除说说
		_handleDeleteMessage(chatId) {
			// 确认
			let ensure = async () => {
				wx.showLoading({
					title: '正在删除...',
					mask: true
				})
				let chats = this.data.chats, idx;
				console.log(chats, chatId)
				for(let i = 0; i < chats.length; i++) {
					if(chats[i].id === chatId) {
						idx = i;
						break;
					}
				}
				// 这块是为了 message-remind 页面
				if(typeof this._removeChatsRemind === 'function')
					this._removeChatsRemind(chats[idx]);
				
				// put / post
				let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
				console.log(chats[idx])
				await util.myRequest({
					url: chats[idx].urlSql,
					header: {Authorization: 'Token ' + token},
					method: 'DELETE'
				})
				.then(res => console.log(res))
				chats.splice(idx, 1);
				this.setData({
					optionShow: false,
					chats,
				});
				wx.setStorageSync('chats', JSON.stringify(chats));
				wx.hideLoading({
					success: () => {
						wx.showToast({
							title: "已完成",
							duration: 800,
						});
					},
				});
			};
			let cancel = async () => {
				this.setData({
					optionShow: false,
				});
			};
			this._optionButtons = [cancel, ensure];
			this.setData({
				optionShow: true,
				optionButton: [{ text: "取消" }, { text: "删除" }],
				optionDialogContent: "删除该状态？",
			});
		},
		// 弹窗 buttons 功能
		async handleDialogButtons(e) {
			let { index } = e.detail;
			await this._optionButtons[index]();
			delete this._optionButtons;
			delete this._currentShareRangeIndex;
		},
		// 记录选择的分享范围
		handleChangeShareRange(e) {
			this._currentShareRangeIndex = e.detail.value[0];
		},
		// 发送评论
		async handleEnsureComment(e) {
			// 本应该后续检查是否 post 成功，这里预留一个
			// 先改变本地，然后异步同步到后端
			// 这里同步不会 get ，只是 post
			let { comment: commentLocal, chatId } = e.detail;
			let chats = this.data.chats, chat;
			console.log(commentLocal, chatId)
			for(let i = 0; i < chats.length; i++) {
				chat = chats[i];
				if(chat.id === chatId) {
					chat.comments.push(commentLocal);
					let key = `chats[${i}].comments`;
					this.setData({
						[key]: chat.comments
					})
					// 这块是为了 message-remind 页面
					if(typeof this._changeChatsRemind === 'function')
						this._changeChatsRemind(chat);
					break;
				}
			}
			// 下面是 post
			let commentSql = {
				comment_uid: util.getUniqueId(),
				pic: chat.urlSql,
				content: commentLocal.content,
				from_user: app.globalData.url + 'login/user/' + commentLocal.fromUser + '/',
				to_user: app.globalData.url + 'login/user/' + commentLocal.toUser + '/'
			};
			let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
			util.myRequest({
				url: app.globalData.url + 'community/comment/',
				header: {Authorization: "Token " + token},
				method: 'POST',
				data: commentSql
			})
			.then(res => console.log(res))
			// 消息提醒
			// 回复别人，接收者为他
			if(commentLocal.fromUser !== commentLocal.toUser) {
				util.myRequest({
					url: app.globalData.url + 'notice/notice/',
					header: {Authorization: 'Token ' + token},
					method: 'POST',
					data: {
						report_from_user: commentLocal.fromUser,
						report_to_user: commentLocal.toUser,
						report_json: {
							receiver: commentLocal.toUser,
							content: commentLocal.content,
							chat: chat
						}
					}
				})
			}
			// 评论说说
			else if(commentLocal.fromUser !== chat.owner) {
				util.myRequest({
					url: app.globalData.url + 'notice/notice/',
					header: {Authorization: 'Token ' + token},
					method: 'POST',
					data: {
						report_from_user: commentLocal.fromUser,
						report_to_user: commentLocal.toUser,
						report_json: {
							receiver: chat.owner,
							content: commentLocal.content,
							chat: chat
						}
					}
				})
			}
		},
	}
})