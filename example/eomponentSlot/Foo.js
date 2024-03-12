import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";
export const Foo = {
  setup() {
    return {};
  },
  render() {
    const foo = h("p", {}, "foo");
    // /foo .vnode.children
    // const renderSlots = array.isArray(this.$slots) ? h("div", { class: "foo" }, [foo, ...this.$slots]) : h("div", { class: "foo" }, [foo, this.$slots]);
    // const renderSlots = h("div", { class: "foo" }, [foo, this.$slots]);

    // return h("div", { class: "foo" }, [renderSlots(this.$slots, "footer", { name: "哈利波特帅" }), foo, renderSlots(this.$slots, "header", { num: 99 })]);
    return h("div", { class: "foo" }, [renderSlots(this.$slots, "footer", { name: "哈利波特帅" }), foo, renderSlots(this.$slots, "header", { num: 99 })]);
  }
};

// export const Foo = {
//   setup() {
//     return {};
//   },
//   render() {
//     const foo = h("p", {}, "foo ");
//     // Foo .vnode. children
//     console.log(111, this.$slots);
//     // children -> vnode
//     //
//     // renderSlots
//     // 具名插槽
//     // 1. 获取到要渲染的元素 1
//     // 2. 要获取到渲染的位置
//     // 作用域插槽
//     const age = 18;
//     return h("div", {class:'foo'}, [
//       // header,
//       foo,
//       this.$slots
//       // footer
//       // renderSlots(this.$slots, "header", {
//       //   age
//       // }),
//       // foo
//       // renderSlots(this.$slots, "footer")
//     ]);
//   }
// };
