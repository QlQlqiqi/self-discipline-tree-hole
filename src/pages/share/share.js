const computedBehavior = require("miniprogram-computed").behavior;
const util = require("../../utils/util");
const store = require("../../store/store");
const app = getApp();
const menuBehavior = require("../../behavior/menu-behavior");

Component({
	behaviors: [computedBehavior, menuBehavior],
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
		imageUrls: [
			"/src/image/option-report.svg",
			"/src/image/option-report.svg",
			"/src/image/option-report.svg",
		],
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
		// 说说 {id, owner, pic{headIcon, name, date, content}, comments{title, content}}
		chats: [
			{
				id: 1,
				owner: 1,
				pic: {
					headIcon: "/src/image/head-icon-yellow.svg",
					name: "黄黄",
					date: "2020-12-21T12:12:12Z",
					content: "说说",
				},
				reviewAbridge: {},
				comments: [
					{ id: 1, title: "洞主", content: "哈哈" },
					{ id: 2, title: "洞主", content: "哈哈" },
				],
			},
		],
		// 下拉刷新
		pullDownRefresh: false,
	},

	computed: {
		// 页面展示的说说
		chatsShow: function (data) {
			let owner = app.globalData.owner;
			return data.chats.filter(item => item.owner === owner);
		},
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
	},

	watch: {
		selectIconRotate: function (selectIconRotate) {
			this.animate(
				".listSelectIcon",
				[
					{ rotate: !selectIconRotate ? 180 : 0 },
					{ rotate: selectIconRotate ? 180 : 0 },
				],
				300
			);
			let height = 36 * this.data.pageNames.length - 2;
			this.animate(
				".listSelectWrap",
				[
					{ height: !selectIconRotate ? height + "px" : 0 },
					{ height: selectIconRotate ? height + "px" : 0 },
				],
				300
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
		// 说说的功能区，根据当前页面决定功能
		handleSelectOption(e) {
			let { pageNameCurrent } = this.data;
			let index = e.detail.index;
			// “树洞区”则[举报]功能
			if (!pageNameCurrent) {
				if (!index) {
					this._handleReport();
				}
			}
			// “个人空间”则[权限，删除]功能
			else if (pageNameCurrent === 1) {
				if (!index) {
					this._handleChangePower();
				} else if (index === 1) {
					this._handleDeleteMessage();
				}
			}
		},
		// 举报说说（un-interactive）
		_handleReport() {
			// 确认
			let ensure = () => {
				// 发送数据到后端
				this.setData({
					optionShow: false,
				});
			};
			let cancel = () => {
				this.setData({
					optionShow: false,
				});
			};
			this._optionButtons = [cancel, ensure];
			this.setData({
				optionShow: true,
				optionButton: [{ text: "取消" }, { text: "确认" }],
				optionDialogContent: "你确定要举报该状态违规吗？",
			});
		},
		// 改变说说分享范围（un-interactive）
		_handleChangePower(ensure) {
			// 确认
			if (!ensure) {
				ensure = () => {
					// 发送数据到后端

					// 改变选中的
					this.setData({
						shareRangeShow: false,
						// _currentShareRangeIndex
					});
				};
			}
			let cancel = () => {
				this.setData({
					shareRangeShow: false,
				});
			};
			this._optionButtons = [cancel, ensure];
			this.setData({
				shareRangeShow: true,
				optionButton: [
					{ text: "取消", type: "default" },
					{ text: "确定", type: "primary" },
				],
				optionDialogContent: ["大家的树洞", "仅自己可见"],
			});
		},
		// 删除说说（un-interactive）
		_handleDeleteMessage() {
			// 确认
			let ensure = () => {
				// 发送数据到后端
				this.setData({
					optionShow: false,
				});
			};
			let cancel = () => {
				this.setData({
					optionShow: false,
				});
			};
			this._optionButtons = [cancel, ensure];
			this.setData({
				optionShow: true,
				optionButton: [{ text: "取消" }, { text: "删除" }],
				optionDialogContent: "删除该状态？",
			});
		},
		// 弹窗 buttons 功能
		handleDialogButtons(e) {
			let { index } = e.detail;
			this._optionButtons[index]();
			delete this._optionButtons;
			delete this._currentShareRangeIndex;
		},
		// 记录选择的分享范围
		handleChangeShareRange(e) {
			this._currentShareRangeIndex = e.detail.value[0];
		},
		// 发送评论（un-interactive）
		handleEnsureComment(e) {
			let {content} = e.detail;
			
		},
		// 下拉刷新，加载数据，这里暂时为全部时间段的（un-interactive）
		async pullDownLoad() {
			this.setData({
				pullDownRefresh: true,
			});
			// let { owner, token } = await util.getTokenAndOwner(
			// 	app.globalData.url + "login/login/"
			// );
			let chats= [
				{
					picid: 1,
					owner: app.globalData.owner,
					data: {
						reviewAbridge: {
							safeAreaBottom: this.data.safeAreaBottom,
							componentHeightMin: 100,
							componentWidthMax: this.data.windowWidth,
							starsNum: 4,
							tasks: [
								{
									content: "哈",
								},
							],
						},
						pic: {
							headIcon: "/src/image/head-icon-yellow.svg",
							name: "黄黄",
							date: "2020-12-21T12:12:12Z",
							content: "说说",
						},
					},
					time: "2020-12-21T12:12:12.111222Z",
					article: [
						{
							url: "url/1/",
							content: "some",
							time: "2020-12-21T12:12:12.111222Z",
							pic: "url/1/",
							from_user: "url/" + app.globalData.owner + '/',
							to_user: "url/1/",
						},
					],
				},
			];
			// let chats = util.formatChatsFromSqlToLocal(await store.getDataFromSqlByUrl(
			// 	app.globalData.url + "community/blog/",
			// 	{token}
			// ));
			chats = util.formatChatsFromSqlToLocal(
				await new Promise(function (resolve) {
					setTimeout(() => {
						resolve(JSON.parse(JSON.stringify(chats)));
					}, 1000);
				})
			);
			console.log(chats)
			this.setData({
				chats,
				pullDownRefresh: false,
			});
			wx.setStorage({
				key: 'chats',
				data: JSON.stringify(chats)
			})
		},
		// 从本地获取全部数据
		_getAllDataFromLocal: function () {
			// 获取任务
			let tasks = JSON.parse(wx.getStorageSync("tasks"));
			// 获取清单
			let lists = JSON.parse(wx.getStorageSync("lists"));
			// 用户昵称
			let signText = JSON.parse(wx.getStorageSync("signText"));
			this.setData({
				tasks,
				lists,
				signText,
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
			});
			// this.pullDownLoad();
			this.setData({
				pullDownRefresh: true
			})
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
