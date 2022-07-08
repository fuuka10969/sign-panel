<template>
  <view class="sign-panel">
    <canvas
      class="sign-bg"
      canvas-id="sign-bg"
      :style="{ width: `${width}px`, height: `${width}px`, border: `1px solid ${borderColor}` }"
    ></canvas>
    <canvas
      class="sign-canvas"
      canvas-id="sign-canvas"
      :style="{ width: `${width}px`, height: `${width}px` }"
      @touchstart="touchstart"
      @touchmove="touchmove"
      @touchend="touchend"
      disable-scroll="true"
    ></canvas>
  </view>
</template>

<script>
export default {
  name: 'sign-panel',
  props: {
    width: {
      type: Number,
      default: 282,
    },
    height: {
      type: Number,
      default: 282,
    },
    // 当前文字
    signText: {
      type: String,
    },
    bgTextSize: {
      type: Number,
      default: 240,
    },
    color: {
      type: String,
      default: '#3cb035',
    },
    borderColor: {
      type: String,
      default: '#BFDC98',
    },
  },
  data() {
    return {
      imgList: [],
      activeIndex: 0,
      points: [], // 路径点集合
      writeDoneTimer: null,
    };
  },
  watch: {
    signText(val, oldVal) {
      if (val !== oldVal) {
        this.canvasClear();
      }
    },
    deep: true,
    immediate: true,
  },
  mounted() {
    this.$nextTick(() => {
      this.canvasInit();
    });
  },
  methods: {
    // // 初始化画板
    // canvasInit() {
    //   // 创建绘图对象
    //   this.canvasCtx = uni.createCanvasContext('sign-canvas', this);
    //   this.canvasBgCtx = uni.createCanvasContext('sign-bg', this);
    //   const canvasCtx = this.canvasCtx;
    //   // 设置画笔样式
    //   canvasCtx.lineWidth = 10;
    //   canvasCtx.strokeStyle = this.color;
    //   // 设置线条的端点样式
    //   canvasCtx.lineCap = 'round';
    //   // 设置线条的交点样式
    //   canvasCtx.lineJoin = 'round';

    //   this.canvasClear();
    // },
    // // 清空画布
    // canvasClear() {
    //   if (this.writeDoneTimer) {
    //     clearTimeout(this.writeDoneTimer);
    //   }
    //   let that = this;
    //   const { canvasCtx, canvasBgCtx, signText } = this;
    //   uni.getSystemInfo({
    //     success: function (res) {
    //       let canvas = uni.createSelectorQuery().in(that).select('.sign-canvas');
    //       let canvasBg = uni.createSelectorQuery().in(that).select('.sign-bg');
    //       canvas.boundingClientRect().exec(function (data) {
    //         let canvasW = Math.ceil(data[0].width);
    //         let canvasH = Math.ceil(data[0].height);
    //         canvasCtx.clearRect(0, 0, canvasW, canvasH);
    //         canvasCtx.draw(true);
    //       });
    //       canvasBg.boundingClientRect().exec(function (data) {
    //         let canvasW = Math.ceil(data[0].width);
    //         let canvasH = Math.ceil(data[0].height);
    //         canvasBgCtx.clearRect(0, 0, canvasW, canvasH);
    //         canvasBgCtx.beginPath();

    //         that.setSignBgLineDash();
    //         if (signText) {
    //           that.setShowSignText();
    //         }

    //         canvasBgCtx.draw(true);
    //       });
    //     },
    //   });
    // },
    // // 绘制画框中虚线
    // setSignBgLineDash() {
    //   const { canvasBgCtx, width, height, borderColor } = this;
    //   canvasBgCtx.lineWidth = 1;
    //   canvasBgCtx.strokeStyle = borderColor;

    //   canvasBgCtx.moveTo(width / 2, 0);
    //   canvasBgCtx.lineTo(width / 2, height);
    //   canvasBgCtx.stroke();
    //   canvasBgCtx.moveTo(0, height / 2);
    //   canvasBgCtx.lineTo(width, height / 2);
    //   canvasBgCtx.stroke();

    //   canvasBgCtx.setLineDash([8, 8]);
    //   canvasBgCtx.moveTo(0, 0);
    //   canvasBgCtx.lineTo(width, height);
    //   canvasBgCtx.stroke();
    //   canvasBgCtx.moveTo(width, 0);
    //   canvasBgCtx.lineTo(0, height);
    //   canvasBgCtx.stroke();
    //   canvasBgCtx.moveTo(width, 0);
    //   canvasBgCtx.lineTo(0, height);
    //   canvasBgCtx.stroke();
    // },

    // // 绘制画框中提示的临摹文字
    // setShowSignText() {
    //   const { width, height, bgTextSize } = this;
    //   const canvasBgCtx = this.canvasBgCtx;
    //   canvasBgCtx.font = `${bgTextSize}px cursive`;
    //   canvasBgCtx.textBaseline = 'middle';
    //   canvasBgCtx.fillStyle = '#f7f7f7';
    //   const x = (width - bgTextSize) / 2;
    //   const y = height / 2;
    //   const maxWidth = width - (width - bgTextSize) / 2;
    //   canvasBgCtx.fillText(this.signText, x, y, maxWidth);
    // },

    // touchstart(e) {
    //   const { writeDoneTimer, signText, points, canvasCtx } = this;
    //   if (writeDoneTimer) {
    //     clearTimeout(writeDoneTimer);
    //   }
    //   if (signText) {
    //     let startX = e.changedTouches[0].x;
    //     let startY = e.changedTouches[0].y;
    //     let startPoint = {
    //       X: startX,
    //       Y: startY,
    //     };
    //     points.push(startPoint);
    //     //每次触摸开始，开启新的路径
    //     canvasCtx.beginPath();
    //   }
    // },
    // touchmove(e) {
    //   if (this.signText) {
    //     let moveX = e.changedTouches[0].x;
    //     let moveY = e.changedTouches[0].y;
    //     let movePoint = {
    //       X: moveX,
    //       Y: moveY,
    //     };
    //     this.points.push(movePoint); //存点
    //     let len = this.points.length;
    //     if (len >= 2) {
    //       this.draw(); //绘制路径
    //     }
    //   }
    // },
    // touchend() {
    //   if (this.signText) {
    //     this.points = [];
    //     this.canvasCtx.draw(true);
    //     this.writeDoneTimer = setTimeout(() => {
    //       this.saveAsImg();
    //     }, 1500);
    //   }
    // },
    // draw() {
    //   const canvasCtx = this.canvasCtx;
    //   let point1 = this.points[0];
    //   let point2 = this.points[1];
    //   this.points.shift();
    //   canvasCtx.moveTo(point1.X, point1.Y);
    //   canvasCtx.lineTo(point2.X, point2.Y);
    //   canvasCtx.stroke();
    //   canvasCtx.draw(true);
    // },
    // // 保存图片
    // saveAsImg() {
    //   let that = this;
    //   uni.getSystemInfo({
    //     success: function (res) {
    //       // createSelectorQuery 自制组件加.in(this)
    //       let canvas = uni.createSelectorQuery().in(that).select('.sign-canvas');
    //       canvas.boundingClientRect().exec(function (data) {
    //         let canvasW = Math.ceil(data[0].width);
    //         let canvasH = Math.ceil(data[0].height);
    //         // canvasToTempFilePath 自制组件加this指向
    //         uni.canvasToTempFilePath(
    //           {
    //             destWidth: canvasW,
    //             destHeight: canvasH,
    //             fileType: 'png',
    //             canvasId: 'sign-canvas',
    //             success: function (res) {
    //               // console.log('图片导出成功：', res, res.tempFilePathconsole);
    //               let path = res.tempFilePath;
    //               that.$emit('confirm', path);
    //               that.canvasClear();
    //             },
    //             fail: err => {
    //               console.log('图片导出失败：', err);
    //             },
    //           },
    //           that
    //         );
    //       });
    //     },
    //   });
    // },
  },
};
</script>

<style lang="scss" scoped>
// .sign-panel {
//   position: relative;
//   display: flex;
//   justify-content: center;
//   .sign-bg {
//     position: absolute;
//     z-index: 0;
//     top: 50%;
//     left: 50%;
//     transform: translate(-50%, -50%);
//     border-radius: 16rpx;
//     background: #fff;
//     overflow: hidden;
//   }
//   .sign-canvas {
//     display: block;
//     margin: 0 auto;
//   }
// }
</style>
