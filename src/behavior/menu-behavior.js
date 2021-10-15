// 仅用于配合 menu 组件的使用
const computedBehavior = require("miniprogram-computed").behavior;
const app = getApp();
const util = require("../utils/util");
const store = require("../store/store");
module.exports = Behavior({
	behaviors: [computedBehavior],
	computed: {
		// 今日事件
		todayTasks: function (data) {
			let todayDate = util.getDawn(0);
			let tommorrowDate = util.getDawn(1);
			let res = data.tasks.filter(function (item) {
				return (
					item.date.localeCompare(todayDate) >= 0 &&
					item.date.localeCompare(tommorrowDate) < 0
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
		// 未来事件
		futureTasks: function (data) {
			let tommorrowDate = util.getDawn(1);
			let res = data.tasks.filter(function (item) {
				return item.date.localeCompare(tommorrowDate) >= 0;
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
		// 展示清单
		listsShow: function (data) {
			// 个人清单第一，工作清单第二，其余自定义清单随意
			let res = [],
				idx = 2;
			for (let list of data.lists) {
				if (list.title === "个人清单") res[0] = list;
				else if (list.title === "工作清单") res[1] = list;
				else res[idx++] = list;
			}
			return res;
		},
	},
	methods: {
		// 修改个性签名
		handleSignTextEnsure: async function (e) {
			wx.showLoading({
				title: "正在保存数据...",
				mask: true,
			});
			this.setData({
				signText: e.detail.signText,
			});
			wx.setStorageSync("signText", JSON.stringify(e.detail.signText));
			let { token, owner } = await util.getTokenAndOwner(
				app.globalData.url + "login/login/"
			);
			let signTextSql = await store.getDataFromSqlByUrl(
				app.globalData.url + "check/sign/?owner=" + JSON.stringify(owner),
				{ token }
			);
			signTextSql = signTextSql[0];
			util
				.myRequest({
					url: signTextSql.url,
					header: { Authorization: "Token " + token },
					method: "PUT",
					data: {
						signText: e.detail.signText,
						owner: app.globalData.url + "login/user/" + owner + "/",
					},
				});
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: "已完成",
						duration: 800,
					});
				},
			});
		},
		// 导航到“今日待办”页面
		handleNavigateToToday: function (e) {
			wx.navigateTo({
				url: "/src/pages/list/list?pageName=" + JSON.stringify("今日待办"),
			});
		},
		// 导航到“将来做”页面
		handleNavigateToFuture: function (e) {
			wx.navigateTo({
				url: "/src/pages/list/list?pageName=" + JSON.stringify("将来做"),
			});
		},
		// 导航到“各类清单”页面
		handleNavigateToList: function (e) {
			// 不允许删除默认清单
			let isDelete =
				e.detail.title !== "个人清单" && e.detail.title !== "工作清单";
			wx.navigateTo({
				url:
					"/src/pages/list/list?pageName=" +
					JSON.stringify(e.detail.title) +
					"&isDelete=" +
					JSON.stringify(isDelete),
			});
		},
		// 删除清单
		handleDeleteList: async function (e) {
			wx.showLoading({
				title: "正在保存数据...",
				mask: true,
			});
			let tasks = [],
				lists = [],
				tasksSave = [],
				listDelete = null;
			for (let list of this.data.lists)
				list.title === e.detail.listTitle
					? (listDelete = list)
					: lists.push(list);
			for (let task of this.data.tasks) {
				if (task.list.title === e.detail.listTitle) {
					task.list = {
						icon: "/src/image/menu-self-list0.svg",
						title: "个人清单",
					};
					tasksSave.push(task);
				}
				tasks.push(task);
			}
			let { owner, token } = await util.getTokenAndOwner(
				app.globalData.url + "login/login/"
			);
			await store.saveTasksToSql(tasksSave, lists, { owner, token });
			await util.myRequest({
				url: listDelete.urlSql,
				header: { Authorization: "Token " + token },
				method: "DELETE",
			});
			this.setData({
				tasks: tasks,
				lists: lists,
			});
			wx.setStorageSync("tasks", JSON.stringify(tasks));
			wx.setStorageSync("lists", JSON.stringify(lists));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: "已完成",
						duration: 800,
					});
				},
			});
		},
		// 导航到“添加清单”页面
		handleNavigateToAddList: function (e) {
			wx.navigateTo({
				url: "/src/pages/add-self-list/add-self-list",
			});
		},
		// 导航到“已完成”页面
		handleNavigateToFinished: function (e) {
			wx.navigateTo({
				url: "/src/pages/list/list?pageName=" + JSON.stringify("已完成") +
				"&disabled=" + JSON.stringify(true),
			});
		},
		// 导航到“过期任务”页面
		handleNavigateToBeforeAndDelete: function (e) {
			wx.navigateTo({
				url:
					"/src/pages/list/list?pageName=" +
					JSON.stringify("过期任务") +
					"&disabled=" +
					JSON.stringify(true),
			});
		},
		// 导航到“我的分享”页面
		handleNavigateToShare: function (e) {
			wx.switchTab({
				url: "/src/pages/share/share",
			});
		},
		// 导航到“消息通知”页面
		handleNavigateToMessageRemind: function (e) {
			wx.navigateTo({
				url: "/src/pages/message-remind/message-remind?refresh=" + JSON.stringify(true),
			});
		},
	}
})