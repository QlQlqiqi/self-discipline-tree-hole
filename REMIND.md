1、add-chat 页面，缩略图（组件 review-abridege）添加和删除缩略图时有“闪动”。

2、message-remind 页面未完成。
3、未和进行后端交互。


tip&bug
1、页面 share 发送评论（handleEnsureComment）会先修改本地，然后 post 到后端，本应该在之后的几秒检查是否 post 成功，但是目前并没有。
2、页面 share 改变说说（_handleChangePower）分享范围同上
3、add-chat 页面，缩略图（组件 review-abridege）添加和删除缩略图时有“闪动”。
