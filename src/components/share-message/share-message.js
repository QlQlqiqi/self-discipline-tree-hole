const computedBehavior = require("miniprogram-computed").behavior;
const util = require("../../utils/util");
Component({
	behaviors: [computedBehavior],
	/**
	 * 组件的属性列表
	 */
	properties: {
		// 头像的 url
		headIcon: String,
		// 用户名称
		name: String,
		// 说说内容
		content: String,
		// 世界时格式的时间
		date: String,
		// 功能的选项，每个包含 {icon, content}
		options: Array,
		// 评论内容，每个包含 {title, content}
		chats: Array,
		// 评论输入框的占位字符
		commnetPlaceHolder: {
			type: String,
			value: '请输入...'
		},
		// 是否禁用评论输入功能
		disabled: {
			type: Boolean,
			value: false
		},
		// 评论文字最大长度
		maxlength: {
			type: Number,
			value: 100
		}
	},

	computed: {
		time(data) {
			return util.dateInToOut(data.date);
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		chatShow: false,
		optionsShow: false,
		commentValue: ''
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
			this.triggerEvent('handleSelectOption', {index});
			this.setData({
				optionsShow: !this.data.optionsShow
			})
		},
		// 展示聊天区
		handleShowChat(e) {
			this.setData({
				chatShow: !this.data.chatShow
			})
		},
		// 发送评论
		handleEnsureComment(e) {
			this.triggerEvent('handleEnsureComment', {
				content: this.data.commentValue
			})
			
			// 这里发送给后台，并清空输入框
			this.setData({
				commentValue: ''
			})
		},
		// 输入评论
		handleInputComment(e) {
			this.setData({
				commentValue: e.detail.value
			})
		}
	}
})
