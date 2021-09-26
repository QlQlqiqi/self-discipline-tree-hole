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
		// 页面名称，[树洞，个人空间]
		pageNames: [
			{icon: '/src/image/tabbar-share.png', title: '树洞'}, 
			{icon: '/src/image/tabbar-self-room.svg', title: '个人空间'}
		],
		// 当前选中的页面
		pageNameCurrent: 0,
		selectIconRotate: false,
		showMenu: false,
		tasks: [],
		lists: [],
		signText: '',
		// 需要展示的轮播图地址
		imageUrls: ['/src/image/option-report.svg','/src/image/option-report.svg','/src/image/option-report.svg'],
		// 当前轮播图 index
		currentGallery: 0,
		// 说说功能选项
		options: [
			{ icon: '/src/image/option-report.svg', content: '举报' },
			{ icon: '/src/image/option-power.svg', content: '权限' },
			{ icon: '/src/image/option-delete.svg', content: '删除' }
		],
		// 说说 {headIcon, name, date, content, comments{title, content}}
		chats: [
			{
				headIcon: '/src/image/head-icon-yellow.svg',
				name: '黄黄',
				date: '2020-12-21T12:12:12Z',
				content: '说说',
				comments: [
					{title: '洞主', content: '哈哈'},
					{title: '洞主', content: '哈哈'}
				]
			},
			{
				headIcon: '/src/image/head-icon-yellow.svg',
				name: '黄黄',
				date: '2020-12-21T12:12:12Z',
				content: '说说',
				comments: [
					{title: '洞主', content: '哈哈'},
					{title: '洞主', content: '哈哈'}
				]
			}
		]
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
			let height = 36 * this.data.pageNames.length - 2;
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
			this.handleShowSelectList();
			this.setData({
				pageNameCurrent: e.currentTarget.dataset.index
			})
		},
		// 控制菜单的显示	
		handleShowMenu: function(e) {
			this.setData({
				showMenu: true
			});
		},
		// 新建说说
		handleAddChat(e) {
			wx.navigateTo({
				url: '/src/pages/add-chat/add-chat'
			})
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
		handleNavigateToShare: function(e) {
			wx.switchTab({
				url: '/src/pages/share/share',
			});
		},


		// 发送评论
		handleEnsureComment(e) {
			console.log(e)
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
				tasks,
				lists,
				signText
			});
		},

		// 加载一些数据
		onLoad() {
			// 设置机型相关信息
			let {navHeight, navTop, windowHeight, windowWidth, bottomLineHeight} = app.globalData;
			
			this.setData({
				navHeight,
				navTop,
				windowHeight,
				windowWidth,
				ratio: 750 / windowWidth,
				bottomLineHeight
			})
		}
	},

	/**
	 * 组件所在页面生命周期
	 */
	pageLifetimes: {
		show: function() {
			this._getAllDataFromLocal();
			// 切换 tabbar 时候显示该页面
			this.getTabBar().setData({
				selected: 2
			})
		},
		hide: function() {}
	},
})
