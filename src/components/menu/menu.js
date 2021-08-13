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
		showDialog: false
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
		// 关闭
		dialogClose: function() {
			this.setData({
				showDialog: false,
				signText: "好好学习 天天向上"
			})
		},
		blur: function(e) {
			// 如果输入为空，则提示
			if(!this.properties.signText.length) {
				this.setData({
					showDialog: true
				})
			}
			else {
				this.triggerEvent("handleSignTextEnsure", {
					signText: e.detail.value
				})
			}
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
