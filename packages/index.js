// 导入单个组件
import SignPanel from './SignPanel';
SignPanel.install = function (Vue) {
    Vue.component(SignPanel.name, SignPanel);
}
// 导出的对象必须具备一个 install 方法
export default SignPanel;
