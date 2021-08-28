const computedBehavior = require("miniprogram-computed").behavior;
const util = require("../../utils/util");
// const app = getApp();
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
		tasks: [],
		showMenu: false,
		// 自定义清单
		lists: [],
		signText: "",
		taskItemColor: ['#D01929', '#F0AD4D', '#CF92FF', '#BABBBA']
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
				showMenu: false
			})
		},
		// 控制菜单的显示	
		handleShowMenu: function(e) {
			this.setData({
				showMenu: true
			});
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
		// 控制任务的完成与否
		handleTaskFinish: function(e) {
			// 修改 finish
			let tasks = [];
			for(let item of this.data.tasks) {
				if(item.id === e.currentTarget.dataset.id) {
					item.finish = !item.finish;
					if(item.finish)
						item.finishDate = util.formatDate(new Date());
				}
				tasks.push(item);
			}
			this.setData({
				tasks: tasks
			});
			this._saveAllDataToLocal();
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
				list: { title: "个人清单", icon: "/src/image/menu-self-list3.svg" },
				delete: false,
				rating: 1,
				feeling: '',
				finishDate: util.formatDate(new Date())
			};
			let lists = this.data.lists || JSON.parse(wx.getStorageSync('lists'));
			let _this = this;
			wx.navigateTo({
				url: '/src/pages/editor/editor?task=' + JSON.stringify(task)
					+ "&lists=" + JSON.stringify(lists),
				events: {
					// 编辑页面完成编辑后，触发事件保存数据
					_handleSaveData: (data) => { util._handleSaveData(_this, data); }
				}
			});
		},
		// 删除任务
		handleDeleteTask: function(e) {
			let id = e.currentTarget.dataset.id;
			for(let task of this.data.tasks)
				if(task.id === id) {
					task.delete = true;
					break;
				}
			this.setData({
				tasks: this.data.tasks
			});
		},
		// 跳转编辑任务
		handleEditor: function(e) {
			let task;
			for(let item of this.data.tasks) {
				if(item.id === e.currentTarget.dataset.id) {
					task = item;
					break;
				}
			}
			let lists = this.data.lists || JSON.parse(wx.getStorageSync('lists'));
			let _this = this;
			wx.navigateTo({
				url: '/src/pages/editor/editor?task=' + JSON.stringify(task)
					+ "&lists=" + JSON.stringify(lists)
					+ "&isEditorTask=" + JSON.stringify(true),
				events: {
					// 编辑页面完成编辑后，触发事件保存数据
					_handleSaveData: (data) => { util._handleSaveData(_this, data); }
				}
			})
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
						console.log(data)
						let tasks = [], lists = [];
						for(let list of this.data.lists) {
							if(list.title === data.pageName)
								continue;
							lists.push(list);
						}
						for(let task of this.data.tasks) {
							if(task.list.title === data.pageName)
								task.list = {
									icon: "/src/image/menu-self-list0.svg",
									title: "个人清单"
								};
							tasks.push(task);
						}
						this.setData({
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
			for(let list of this.data.lists) {
				if(list.title === data.listTitle)
					continue;
				lists.push(list);
			}
			for(let task of this.data.tasks) {
				if(task.list.title === data.listTitle)
					task.list = {
						icon: "/src/image/menu-self-list0.svg",
						title: "个人清单"
					};
				tasks.push(task);
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
			});
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
		// 保存数据到后端
		_saveAllDataToSql: function() {
			// 保存在后端
			// 登录保证不过期
			let token, owner, successListNum = 0, data = this.data, _this = this;
			const url = getApp().globalData.url;
			util.login(url + 'login/login/')
			.then(res => {
				token = res.data.token;
      	owner = res.data.user_id;
			})
			.then(() => {
				// 先删除后保存 lists
				util.myRequest({
					url: url + 'check/taglist/?owner=' + JSON.stringify(owner),
					header: {token: token},
					method: "GET"
				}).then(res => {
					// PUT 或 POST lists
					// console.log(...res.data);
					// for(let localList of _this.data.lists) {
					// 	for(let remoteList of res.data) {
					// 		// 修改
					// 		if(remoteList.tag === localList.title) {

					// 			break;
					// 		}
					// 	}
					// }

					// DELETE
					res.data.forEach(function(item) {
						util.myRequest({
							url: item.url + "?owner=" + JSON.stringify(owner),
							header: { Authorization: "Token " + token },
							method: "DELETE"
						}).then(res => console.log(res))
					})
				})
				// 保存 lists
				.then(() => {
					data.lists.forEach(function(item) {
						let list = {
							tag: item.title,
							icon: item.icon,
							owner: url + 'login/user/' + owner + "/"
						}
						util.myRequest({
							url: url + 'check/taglist/?owner=' + JSON.stringify(owner),
							header: { Authorization: "Token " + token },
							method: "POST",
							data: list
						})
						.then(() => { successListNum++; })
					})
				});
			})
			// 先删除后保存 tasks
			.then(() => {
				util.myRequest({
					url: url + 'check/check/?owner=' + JSON.stringify(owner),
					header: { token: token },
					method: "GET"
				}).then(res => {
					// 删除 tasks
					res.data.forEach(function(item) {
						util.myRequest({
							url: item.url,
							header: { Authorization: "Token " + token },
							method: "DELETE"
						}).then(res => console.log(res))
					})
				})
				.then(() => {
					let timeId = setInterval(() => {
						// 当全部保存好后
						if(successListNum === data.lists.length) {
							clearInterval(timeId);
							// 获取全部的 lists 的 url
							util.myRequest({
								url: url + 'check/taglist/?owner=' + JSON.stringify(owner),
								header: { token: token },
								method: "GET"
							}).then(res => {
								let listUrl = [], listTitle = [];
								for(let item of res.data) {
									listUrl.push(item.url);
									listTitle.push(item.tag);
								}
								// 保存 tasks
								data.tasks.forEach(function(item) {
									// 根据 remind 和 e_time 得到 c_time
									let div = [0, 60, 300, 600, 1800, 3600][item.remind] * 1000 + 8 * 60 * 60 * 1000;
									let date = new Date();
									date.setTime(new Date(item.date).getTime() - div);
									let c_time = util.formatDate(date)
									// 得到 list
									let list = listUrl[listTitle.indexOf(item.list.title)];
									let task = {
										priority: item.priority,
										repeat: item.repeat,
										e_time: item.date,
										c_time: c_time,
										finish: item.finish? 1: 0,
										text: item.content,
										todo_desc: item.desc || "default",
										tag: list,
										todo_delete: item.delete? 1: 0,
										star: item.rating,
										star_text: item.feeling || "default",
										owner: url + 'login/user/' + owner + "/",
										fin_date: item.finishDate || util.formatDate(new Date())
									}
									util.myRequest({
										url: url + 'check/check/?owner=' + JSON.stringify(owner),
										header: { Authorization: "Token " + token },
										method: "POST",
										data: task
									}).then(res => {console.log("post", res); wx.setStorageSync('tmp', JSON.stringify(res))})
								})
							})
						}
					}, 500);
				})
			})
			.then(() => {
				util.myRequest({
					url: url + 'check/sign/?owner=' + JSON.stringify(owner),
					header: { token: token },
					method: "GET"
				})
				.then(res => {
					console.log(res.data, res.data[0].owner)
					util.myRequest({
						url: res.data[0].url,
						header: { Authorization: "Token " + token },
						method: "PUT",
						data: {
							owner: res.data[0].owner,
							signText: _this.data.signText
						}
					})
					.then(res => console.log(res))
				})
			})
		},
		// 拉取并设置数据
		onLoad: function() {
			let _this = this;
			// _this._saveAllDataToSql();
			// 每 30s 向后端同步一次数据
			setInterval(() => {
				console.log(_this.data.tasks);
				_this._getAllDataFromLocal();
				_this._saveAllDataToSql();
			}, 1000 * 30);
			// 当请求好数据后保存数据
			let timeId = setInterval(() => {
				let success = 0;
				if(typeof getApp === 'function' && getApp().globalData)
					success = getApp().globalData.success;
				if(success === 3) {
					clearInterval(timeId);
					this._getAllDataFromLocal();
					// 设置机型相关信息
					let app = getApp();
					this.setData({
						navHeight: app.globalData.navHeight,
						navTop: app.globalData.navTop,
						windowHeight: app.globalData.windowHeight,
						windowWidth: app.globalData.windowWidth
					});
					// 为 util 设置 uniqueId
					util.setUniqueId(JSON.parse(wx.getStorageSync('uniqueId') || JSON.stringify(100000)));
					// 如果存在一个今天会发生的重复任务，则修改该任务为非重复任务，并自动产生一个日期顺延的重复任务
					// 如果以前完成了一个重复任务，不管其设置的日期是什么时候，同上处理
					let res = [];
					for(let task of this.data.tasks) {
						if(task.delete || !task.repeat) {
							res.push(task);
							continue;
						}
						// 每天重复
						let oldDate = new Date(task.date);
						let addTime = [0, 1, 7, 30, 365][task.repeat] * 24 * 60 * 60 * 1000;
						let newDate = new Date(oldDate.getTime() + addTime);
						let oldDateYMD = util.formatDate(oldDate).substr(0, 10);
						let todayYMD = util.getDawn(0).substr(0, 10);
						// 第一种情况，即一个过期的重复任务（无论是否完成）
						if(oldDateYMD.localeCompare(todayYMD) < 0) {
							let newTime = oldDate.getTime() + addTime;
							let todayTime = (new Date(util.getDawn(0))).getTime();
							do {
								let tmpTask = JSON.parse(JSON.stringify(task));
								tmpTask.id = util.getUniqueId();
								tmpTask.date = util.formatDate(new Date(newTime));
								tmpTask.finish = false;
								tmpTask.desc = "";
								tmpTask.rating = 1;
								tmpTask.feeling = '';
								tmpTask.repeat = 0; 
								res.push(tmpTask);
								newTime += addTime;
							} while(newTime <= todayTime);
							res[res.length - 1].repeat = task.repeat;
							task.repeat = 0;
						}
						// 第二种情况，即一个完成的任务（走到这里肯定不是过期任务）
						else if(task.finish && task.finishDate.localeCompare(util.getDawn(0)) >= 0) {
							let tmpTask = JSON.parse(JSON.stringify(task));
							tmpTask.id = util.getUniqueId();
							tmpTask.date = util.formatDate(newDate);
							tmpTask.finish = false;
							tmpTask.desc = "";
							tmpTask.rating = 1;
							tmpTask.feeling = '';
							res.push(tmpTask);
							task.repeat = 0;
						}
						res.push(task);
					}
					this.setData({
						tasks: res
					})
				}
			}, 300);
		},
	},

	/**
	 * 组件所在页面生命周期
	 */
	pageLifetimes: {
		show: function() {
			// 如果是通过 switchbar 过来的，读取数据
			if(this.getTabBar().data.selected) {
				this._getAllDataFromLocal();
			}
			// 非 switchbar 过来的，且不是一打开触发的，保存数据到本地
			else {
				if(!this._tmpflag)
					this._tmpflag = true;
				else this._saveAllDataToLocal();
			}
			// 切换 tabbar 时候显示该页面
			this.getTabBar().setData({
				selected: 0
			})
		},
		hide: function() {}
	},

	/**
	 * 组件生命周期
	 */
	lifetimes: {
		ready: function() {
			
		}
		
	}
})
