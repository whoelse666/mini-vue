import { h, renderSlots, getCurrentInstance } from "../../dist/mini-vue.esm.js";
export const Foo = {
  name: "Foo",
  render() {
    const foo = h("p", {}, "foo");
    return h("div", { class: "foo" }, [renderSlots(this.$slots, "footer", { name: "孙" }), foo, renderSlots(this.$slots, "header", { num: 99 })]);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log("Foo:", instance);
    return {};
  }
};
