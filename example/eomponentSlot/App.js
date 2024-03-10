import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");
  let foo = h(Foo, {}, [h("p", {}, "123"), h("p", {}, "567")]);
    //  foo = h(
    //   Foo,
    //   {},
    //   {
    //     header: h("p", {}, "123"),
    //     footer: h("p", {}, "567")
    //   }
    // );
    //  foo = h(Foo, {}, h("p", {}, "123"));
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
