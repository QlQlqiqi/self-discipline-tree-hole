const computedBehavior = require('miniprogram-computed').behavior;
let app = getApp();
const util = require("../../utils/util")
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
		dateString: "",
		defaultTime: "",
		tasks: [],
		// 星星位置相关信息
		stars: [
			{ top: '42', left: '222'},
			{ top: '20', left: '282'},
			{ top: '0', left: '350'},
			{ top: '20', left: '416'},
			{ top: '42', left: '480'}
		],
		// 选定的任务
		task: {},
		// 显示感想
		showFeeling: false
	},

	computed: {
		// 从小到大得到所有已完成任务出现的日期，如果某天未完成任务，则不显示 spot
		spot: function(data) {
			let res = [];
			for(let task of data.tasks) {
				if(!task.finish)
					continue;
				let finishDate = task.finishDate.substr(0, 10);
				if(res.indexOf(finishDate) === -1)
					res.push(finishDate);
			}
			res.sort((a, b) => { return a.localeCompare(b); });
			return res;
		},
		// 今日事件
		todayTasks: function(data) {
			let todayDateYMD = data.dateString;
			let tommorrowDateYMD = util.formatDate(new Date((new Date(data.dateString)).getTime() + 24 * 60 * 60 * 1000)).substr(0, 10);
			let res = data.tasks.filter(function(item) {
				return item.date.localeCompare(todayDateYMD) >= 0 
					&& item.date.localeCompare(tommorrowDateYMD) < 0
			});
			res.sort((a, b) => a.priority !== b.priority
				? (a.priority < b.priority? -1: 1)
				: a.date.localeCompare(b.date));
			return res;
		},
		// 今日完成的任务（包括今日完成的未来事件）
		finishedTasks: function(data) {
			let todayDateYMD = data.dateString;
			let tommorrowDateYMD = util.formatDate(new Date((new Date(data.dateString)).getTime() + 24 * 60 * 60 * 1000)).substr(0, 10);
			let res = data.tasks.filter(function(item) {
				return item.finish
					&& item.finishDate.localeCompare(todayDateYMD) >= 0 
					&& item.finishDate.localeCompare(tommorrowDateYMD) < 0
			});
			res.sort((a, b) => a.date.localeCompare(b.date) );
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
				if(task.date.localeCompare(util.formatDate(new Date((new Date(data.dateString)).getTime() + 24 * 60 * 60 * 1000))) > 0)
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
		}
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 关闭背景遮掩
		handleCloseMask: function(e) {
			this.setData({
				showFeeling: false
			})
		},
		// 点击任务，展开感想
		handleSelectTask: function(e) {
			let task = this.data.finishedTasks[e.currentTarget.dataset.index];
			this.setData({
				showFeeling: true,
				task: task
			})
		},
		// 关闭任务
		handleBackFeeling: function(e) {
			this.setData({
				showFeeling: false
			})
		},
		// 选中日期改变
		handleDateChange(e) {
			this.setData({
				dateString: e.detail.dateString
			});
		},
		// 返回
		handleBack: function(e) {
			wx.navigateBack();
		},
		// 处理数据
		onLoad: function(options) {
			// 默认时间
			let date = new Date();
			let defaultTime =  `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
			this.setData({
				tasks: JSON.parse(wx.getStorageSync('tasks')),
				defaultTime: defaultTime,
				navHeight: app.globalData.navHeight,
				navTop: app.globalData.navTop,
				windowHeight: app.globalData.windowHeight,
				windowWidth: app.globalData.windowWidth
			});
		}
	},
})
