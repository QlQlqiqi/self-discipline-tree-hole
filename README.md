### 微信小程序——自律树洞

#### -1.0.0

##### 第一个 0 - 1 的项目

- **起初和后端尽量把字段确认好，并尽量给未来需要的字段留出空间。**

比如：目前“个性签名”字段为一个 String ，未来可能需要增加“修改日期”的功能，则个性签名字段应为一个 Object ，这样在扩展字段的时候直接增加属性即可。

- **布局要合理**。

比如：即使页面简单，也不要过度依赖 absolute 进行布局，因为它会增大后续的扩展难度，尽量使用 flex 或 grid 布局。

- **前后端数据交互时机和内容要合理。**

比如：目前我选择了较为笨拙的方式，即：在 tab-bar 页面触发 onShow 的时候与将全部数据保存在本地，每隔 30s 将当前数据同步到后端。
*待以后有更好的办法再来优化*

- **修复左侧弹出菜单在特定情况下(页面滑动到底部)显示位置会偏移**

需求：

​		点击 navbar 上菜单 icon ，从左侧弹出菜单，位置相对屏幕固定，可以上下滑动。

问题： 

​		无论如何实现，当页面高度随着内容数量增多时，页面会上下滑动，当滑动到顶部或者底部时，<munu> 会相应的显示位置过高或过低。

解决：

​		为页面内容增加一个 <view-scroll> ，设置高度为 100% ，这样保证内容可以上下滑动且页面是不会上下滑动的，然后在 <menu> 内部增加 <view-scroll> ，设置高度 height 的原则是不会引起页面上下滑动，保证 <menu> 可以上下滑动的同时位置又相对屏幕固定。

##### 设计前想好页面架构、页面间数据通信方式、前后端交互方式和时机，页面设计不能只依靠 absolute。

#### -1.3.0:

- -完全重构数据交互和存储方式

>以前：

1、数据以本地为主，每一定时间（30s）同步到服务器一次。
2、数据通信时采用最笨拙的方式，即，先删除服务器的全部数据，然后再将新的数据全部加上去。

> 现在：

1、数据以服务器为主，每次数据的更改都会及时同步到服务器。
2、需要 put / delete / post 的数据分别采用不同的方式，只针对该数据进行更改。

### -1.3.1

- -修复部分机型标题栏高度过低的问题

> 使 navbar 和“胶囊”对齐。

#### -1.3.2

- -优化 tab-bar 标签栏 UI
- -修复部分机型页面显示不同 bug

#### -1.4.0

- -新增“创建任务”按钮的可拖拽和自动归位的功能

> 1、直接在 js 文件中监听 touchmove 事件，会使得拖动十分卡顿，所以需要放在 wxs 文件中监听，会变得十分流畅。
>
> 2、因为拖拽是在 wxs 中实现的，所以“自动归位”功能必须也要在 wxs 中实现，不能在 js 中实现，因为 wxs 设置的 style 优先级高于在 js 中通常设置 top 和 left 数据影响 dom 的 style 的优先级。
>
> 3、在 touchmove 中不能直接设置 dom 的位置为鼠标的位置，因为 dom 也是有大小的，所以需要在 touchstart 中记录点击时的位置，然后通过在 touchmove 中监听前后的鼠标位置差来改变 dom 位置，可以不会让 dom 在点击的一瞬间产生“抖动”。

- -新增向用户提示更新内容的功能
- -修复个性签名不能同步到服务器的问题



### 小结

总的来说，此次项目较为简单，但是还有的地方没有处理好（左侧栏在特定情况下位置会偏移），作为上手的第一个项目较为合适。
