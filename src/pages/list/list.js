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
		// 需要展示的任务
		tasks: [],
		// 标题
		pageName: "",
		taskItemColor: ['#D01929', '#F0AD4D', '#CF92FF', '#BABBBA']
	},

	computed: {
		showTasks: function(data) {
			let res = data.tasks.filter(function(item) {
				return (!item.delete || data.pageName === "过期 / 删除任务");
			});
			res.sort((a, b) => a.date.localeCompare(b.date) );
			return res;
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		// 获取数据
		onLoad: function(options) {
			// 设置机型相关信息
			let app = getApp();
			this.setData({
				navHeight: app.globalData.navHeight,
				navTop: app.globalData.navTop,
				windowHeight: app.globalData.windowHeight,
				windowWidth: app.globalData.windowWidth
			});
			this.setData({
				tasks: JSON.parse(options.tasks || JSON.stringify([])),
				pageName: JSON.parse(options.pageName || JSON.stringify("")),
				isDelete: JSON.parse(options.isDelete || JSON.stringify(false)),
				disabled: JSON.parse(options.disabled || JSON.stringify(false)),
				rawTasks: JSON.parse(options.tasks || JSON.stringify([])),
				rawPageName: JSON.parse(options.pageName || JSON.stringify(""))
			});
			console.log(this.data)
		},
		// 返回上一页面，如果修改过数据，则弹窗询问是否保存数据
		handleBack: function() {
			if(this.data.editor) {
				this.setData({
					showDialog: true,
					dialogMsg: "是否保存数据？",
					editor: false
				});
				// 确定
				this._handleDialogDefine = function(_this) {
					this.getOpenerEventChannel().emit("_handleSaveData", {
						tasks: this.data.tasks
					})
					wx.navigateBack();
					delete _this._handleDialogDefine;
				}
				// 取消
				this._handleDialogCancel = function(_this) {
					wx.navigateBack();
					delete _this._handleDialogCancel;
				}
			}
			else wx.navigateBack();
			console.log(this.data)
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
			let lists = JSON.parse(wx.getStorageSync('lists'));
			// 默认 list 
			for(let list of lists) {
				if(list.title === this.data.pageName) 
					task.list = list;
			}
			let _this = this;
			wx.navigateTo({
				url: '/src/pages/editor/editor?task=' + JSON.stringify(task)
					+ "&lists=" + JSON.stringify(lists),
				events: {
					// 触发事件保存数据
					_handleSaveData: (data) => { 
						util._handleSaveData(_this, data);
						this.setData({
							editor: true
						});
					}
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
				tasks: this.data.tasks,
				editor: true
			});
		},
		// 编辑每一个任务
		handleEditor: function(e) {
			let task;
			for(let item of this.data.tasks) {
				if(item.id === e.currentTarget.dataset.id) {
					task = item;
					break;
				}
			}
			let lists = JSON.parse(wx.getStorageSync('lists'));
			let _this = this;
			wx.navigateTo({
				url: '/src/pages/editor/editor?task=' + JSON.stringify(task)
					+ "&lists=" + JSON.stringify(lists)
					+ "&isEditorTask=" + JSON.stringify(true),
				events: {
					// 编辑页面完成编辑后，触发事件保存数据
					_handleSaveData: (data) => {
						util._handleSaveData(_this, data);
						_this.setData({
							tasks: _this.data.tasks,
							editor: true
						})
					}
				}
			})
		},
		// 控制任务完成与否
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
				tasks: tasks,
				editor: true
			});
		},
		// 删除清单，显示弹窗询问是否删除
		handleDeleteList: function(e) {
			this.setData({
				showDialog: true,
				dialogMsg: "是否删除该清单及其该清单中所有任务（包括曾经完成或未完成的任务）？"
			});
			// 如果“确定”则执行下面
			this._handleDialogDefine = function(_this) {
				this.getOpenerEventChannel().emit("_handleDeleteList", {
					pageName: _this.data.rawPageName
				});
				delete _this._handleDialogDefine;
				wx.navigateBack();
			}
		},
		// 当点击弹窗“确定”时，关闭弹窗，告诉父组件删除清单及任务，并返回上一层
		handleDialogButtonTap: function(e) {
			let index = e.detail.index;
			if(index === 1 && typeof this._handleDialogDefine === "function")
				this._handleDialogDefine(this);
			else if(!index && typeof this._handleDialogCancel === "function")
				this._handleDialogCancel(this);
			this.setData({
				showDialog: false
			});
		},
		onUnload: function() {}
	}
})
