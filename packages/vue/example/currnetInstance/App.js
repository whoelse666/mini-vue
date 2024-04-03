import { h, createTextVNode, getCurrentInstance } from "../../dist/mini-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");
    let foo = h(
      Foo,
      {},
      {
        header: ({ num }) => [h("p", {}, "header-" + num), createTextVNode("你好")],
        footer: ({ name }) => h("p", {}, "footer-" + name)
      }
    );
    return h("div", {}, [app, foo]);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log("App:", instance);
    return;
  }
};
