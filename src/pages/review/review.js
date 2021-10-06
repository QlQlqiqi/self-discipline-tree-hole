const computedBehavior = require("miniprogram-computed").behavior;
const menuBehavior = require("../../behavior/menu-behavior");
const app = getApp();
const util = require("../../utils/util");
const store = require("../../store/store");
Component({
	behaviors: [computedBehavior, menuBehavior],
	options: {
		multipleSlots: true,
	},
	/**
	 * 组件的属性列表
	 */
	properties: {},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 星星位置相关信息
		stars: [
			{ top: "70", left: "136" },
			{ top: "40", left: "216" },
			{ top: "16", left: "300" },
			{ top: "40", left: "386" },
			{ top: "70", left: "468" },
		],
		// 完成的任务
		finishedTasks: [],
		// 展示菜单
		showMenu: false,
		tasks: [],
		lists: [],
		showFeeling: false,
	},

	computed: {
		// 今日完成的任务（包括今日完成的未来事件）
		finishedTasks: function (data) {
			let todayDate = util.getDawn(0);
			let tommorrowDate = util.getDawn(1);
			let res = data.tasks.filter(function (item) {
				return (
					item.finish &&
					item.finishDate.localeCompare(todayDate) >= 0 &&
					item.finishDate.localeCompare(tommorrowDate) < 0 &&
					!item.delete
				);
			});
			res.sort((a, b) => a.date.localeCompare(b.date));
			return res;
		},
		// 设定星星数量
		starsNumber: function (data) {
			// 该任务得到的分数，50% 完成度 + 30% 超时评星 + 20% 自评评星
			// 这里假设一个任务 100 满分
			let scores = 0,
				futureTaskNum = 0;
			data.finishedTasks.forEach(function (task) {
				scores += 50;
				let exceedTime =
					(new Date(task.finishDate).getTime() -
						new Date(task.date).getTime() || 0) / 1000;
				// 超时 30mins 忽略不计，超时 30-60mins 四星，超时 1h-3h 三星，超时 3h-5h 两星，大于 5h 一星
				if (exceedTime <= 30 * 60) scores += 30;
				else if (exceedTime <= 60 * 60) scores += 30 * 0.8;
				else if (exceedTime <= 3 * 60 * 60) scores += 30 * 0.6;
				else if (exceedTime <= 5 * 60 * 60) scores += 30 * 0.4;
				else scores += 30 * 0.2;
				// 自评
				scores += 20 * (task.rating / 5);
				if (task.date.localeCompare(util.getDawn(1)) > 0) futureTaskNum++;
			});
			scores /= 100;
			let radio = scores / (data.todayTasks.length + futureTaskNum || 1),
				starsNum = 0;
			if (radio < 0.4) starsNum = 1;
			else if (radio < 0.6) starsNum = 2;
			else if (radio < 0.8) starsNum = 3;
			else if (radio < 1) starsNum = 4;
			else starsNum = 5;
			// 特判，如果没有完成任何任务，则 0 星
			if (!data.finishedTasks.length) starsNum = 0;
			return starsNum;
		},
		// 已完成任务的高度，单位：rpx
		contentHeight: function (data) {
			return (
				(app.globalData.windowHeight - app.globalData.navHeight - 58) *
					data.ratio -
				166 -
				142 -
				30 -
				40 -
				20 -
				app.globalData.bottomLineHeight * 2
			);
		},
	},

	watch: {},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 关闭背景遮掩
		handleCloseMask: function (e) {
			this.setData({
				showMenu: false,
				showFeeling: false,
			});
		},
		// 控制菜单的显示
		handleShowMenu: function (e) {
			this.setData({
				showMenu: true,
			});
		},
		// 进入历史页面
		handleNavigateToHistory: function (e) {
			wx.navigateTo({
				url: "/src/pages/history/history",
			});
		},
		// 控制选择某个任务编辑，并打开输入框
		handleSelectTask: function (e) {
			let task = this.data.finishedTasks[e.currentTarget.dataset.index];
			this._selectedId = task.id;
			this.setData({
				showFeeling: true,
				feeling: task.feeling || "",
				rating: task.rating || 1,
			});
		},
		// 改变任务完成满意度
		handleChangeRating: function (e) {
			this.setData({
				rating: e.detail.rating,
			});
		},
		// 改变任务感想
		handleInput: function (e) {
			this.setData({
				feeling: e.detail.value,
			});
		},
		// 关闭感想输入框
		handleBackFeeling: function () {
			delete this._selectedId;
			this.setData({
				showFeeling: false,
			});
		},
		// 保存输入框信息
		handleEnsureFeeling: async function () {
			wx.showLoading({
				title: "正在保存数据...",
				mask: true,
			});
			let { owner, token } = await util.getTokenAndOwner(
				app.globalData.url + "login/login/"
			);
			let index,
				task = null;
			for (let i = 0; i < this.data.tasks.length; i++)
				if (this.data.tasks[i].id === this._selectedId) {
					index = i;
					task = this.data.tasks[i];
					break;
				}
			task.feeling = this.data.feeling;
			task.rating = this.data.rating;
			await store.saveTasksToSql([task], this.data.lists, { owner, token });
			let key = `tasks[${index}]`;
			this.setData({
				[key]: task,
				feeling: task.feeling,
				showFeeling: false,
			});
			wx.setStorageSync("tasks", JSON.stringify(this.data.tasks));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: "已完成",
						duration: 800,
					});
				},
			});
		},
		// 从本地获取全部数据
		_getAllDataFromLocal: function () {
			// 获取任务
			let tasks = JSON.parse(wx.getStorageSync("tasks") || JSON.stringify([]));
			// 获取清单
			let lists = JSON.parse(wx.getStorageSync("lists") || JSON.stringify([]));
			// 用户昵称
			let signText = JSON.parse(wx.getStorageSync("signText") || JSON.stringify(''));
			this.setData({
				tasks: tasks,
				lists: lists,
				signText: signText,
			});
			console.log(this.data);
		},
		// 拉取并设置数据
		onLoad: function () {
			// 设置机型相关信息
			let {
				navHeight,
				navTop,
				windowHeight,
				windowWidth,
				bottomLineHeight,
			} = app.globalData;

			this.setData({
				navHeight,
				navTop,
				windowHeight,
				windowWidth,
				ratio: 750 / windowWidth,
				bottomLineHeight,
			});
		},
	},

	/**
	 * 组件所在页面生命周期
	 */
	pageLifetimes: {
		show: function () {
			this._getAllDataFromLocal();
			// 切换 tabbar 时候显示该页面
			this.getTabBar().setData({
				selected: 1,
			});
		},
		hide: function () {},
	},

	/**
	 * 组件生命周期
	 */
	lifetimes: {},
});
