const computedBehavior = require("miniprogram-computed").behavior;
const menuBehavior = require("../../behavior/menu-behavior");
const shareChatBehavior = require("../../behavior/share-chat-behavior");
const util = require("../../utils/util");
const store = require("../../store/store");
const app = getApp();

Component({
	behaviors: [computedBehavior, menuBehavior, shareChatBehavior],
	/**
	 * 组件的属性列表
	 */
	properties: {},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 页面名称，[树洞，个人空间]
		pageNames: [
			{ icon: "/src/image/tabbar-share.png", title: "树洞区" },
			{ icon: "/src/image/tabbar-self-room.svg", title: "个人空间" },
		],
		// 当前选中的页面
		pageNameCurrent: 0,
		selectIconRotate: false,
		showMenu: false,
		tasks: [],
		lists: [],
		signText: "",
		// 需要展示的轮播图地址
		gallerys: [],
		// 当前轮播图 index
		currentGallery: 0,
		// 说说功能选项
		options: [
			{ icon: "/src/image/option-report.svg", content: "举报" },
			{ icon: "/src/image/option-power.svg", content: "权限" },
			{ icon: "/src/image/option-delete.svg", content: "删除" },
		],
		optionShow: false,
		optionButton: [{ text: "取消" }, { text: "确认" }],
		optionDialogContent: "",
		shareRangeShow: false,
		// 说说 {id, owner, reviewAbridge{}, pic{headIcon, name, date, content, shareRange}}, comments{id, title, content}}
		chats: [],
		// 下拉刷新
		pullDownRefresh: false,
		scrollTop: 0,
		chatsRemindShow: false,
	},

	computed: {
		// 当前页面使用的功能
		optionsSelect: function (data) {
			// 树洞区为举报，个人空间为权限和删除
			if (data.pageNameCurrent === 0) {
				return data.options.filter(item => item.content === "举报");
			} else if (data.pageNameCurrent === 1) {
				return data.options.filter(
					item => item.content === "权限" || item.content === "删除"
				);
			}
		},
		// 当前页面展示的说说
		chatsShow(data) {
			let pageNameCurrent = data.pageNameCurrent;
			let chats = data.chats.filter(item => {
				return (pageNameCurrent && item.owner === app.globalData.owner)
				|| (!pageNameCurrent && !item.pic.shareRange);
			})
			chats.sort((a, b) => b.pic.date.localeCompare(a.pic.date));
			return chats;
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
			let height = 36 * this.data.pageNames.length - 2;
			this.animate(
				".listSelectWrap",
				[
					{ height: !selectIconRotate ? height + "px" : 0 },
					{ height: selectIconRotate ? height + "px" : 0 },
				],
				200
			);
		},
		pageNameCurrent: function (pageNameCurrent) {
			// [树洞区，个人空间]
		},
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 包裹说说的滚轮滑动
		handleScroll(e) {
			
		},
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
			this.handleShowSelectList();
			this.setData({
				pageNameCurrent: e.currentTarget.dataset.index,
			});
		},
		// 控制菜单的显示
		handleShowMenu: function (e) {
			this.setData({
				showMenu: true,
			});
		},
		// 导航去消息提醒页面
		handleNavigateToMessageRemind(e) {
			wx.navigateTo({
				url: "/src/pages/message-remind/message-remind",
			});
		},
		// 新建说说
		handleAddChat(e) {
			wx.navigateTo({
				url: "/src/pages/add-chat/add-chat",
			});
		},
		// 当前轮播图 index 改变
		handleChangeCurrentGallery(e) {
			this.setData({
				currentGallery: e.detail.current
			})
		},
		// 跳转 web-view
		handleOpenOfficialAccount(e) {
			let gallery = this.data.gallerys[this.data.currentGallery];
			wx.navigateTo({
				url: '/src/pages/web-view/web-view?src=' + JSON.stringify(gallery.url)
					+ '&title=' + JSON.stringify(gallery.title),
			})
		},
		// 下拉刷新，加载数据，这里暂时为全部时间段的
		async pullDownLoad() {
			// let chsats = [
			// 	{
			// 		picid: 1,
			// 		owner: app.globalData.owner,
			// 		data: {
			// 			reviewAbridge: {
			// 				safeAreaBottom: this.data.safeAreaBottom,
			// 				componentHeightMin: 100,
			// 				componentWidthMax: this.data.windowWidth,
			// 				starsNum: 4,
			// 				tasks: [{content: "哈"},],
			// 			},
			// 			pic: {
			// 				picId: 1,
			// 				headIcon: "/src/image/head-icon-yellow.svg",
			// 				name: "黄黄",
			// 				date: "2020-12-21T12:12:12Z",
			// 				content: "说说",
			// 				shareRange: 0
			// 			},
			// 		},
			// 		time: "2020-12-21T12:12:12.111222Z",
			// 		article: [
			// 			{
			// 				pic_id: 1,
			// 				url: "url/1/",
			// 				content: "some",
			// 				time: "2020-12-21T12:12:12.111222Z",
			// 				pic: "url/1/",
			// 				from_user: "url/" + app.globalData.owner + '/',
			// 				to_user: "url/" + app.globalData.owner + '/',
			// 			},
			// 		],
			// 	},
			// ];
			this.setData({
				pullDownRefresh: true,
			});
			let { owner, token } = await util.getTokenAndOwner(app.globalData.url + "login/login/");
			// 说说
			let chatsSqlPr = store.getDataFromSqlByUrl(app.globalData.url + 'community/blog/', {owner, token});
			// 轮播图
			let gallerysSqlPr = store.getDataFromSqlByUrl(app.globalData.url + 'oppicture/op/', {owner, token});
			// 消息提示
			let chatsRemindSqlPr = store.getDataFromSqlByUrl(app.globalData.url + 'notice/notice/', {owner, token});
			let dataSql = await Promise.all([chatsSqlPr, gallerysSqlPr, chatsRemindSqlPr])
			let chats = util.formatChatsFromSqlToLocal(dataSql[0]);
			chats.forEach(item => {
				item.id = util.getUniqueId();
			});
			console.log(chats)
			let gallerys = dataSql[1].map(item => {
				return {
					icon: item.op_picture,
					url: item.art_url,
					title: item.op_title
				}
			});
			let chatsRemind = dataSql[2].map(item => {
				let chat;
				chats.forEach(item => {
					if(item.pic.picId === item.pic.picId)
						chat = item;
				})
				return {
					fromUser: item.report_from_user,
					toUser: item.report_to_user,
					chat: chat,
					content: item.report_json.content,
					url: item.url,
				}
			});
			console.log(chatsRemind)
			this.setData({
				chats,
				gallerys,
				pullDownRefresh: false,
				chatsRemindShow: Boolean(chatsRemind.length)
			});
			wx.setStorageSync('chats', JSON.stringify(chats));
			wx.setStorageSync('gallerys', JSON.stringify(gallerys));
			wx.setStorageSync('chatsRemind', JSON.stringify(chatsRemind));
		},
		// 点击回到顶部
		handleReturnTop() {
			this.setData({
				scrollTop: 0
			})
		},
		// 从本地获取全部数据
		_getAllDataFromLocal: function () {
			// 获取任务
			let tasks = JSON.parse(wx.getStorageSync("tasks") || JSON.stringify([]));
			// 获取清单
			let lists = JSON.parse(wx.getStorageSync("lists") || JSON.stringify([]));
			// 用户昵称
			let signText = JSON.parse(wx.getStorageSync("signText") || JSON.stringify(''));
			let chats = JSON.parse(wx.getStorageSync('chats') || JSON.stringify([]));
			let gallerys = JSON.parse(wx.getStorageSync('gallerys') || JSON.stringify([]));
			let chatsRemind = JSON.parse(wx.getStorageSync('chatsRemind') || JSON.stringify([]));
			this.setData({
				tasks,
				lists,
				signText,
				chats,
				gallerys,
				chatsRemind,
				chatsRemindShow: Boolean(chatsRemind.length),
			});
		},
		// 加载一些数据
		onLoad() {
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
				pullDownRefresh: true,
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
				selected: 2,
			});
		},
		hide: function () {},
	},
});
