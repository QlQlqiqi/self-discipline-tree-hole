const computedBehavior = require("miniprogram-computed").behavior;
const app = getApp();
const util = require("../../utils/util");
const store = require('../../store/store');
Component({
	behaviors: [computedBehavior],
	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 需要展示的任务
		tasks: [],
		// 标题
		pageName: "",
		taskItemColor: ['#D01929', '#F0AD4D', '#CF92FF', '#BABBBA']
	},

	computed: {
		showTasks: function(data) {
			let todayDate = util.getDawn(0), tomorrowDate = util.getDawn(1);
			let res = [];
			// 过期 / 删除任务
			if(data.pageName === '过期 / 删除任务')
				res = data.tasks.filter(item => item.date.localeCompare(todayDate) < 0 || item.delete);
			// 今日待办
			else if(data.pageName === '今日待办')
				res = data.tasks.filter(item => 
					item.date.localeCompare(tomorrowDate) < 0 
					&& item.date.localeCompare(todayDate) >= 0
					&& !item.delete
				);
			// 将来做
			else if(data.pageName === '将来做')
				res = data.tasks.filter(item => 
					item.date.localeCompare(tomorrowDate) >= 0 
					&& !item.delete
				);
			// 已完成
			else if(data.pageName === '已完成')
				res = data.tasks.filter(item => 
					item.finish
					&& !item.delete
				);
			// 各种清单
			else 
				res = data.tasks.filter(item => 
					item.date.localeCompare(todayDate) >= 0
					&& !item.list.title.localeCompare(data.pageName)
					&& !item.delete
				);
			res.sort((a, b) => a.date.localeCompare(b.date) );
			return res;
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		// 获取数据
		onLoad: function(options) {
			this.setData({
				navHeight: app.globalData.navHeight,
				navTop: app.globalData.navTop,
				windowHeight: app.globalData.windowHeight,
				windowWidth: app.globalData.windowWidth,
				pageName: JSON.parse(options.pageName || JSON.stringify("$")),
				isDelete: JSON.parse(options.isDelete || JSON.stringify(false)),
				disabled: JSON.parse(options.disabled || JSON.stringify(false))
			});
		},
		// 返回上一页面
		handleBack: function() {
			wx.navigateBack();
		},
		// 新增任务
		addTask: function(e) {
			let task = {
				id: util.getUniqueId(),
				priority: 0,
				repeat: 0,
				date: util.formatDate(new Date()),
				remind: 0,
				finish: false,
				content: "",
				desc: "",
				list: { title: "个人清单", icon: "/src/image/menu-self-list0.svg" },
				delete: false,
				rating: 1,
				feeling: '',
				finishDate: util.formatDate(new Date())
			};
			let lists = JSON.parse(wx.getStorageSync('lists'));
			// 默认 list 
			for(let list of lists) {
				if(list.title === this.data.pageName) 
					task.list = list;
			}
			wx.navigateTo({
				url: '/src/pages/editor/editor?taskId=' + JSON.stringify(task.id) 
					+ '&task=' + JSON.stringify(task)
			});
		},
		// 编辑每一个任务
		handleEditor: function(e) {
			let taskId = e.currentTarget.dataset.id;
			wx.navigateTo({
				url: '/src/pages/editor/editor?taskId=' + JSON.stringify(taskId)
					+ "&isEditorTask=" + JSON.stringify(true)
			})
		},
		// 控制任务完成与否
		handleTaskFinish: async function(e) {
			wx.showLoading({
				title: '正在保存数据...',
				mask: true
			})
			let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
			// 修改 finish
			let tasks = [];
			for(let item of this.data.tasks) {
				if(item.id === e.currentTarget.dataset.id) {
					item.finish = !item.finish;
					if(item.finish)
						item.finishDate = util.formatDate(new Date());
					await store.saveTasksToSql([item], this.data.lists, {owner, token});
				}
				tasks.push(item);
			}
			this.setData({
				tasks: tasks
			});
			wx.setStorageSync('tasks', JSON.stringify(tasks));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: '已完成',
						duration: 800
					})
				},
			})
		},
		// 删除清单，显示弹窗询问是否删除
		handleDeleteList: function(e) {
			this.setData({
				showDialog: true,
				dialogMsg: "是否删除该清单？（清单内任务自动进入「个人清单」内）"
			});
			// 如果“确定”则执行下面
			this._handleDialogDefine = async function(_this) {
				wx.showLoading({
					title: '正在保存数据...',
					mask: true
				})
				let tasks = [], lists = [], tasksSave = [], listDelete = null;
				for(let list of _this.data.lists)
					list.title === _this.data.pageName? listDelete = list: lists.push(list);
				for(let task of _this.data.tasks) {
					if(task.list.title === _this.data.pageName) {
						task.list = {
							icon: "/src/image/menu-self-list0.svg",
							title: "个人清单"
						};
						tasksSave.push(task);
					}
					tasks.push(task);
				}
				let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
				await store.saveTasksToSql(tasksSave, lists, {owner, token});
				await util.myRequest({
					url: listDelete.urlSql,
					header: { Authorization: 'Token ' + token },
					method: 'DELETE'
				})
				_this.setData({
					tasks: tasks,
					lists: lists
				});
				wx.setStorageSync('tasks', JSON.stringify(tasks));
				wx.setStorageSync('lists', JSON.stringify(lists));
				delete _this._handleDialogDefine;
				wx.hideLoading({
					success: () => {
						wx.showToast({
							title: '已完成',
							duration: 800
						})
					},
				})
				wx.navigateBack();
			}
		},
		// 当点击弹窗“确定”时，关闭弹窗，告诉父组件删除清单及任务，并返回上一层
		handleDialogButtonTap: async function(e) {
			let index = e.detail.index;
			if(index === 1 && typeof this._handleDialogDefine === "function")
				await this._handleDialogDefine(this);
			else if(!index && typeof this._handleDialogCancel === "function")
				await this._handleDialogCancel(this);
			this.setData({
				showDialog: false
			});
		}
	},

	pageLifetimes: {
		show: function() {
			this.setData({
				tasks: JSON.parse(wx.getStorageSync('tasks')),
				lists: JSON.parse(wx.getStorageSync('lists'))
			})
		}
	}
})
