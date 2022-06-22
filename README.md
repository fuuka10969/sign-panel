# sign-panel 签名面板


## Attributes
| 参数            | 说明     | 类型  | 可选值  | 默认值|
|---------------- | ------------------------------ | ------ | - | ----- |
| width           | 画布宽度                       | Number  | - | 360 |
| height          | 画布高度                       | Number  | - | 360 |
| bg-color        | 画布背景色（canvas背景,保存的图片仍然是透明的） | String | - | #fff |
| show-border     | 显示网格线                     | Boolean | true\/false | true |
| border-width    | 网格线宽度                     | Number  | - | 1 |
| border-color    | 网格线颜色                     | String  | - | #ccc |
| sign-text       | 签字内容                       | String  | - | - |
| show-bg-text    | 画布背景显示写入文字提示       | Boolean | true\/false | true |
| bg-text-size    | 画布背景文字大小               | Number  | - | 240 |
| write-width     | 基础轨迹宽度                   | Number  | - | 4 |
| max-write-width | 写字模式最大线宽               | Number  | - | 30 |
| min-write-width | 写字模式最小线宽               | Number  | - | 4 |
| color           | 轨迹颜色                       | String  | - | #101010 |
| line-cap        | 线条的边缘类型                 | String  | `butt`平直的边缘 `round`圆形线帽 `square`	正方形线帽 | round |
| line-join       | 线条交汇时边角的类型           | String  | `bevel`创建斜角 `round`创建圆角 `miter`创建尖角 | round |
| is-sign         | 签名模式，签名模式没有画布网格 | Boolean | true\/false | false |
| img-type        | 下载的图片格式                 | String  | png\/jpeg | png |
| auto-write-done | 停笔`done-time`秒时间后默认绘制结束，发送confirm事件 | Boolean | true\/false | true |
| done-time       | 默认绘制结束所需的时间，以毫秒为单位，`auto-write-done`为`true`时生效 | Number | - | 1500 |
| is-dpr          | 是否使用dpr兼容高分屏          | Boolean | true\/false | false |

## Event
| 事件名称 | 说明 | 回调参数 |
| --- | --- | --- |
| confirm | `auto-write-done`默认绘制结束后调用的事件 | 生成的当前画布base64值 |

## Methods
| 方法名称 | 说明 | 参数 |
| --- | --- | --- |
| canvasClear | 用于清空canvas内容           | - |
| saveAsImg   | 返回canvas格式为base64的图片 | - |
| downloadImg | 下载canvas上的图片           | - |