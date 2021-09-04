const computedBehavior = require('miniprogram-computed').behavior;
const util = require("../../utils/util")
Component({
	behaviors: [computedBehavior],
	options: {
		multipleSlots: true
	},
	/**
	 * 组件的属性列表
	 */
	properties: {
		
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 星星位置相关信息
		stars: [
			{ top: '70', left: '136'},
			{ top: '40', left: '216'},
			{ top: '16', left: '300'},
			{ top: '40', left: '386'},
			{ top: '70', left: '468'}
		],
		// 完成的任务
		finishedTasks: [],
		// 展示菜单
		showMenu: false,
		tasks: [],
		lists: [],
		showFeeling: false
	},

	computed: {
		// 今日事件
		todayTasks: function(data) {
			let todayDate = util.getDawn(0);
			let tommorrowDate = util.getDawn(1);
			let res = data.tasks.filter(function(item) {
				return item.date.localeCompare(todayDate) >= 0 
					&& item.date.localeCompare(tommorrowDate) < 0
					&& !item.delete;
			});
			res.sort((a, b) => a.priority !== b.priority
				? (a.priority < b.priority? -1: 1)
				: a.date.localeCompare(b.date));
			return res;
		},
		// 未来事件
		futureTasks: function(data) {
			let tommorrowDate = util.getDawn(1);
			let res = data.tasks.filter(function(item) {
				return item.date.localeCompare(tommorrowDate) >= 0
					&& !item.delete;
			});
			res.sort((a, b) => a.priority !== b.priority
				? (a.priority < b.priority? -1: 1)
				: a.date.localeCompare(b.date));
			return res;
		},
		// 今日完成的任务（包括今日完成的未来事件）
		finishedTasks: function(data) {
			let todayDate = util.getDawn(0);
			let tommorrowDate = util.getDawn(1);
			let res = data.tasks.filter(function(item) {
				return item.finish
					&& item.finishDate.localeCompare(todayDate) >= 0 
					&& item.finishDate.localeCompare(tommorrowDate) < 0
					&& !item.delete;
			});
			res.sort((a, b) => a.date.localeCompare(b.date) );
			return res;
		},
		// 展示清单
		listsShow: function(data) {
			// 个人清单第一，工作清单第二，其余自定义清单随意
			let res = [], idx = 2;
			for(let list of data.lists) {
				if(list.title === '个人清单')
					res[0] = list;
				else if(list.title === '工作清单')
					res[1] = list;
				else res[idx++] = list;
			}
			return res;
		},
		// 设定星星数量
		starsNumber: function(data) {
			// 该任务得到的分数，50% 完成度 + 30% 超时评星 + 20% 自评评星
			// 这里假设一个任务 100 满分
			let scores = 0, futureTaskNum = 0;;
			data.finishedTasks.forEach(function(task) {
				scores += 50;
				let exceedTime = ((new Date(task.finishDate)).getTime() - (new Date(task.date)).getTime() || 0) / 1000;
				// 超时 30mins 忽略不计，超时 30-60mins 四星，超时 1h-3h 三星，超时 3h-5h 两星，大于 5h 一星
				if(exceedTime <= 30 * 60)
					scores += 30;
				else if(exceedTime <= 60 * 60)
					scores += 30 * 0.8;
				else if(exceedTime <= 3 * 60 * 60)
					scores += 30 * 0.6;
				else if(exceedTime <= 5 * 60 * 60)
					scores += 30 * 0.4;
				else scores += 30 * 0.2;
				// 自评
				scores += 20 * (task.rating / 5);
				if(task.date.localeCompare(util.getDawn(1)) > 0)
					futureTaskNum++;
			});
			scores /= 100;
			let radio = scores / ((data.todayTasks.length + futureTaskNum) || 1), starsNum = 0;
			if(radio < 0.4)
				starsNum = 1;
			else if(radio < 0.6)
				starsNum = 2
			else if(radio < 0.8)
				starsNum = 3
			else if(radio < 1)
				starsNum = 4
			else starsNum = 5;
			// 特判，如果没有完成任何任务，则 0 星
			if(!data.finishedTasks.length)
				starsNum = 0;
			return starsNum;
		},
		// 已完成任务的高度，单位：rpx
		contentHeight: function(data) {
			let ratio = 750 / data.windowWidth;
			let contentHeight = (data.windowHeight - data.navHeight) * ratio - 166 - 12 - 142 - 14 - 164 - 16 - 60;
			return contentHeight;
		}
	},

	watch: {},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 关闭背景遮掩
		handleCloseMask: function(e) {
			this.setData({
				showMenu: false,
				showFeeling: false
			})
		},
		// 控制菜单的显示
		handleShowMenu: function(e) {
			this.setData({
				showMenu: true
			});
		},
		// 进入历史页面
		handleNavigateToHistory: function(e){
			wx.navigateTo({
				url: '/src/pages/history/history?tasks=' + JSON.stringify(this.data.tasks)
			})
		},
		// 修改个性签名
		handleSignTextEnsure: function(e) {
			this.setData({
				signText: e.detail.signText
			});
			console.log(this.data.signText)
			wx.setStorageSync('signText', JSON.stringify(e.detail.signText));
			// let _this = this, appData = getApp().globalData;
			// util.myRequest({
			// 	url: JSON.parse(wx.getStorageSync('signTextUrl')),
			// 	method: "PUT",
			// 	header: { Authorization: 'Token ' + _this.token },
			// 	data: {
			// 		signText: e.detail.signText,
			// 		owner: appData.loginUrl + 'user/' + _this.owner + '/'
			// 	}
			// })
		},
		// 导航到“今日待办”页面
		handleNavigateToToday: function(e) {
			let _this = this;
			let tasks = this.data.todayTasks;
			wx.navigateTo({
				url: '/src/pages/list/list?tasks=' + JSON.stringify(tasks)
					+ "&pageName=" + JSON.stringify("今日待办"),
				events: {
					// 触发事件保存数据
					_handleSaveData: (data) => { util._handleSaveData(_this, data); }
				}
			});
		},
		// 导航到“将来做”页面
		handleNavigateToFuture: function(e) {
			let _this = this;
			let tasks = this.data.futureTasks;
			wx.navigateTo({
				url: '/src/pages/list/list?tasks=' + JSON.stringify(tasks)
					+ "&pageName=" + JSON.stringify("将来做"),
				events: {
					// 触发事件保存数据
					_handleSaveData: (data) => { util._handleSaveData(_this, data); }
				}
			})
		},
		// 导航到“各类清单”页面
		handleNavigateToList: function(e) {
			let _this = this;
			let tasks = this.data.tasks.filter(function(item) {
				return item.list.title === e.detail.title
					&& !item.finish
					&& !item.delete;
			})
			// 不允许删除默认清单
			let isDelete = e.detail.title !== "个人清单" && e.detail.title !== "工作清单";
			wx.navigateTo({
				url: '/src/pages/list/list?tasks=' + JSON.stringify(tasks)
					+ "&pageName=" + JSON.stringify(e.detail.title)
					+ "&isDelete=" + JSON.stringify(isDelete),
				events: {
					// 触发事件保存数据
					_handleSaveData: (data) => { util._handleSaveData(_this, data); },
					// 删除清单
					_handleDeleteList: (data) => {
						let tasks = [], lists = [];
						for(let task of _this.data.tasks) {
							if(task.list.title === data.pageName)
								task.delete = true;
							tasks.push(task);
						}
						for(let list of _this.data.lists) {
							if(list.title === data.pageName)
								continue;
							lists.push(list);
						}
						_this.setData({
							tasks: tasks,
							lists: lists
						});
					}
				}
			})
		},
		// 删除清单
		handleDeleteList: function(e) {
			let tasks = [], lists = [], data = e.detail;
			for(let task of this.data.tasks) {
				if(task.list.title === data.listTitle)
					task.delete = true;
				tasks.push(task);
			}
			for(let list of this.data.lists) {
				console.log(list.title, data.listTitle)
				if(list.title === data.listTitle)
					continue;
				lists.push(list);
			}
			this.setData({
				tasks: tasks,
				lists: lists
			});
		},
		// 导航到“添加清单”页面
		handleNavigateToAddList: function(e) {
			let _this = this;
			wx.navigateTo({
				url: '/src/pages/add-self-list/add-self-list',
				events: {
					// 触发事件保存数据
					_handleSaveData: (data) => { util._handleSaveData(_this, data); }
				}
			})
		},
		// 导航到“已完成”页面
		handleNavigateToFinished: function(e) {
			let _this = this;
			let tasks = this.data.tasks.filter(function(item) {
				return item.finish && !item.delete;
			})
			wx.navigateTo({
				url: '/src/pages/list/list?tasks=' + JSON.stringify(tasks)
					+ "&pageName=" + JSON.stringify("已完成"),
				events: {
					// 触发事件保存数据
					_handleSaveData: (data) => { util._handleSaveData(_this, data); }
				}
			});
		},
		// 导航到“过期 / 删除任务”页面
		handleNavigateToBeforeAndDelete: function(e) {
			let _this = this;
			let todayDate = util.getDawn(0);
			let tasks = this.data.tasks.filter(function(item) {
				return item.date.localeCompare(todayDate) < 0
					|| item.delete;
			})
			wx.navigateTo({
				url: '/src/pages/list/list?tasks=' + JSON.stringify(tasks)
					+ "&pageName=" + JSON.stringify("过期 / 删除任务")
					+ "&disabled=" + JSON.stringify(true),
				events: {
					// 触发事件保存数据
					_handleSaveData: (data) => { util._handleSaveData(_this, data); }
				}
			})
		},
		// 导航到“我的分享”页面
		// 目前还未实现该功能
		handleNavigateToShare: function(e) {
			wx.navigateTo({
				url: '/src/pages/share/share',
			});
		},
		// 控制选择某个任务编辑，并打开输入框
		handleSelectTask: function(e) {
			let task = this.data.finishedTasks[e.currentTarget.dataset.index];
			this._selectedId = task.id;
			this.setData({
				showFeeling: true,
				feeling: task.feeling || '',
				rating: task.rating || 1
			})
		},
		// 改变任务完成满意度
		handleChangeRating: function(e) {
			this.setData({
				rating: e.detail.rating
			})
		},
		// 改变任务感想
		handleInput: function(e) {
			this.setData({
				feeling: e.detail.value
			})
		},
		// 关闭感想输入框
		handleBackFeeling: function() {
			delete this._selectedId;
			this.setData({
				showFeeling: false
			})
		},
		// 保存输入框信息
		handleEnsureFeeling: function() {
			let index, task;
			for(let i = 0; i < this.data.tasks.length; i++)
				if(this.data.tasks[i].id === this._selectedId) {
					index = i;
					task = this.data.tasks[i];
					break;
				}
			task.feeling = this.data.feeling;
			task.rating = this.data.rating;
			let key = `tasks[${index}]`;
			this.setData({
				[key]: task,
				feeling: task.feeling,
				showFeeling: false
			});
			this._saveAllDataToLocal();
		},
		// 从本地获取全部数据
		_getAllDataFromLocal: function() {
			// 获取任务
			let tasks = JSON.parse(wx.getStorageSync('tasks') || JSON.stringify([]));
			// 获取清单
			let lists = JSON.parse(wx.getStorageSync('lists') || JSON.stringify([
				{ title: "个人清单", icon: "/src/image/menu-self-list3.svg" },
				{ title: "工作清单", icon: "/src/image/menu-self-list4.svg" }
			]));
			// 用户昵称
			let signText = JSON.parse(wx.getStorageSync('signText') || JSON.stringify("好好学习 天天向上"));
			this.setData({
				tasks: tasks,
				lists: lists,
				signText: signText,
				rawTasks: tasks,
				rawLists: lists,
				rawSignText: signText
			});
			this.token = JSON.parse(wx.getStorageSync('token'));
			this.owner = JSON.parse(wx.getStorageSync('owner'));
		},
		// 保存数据到本地
		_saveAllDataToLocal: function() {
			wx.setStorageSync('tasks', JSON.stringify(this.data.tasks));
			wx.setStorageSync('lists', JSON.stringify(this.data.lists));
			wx.setStorageSync('uniqueId', JSON.stringify(util.getUniqueId()));
		},
		// 拉取并设置数据
		onLoad: function() {
			// 设置机型相关信息
			let app = getApp();
			this.setData({
				navHeight: app.globalData.navHeight,
				navTop: app.globalData.navTop,
				windowHeight: app.globalData.windowHeight,
				windowWidth: app.globalData.windowWidth
			});
			this._getAllDataFromLocal();
			// 为 util 设置 uniqueId
			util.setUniqueId(JSON.parse(wx.getStorageSync('uniqueId') || JSON.stringify(10000)));
		}
	},

	/**
	 * 组件所在页面生命周期
	 */
	pageLifetimes: {
		show: function() {
			// 如果是通过 switchbar 过来的，读取数据
			if(this.getTabBar().data.selected !== 1) 
				this._getAllDataFromLocal();
			// 非 switchbar 过来的，且不是一打开触发的，保存数据到本地
			else this._saveAllDataToLocal();
			// 切换 tabbar 时候显示该页面
			this.getTabBar().setData({
				selected: 1
			})
		},
		hide: function() {}
	},

	/**
	 * 组件生命周期
	 */
	lifetimes: {
		
	}
})
