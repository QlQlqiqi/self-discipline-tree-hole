App({
  globalData: {
    url: 'https://witime.wizzstudio.com/'
  },
  onLaunch() {
    // 获取设备相关信息
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top,
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight)*2;
          // 导航栏高度
        this.globalData.navHeight = navHeight;
        // 导航栏距离顶部距离
        this.globalData.navTop = navTop;
        // 可使用窗口高度
        this.globalData.windowHeight = res.windowHeight;
        // 可使用窗口宽度
        this.globalData.windowWidth = res.windowWidth;
        // 底部“黑线”高度
        this.globalData.bottomLineHeight = res.windowHeight - res.safeArea.bottom;
      },
      fail(err) {
        console.error(err);
      }
    })

    // 提示用户更新内容
    if(!wx.getStorageSync('noticeUpdateContent')) {
      wx.setStorageSync('noticeUpdateContent', JSON.stringify(true));
      this.globalData.noticeUpdateContent = true;
    }
  }
})
