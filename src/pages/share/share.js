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
		chatShowCounts: 0,
		chatsShow: [],
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
		// chatsShow(data) {
		// 	let pageNameCurrent = data.pageNameCurrent;
		// 	let chats = data.chats.filter(item => {
		// 		return (
		// 			(pageNameCurrent && item.owner === app.globalData.owner) ||
		// 			(!pageNameCurrent && !item.pic.shareRange)
		// 		);
		// 	});
		// 	chats.sort((a, b) => b.pic.date.localeCompare(a.pic.date));
		// 	return chats;
		// },

		// 当前页面展示的说说
		// chatsShow(data) {
		// 	return data._chatsShow.slice(0, data.chatShowCounts);
		// }
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
		// chatShowCounts: function (chatShowCounts) {
		// 	this._updateChatsShow();
		// },
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		// 包裹说说的滚轮滑动
		handleScroll(e) {},
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
				currentGallery: e.detail.current,
			});
		},
		// 跳转 web-view
		handleOpenOfficialAccount(e) {
			let gallery = this.data.gallerys[this.data.currentGallery];
			wx.navigateTo({
				url:
					"/src/pages/web-view/web-view?src=" +
					JSON.stringify(gallery.url) +
					"&title=" +
					JSON.stringify(gallery.title),
			});
		},
		// 更新显示的 chatsShow
		_updateChatsShow(reload = false) {
			let { pageNameCurrent, chats, chatShowCounts, chatsShow } = this.data;
			if(reload) chatsShow = [];
			if (chatShowCounts === chats.length) return;
			let bound = Math.min(chatShowCounts + 5, chats.length);
			// 设置显示的 chats
			for (let i = chatShowCounts; i < bound; i++) {
				let item = chats[i];
				if (
					(pageNameCurrent && item.owner === app.globalData.owner) ||
					(!pageNameCurrent && !item.pic.shareRange)
				)
					chatsShow.push(item);
			}
			// console.log(chatsShow);
			// chatsShow.sort((a, b) => b.pic.date.localeCompare(a.pic.date));
			this.setData({
				chatsShow,
			});
		},
		// 触底刷新
		handleLowerRefresh() {
			let len = this.data.chats.length,
				chatShowCounts = this.data.chatShowCounts;
			if (len <= chatShowCounts) return;
			chatShowCounts = Math.min(chatShowCounts + 5, len);
			this._updateChatsShow();
			this.setData({
				chatShowCounts,
			});
		},
		// 下拉刷新，加载数据，这里暂时为全部时间段的
		pullDownLoad() {
			this.setData({
				pullDownRefresh: true,
				chatShowCounts: 0,
			});
			util
				.getTokenAndOwner(app.globalData.url + "login/login/")
				.then(({ owner, token }) => {
					// 说说
					let chatsSqlPr = store.getDataFromSqlByUrl(
						app.globalData.url + "community/blog/",
						{ owner, token }
					);
					// 轮播图
					let gallerysSqlPr = store.getDataFromSqlByUrl(
						app.globalData.url + "oppicture/op/",
						{ owner, token }
					);
					// 消息提示
					let chatsRemindSqlPr = store.getDataFromSqlByUrl(
						app.globalData.url + "notice/notice/",
						{ owner, token }
					);
					Promise.all([chatsSqlPr, gallerysSqlPr, chatsRemindSqlPr]).then(
						dataSql => {
							let chats = util.formatChatsFromSqlToLocal(dataSql[0]);
							// chats.forEach(item => {
							// 	item.id = util.getUniqueId();
							// });
							console.log(chats);
							let gallerys = dataSql[1].map(item => {
								return {
									icon: item.op_picture,
									url: item.art_url,
									title: item.op_title,
								};
							});
							let chatsRemind = dataSql[2]
								.filter(item => {
									return item.report_json.receiver === owner;
								})
								.map(item => {
									return {
										fromUser: item.report_from_user,
										toUser: item.report_to_user,
										chat: item.report_json.chat,
										content: item.report_json.content,
										url: item.url,
									};
								});
							chats.sort((a, b) => b.pic.date.localeCompare(a.pic.date));
							// console.log(chatsRemind)
							this.setData({
								chats,
								gallerys,
								pullDownRefresh: false,
								chatsRemindShow: Boolean(chatsRemind.length),
							});
							this._updateChatsShow(true);
							wx.setStorageSync("chats", JSON.stringify(chats));
							wx.setStorageSync("gallerys", JSON.stringify(gallerys));
							wx.setStorageSync("chatsRemind", JSON.stringify(chatsRemind));
						}
					);
				});
		},
		// 删除评论 dialog
		handleDeleteDialogShow(e) {
			let { deleteShow, chatId, commentId } = e.detail;
			this.setData({
				deleteShow,
				deleteChatId: chatId,
				deleteCommentId: commentId,
			});
		},
		// 删除评论 dialog buttons
		handleDeleteDialog(e) {
			let { deleteChatId, deleteCommentId } = this.data;
			if (e.detail.index)
				this.handleDeleteComment({
					chatId: deleteChatId,
					commentId: deleteCommentId,
				});
			this.setData({
				deleteShow: false,
			});
		},
		// 点击回到顶部
		handleReturnTop() {
			this.setData({
				scrollTop: 0,
			});
		},
		// 从本地获取全部数据
		_getAllDataFromLocal: function () {
			// 获取任务
			let tasks = JSON.parse(wx.getStorageSync("tasks") || "[]");
			// 获取清单
			let lists = JSON.parse(wx.getStorageSync("lists") || "[]");
			// 用户昵称
			let signText = JSON.parse(
				wx.getStorageSync("signText") || JSON.stringify("")
			);
			let chats = JSON.parse(wx.getStorageSync("chats") || "[]");
			let gallerys = JSON.parse(wx.getStorageSync("gallerys") || "[]");
			let chatsRemind = JSON.parse(wx.getStorageSync("chatsRemind") || "[]");
			this.setData({
				chats,
				tasks,
				lists,
				signText,
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
