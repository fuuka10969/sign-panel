<template>
  <div class="sign-panel">
    <canvas
      :ref="bgId"
      class="sign-canvas-bg"
      :id="bgId"
      :style="showBorder && { border: `${borderWidth}px solid ${borderColor}` }"
    ></canvas>
    <canvas
      :ref="domId"
      class="sign-canvas"
      :id="domId"
      @mousedown.prevent.stop="handleMousedown"
      @mousemove.prevent.stop="handleMousemove"
      @mouseup.prevent.stop="handleMouseup"
      @mouseleave.prevent.stop="handleMouseleave"
      @touchstart.prevent.stop="handleTouchstart"
      @touchmove.prevent.stop="handleTouchmove"
      @touchend.prevent.stop="handleTouchend"
    >
      您的浏览器不支持canvas技术,请升级浏览器!
    </canvas>
  </div>
</template>

<script>
export default {
  name: 'SignPanel',
  model: {
    value: 'image',
    event: 'confirm',
  },
  props: {
    image: {
      required: false,
      type: [String],
      default: null,
    },
    width: {
      type: Number,
      default: 360,
    },
    height: {
      type: Number,
      default: 360,
    },
    bgColor: {
      type: String,
      default: '#fff',
    },
    showBorder: {
      type: Boolean,
      default: true,
    },
    borderWidth: {
      type: Number,
      default: 1,
    },
    borderColor: {
      type: String,
      default: '#ccc',
    },
    signText: {
      type: String,
    },
    showBgText: {
      type: Boolean,
      default: true,
    },
    bgTextSize: {
      type: Number,
      default: 240,
    },
    writeWidth: {
      type: Number,
      default: 4,
    },
    maxWriteWidth: {
      type: Number,
      default: 30,
    },
    minWriteWidth: {
      type: Number,
      default: 4,
    },
    color: {
      type: String,
      default: '#101010',
    },
    lineCap: {
      type: String,
      default: 'round',
    },
    lineJoin: {
      type: String,
      default: 'round',
    },
    isSign: {
      type: Boolean,
      default: false,
    },
    imgType: {
      type: String,
      default: 'png',
    },
    autoWriteDone: {
      type: Boolean,
      default: true,
    },
    doneTime: {
      type: Number,
      default: 1500,
    },
    isDpr: {
      type: Boolean,
      default: false,
    },
    isFullScreen: {
      // 暂不实现 是否全屏手写 [Boolean] 可选
      type: Boolean,
      default: false,
    },
    isFullCover: {
      // 暂不实现 是否全屏模式下覆盖所有的元素 [Boolean] 可选
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      value: null, // base64
      domId: `sign-canvas-${Math.random().toString(36).substr(2)}`, // 生成唯一dom标识
      bgId: `sign-canvas-bg-${Math.random().toString(36).substr(2)}`, // 生成唯一dom标识
      canvas: null, //canvas dom对象
      context: null, //canvas 画布对象
      dpr: 1,
      writeDoneTimer: null,
      resizeTimer: null,
      penWidth: this.writeWidth,
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
    this.init();
    window.addEventListener('resize', this.resizeCanvasInit, true);
  },

  methods: {
    // 监听窗口变化
    resizeCanvasInit() {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.init();
      }, 1000);
    },

    init() {
      this.dpr =
        typeof window !== 'undefined' && this.isDpr
          ? window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || 1
          : 1;
      this.canvas = document.getElementById(this.domId);
      this.canvasBg = document.getElementById(this.bgId);
      this.context = this.canvas.getContext('2d');
      this.contextBg = this.canvasBg.getContext('2d');
      this.canvasBg.style.background = this.bgColor;

      this.canvasInit(this.canvas);
      this.canvasInit(this.canvasBg);

      this.canvasClear();
    },

    /**
     * 设置画布尺寸
     */
    setCanvasSize(canvas) {
      // if (this.isFullScreen) {
      //   this.width = window.innerWidth || document.body.clientWidth;
      //   this.height = window.innerHeight || document.body.clientHeight;
      //   if (this.isFullCover) { // 开启全屏覆盖
      //     canvas.style.position = 'fixed';
      //     canvas.style.top = 0;
      //     canvas.style.left = 0;
      //     canvas.style.margin = 0;
      //     canvas.style.zIndex = 20001;
      //   }
      // }
      canvas.height = this.width;
      canvas.width = this.height;
    },

    /**
     * 初始化画板
     */
    canvasInit(canvas) {
      const { dpr } = this;
      canvas.width = this.width * dpr;
      canvas.height = this.height * dpr;
      canvas.style.width = `${this.width}px`;
      canvas.style.height = `${this.height}px`;
      this.emptyCanvas = canvas.toDataURL(`image/${this.imgType}`);
    },

    /**
     * 清空画板
     */
    canvasClear() {
      if (this.autoWriteDone && this.writeDoneTimer) {
        clearTimeout(this.writeDoneTimer);
      }
      const { context, contextBg } = this;
      context.save();
      contextBg.save();
      context.strokeStyle = this.color;
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      contextBg.clearRect(0, 0, this.canvas.width, this.canvas.height);
      context.beginPath();
      contextBg.beginPath();
      if (this.showBorder && !this.isSign) {
        this.setBgLineDash(this.canvasBg, contextBg);
      }
      if (this.showBgText && this.signText) {
        this.setShowSignText(contextBg);
      }

      contextBg.restore();
      context.restore();
    },

    /**
     * 绘制画框中虚线
     */
    setBgLineDash(canvasBg, contextBg) {
      const { width, height } = canvasBg;
      contextBg.lineWidth = this.borderWidth * this.dpr;
      contextBg.strokeStyle = this.borderColor;

      contextBg.setLineDash([8, 8]);
      contextBg.moveTo(0, 0);
      contextBg.lineTo(width, height);
      contextBg.stroke();
      contextBg.moveTo(width, 0);
      contextBg.lineTo(0, height);
      contextBg.stroke();
      contextBg.moveTo(width, 0);
      contextBg.lineTo(0, height);
      contextBg.stroke();
      contextBg.moveTo(width / 2, 0);
      contextBg.lineTo(width / 2, height);
      contextBg.stroke();
      contextBg.moveTo(0, height / 2);
      contextBg.lineTo(width, height / 2);
      contextBg.stroke();
    },

    /**
     * 绘制画框中提示的临摹文字
     */
    setShowSignText(contextBg) {
      const { width, height, bgTextSize } = this;
      contextBg.font = `${bgTextSize}px sans-serif`;
      contextBg.textBaseline = 'middle';
      contextBg.fillStyle = 'rgba(0, 0, 0, 0.1)';
      const x = (width - bgTextSize) / 2;
      const y = height / 2 + 20;
      const maxWidth = width - (width - bgTextSize) / 2;
      contextBg.fillText(this.signText, x, y, maxWidth);
    },

    /**
     * 轨迹宽度
     */
    setLineWidth() {
      const { context, dpr } = this;
      const nowTime = new Date().getTime();
      const diffTime = nowTime - this.lastWriteTime;
      this.lastWriteTime = nowTime;
      let returnNum = this.minWriteWidth + ((this.maxWriteWidth - this.minWriteWidth) * diffTime) / 30;
      if (returnNum < this.minWriteWidth) {
        returnNum = this.minWriteWidth;
      } else if (returnNum > this.maxWriteWidth) {
        returnNum = this.maxWriteWidth;
      }
      returnNum = returnNum.toFixed(2);
      // 写字模式和签名模式
      if (this.isSign) {
        context.lineWidth = this.penWidth * dpr;
      } else {
        const lineWidth = (this.penWidth = (this.penWidth / 4) * 3 + returnNum / 4);
        context.lineWidth = lineWidth * dpr;
      }
    },

    /**
     * 写开始
     */
    writeBegin(point) {
      if (this.autoWriteDone && this.writeDoneTimer) {
        clearTimeout(this.writeDoneTimer);
      }
      if (this.signText) {
        this.isWrite = true;
        this.lastWriteTime = new Date().getTime();
        this.lastPoint = point;
        this.writeContextStyle();
      }
    },

    /**
     * 绘制轨迹
     */
    writing(point) {
      const { context, dpr } = this;
      context.beginPath();
      context.moveTo(this.lastPoint.x * dpr, this.lastPoint.y * dpr);
      context.lineTo(point.x * dpr, point.y * dpr);
      this.setLineWidth();
      context.stroke();
      this.lastPoint = point;
      context.closePath();
    },

    /**
     * 写结束
     */
    writeEnd(point) {
      this.isWrite = false;
      this.lastPoint = point;
      if (this.autoWriteDone) {
        this.writeDoneTimer = setTimeout(() => {
          const image = this.saveAsImg();
          this.$emit('confirm', image);
        }, this.doneTime);
      }
    },

    /**
     * 轨迹样式
     */
    writeContextStyle() {
      this.context.beginPath();
      this.context.strokeStyle = this.color;
      this.context.lineCap = this.lineCap;
      this.context.lineJoin = this.lineJoin;
    },

    /**
     *  保存图片 格式base64
     */
    saveAsImg() {
      const image = new Image();
      image.src = this.canvas.toDataURL(`image/${this.imgType}`);
      this.canvasInit(this.canvas);
      this.canvasInit(this.canvasBg);
      this.canvasClear();
      return image.src;
    },

    /**
     * 鼠标按下 => 下笔
     */
    handleMousedown(e) {
      this.writeBegin({ x: e.offsetX || e.clientX, y: e.offsetY || e.clientY });
    },

    /**
     * 书写过程 => 下笔书写
     */
    handleMousemove(e) {
      this.isWrite && this.writing({ x: e.offsetX, y: e.offsetY });
    },

    /**
     * 鼠标松开 => 提笔
     */
    handleMouseup(e) {
      this.writeEnd({ x: e.offsetX, y: e.offsetY });
    },

    /**
     * 离开书写区域 => 提笔离开
     */
    handleMouseleave(e) {
      this.isWrite = false;
      this.lastPoint = { x: e.offsetX, y: e.offsetY };
    },

    /* ==========================移动端兼容=Start================================ */

    /**
     * 手指按下 => 下笔
     */
    handleTouchstart(e) {
      const touch = e.targetTouches[0];
      const x = touch.clientX ? touch.clientX - this.getRect().left : touch.pageX - this.offset(touch.target, 'left');
      const y = touch.clientY ? touch.clientY - this.getRect().top : touch.pageY - this.offset(touch.target, 'top');
      this.writeBegin({ x, y });
    },

    /**
     * 手指移动 => 下笔书写
     */
    handleTouchmove(e) {
      const touch = e.targetTouches[0];
      const x = touch.clientX ? touch.clientX - this.getRect().left : touch.pageX - this.offset(touch.target, 'left');
      const y = touch.clientY ? touch.clientY - this.getRect().top : touch.pageY - this.offset(touch.target, 'top');
      this.isWrite && this.writing({ x, y });
    },

    /**
     * 手指移动结束 => 提笔离开
     */
    handleTouchend(e) {
      const tcs = e.targetTouches;
      const ccs = e.changedTouches;
      const touch = (tcs && tcs.length && tcs[0]) || (ccs && ccs.length && ccs[0]);
      const x = touch.clientX ? touch.clientX - this.getRect().left : touch.pageX - this.offset(touch.target, 'left');
      const y = touch.clientY ? touch.clientY - this.getRect().top : touch.pageY - this.offset(touch.target, 'top');
      this.writeEnd({ x, y });
    },

    /* ==========================移动端兼容=End================================== */

    /**
     * 下载二维码到本地
     */
    downloadImg(name) {
      const c = this.$refs[this.domId];
      const dataURL = c.toDataURL('image/png');
      this.saveFile(dataURL, name ? `${name}.${this.imgType}` : `${Date.parse(new Date())}.${this.imgType}`);
    },

    /**
     * 保存文件
     */
    saveFile(data, filename) {
      const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
      saveLink.href = data;
      saveLink.download = filename;
      const event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      saveLink.dispatchEvent(event);
    },

    /**
     * 获取画布的元素的大小及其相对于视口的位置
     * @return {}
     */
    getRect() {
      return this.$refs[this.domId].getBoundingClientRect();
    },

    /**
     * 获取dom对象的偏移量 可以获取解决position定位的问题
     * @returns number
     */
    offset(obj, direction) {
      //将top,left首字母大写,并拼接成offsetTop,offsetLeft
      const offsetDir = 'offset' + direction[0].toUpperCase() + direction.substring(1);
      let realNum = obj[offsetDir];
      let positionParent = obj.offsetParent; //获取上一级定位元素对象
      while (positionParent != null) {
        realNum += positionParent[offsetDir];
        positionParent = positionParent.offsetParent;
      }
      return realNum;
    },

    /**
     * 图片压缩
     */
    dealImage() {
      //压缩系数0-1之间
      // var quality = 0.6;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var dealWidth = 300; //目标尺寸
      var dealHeight = 200;
      canvas.width = dealWidth;
      canvas.width = dealHeight;

      // if (Math.max(imgWidth, imgHeight) > w) {
      //     if (imgWidth > imgHeight) {
      //         canvas.width = w
      //         canvas.height = w * imgHeight / imgWidth
      //     } else {
      //         canvas.height = w
      //         canvas.width = w * imgWidth / imgHeight
      //     }
      // } else {
      //     canvas.width = imgWidth
      //     canvas.height = imgHeight
      //     quality = 0.6
      // }
      const c = this.$refs[this.domId];
      const dataURL = c.toDataURL('image/png');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(dataURL, 0, 0, canvas.width, canvas.height);
      // var ba = canvas.toDataURL('image/jpeg', quality) //压缩语句
    },
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeCanvasInit, true);
  },
};
</script>

<style lang="less" scoped>
.sign-panel {
  position: relative;
  .sign-canvas-bg {
    position: absolute;
    z-index: -1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .sign-canvas {
    display: block;
    margin: 0 auto;
  }
}
</style>
