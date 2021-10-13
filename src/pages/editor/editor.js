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
		// 优先级种类
		priorityRange: ["重要且紧急", "紧急不重要", "重要不紧急", "不重要不紧急"],
		// 展示优先级
		showPriority: false,
		priorityColor: ['#D01929', '#E79100', '#C477FF', '#969595'],
		priorityIconSrc: ['/src/image/priority0.png', '/src/image/priority1.png',
			'/src/image/priority2.png', '/src/image/priority3.png'],
		// 优先级展开的 margin-left 位置(单位：px)
		showPriorityLeft: 0,
		// 重复种类
		repeatRange: ["不重复", "每天", "每周", "每月", "每年"]
	},

	computed: {
		
	},

	watch: {
		"task.date": function(date) {
			if(this.data.task.date.localeCompare(this.data.startDate) < 0
			|| this.data.task.date.localeCompare(this.data.endDate) > 0) {
				this.data.task.date = date;
				this.setData({
					task: this.data.task
				});
			}
		}
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		onLoad: function(options) {
			let tasks = JSON.parse(wx.getStorageSync('tasks')), lists = JSON.parse(wx.getStorageSync('lists'));
			let task = JSON.parse(options.task || JSON.stringify({
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
			}));
			// 如果指明了 list 
			let list = JSON.parse(options.list || JSON.stringify(''));
			if(list)
				task.list = list;
			console.log(list)
			let taskId = JSON.parse(options.taskId || JSON.stringify(false));
			let isEditorTask = JSON.parse(options.isEditorTask || JSON.stringify(false));
			// 如果是新建任务
			if(!isEditorTask) {
				tasks = util.mergeById(tasks, task);
			}
			else {
				for(let tmp of tasks) {
					if(tmp.id === taskId) {
						task = tmp;
						break;
					}
				}
			}
			// 清单种类
			let listRange = lists.map(item => item.title);
			this.setData({
				tasks: tasks,
				task: task,
				lists: lists,
				listRange: listRange,
				startDate: util.formatDate(new Date()),
				selectIndex: listRange.indexOf(task.list.title),
				isEditorTask: isEditorTask,
				navHeight: app.globalData.navHeight,
				navTop: app.globalData.navTop,
				windowHeight: app.globalData.windowHeight,
				windowWidth: app.globalData.windowWidth
			});
		},
		// 控制页面回退
		handleBack: function() {
			wx.navigateBack();
		},
		// 清单选择器改变时
		bindlistPickerChange: function(e) {
			this.data.task.list.title = this.data.listRange[e.detail.value];
			this.setData({
				task: this.data.task,
				selectIndex: e.detail.value
			});
		},
		// 显示优先级
		handleShowPriority: function(e){
			this.setData({
				showPriority: !this.data.showPriority,
				showPriorityLeft: e.detail.x
			})
		},
		// 优先级选择器改变时
		handleSelectPriority: function(e) {
			this.data.task.priority = e.currentTarget.dataset.index;
			this.setData({
				task: this.data.task,
				showPriority: false
			});
		},
		// 重复选择器改变时
		handleRepeatPickerChange: function(e) {
			this.data.task.repeat = e.detail.value;
			this.setData({
				task: this.data.task
			});
		},
		// 日期选择器改变时
		handleChangeTime: function(e) {
			this.data.task.date = e.detail.time;
			this.setData({
				task: this.data.task
			});
		},
		// 控制任务的完成与否
		handleTaskFinish: function(e) {
			// 修改 finish
			let task = this.data.task;
			task.finish = !task.finish;
			task.finishDate = util.formatDate(new Date());
			this.setData({
				task: task
			});
		},
		// 删除任务，保存数据并返回上一个页面
		handleDelete: function(e) {
			// 如果是新增任务，则直接返回
			if(!this.data.isEditorTask) {
				this.handleBack();
				return;
			}
			let task = this.data.task;
			task.delete = true;
			this.handleEnsure();
		},
		// 点击完成，检查数据是否合法，保存数据，并返回上一个页面
		handleEnsure: async function() {
			let {tasks, task} = this.data;
			if(!task.content.length) {
				this.setData({
					errorDialogMsg: "任务内容不得为空",
					showErrorDialog: true
				});
				return;
			}
			// 保存数据
			wx.showLoading({
				title: '正在保存数据...',
				mask: true
			})
			// task.date = "2021-10-11T13:24:33Z"
			// task.finish = true;
			tasks = util.mergeById(tasks, [task]);
			let {owner, token} = await util.getTokenAndOwner(app.globalData.url + 'login/login/');
			await store.saveTasksToSql([task], this.data.lists, {owner, token});
			console.log(task)
			wx.setStorageSync('tasks', JSON.stringify(tasks));
			wx.hideLoading({
				success: () => {
					wx.showToast({
						title: '已完成',
						duration: 800
					})
				},
			})
			this.handleBack();
		},
		// 关闭弹窗
		dialogClose: function(e) {
			this.setData({
				showErrorDialog: false
			})
		},
		// 任务内容绑定输入
		contentInput: function(e) {
			this.data.task.content = e.detail.value;
			this.setData({
				task: this.data.task
			})
		},
		// 描述说明绑定输入
		descInput: function(e) {
			this.data.task.desc = e.detail.value;
			this.setData({
				task: this.data.task
			})
		}
	}
})
