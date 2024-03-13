import { h, renderSlots, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";
export const Foo = {
  render() {
    const foo = h("p", {}, "foo");
    // /foo .vnode.children
    // const renderSlots = array.isArray(this.$slots) ? h("div", { class: "foo" }, [foo, ...this.$slots]) : h("div", { class: "foo" }, [foo, this.$slots]);
    // const renderSlots = h("div", { class: "foo" }, [foo, this.$slots]);

    // return h("div", { class: "foo" }, [renderSlots(this.$slots, "footer", { name: "哈利波特帅" }), foo, renderSlots(this.$slots, "header", { num: 99 })]);

    return h("div", { class: "foo" }, [renderSlots(this.$slots, "footer", { name: "哈利波特帅" }), foo, renderSlots(this.$slots, "header", { num: 99 })]);
  },
  setup() {
    return {};
  }
};
