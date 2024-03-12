import { h, createTextVNode } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");
    // 逐步: 1. 实现单个slot ,  2.多个使用数组, 3.具名插槽,使用对象
    // let foo = h(Foo, {}, [h("p", {}, "123"), h("p", {}, "567")]);
    // let  foo = h(Foo, {}, [h("p", {}, "123"), h("p", {}, "567")]);
    let foo = h(
      Foo,
      {},
      {
        // 作用于插槽,要接受值,采用函数方式接受children 传递的值
        header: ({ num }) => [h("p", {}, "header-" + num), createTextVNode("你好")],
        footer: ({ name }) => h("p", {}, "footer-" + name)
      }
    );
    return h("div", {}, [app, foo]);
  },
  setup() {
    return;
  }
};
// export const App = {
//   name: "App",
//   render() {
//     const app = h("div", {}, "App");
//     // object key
//     const foo = h(
//       Foo,
//       {},
//       h("p", {}, "123")
//       // {
//         // header: "header",
//         // main: "main",
//         // footer: "footer"
//         // header: ({ age }) => h("p", {}, "header" + age),
//         // footer: () => h("p", {}, "footer")
//       // }
//     );
//     // 数组 vnode
//     // const foo = h(Foo, {}, h("p", {}, "123"));
//     return h("div", {}, [app, foo]);
//   },

//   setup() {
//     return { msg: "mini-666" };
//   }
// };
