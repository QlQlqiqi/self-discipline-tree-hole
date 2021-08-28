const computedBehavior = require("miniprogram-computed").behavior;
const util = require("../../utils/util");
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
		priorityColor: ['#D01929', '#F0AD4D', '#CF92FF', '#BABBBA'],
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
				let val = {...this.data.task};
				val.date = date;
				this.setData({
					task: val
				});
			}
		}
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		onLoad: function(options) {
			// 设置机型相关信息
			let app = getApp();
			this.setData({
				navHeight: app.globalData.navHeight,
				navTop: app.globalData.navTop,
				windowHeight: app.globalData.windowHeight,
				windowWidth: app.globalData.windowWidth
			});
			// 任务
			let task = JSON.parse(options.task);
			let rawTask = JSON.parse(options.task);
			// 提醒种类
			let remindRange = options.remindRange
				? JSON.parse(options.remindRange)
				: ["不提醒", "提前1分钟", "提前5分钟", "提前10分钟", "提前30分钟", "提前1小时"];
			// 清单种类
			let listRange = [];
			for(let list of JSON.parse(options.lists)) {
				listRange.push(list.title);
			}
			// 是否是任务编辑
			let isEditorTask = JSON.parse(options.isEditorTask || JSON.stringify(false));
			this.setData({
				task: task,
				rawTask: rawTask,
				remindRange: remindRange,
				listRange: listRange,
				startDate: util.formatDate(new Date()),
				selectIndex: listRange.indexOf(task.list.title),
				isEditorTask: isEditorTask
			});
			console.log(this.data)
		},
		// 控制页面回退
		handleBack: function() {
			wx.navigateBack();
		},
		// 清单选择器改变时
		bindlistPickerChange: function(e) {
			let val = {...this.data.task};
			val.list.title = this.data.listRange[e.detail.value];
			this.setData({
				task: val,
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
			let index = e.currentTarget.dataset.index;
			// let priority = this.data.priorityRange[index];
			let val = {...this.data.task};
			val.priority = index;
			this.setData({
				task: val,
				// priorityIndex: index,
				showPriority: false
			});
		},
		// 重复选择器改变时
		handleRepeatPickerChange: function(e) {
			let val = {...this.data.task};
			val.repeat = e.detail.value;
			this.setData({
				task: val
			});
		},
		// 日期选择器改变时
		handleChangeTime: function(e) {
			console.log(e.detail)
			let time = e.detail.time.split(' ');
			let val = {...this.data.task};
			val.date = time[0];
			val.time = time[1];
			this.setData({
				task: val
			});
			console.log(this.data.task)
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
			console.log(this.data.task)
		},
		// 删除任务，并触发 _handleSaveData 事件，返回上一个页面
		handleDelete: function(e) {
			let task = this.data.task;
			task.delete = true;
			const eventChannel = this.getOpenerEventChannel();
			eventChannel.emit("_handleSaveData", {
				tasks: [task]
			});
			wx.navigateBack()
		},
		// 点击完成，检查数据是否合法，并触发 _handleSaveData 事件，返回上一个页面
		handleEnsure: function() {
			if(!this.data.task.content.length) {
				this.setData({
					errorDialogMsg: "任务内容不得为空",
					showErrorDialog: true
				});
				return;
			}
			// 触发事件并回退上一个页面
			const eventChannel = this.getOpenerEventChannel();
			console.log(this.data.task)
			eventChannel.emit("_handleSaveData", {
				tasks: [this.data.task]
			});
			wx.navigateBack();
		},
		// 关闭弹窗
		dialogClose: function(e) {
			this.setData({
				showErrorDialog: false
			})
		},
		// 任务内容绑定输入
		contentInput: function(e) {
			let task = this.data.task;
			task.content = e.detail.value;
			this.setData({
				task: task
			})
		},
		// 描述说明绑定输入
		descInput: function(e) {
			let task = this.data.task;
			task.desc = e.detail.value;
			this.setData({
				task: task
			})
		}
	},
	
	/**
	 * 组件生命周期
	 */
	lifetimes: {
		attached: function() {
			
		}
	},

	/**
	 * 页面生命周期
	 */
	pageLifetimes: {
		show: function() {
			
		}
		
	}
})
