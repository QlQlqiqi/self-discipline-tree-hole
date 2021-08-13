### 微信小程序——自律树洞

### version 1.0.0

### 第一个 0 - 1 的项目

- **起初和后端尽量把字段确认好，并尽量给未来需要的字段留出空间。**

比如：目前“个性签名”字段为一个 String ，未来可能需要增加“修改日期”的功能，则个性签名字段应为一个 Object ，这样在扩展字段的时候直接增加属性即可。

- **布局要合理**。

比如：即使页面简单，也不要过度依赖 absolute 进行布局，因为它会增大后续的扩展难度，尽量使用 flex 或 grid 布局。

- **前后端数据交互时机和内容要合理。**

比如：目前我选择了最笨拙的方式，即：在 tabbar 页面触发 onshow 的时候与后端进行数据交互，并且交互内容为全部数据。
这就导致前后端交互量极大，且不合理。*这是因为第一次进行前后端交互，不知道具体如何交互，所以起初设计的时候没有考虑周全。*

- **修复左侧弹出菜单在特定情况下(页面滑动到底部)显示位置会偏移**

需求：

    点击 navbar 上菜单 icon ，从左侧弹出菜单，位置相对屏幕固定，可以上下滑动。

问题： 

    无论如何实现，当页面高度随着内容数量增多时，页面会上下滑动，当滑动到顶部或者底部时，<munu> 会相应的显示位置**过高或过低**。
    
解决：

    为页面内容增加一个 <view-scroll> ，设置高度为 100% ，这样保证内容可以上下滑动且页面是不会上下滑动的，然后在 <menu> 内部
    增加 <view-scroll> ，设置高度 height 的原则是不会引起页面上下滑动，保证 <menu> 可以上下滑动的同时位置又相对屏幕固定。
    
#### 设计前想好页面架构、页面间数据通信方式、前后端交互方式和时机，页面设计不能只依靠 absolute。

### 小结

总的来说，此次项目较为简单，但是还有的地方没有处理好（左侧栏在特定情况下位置会偏移），作为上手的第一个项目较为合适。
