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
		// 该说说
		chat: Object,
		// 功能的选项，每个包含 {icon, content}
		options: Array,
		// 是否禁用评论输入功能
		disabled: {
			type: Boolean,
			value: false
		},
		// 评论文字最大长度
		maxlength: {
			type: Number,
			value: 100
		},
		// 最大列宽
		componentWidthMax: Number
	},

	computed: {
		date(data) {
			return util.dateInToOut(data.chat.pic.date);
		},
		chatFilter(data) {
			let owner = app.globalData.owner;
			let chat = JSON.parse(JSON.stringify(data.chat));
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
			return chat;
		},
		// 评论输入框的占位字符
		commnetPlaceHolder(data) {
			if(data.replyIndex === -1)
				return '请输入...';
			let {fromUser, toUser} = data.chatFilter.comments[data.replyIndex];
			return fromUser === app.globalData.owner
				? '请输入...'
				: ' 回复 ' + 
				((data.chat.owner === fromUser)
					? '洞主'
					: util.getCommentTitle(
							data.chat.owner, 
							fromUser, 
							toUser,
							app.globalData.owner, 
							data.chat.pic.name,
						).split(' 回复 ')[0]);
		},
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		chatShow: false,
		optionsShow: false,
		commentValue: '',
		// -1 代表洞主
		replyIndex: -1,
		commentFocus: false,
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 打开说说的功能区
		handleShowOptions(e) {
			this.setData({
				optionsShow: !this.data.optionsShow
			})
		},
		// 点击相关功能，告诉父组件
		handleSelectOption(e) {
			let index = e.currentTarget.dataset.index;
			this.triggerEvent('handleSelectOption', {
				index,
				chatId: this.data.chatFilter.id
			});
			this.setData({
				optionsShow: !this.data.optionsShow
			})
		},
		// 展示聊天区
		handleShowChat(e) {
			// 如果输入内容为空，则清除选中回复的人
			let replyIndex = this.data.commentValue? this.data.replyIndex: -1;
			this.setData({
				chatShow: !this.data.chatShow,
				replyIndex,
			})
		},
		// 收起键盘
		handleInputBlur(e) {
			this.setData({
				commentFocus: false
			})
		},
		// 点击回复，显示回复谁，并拉起键盘
		handleReplyWho(e) {
			let {index} = e.currentTarget.dataset;
			console.log(index)
			this.setData({
				replyIndex: index,
				commentFocus: true,
			});
		},
		// 发送评论
		handleEnsureComment(e) {
			let {chatFilter, replyIndex, commentValue} = this.data;
			let {anames, owner} = app.globalData;
			let title = replyIndex === -1
				? util.getCommentTitle(chatFilter.owner, owner, owner, owner, chatFilter.pic.name)
				: util.getCommentTitle(
					chatFilter.owner, 
					chatFilter.comments[replyIndex].fromUser, 
					chatFilter.comments[replyIndex].toUser, 
					owner,
					chatFilter.pic.name,
				);
			let comment = {
				id: util.getUniqueId(),
				title,
				content: commentValue,
				chatId: chatFilter.id,
				fromUser: app.globalData.owner,
				toUser: replyIndex === -1
					?	app.globalData.owner
					: chatFilter.comments[replyIndex].fromUser
			}
			this.triggerEvent('handleEnsureComment', {
				comment,
				chatId: chatFilter.id
			})
			// 清空输入框
			this.setData({
				commentValue: '',
				replyIndex: -1
			})
		},
		// 输入评论
		handleInputComment(e) {
			this.setData({
				commentValue: e.detail.value
			})
		},
	},
	pageLifetimes: {
		// 加载数据
		show: function() {
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
			})
		}

	}
})
