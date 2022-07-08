<template>
  <div id="app">
    <div class="tips">温馨提示：请使用正楷在框内签署您的名字，注意字迹工整。</div>
    <div class="text-list">
      <div
        v-for="(item, i) in nameList"
        :key="i"
        :class="['text-item', {'is-active': activeIndex === i}]"
      >
        {{ item }}
      </div>
    </div>
    <sign-panel
      class="sign-canvas"
      ref="signPanel"
      :signText="nameList[activeIndex]"
      :lastWriteSpeed="4"
      @confirm="handleCompare"
    />
    <div class="confirm-text">已输入文字</div>
    <div class="view-list">
      <img v-for="(item, i) in imgList" :key="i" class="view-image" :src="item" width="150" height="150">
    </div>
    <div class="button-footer">
      <button class="button" @click="canvasClear()">清空</button>
      <button class="button" @click="downloadImg()">下载</button>
      <button class="button button-primary" :class="{'is-disabled': !signDone}" :disabled="!signDone" @click="submitImg()">提交</button>
    </div>
  </div>
</template>
<script>
import SignPanel from '../packages';

export default {
  data() {
    return {
      name: '',
      nameList: [],
      imgList: [],
      activeIndex: 0,
      signDone: false
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.name = '测试试';
      this.nameList = this.name.split('');
      this.getVerifyTask();
    },

    // AI手绘图文校验服务API创建任务
    getVerifyTask() {
      setTimeout(() => {
        this.taskId = '12345';
      }, 1000)
    },
    /**
     * 清除画板
     */
    canvasClear() {
      this.$refs.signPanel.canvasClear();
      this.imgList = []
      this.activeIndex = 0
    },
    // 下载
    downloadImg() {
      this.$refs.signPanel.downloadImg();
    },

    /**
     * 提交签名
     */
    submitImg() {
    },
    /**
     * 验证并更新文字
     */
    handleCompare(val) {
      if (val && this.imgList.length < this.nameList.length) {
        if (val && this.imgList.length < this.nameList.length) {
          // 验证签名是否正确
          // const params = {
          //   aiVerifyTaskId: this.taskId,
          //   handDrawImageBase64: val,
          //   nameNode: this.nameList[this.activeIndex],
          // };
          setTimeout(() => {
            const res = {
              verifyResult: true,
              taskResult: false,
            }
            // verifyResult 校验当前文字与手绘图片内容
            if (res.verifyResult) {
              this.imgList.push(val);
              this.activeIndex += 1;
              // taskResult 整个手绘校验任务的校验结果
              if (res.taskResult && this.imgList.length === this.nameList.length) {
                this.isSuccess = true;
              }
            } else {
              alert('签名无法识别, 请用正楷字体重新签署')
            }
          }, 1000);
        }
      }
    },
  },
  components: {
    'sign-panel': SignPanel
  },
}
</script>
<style lang="less">
* {
  margin: 0;
  padding: 0;
}
#app {
  touch-action: none;
}
.tips{
  margin: 16px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.sign-canvas{
  display: block;
  margin: 20px auto;
}
.confirm-text {
  text-align: center;
}
.text-list {
  display: flex;
  justify-content: center;
  .text-item {
    display: block;
    margin: 10px;
    width: 60px;
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-size: 40px;
    border: 2px solid transparent;
    &.is-active {
      border-color: #ccc;
    }
  }
}
.view-list {
  display: flex;
  justify-content: center;
  height: 80px;
  .view-image{
    display: block;
    margin: 10px 6px;
    width: 60px;
    height: 60px;
  }
}
.config{
  width: 350px;
  margin: 20px auto;
  .ul-config{
    .li-c{
      display: flex;
      align-items: center;
      padding: 4px 10px;
      .item-label{
        font-size: 14px;
      }
      .item-content{
        margin-left: 10px;
      }
    }
  }
}
.button-footer {
  display: flex;
  justify-content: space-around;
  padding: 8px;
  .button {
    width: 100px;
    height: 50px;
    line-height: 50px;
    background: #fff;
    border-radius: 10px;
    text-align: center;
    border: 1px solid #ccc;
    cursor: pointer;
    &.button-primary {
      border-color: transparent;
      color: #fff;
      background: #1a90ff;
    }
    &.is-disabled {
      background: #e5e5e5;
    }
  }
}
</style>
