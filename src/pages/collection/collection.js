const computedBehavior = require("miniprogram-computed").behavior;
const util = require("../../utils/util");
const store = require("../../store/store");
const app = getApp();

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
		taskItemColor: ['#D01929', '#E79100', '#C477FF', '#969595'],
		dialogTitle: '',
		dialogShow: false,
		dialogButtons: [],
		dialogContents: '',
		selectIconRotate: false,
		pageName: '收集箱'
	},

	computed: {
		// 今日事件
		todayTasks: function(data) {
			let todayDate = util.getDawn(0);
			let tommorrowDate = util.getDawn(1);
			let res = data.tasks.filter(function(item) {
				return item.date.localeCompare(todayDate) >= 0 
					&& item.date.localeCompare(tommorrowDate) < 0
					&& !item.delete
					&& (data.pageName === '收集箱' || item.list.title === data.pageName);
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
					&& !item.delete
					&& (data.pageName === '收集箱' || item.list.title === data.pageName);
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

	watch: {
		'selectIconRotate': function(selectIconRotate) {
			this.animate('.listSelectIcon', [
				{rotate: !selectIconRotate? 180: 0},
				{rotate: selectIconRotate? 180: 0}
			], 300);
			let height = 36 * (this.data.lists.length + 1);
			this.animate('.listSelectWrap', [
				{height: !selectIconRotate? height + 'px': 0},
				{height: selectIconRotate? height + 'px': 0}
			], 300)
		}
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 关闭左侧栏背景遮掩
		handleCloseMask: function(e) {
			this.setData({
				showMenu: false
			})
		},
		// 显示 / 关闭清单列表
		handleShowSelectList: function(e) {
			this.setData({
				selectIconRotate: !this.data.selectIconRotate
			});
		},
		// 选择清单
		handleSelectList: function(e) {
			let index = e.currentTarget.dataset.index;
			let pageName = index === undefined? '收集箱': this.data.lists[index].title;
			this.handleShowSelectList();
			this.setData({
				pageName
			})
		},
		// 控制菜单的显示	
		handleShowMenu: function(e) {
			this.setData({
				showMenu: true
			});
		},
		// 修改个性签名
		handleSignTextEnsure: async function(e) {
			wx.showLoading({
				title: '正在保存数据...',
				mask: true
			})
			this.setData({
				signText: e.detail.signText
			});
			wx.setStorageSync('signText', JSON.stringify(e.detail.signText));
			let {token, owner} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
			let signTextSql = await store.getDataFromSqlByUrl(app.globalData.url + 'check/sign/', {owner, token});
			signTextSql = signTextSql[0];
			util.myRequest({
				url: signTextSql.url,
				header: { Authorization: "Token " + token },
				method: "PUT",
				data: {
					signText: e.detail.signText,
					owner: app.globalData.url + 'login/user/' + owner + '/'
				}
			}).
			then(res => console.log(res))
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: '已完成',
						duration: 800
					})
				},
			})
		},
		// 控制任务的完成与否
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
		// 新增任务
		handleAddTask: function(e) {
			// 如果当前不是“收集箱”，附带当前清单类型
			if(this.data.pageName === '收集箱') {
				wx.navigateTo({
					url: '/src/pages/editor/editor'
				});
			}
			else {
				let list = {
					title: this.data.pageName
				};
				for(let tmp of this.data.lists) {
					if(tmp.title === this.data.pageName)
						list.icon = tmp.icon;
				}
				wx.navigateTo({
					url: '/src/pages/editor/editor?list=' + JSON.stringify(list)
				});
			}
		},
		// 跳转编辑任务
		handleEditor: function(e) {
			let taskId = e.currentTarget.dataset.id;
			wx.navigateTo({
				url: '/src/pages/editor/editor?taskId=' + JSON.stringify(taskId)
					+ "&isEditorTask=" + JSON.stringify(true)
			})
		},
		// 导航到“今日待办”页面
		handleNavigateToToday: function(e) {
			wx.navigateTo({
				url: '/src/pages/list/list?pageName=' + JSON.stringify('今日待办')
			});
		},
		// 导航到“将来做”页面
		handleNavigateToFuture: function(e) {
			wx.navigateTo({
				url: '/src/pages/list/list?pageName=' + JSON.stringify('将来做')
			})
		},
		// 导航到“各类清单”页面
		handleNavigateToList: function(e) {
			// 不允许删除默认清单
			let isDelete = e.detail.title !== "个人清单" && e.detail.title !== "工作清单";
			wx.navigateTo({
				url: '/src/pages/list/list?pageName=' + JSON.stringify(e.detail.title)
					+ "&isDelete=" + JSON.stringify(isDelete)
			})
		},
		// 删除清单
		handleDeleteList: async function(e) {
			wx.showLoading({
				title: '正在保存数据...',
				mask: true
			})
			let tasks = [], lists = [], tasksSave = [], listDelete = null;
			for(let list of this.data.lists)
				list.title === e.detail.listTitle? listDelete = list: lists.push(list);
			for(let task of this.data.tasks) {
				if(task.list.title === e.detail.listTitle) {
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
			this.setData({
				tasks: tasks,
				lists: lists
			});
			wx.setStorageSync('tasks', JSON.stringify(tasks));
			wx.setStorageSync('lists', JSON.stringify(lists));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: '已完成',
						duration: 800
					})
				},
			})
		},
		// 导航到“添加清单”页面
		handleNavigateToAddList: function(e) {
			wx.navigateTo({
				url: '/src/pages/add-self-list/add-self-list'
			})
		},
		// 导航到“已完成”页面
		handleNavigateToFinished: function(e) {
			wx.navigateTo({
				url: '/src/pages/list/list?pageName=' + JSON.stringify('已完成')
			});
		},
		// 导航到“过期 / 删除任务”页面
		handleNavigateToBeforeAndDelete: function(e) {
			wx.navigateTo({
				url: '/src/pages/list/list?pageName=' + JSON.stringify('过期 / 删除任务')
					+ "&disabled=" + JSON.stringify(true)
			})
		},
		// 导航到“我的分享”页面
		// 目前还未实现该功能
		handleNavigateToShare: function(e) {
			wx.switchTab({
				url: '/src/pages/share/share',
			});
		},
		// 从本地获取全部数据
		_getAllDataFromLocal: function() {
			// 获取任务
			let tasks = JSON.parse(wx.getStorageSync('tasks'));
			// 获取清单
			let lists = JSON.parse(wx.getStorageSync('lists'));
			// 用户昵称
			let signText = JSON.parse(wx.getStorageSync('signText'));
			this.setData({
				tasks: tasks,
				lists: lists,
				signText: signText
			});
			console.log(this.data);	
		},
		// 保存数据到本地
		_saveAllDataToLocal: function() {
			wx.setStorageSync('tasks', JSON.stringify(this.data.tasks));
			wx.setStorageSync('lists', JSON.stringify(this.data.lists));
		},
		// 拉取并设置数据
		onLoad: async function() {
			let {token, owner} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
			// 从后端拉取数据
			wx.showLoading({
				title: '正在获取数据',
				mask: true
			})
			// 请求 lists
			let listsLocal = [];
			let lists = util.formatListsFromSqlToLocal(await store.getDataFromSqlByUrl(app.globalData.url + 'check/taglist/', {owner, token}));
			// 如果没有清单，则自动为其补充两个
			if(!lists.length) {
				lists = [
					{ title: "个人清单", icon: "/src/image/menu-self-list0.svg" },
          { title: "工作清单", icon: "/src/image/menu-self-list1.svg" }
				];
				await Promise.all(
					util.formatListsFromLocalToSql(lists, {owner}).map(item => {
						return util.myRequest({
							url: app.globalData.url + 'check/taglist/?owner=' + JSON.stringify(owner),
							header: { Authorization: "Token " + token },
							method: "POST",
							data: item
						});
					})
				);
				let listsSql = await store.getDataFromSqlByUrl(app.globalData.url + 'check/taglist/', {owner, token});
				console.log(listsSql)
				lists.forEach(listLocal => {
					for(let listSql of listsSql)
						if(listLocal.title == listSql.tag) {
							listLocal.urlSql = listSql.url;
							break;
						}
				});
			}
			listsLocal = lists;
			
			// 请求 tasks
			let tasksLocal = util.formatTasksFromSqlToLocal(
				await store.getDataFromSqlByUrl(app.globalData.url + 'check/check/', {owner, token}), 
				listsLocal,
				{owner, token}
			);
			// 设置 id
			tasksLocal.forEach(item => item.id = util.getUniqueId());

			// 如果存在一个今天会发生的重复任务，则修改该任务为非重复任务，并自动产生一个日期顺延的重复任务
			// 如果以前完成了一个重复任务，不管其设置的日期是什么时候，同上处理
			let res = [], tasksPost = [], flagNeedToShowDialog = false;
			for(let task of tasksLocal) {
				if(task.delete || !task.repeat) {
					res.push(task);
					continue;
				}
				// 每天重复
				// 此处 UTC+0 -> UTC+8，将世界时间转化为本地时间
				let oldDate = new Date((new Date(task.date)).getTime() - 8 * 60 * 60 * 1000);
				let addTime = [0, 1, 7, 30, 365][task.repeat] * 24 * 60 * 60 * 1000;
				let oldDateYMD = util.formatDate(oldDate).substr(0, 10);
				let todayYMD = util.getDawn(0).substr(0, 10);
				// 第一种情况，即一个过期的重复任务（无论是否完成）
				if(oldDateYMD.localeCompare(todayYMD) < 0) {
					flagNeedToShowDialog = true;
					let newTime = oldDate.getTime() + addTime;
					let tomorrowTime = (new Date(util.getDawn(1))).getTime();
					do {
						let tmpTask = JSON.parse(JSON.stringify(task));
						tmpTask.id = util.getUniqueId();
						tmpTask.date = util.formatDate(new Date(newTime));
						tmpTask.finish = false;
						tmpTask.desc = "";
						tmpTask.rating = 1;
						tmpTask.feeling = '';
						tmpTask.repeat = 0;
						tmpTask._asd = 1;
						// 根据用户选择是否延续任务
						tmpTask._overTime = true;
						delete tmpTask.urlSql;
						res.push(tmpTask);
						tasksPost.push(tmpTask);
						newTime += addTime;
					} while(newTime < tomorrowTime);
					res[res.length - 1].repeat = task.repeat;
					task.repeat = 0;
					task._self = true;
					tasksPost.push(task);
				}
				// 第二种情况，即一个完成的任务（走到这里肯定不是过期任务）
				else if(task.finish && task.finishDate.localeCompare(util.getDawn(0)) >= 0) {
					let newDate = new Date(oldDate.getTime() + addTime);
					let tmpTask = JSON.parse(JSON.stringify(task));
					tmpTask.id = util.getUniqueId();
					tmpTask.date = util.formatDate(newDate);
					tmpTask.finish = false;
					tmpTask.desc = "";
					tmpTask.rating = 1;
					tmpTask.feeling = '';
					delete tmpTask.urlSql;
					res.push(tmpTask);
					tasksPost.push(tmpTask);
					task.repeat = 0;
					tasksPost.push(task);
				}
				console.log(task)
				res.push(task);
			}
			// post 修改和增加过的数据
			await store.saveTasksToSql(tasksPost, listsLocal, {owner, token});
			tasksLocal = res;

			// 展示弹窗是否延续任务
			if(flagNeedToShowDialog)
				this.setData({
					dialogShow: true,
					dialogTitle: '提示',
					dialogContents: '检测存在过期任务，是否延续？',
					dialogButtons: [{text: '取消'},{text: '确定'}]
				})
			
			// 延时所有过期任务
			this._handleDialogDefine = async () => {
				let todayYMD = util.getDawn(0).substr(0, 10);
				tasksLocal = tasksLocal.filter(item => {
					// 删除以前自动创建的任务
					if(item._overTime) {
						delete item._overTime;
						util.myRequest({
							url: item.urlSql,
							header: { Authorization: "Token " + token },
							method: 'DELETE'
						})
						return false;
					}
					// 修改本体任务时间
					item.date = todayYMD + item.date.substr(10);
					util.myRequest({
						url: item.urlSql,
						header: { Authorization: "Token " + token },
						method: 'PUT',
						data: util.formatTasksFromLocalToSql([item], listsLocal, {owner, token})[0]
					}).then(res => console.log(res, util.formatTasksFromLocalToSql([item], listsLocal, {owner, token})))
					
					return true;
				})
				console.log(tasksLocal)
				this.setData({
					tasks: tasksLocal,
					dialogShow: false
				})
				wx.setStorageSync('tasks', JSON.stringify(tasksLocal));
			}
			this._handleDialogCancel = () => {
				this.setData({
					dialogShow: false
				})
			}

			// 请求 signText
			let signTextLocal = "好好学习 天天向上";
			let signText = await store.getDataFromSqlByUrl(app.globalData.url + 'check/sign/', {owner, token});
			if(signText.length) 
				signTextLocal = signText[0].signText;
			else {
				signTextLocal = '好好学习 天天向上';
				util.myRequest({
					url: app.globalData.url + 'check/sign/?owner=' + JSON.stringify(owner),
					header: { Authorization: "Token " + token },
					method: "POST",
					data: {
						signText: signTextLocal,
						owner: app.globalData.url + 'login/user/' + owner + "/"
					}
				});
			}
			wx.setStorageSync('signText', JSON.stringify(signTextLocal));

			// 设置机型相关信息
			let {navHeight, navTop, windowHeight, windowWidth} = app.globalData;
			
			this.setData({
				tasks: tasksLocal,
				lists: listsLocal,
				signText: signTextLocal,
				navHeight,
				navTop,
				windowHeight,
				windowWidth,
				ratio: 750 / windowWidth,
				bottomLineHeight: app.globalData.bottomLineHeight,
				noticeUpdateContent: app.globalData.noticeUpdateContent
			})
			this._saveAllDataToLocal();
			console.log(this.data);

			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: '成功',
						icon: 'success',
						duration: 800
					})
				},
			})
		},
		// 关闭更新内容通知的弹窗
		handleCloseNoticeUpdateContent: function(e) {
			this.setData({
				noticeUpdateContent: false
			})
		},
		// 弹窗点击事件
		handleDialogButton: function(e) {
			let index = e.detail.index;
			if(index === 1 && typeof this._handleDialogDefine === 'function') {
				this._handleDialogDefine();
				delete this._handleDialogDefine;
				wx.showToast({
					title: '成功',
					duration: 800
				});
			}
			else if(index === 0 && typeof this._handleDialogCancel === 'function') {
				this._handleDialogCancel();
				delete this._handleDialogCancel;
			}
		}
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
				else this._getAllDataFromLocal();
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
