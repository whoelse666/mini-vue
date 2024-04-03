import { h } from "../../dist/mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    // emit
    return h("div", {}, [
      h("div", {}, "App"),
      h(Foo, {
        count: 1,
        onAddFoo(val) {
          console.log("onAddFoo",val);
        },
        onAdd2(a,b) {
          console.log("onAdd2", a, b);
        },
        onAdd(a, b) {
          console.log("onAdd", a, b);
        }
      }),
      h("ol", { class: "red" }, "hi"),
      h(
        "p",
        {
          class: "blue",
          onClick: () => {
            console.log("click");
          },
          onMousedown: () => {
            console.log("onmousedown");
          }
        },
        "mini-vue" + this.msg
      ),
      h(
        "ul",
        {
          class: "test"
        },
        [h("span", null, "test666")]
      )
    ]);
  },

  setup() {
    return {};
  }
};
