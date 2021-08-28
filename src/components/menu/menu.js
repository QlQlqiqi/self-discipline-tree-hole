const computedBehavior = require("miniprogram-computed").behavior;
Component({
	behaviors: [computedBehavior],
	/**
	 * 组件的属性列表
	 */
	properties: {
		// 控制 menu 出现的字段
		show: {
			type: Boolean,
			value: false
		},
		// 今日待办任务数
		todoListNum: Number,
		// 自定义清单，每个清单包含两个字段
		// icon: 前面 logo 的地址，默认 menu-self-list0.svg
		// title: 清单标题
		// id: 标识
		lists: Array,
		signText: String,
		// 菜单高度，超出增加滚动条，单位：rpx
		menuHeight: Number,
		// 底部留白高度，以 marggin-bottom 实现，单位：rpx
		menuBottomBlcakHeight: Number
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		showDialog: false,
		dialogContent: '',
		dialogTitle: '',
		trashIndex: -1,
		trashOpacity: 0
	},

	computed: {
		
	},

	watch: {
		"show": function(show) {
			if(show)
				this.showMenu();
			else this.hideMenu();
		}
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 控制 dialog 的 buttons 功能
		handleDialogButtons: function(e) {
			if(e.detail.index === 1) 
				this.triggerEvent('handleDeleteList', {
					listTitle: this.data.lists[this.data.trashIndex].title
				})
			this.setData({
				showDialog: false
			})
		},
		// 展示删除键
		handleShowTrash: function(e) {
			let index = e.currentTarget.dataset.index;
			let x = e.detail.x;
			if(x >= -10) {
				if(this.data.trashIndex === index) {
					this.setData({
						trashIndex: -1
					})
				}
			}
			else {
				this.setData({
					trashIndex: index,
					trashOpacity: (x + 10) / -10
				})
			}
		},
		// 展示菜单
		showMenu: function() {
			this.animate(".menu-wrap", [
				{ offset: 0, left: "-750rpx" },
				{ offset: 1, left: "-150rpx" }
			], 200);
		},
		// 隐藏菜单
		hideMenu: function() {
			this.animate(".menu-wrap", [
				{ offset: 0, left: "-150rpx" },
				{ offset: 1, left: "-750rpx" }
			], 200);
		},
		// 同步个性签名
		input: function(e) {
			this.triggerEvent("handleSignTextChange", {
				signText: e.detail.value
			})
		},
		blur: function(e) {
			let value = e.detail.value;
			// 如果输入为空，则提示
			if(!value) {
				value = '好好学习 天天向上';
				this.setData({
					showDialog: true,
					dialogTitle: '提示',
					dialogContent: '输入不得为空！',
					buttons: [{text: '确认'}]
				})
			}
			this.triggerEvent("handleSignTextEnsure", {
				signText: value
			})
		},
		// 触发“今日待办”事件
		handleNavigateToToday: function(e) {
			this.triggerEvent("handleNavigateToToday");
		},
		// 触发“将来做”事件
		handleNavigateToFuture: function(e) {
			this.triggerEvent("handleNavigateToFuture");
		},
		// 触发“各种清单”事件
		handleNavigateToList: function(e) {
			this.triggerEvent("handleNavigateToList", {
				title: e.currentTarget.dataset.title
			})
		},
		// 触发“删除”清单事件
		handleDeleteList: function(e) {
			// 询问是否删除
			this.setData({
				showDialog: true,
				dialogTitle: '提示',
				dialogContent: '是否删除该清单？（清单内任务自动进入[个人清单]内）',
				buttons: [{text: '取消'}, {text: '确认'}]
			})
		},
		// 触发“添加清单”事件
		handleNavigateToAddList: function(e) {
			this.triggerEvent("handleNavigateToAddList");
		},
		// 触发“已完成”事件
		handleNavigateToFinished: function(e) {
			this.triggerEvent("handleNavigateToFinished");
		},
		// 触发“过期 / 删除任务”事件
		handleNavigateToBeforeAndDelete: function(e) {
			this.triggerEvent("handleNavigateToBeforeAndDelete");
		},
		// 触发“我的分享”事件
		handleNavigateToShare: function(e) {
			this.triggerEvent("handleNavigateToShare");
		},
		some(e) {
			console.log(e)
		}
	},
	lifetimes: {
		attached: function() {
			
		}
	},
	pageLifetimes: {
		show: function() {

		}
	},
	hide: function() {
		
	}
})
