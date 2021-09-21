const app = getApp();
const util = require("../../utils/util");
const store = require('../../store/store');
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
		// 检查输入名是否合法，然后保存数据
		handleEnsure: async function() {
			if(!this.data.listTitle.length) {
				this.setData({
					show: true
				});
				return;
			}
			wx.showLoading({
				title: '正在保存数据...',
				mask: true
			})
			let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
			let list = {
				title: this.data.listTitle, 
				icon: this.properties.listIcon[this.data.selectedIcon] 
			}
			await util.myRequest({
				url: app.globalData.url + 'check/taglist/?owner=' + JSON.stringify(owner),
				header: { Authorization: "Token " + token },
				method: "POST",
				data: util.formatListsFromLocalToSql([list], {owner})[0]
			});
			(await store.getDataFromSqlByUrl(app.globalData.url + 'check/taglist/', {owner, token}))
			.forEach(listSql => {
				if(listSql.tag === list.title)
					list.urlSql = listSql.url;
			})
			let lists = JSON.parse(wx.getStorageSync('lists'));
			lists.push(list);
			wx.setStorageSync('lists', JSON.stringify(lists));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: '已完成',
						duration: 800
					})
				},
			})
			this.handleBack()
		},
		// 删除清单
		handleDelete: function() {
			// 直接返回上一个页面
			this.handleBack();
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
		}
	}
})
