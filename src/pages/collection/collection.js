const computedBehavior = require("miniprogram-computed").behavior;
const menuBehavior = require("../../behavior/menu-behavior");
const util = require("../../utils/util");
const store = require("../../store/store");
const app = getApp();

Component({
	behaviors: [computedBehavior, menuBehavior],
	/**
	 * 组件的属性列表
	 */
	properties: {},

	/**
	 * 组件的初始数据
	 */
	data: {
		tasks: [],
		showMenu: false,
		// 自定义清单
		lists: [],
		signText: "",
		taskItemColor: ["#D01929", "#E79100", "#C477FF", "#969595"],
		dialogTitle: "",
		dialogShow: false,
		dialogButtons: [],
		dialogContents: "",
		selectIconRotate: false,
		pageName: "收集箱",
	},

	computed: {
		// 显示的今日任务
		todayTasksShow(data) {
			let todayDate = util.getDawn(0);
			let tommorrowDate = util.getDawn(1);
			let res = data.tasks.filter(function (item) {
				return (
					item.date.localeCompare(todayDate) >= 0 &&
					item.date.localeCompare(tommorrowDate) < 0 &&
					(item.list.title === data.pageName || data.pageName === "收集箱")
				);
			});
			res.sort((a, b) =>
				a.priority !== b.priority
					? a.priority < b.priority
						? -1
						: 1
					: a.date.localeCompare(b.date)
			);
			return res;
		},
		// 显示的未来任务
		futureTasksShow(data) {
			let tommorrowDate = util.getDawn(1);
			let res = data.tasks.filter(function (item) {
				return (
					item.date.localeCompare(tommorrowDate) >= 0 &&
					(item.list.title === data.pageName || data.pageName === "收集箱")
				);
			});
			res.sort((a, b) =>
				a.priority !== b.priority
					? a.priority < b.priority
						? -1
						: 1
					: a.date.localeCompare(b.date)
			);
			return res;
		},
	},

	watch: {
		selectIconRotate: function (selectIconRotate) {
			this.animate(
				".listSelectIcon",
				[
					{ rotate: !selectIconRotate ? 180 : 0 },
					{ rotate: selectIconRotate ? 180 : 0 },
				],
				200
			);
			let height = Math.min(8 * 36, 36 * (this.data.lists.length + 1) - 2);
			this.animate(
				".listSelectWrap",
				[
					{ height: !selectIconRotate ? height + "px" : 0 },
					{ height: selectIconRotate ? height + "px" : 0 },
				],
				200
			);
		},
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 关闭左侧栏背景遮掩
		handleCloseMask: function (e) {
			this.setData({
				showMenu: false,
			});
		},
		// 显示 / 关闭清单列表
		handleShowSelectList: function (e) {
			this.setData({
				selectIconRotate: !this.data.selectIconRotate,
			});
		},
		// 选择清单
		handleSelectList: function (e) {
			let index = e.currentTarget.dataset.index;
			let pageName =
				index == undefined ? "收集箱" : this.data.lists[index].title;
			this.handleShowSelectList();
			this.setData({
				pageName,
			});
		},
		// 控制菜单的显示
		handleShowMenu: function (e) {
			this.setData({
				showMenu: true,
			});
		},
		// 控制任务的完成与否
		handleTaskFinish: async function (e) {
			wx.showLoading({
				title: "正在保存数据...",
				mask: true,
			});
			let { owner, token } = await util.getTokenAndOwner(
				app.globalData.url + "login/login/"
			);
			// 修改 finish
			let tasks = [];
			for (let item of this.data.tasks) {
				if (item.id === e.currentTarget.dataset.id) {
					item.finish = !item.finish;
					if (item.finish) item.finishDate = util.formatDate(new Date());
					console.log(item);
					await store.saveTasksToSql([item], this.data.lists, { owner, token });
				}
				tasks.push(item);
			}
			this.setData({
				tasks: tasks,
			});
			wx.setStorageSync("tasks", JSON.stringify(tasks));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: "已完成",
						duration: 800,
					});
				},
			});
		},
		// 新增任务
		handleAddTask: function (e) {
			// 如果当前不是“收集箱”，附带当前清单类型
			if (this.data.pageName === "收集箱") {
				wx.navigateTo({
					url: "/src/pages/editor/editor",
				});
			} else {
				let list = {
					title: this.data.pageName,
				};
				for (let tmp of this.data.lists) {
					if (tmp.title === this.data.pageName) list.icon = tmp.icon;
				}
				wx.navigateTo({
					url: "/src/pages/editor/editor?list=" + JSON.stringify(list),
				});
			}
		},
		// 跳转编辑任务
		handleEditor: function (e) {
			let taskId = e.currentTarget.dataset.id;
			wx.navigateTo({
				url:
					"/src/pages/editor/editor?taskId=" +
					JSON.stringify(taskId) +
					"&isEditorTask=" +
					JSON.stringify(true),
			});
		},
		// 从本地获取全部数据
		_getAllDataFromLocal: function () {
			// 获取任务
			let tasks = JSON.parse(wx.getStorageSync("tasks") || JSON.stringify([]));
			// 获取清单
			let lists = JSON.parse(wx.getStorageSync("lists") || JSON.stringify([]));
			// 用户昵称
			let signText = JSON.parse(
				wx.getStorageSync("signText") || JSON.stringify("")
			);
			this.setData({
				tasks: tasks,
				lists: lists,
				signText: signText,
			});
			console.log(this.data);
		},
		// 保存数据到本地
		_saveAllDataToLocal: function () {
			wx.setStorageSync("tasks", JSON.stringify(this.data.tasks));
			wx.setStorageSync("lists", JSON.stringify(this.data.lists));
		},
		// 拉取并设置数据
		onLoad: async function () {
			// 设置机型相关信息
			let { navHeight, navTop, windowHeight, windowWidth } = app.globalData;
			this.setData({
				navHeight,
				navTop,
				windowHeight,
				windowWidth,
				ratio: 750 / windowWidth,
				bottomLineHeight: app.globalData.bottomLineHeight,
				noticeUpdateContent: app.globalData.noticeUpdateContent || false,
			});
			
			let { token, owner } = await util.getTokenAndOwner(
				app.globalData.url + "login/login/"
			);
			// 从后端拉取数据
			wx.showLoading({
				title: "正在获取数据",
				mask: true,
			});
			// 请求 lists
			let listsLocal = [];
			let lists = util.formatListsFromSqlToLocal(
				await store.getDataFromSqlByUrl(
					app.globalData.url + "check/taglist/?owner=" + JSON.stringify(owner),
					{ token }
				)
			);
			// 如果没有清单，则自动为其补充两个
			if (!lists.length) {
				lists = [
					{ title: "个人清单", icon: "/src/image/menu-self-list0.svg" },
					{ title: "工作清单", icon: "/src/image/menu-self-list1.svg" },
				];
				await Promise.all(
					util.formatListsFromLocalToSql(lists, { owner }).map(item => {
						// console.log(item)
						return util.myRequest({
							url:
								app.globalData.url +
								"check/taglist/?owner=" +
								JSON.stringify(owner),
							header: { Authorization: "Token " + token },
							method: "POST",
							data: item,
						});
					})
				);
				let listsSql = await store.getDataFromSqlByUrl(
					app.globalData.url + "check/taglist/?owner=" + JSON.stringify(owner),
					{ token }
				);
				console.log(listsSql);
				lists.forEach(listLocal => {
					for (let listSql of listsSql)
						if (listLocal.title == listSql.tag) {
							listLocal.urlSql = listSql.url;
							break;
						}
				});
			}
			listsLocal = lists;

			// 请求 tasks
			let tasksLocal = util.formatTasksFromSqlToLocal(
				await store.getDataFromSqlByUrl(
					app.globalData.url + "check/check/?owner=" + JSON.stringify(owner),
					{ token }
				),
				listsLocal,
				{ owner, token }
			);
			// 设置 id
			tasksLocal.forEach(item => (item.id = util.getUniqueId()));

			// 重新创建重复任务
			let tasksNewRepeatPost = [],
				tasksOldRepeatPut = [],
				tasksDelay = [];
			let todayYMD = util.getDawn(0).substr(0, 10);
			let flagNeedToShowDialog = false;
			tasksLocal.forEach(item => {
				// 延续非重复、未完成、过期、未“删除”任务
				if (
					!item.delete &&
					!item.repeat &&
					!item.finish &&
					item.date.substr(0, 10).localeCompare(todayYMD) < 0
				) {
					flagNeedToShowDialog = true;
					tasksDelay.push(item);
				}
				// 未“删除”、未完成、重复、过期，
				// 未“删除”、完成、重复，即完成一个重复任务，创建一个新的，旧的则不再创建
				if (
					(!item.delete &&
						!item.finish &&
						item.repeat &&
						item.date.substr(0, 10).localeCompare(todayYMD) < 0) ||
					(!item.delete && item.finish && item.repeat)
				) {
					let oldDate = new Date(new Date(item.date).getTime());
					let addTime = [0, 1, 7, 30, 365][item.repeat] * 24 * 60 * 60 * 1000;
					let todayTime = new Date(util.getDawn(0)).getTime();
					let oldTime = oldDate.getTime();
					while (oldTime < todayTime) oldTime += addTime;
					// 如果是完成的任务
					if (item.finish) {
						oldTime = Math.max(oldTime, oldDate.getTime() + addTime);
					}
					let task = {
						id: util.getUniqueId(),
						priority: item.priority,
						repeat: item.repeat,
						date: util.formatDate(new Date(oldTime - 8 * 60 * 60 * 1000)),
						remind: 0,
						finish: false,
						content: item.content,
						desc: "",
						list: JSON.parse(JSON.stringify(item.list)),
						delete: false,
						rating: 1,
						feeling: "",
						finishDate: item.finishDate,
					};
					tasksNewRepeatPost.push(task);
					item.delete = true;
					tasksOldRepeatPut.push(item);
				}
			});
			// post 修改和增加过的数据
			await store.saveTasksToSql(
				[...tasksNewRepeatPost, ...tasksOldRepeatPut],
				listsLocal,
				{ owner, token }
			);
			tasksLocal.push(...tasksNewRepeatPost);

			// 展示弹窗是否延续任务
			if (flagNeedToShowDialog) {
				this.setData({
					dialogShow: true,
					dialogTitle: "提示",
					dialogContents: "检测存在过期任务，是否延续？",
					dialogButtons: [{ text: "取消" }, { text: "确定" }],
				});
			}

			this._handleDialogDefine = async () => {
				tasksDelay.forEach(item => {
					item.date = todayYMD + item.date.substr(10);
				});
				await store.saveTasksToSql(tasksDelay, listsLocal, { owner, token });
				wx.setStorageSync("tasks", JSON.stringify(tasksLocal));
				this.setData({
					tasks: tasksLocal,
					dialogShow: false,
				});
			};

			this._handleDialogCancel = async () => {
				tasksDelay.forEach(item => {
					item.delete = true;
				});
				await store.saveTasksToSql(tasksDelay, listsLocal, { owner, token });
				wx.setStorageSync("tasks", JSON.stringify(tasksLocal));
				this.setData({
					tasks: tasksLocal,
					dialogShow: false,
				});
			};

			// 请求 signText
			let signTextLocal = "好好学习 天天向上";
			let signText = await store.getDataFromSqlByUrl(
				app.globalData.url + "check/sign/?owner=" + JSON.stringify(owner),
				{ token }
			);
			if (signText.length) signTextLocal = signText[0].signText;
			else {
				signTextLocal = "好好学习 天天向上";
				util.myRequest({
					url:
						app.globalData.url + "check/sign/?owner=" + JSON.stringify(owner),
					header: { Authorization: "Token " + token },
					method: "POST",
					data: {
						signText: signTextLocal,
						owner: app.globalData.url + "login/user/" + owner + "/",
					},
				});
			}
			wx.setStorageSync("signText", JSON.stringify(signTextLocal));

			this.setData({
				tasks: tasksLocal,
				lists: listsLocal,
				signText: signTextLocal,
			});
			this._saveAllDataToLocal();
			// 保存 owner
			app.globalData.owner = owner;
			console.log(this.data);

			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: "成功",
						icon: "success",
						duration: 800,
					});
				},
			});
		},
		// 关闭更新内容通知的弹窗
		handleCloseNoticeUpdateContent: function (e) {
			this.setData({
				noticeUpdateContent: false,
			});
		},
		// 弹窗点击事件
		handleDialogButton: function (e) {
			let index = e.detail.index;
			if (index === 1 && typeof this._handleDialogDefine === "function") {
				this._handleDialogDefine();
				delete this._handleDialogDefine;
				wx.showToast({
					title: "成功",
					duration: 800,
				});
			} else if (
				index === 0 &&
				typeof this._handleDialogCancel === "function"
			) {
				this._handleDialogCancel();
				delete this._handleDialogCancel;
			}
		},
	},

	/**
	 * 组件所在页面生命周期
	 */
	pageLifetimes: {
		show: function () {
			// 如果是通过 switchbar 过来的，读取数据
			if (this.getTabBar().data.selected) {
				this._getAllDataFromLocal();
			}
			// 非 switchbar 过来的，且不是一打开触发的，保存数据到本地
			else {
				if (!this._tmpflag) this._tmpflag = true;
				else this._getAllDataFromLocal();
			}
			// 切换 tabbar 时候显示该页面
			this.getTabBar().setData({
				selected: 0,
			});
		},
		hide: function () {},
	},

	/**
	 * 组件生命周期
	 */
	lifetimes: {
		ready: function () {},
	},
});
