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
		chatContent: '',
		maxLength: 800,
		// 下面的功能区
		options: [
			{icon: '/src/image/add-chat-option0.svg', content: '添加今日回顾单'},
			{icon: '/src/image/add-chat-option1.svg', content: '选择匿名身份'},
			{icon: '/src/image/add-chat-option2.svg', content: '分享范围'}
		],
		// 当弹出键盘时，显示下面的功能框
		bottomOptionsShow: false,
		// 功能框距离下面的距离 px
		optionsBottom: 0,
		reviewShow: false,
		// 缩略图
		review: {
			starsNum: 0,
			// 每个元素为 {content: String}
			tasks: [{content: 111}]
		},
		repeatTipShow: false,
		repeatTipTop: 0,
		// 待选择的匿名，每个元素{icon, name}
		anameRange: [
			{icon: '/src/image/anameRed.svg', name: '小红'},
			{icon: '/src/image/anameGreen.svg', name: '小绿'},
			{icon: '/src/image/anameYellow.svg', name: '小黄'},
			{icon: '/src/image/anameBlue.svg', name: '小蓝'}
		],
		// 当前选择的匿名的 index
		currentAnameIndex: 0,
		anameShow: false,
		buttons: [
			{text: '取消', type: 'default'},
			{text: '确定', type: 'primary'}
		],
		// 分享范围，每个元素{content}
		shareRange: [
			{content: '大家的树洞'},
			{content: '仅自己可见'}
		],
		// 当前选择的分享的 index
		currentShareIndex: 0,
		shareShow: false,
	},

	computed: {

	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 绑定输入
		handleInput(e) {
			this.setData({
				chatContent: e.detail.value
			})
		},
		// 弹出键盘
		handleShowKeyBoard(e) {
			// 因为 handleShowKeyBoard 会触发两次，且两次只有第一次高度正常，所以需要特殊保存
			this._keyBoardHeight = Math.max(this._keyBoardHeight || 0, e.detail.height);
			this.setData({
				optionsBottom: this._keyBoardHeight,
				bottomOptionsShow: true
			})
		},
		// 收起键盘
		handleCloseKeyBoard(e) {
			// 因为 handleShowKeyBoard 会触发两次，覆盖掉该事件，所以需要延迟调用该方法
			setTimeout(() => {
				this.setData({
					bottomOptionsShow: false,
					optionsBottom: 0
				})
			}, 0);
		},
		// 触发“添加今日回顾清单”
		handleAddReviewAbridge(e) {
			// 如果已经添加了，显示不能重复添加
			if(this.data.reviewShow) {
				let {windowHeight, navHeight, ratio} = this.data;
				this.setData({
					repeatTipShow: true,
					repeatTipTop: windowHeight - navHeight - (this._keyBoardHeight || 0) - (76 + 88) / ratio
				});
				// 3000ms 后消失，如果期间再次点击，则重新计算时间
				if(this._repeatTipTimeId)
					clearTimeout(this._repeatTipTimeId);
				this._repeatTipTimeId = setTimeout(() => {
					this.setData({
						repeatTipShow: false
					});
					delete this._repeatTipTimeId;
				}, 3000);
				return;
			}
			this.setData({
				reviewShow: true
			})
		},
		// 关闭缩略图
		handleCloseReviewAbridge(e) {
			this.setData({
				reviewShow: !this.data.reviewShow
			})
		},
		// 弹出“匿名选择”
		handleShowAnameSelect(e) {
			this.setData({
				anameShow: true
			})
		},
		// 关闭“匿名选择”
		handleCloseAnameSelect() {
			this.setData({
				anameShow: false
			})
		},
		// 匿名 buttontap 
		handleAnameButtonTap(e) {
			if(e.detail.index) {
				this.setData({
					currentAnameIndex: this._currentAnameIndex
				})
			}
			this.handleCloseAnameSelect();
			delete this._currentAnameIndex;
		},
		// 改变匿名
		handleChangeAname(e) {
			this._currentAnameIndex = e.detail.value[0];
		},
		//  弹出“分享范围”
		handleShowShareSelect(e) {
			this.setData({
				shareShow: true
			})
		},
		// 关闭“分享范围”
		handleCloseShareSelect() {
			this.setData({
				shareShow: false
			})
		},
		// 分享 buttontap 
		handleShareButtonTap(e) {
			if(e.detail.index) {
				this.setData({
					currentShareIndex: this._currentShareIndex
				})
			}
			this.handleCloseShareSelect();
			delete this._currentShareIndex;
		},
		// 改变分享范围
		handleChangeShare(e) {
			this._currentShareIndex = e.detail.value[0];
		},
		
		// 加载数据
		onLoad: function() {
			// 设置机型相关信息
			let {navHeight, navTop, windowHeight, windowWidth, bottomLineHeight} = app.globalData;
			
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
