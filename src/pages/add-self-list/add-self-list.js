const app = getApp();
const util = require("../../utils/util");
const store = require("../../store/store");
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
				"/src/image/menu-self-list6.svg",
			],
		},
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		listTitle: "",
		show: false,
		selectedIcon: 0,
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 检查输入名是否合法，然后保存数据
		handleEnsure: async function () {
			if (!this.data.listTitle.length) {
				this.setData({
					show: true,
				});
				return;
			}
			// 如果是覆盖清单，则执行其他方法
			if(this.data.edit) {
				await this._changeCurrentList();
				return;
			}
			// 如果名称重复，返回
			for(let list of this.data.lists) {
				if(list.title === this.data.listTitle) {
					wx.showToast({
						title: '该清单已存在，请勿重复添加',
						duration: 400,
						mask: true
					})
					setTimeout(() => {
						this.handleBack();
					}, 400);
					return;
				}
			}
			wx.showLoading({
				title: "正在保存数据...",
				mask: true,
			});
			let { owner, token } = await util.getTokenAndOwner(
				app.globalData.url + "login/login/"
			);
			let list = {
				title: this.data.listTitle,
				icon: this.properties.listIcon[this.data.selectedIcon],
			};
			await util.myRequest({
				url: app.globalData.url + "check/taglist/?owner=" + JSON.stringify(owner),
				header: { Authorization: "Token " + token },
				method: "POST",
				data: util.formatListsFromLocalToSql([list], { owner })[0],
			});
			(
				await store.getDataFromSqlByUrl(
					app.globalData.url + "check/taglist/?owner=" + JSON.stringify(owner),
					{ token }
				)
			).forEach(listSql => {
				if (listSql.tag === list.title) list.urlSql = listSql.url;
			});
			let lists = this.data.lists;
			lists.push(list);
			wx.setStorageSync("lists", JSON.stringify(lists));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: "已完成",
						duration: 800,
					});
				},
			});
			this.handleBack();
		},
		// 删除清单
		handleDelete: async function () {
			// 如果是新建清单，直接返回上一个页面
			if(!this.data.edit) {
				this.handleBack();
				return;
			}
			// 删除原来的清单
			let lists = this.data.lists;
			wx.showLoading({
				title: "正在保存数据...",
				mask: true,
			});
			let { owner, token } = await util.getTokenAndOwner(app.globalData.url + "login/login/");
			let urlSql, res = [];
			for(let list of lists) {
				if(list.title === this.data.readyTitle) {
					urlSql = list.urlSql;
					continue;
				}
				res.push(list);
			}
			await util.myRequest({
				url: urlSql,
				header: {Authorization: 'Token ' + token},
				method: 'DELETE'
			})
			.then(res => console.log(res));
			wx.setStorageSync('lists', JSON.stringify(res));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: "已完成",
						duration: 800,
					});
				},
			});
			this.handleBack();

		},
		dialogClose: function () {
			this.setData({
				show: false,
			});
		},
		// 点击更换被选 icon
		handleSelectedIcon: function (e) {
			this.setData({
				selectedIcon: e.currentTarget.dataset.index,
			});
		},
		// 输入
		input: function () {},
		// 返回上一页面
		handleBack: function () {
			wx.navigateBack();
		},
		// 更改当前的 list
		async _changeCurrentList() {
			let lists = this.data.lists;
			// 如果名称重复，返回
			for(let list of lists) {
				if(list.title === this.data.listTitle && this.data.listTitle !== this.data.readyTitle) {
					wx.showToast({
						title: '该清单已存在，请勿重复添加',
						duration: 400,
						mask: true
					})
					setTimeout(() => {
						this.handleBack();
					}, 400);
					return;
				}
			}
			wx.showLoading({
				title: "正在保存数据...",
				mask: true,
			});
			let { owner, token } = await util.getTokenAndOwner(app.globalData.url + "login/login/");
			let urlSql;
			for(let list of lists) {
				if(list.title === this.data.readyTitle) {
					list.title = this.data.listTitle;
					list.icon = this.properties.listIcon[this.data.selectedIcon];
					urlSql = list.urlSql;
					break;
				}
			}
			await util.myRequest({
				url: urlSql,
				header: {Authorization: 'Token ' + token},
				method: 'PUT',
				data: {
					tag: this.data.listTitle,
					icon: this.properties.listIcon[this.data.selectedIcon],
					owner: app.globalData.url + 'login/user/' + app.globalData.owner + '/',
				}
			})
			.then(res => console.log(res));
			wx.setStorageSync('lists', JSON.stringify(lists));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: "已完成",
						duration: 800,
					});
				},
			});
			this.handleBack();
		},
		onLoad: function (options) {
			// 如果 edit 为 true，则将结果修改至对应 title 的 list
			let edit = JSON.parse(options.edit || JSON.stringify(false));
			if(edit) {
				let list = JSON.parse(options.list);
				let selectedIcon = 0;
				for(let i = 0; i < this.data.listIcon.length; i++) {
					if(this.data.listIcon[i] === list.icon)
						selectedIcon = i;
				}
				this.setData({
					readyTitle: list.title,
					edit,
					listTitle: list.title,
					selectedIcon,
				})
			}
			// 设置机型相关信息
			let app = getApp();
			this.setData({
				navHeight: app.globalData.navHeight,
				navTop: app.globalData.navTop,
				windowHeight: app.globalData.windowHeight,
				windowWidth: app.globalData.windowWidth,
				lists: JSON.parse(wx.getStorageSync('lists')),
			});
		},
	},
});
