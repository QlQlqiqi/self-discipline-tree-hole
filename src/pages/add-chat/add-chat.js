const computedBehavior = require("miniprogram-computed").behavior;
const util = require("../../utils/util");
const store = require("../../store/store");
const app = getApp();
Component({
	behaviors: [computedBehavior],
	/**
	 * 组件的属性列表
	 */
	properties: {},

	/**
	 * 组件的初始数据
	 */
	data: {
		tasks: [],
		chatContent: "",
		maxLength: 800,
		// 下面的功能区
		options: [
			{ icon: "/src/image/add-chat-option0.svg", content: "添加今日回顾单" },
			{ icon: "/src/image/add-chat-option1.svg", content: "选择匿名身份" },
			{ icon: "/src/image/add-chat-option2.svg", content: "分享范围" },
		],
		// 当弹出键盘时，显示下面的功能框
		bottomOptionsShow: true,
		// 功能框距离下面的距离 px
		optionsBottom: 100,
		reviewShow: false,
		// 缩略图
		// {startsNum, tasks[{content}]}
		review: {},
		repeatTipShow: false,
		repeatTipTop: 0,
		// 待选择的匿名，每个元素{icon, name}
		anameRange: app.globalData.anames,
		// 当前选择的匿名的 index
		currentAnameIndex: 0,
		anameShow: false,
		buttons: [
			{ text: "取消", type: "default" },
			{ text: "确定", type: "primary" },
		],
		// 分享范围，每个元素{content}
		shareRange: [{ content: "大家的树洞" }, { content: "仅自己可见" }],
		// 当前选择的分享的 index
		currentShareIndex: 0,
		shareShow: false,
	},

	computed: {
		charInputLength(data) {
			return data.chatContent.length;
		},
		// 今日事件
		todayTasks: function (data) {
			let todayDate = util.getDawn(0);
			let tommorrowDate = util.getDawn(1);
			let res = data.tasks.filter(function (item) {
				return (
					item.date.localeCompare(todayDate) >= 0 &&
					item.date.localeCompare(tommorrowDate) < 0 &&
					!item.delete
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
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 页面返回
		handleBack(e) {
			wx.navigateBack();
		},
		// 确认说说
		async handleEnsure(e) {
			wx.showLoading({
				title: '正在发布...',
				mask: true
			})
			let chats = JSON.parse(wx.getStorageSync('chats'));
			// post
			let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
			let {anames} = app.globalData;
			let chat = {
				id: util.getUniqueId(),
				owner,
				reviewAbridge: this.data.review,
				pic: {
					// picId: chat.id
					headIcon: anames[this.data.currentAnameIndex].icon,
					name: anames[this.data.currentAnameIndex].name,
					date: util.formatDate(new Date()),
					content: this.data.chatContent,
					shareRange: this.data.currentShareIndex
				},
				comments: []
			}
			chat.reviewAbridge.show = Boolean(this.data.reviewShow);
			chat.pic.picId = chat.id;
			console.log(chat)
			await store.saveChatsToSql([chat], {owner, token});
			chats.push(chat);
			// 改变选中的
			this.setData({
				shareRangeShow: false,
				chats,
			});
			wx.setStorageSync('chats', JSON.stringify(chats));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: "已完成",
						duration: 800,
					});
				},
			});
			wx.navigateBack();
		},
		// 取消说说
		handleCancel(e) {
			this.handleBack();
		},
		// 绑定输入
		handleInput(e) {
			this.setData({
				chatContent: e.detail.value,
			});
		},
		// 弹出键盘
		handleShowKeyBoard(e) {
			// 因为 handleShowKeyBoard 会触发两次，且两次只有第一次高度正常，所以需要特殊保存
			app.globalData.keyBoardHeight = Math.max(e.detail.height, app.globalData.keyBoardHeight || 0);
			console.log(app.globalData.keyBoardHeight)
			this.setData({
				optionsBottom: app.globalData.keyBoardHeight + 50,
				bottomOptionsShow: true,
			});
		},
		// 收起键盘
		handleCloseKeyBoard(e) {
			// 因为 handleShowKeyBoard 会触发两次，覆盖掉该事件，所以需要延迟调用该方法
			setTimeout(() => {
				this.setData({
					bottomOptionsShow: true,
					optionsBottom: 100,
				});
			}, 0);
		},
		// 触发“添加今日回顾清单”
		handleAddReviewAbridge(e) {
			// 如果已经添加了，显示不能重复添加
			if (this.data.reviewShow) {
				let { windowHeight, navHeight, ratio } = this.data;
				this.setData({
					repeatTipShow: true,
					repeatTipTop:
						windowHeight -
						navHeight -
						(app.globalData.keyBoardHeight || 0) -
						(76 + 88) / ratio,
				});
				// 3000ms 后消失，如果期间再次点击，则重新计算时间
				if (this._repeatTipTimeId) clearTimeout(this._repeatTipTimeId);
				this._repeatTipTimeId = setTimeout(() => {
					this.setData({
						repeatTipShow: false,
					});
					delete this._repeatTipTimeId;
				}, 3000);
				return;
			}
			this.setData({
				reviewShow: true,
			});
		},
		// 关闭缩略图
		handleCloseReviewAbridge(e) {
			this.setData({
				reviewShow: !this.data.reviewShow,
			});
		},
		// 弹出“匿名选择”
		handleShowAnameSelect(e) {
			this.setData({
				anameShow: true,
			});
		},
		// 关闭“匿名选择”
		handleCloseAnameSelect() {
			this.setData({
				anameShow: false,
			});
		},
		// 匿名 buttontap
		handleAnameButtonTap(e) {
			if (e.detail.index) {
				this.setData({
					currentAnameIndex: this._currentAnameIndex,
				});
			}
			this.handleCloseAnameSelect();
			delete this._currentAnameIndex;
		},
		// 改变匿名
		handleChangeAname(e) {
			this._currentAnameIndex = e.detail.value[0];
		},
		//  弹出“分享范围”
		handleShowShareSelect(e) {
			this.setData({
				shareShow: true,
			});
		},
		// 关闭“分享范围”
		handleCloseShareSelect() {
			this.setData({
				shareShow: false,
			});
		},
		// 分享 buttontap
		handleShareButtonTap(e) {
			if (e.detail.index) {
				this.setData({
					currentShareIndex: this._currentShareIndex,
				});
			}
			this.handleCloseShareSelect();
			delete this._currentShareIndex;
		},
		// 改变分享范围
		handleChangeShare(e) {
			this._currentShareIndex = e.detail.value[0];
		},

		// 加载数据
		onLoad: function () {
			let tasks = JSON.parse(wx.getStorageSync('tasks'));
			// 设置机型相关信息
			let {
				navHeight,
				navTop,
				windowHeight,
				windowWidth,
				bottomLineHeight,
			} = app.globalData;
			// 从后端拉取数据
			// this.getDataFromSql();
			this.setData({
				navHeight,
				navTop,
				windowHeight,
				windowWidth,
				ratio: 750 / windowWidth,
				bottomLineHeight,
				tasks
			});
			this.setData({
				review: {
					starsNum: this.data.starsNumber,
					tasks: this.data.finishedTasks.map(item => {
						return {
							content: item.content
						}
					})
				}
			})
			// 保留上一次的数据
			let last = wx.getStorageSync('add-chat-last-data');
			if(last) {
				last = JSON.parse(last);
				let {reviewShow, currentAnameIndex, currentShareIndex} = last;
				this.setData({
					reviewShow,
					currentAnameIndex,
					currentShareIndex,
				})
				wx.removeStorageSync('add-chat-last-data');
			}
		},
	},
});
