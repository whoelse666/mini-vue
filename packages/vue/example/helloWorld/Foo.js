import { h } from "../../dist/mini-vue.esm.js";

export const Foo = {
  setup(props) {
    console.log(props.count);
    //props 不可修改,使用 shallowReadonly 
    props.count++;
    console.log(props.count);
  },
  render() {
    return h("div", {}, "foo: " + this.count);
  }
};
