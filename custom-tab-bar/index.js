const app = getApp();
Component({
  data: {
    selected: 0,
    color: "#888",
    selectedColor: "#4B844D",
    list: [{
      pagePath: "/src/pages/collection/collection",
      iconPath: "/src/image/tabbar-collection-unselected.png",
      selectedIconPath: "/src/image/tabbar-collection.png",
      text: "收集箱"
    }, {
      pagePath: "/src/pages/review/review",
      iconPath: "/src/image/tabbar-review-unselected.png",
      selectedIconPath: "/src/image/tabbar-review.png",
      text: "回顾"
    }, {
      pagePath: "/src/pages/share/share",
      iconPath: "/src/image/tabbar-share-non.png",
      selectedIconPath: "/src/image/tabbar-share.png",
      text: "树洞"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      // 切换 tabbar 页面
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({url})
      this.setData({
        selected: data.index
      });
    }
  }
})