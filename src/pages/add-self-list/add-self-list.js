const util = require("../../utils/util");
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		listIcon: {
			type: Array,
			value: [
				"/src/image/menu-self-list2.svg",
				"/src/image/menu-self-list3.svg",
				"/src/image/menu-self-list4.svg",
				"/src/image/menu-self-list5.svg",
				"/src/image/menu-self-list6.svg"
			]
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		listTitle: "",
		show: false,
		selectedIcon: 0
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 检查输入名是否合法，然后保存数据到本地
		ensure: function() {
			if(!this.data.listTitle.length) {
				this.setData({
					show: true
				});
				return;
			}
			// 触发事件并回退上一个页面
			const eventChannel = this.getOpenerEventChannel();
			eventChannel.emit("_handleSaveData", {
				lists: [{ 
					title: this.data.listTitle, 
					icon: this.properties.listIcon[this.data.selectedIcon] 
				}]
			});
			wx.navigateBack()
		},
		dialogClose: function() {
			this.setData({
				show: false
			});
		},
		// 点击更换被选 icon
		handleSelectedIcon: function(e) {
			this.setData({
				selectedIcon: e.currentTarget.dataset.index
			});
		},
		// 输入
		input: function() {},
		// 返回上一页面
		handleBack: function() {
			wx.navigateBack();
		},
		onLoad: function() {
			// 设置机型相关信息
			let app = getApp();
			this.setData({
				navHeight: app.globalData.navHeight,
				navTop: app.globalData.navTop,
				windowHeight: app.globalData.windowHeight,
				windowWidth: app.globalData.windowWidth
			});
		},
		onUnload: function() {}
	}
})
