import { h } from "../../dist/mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: "hard"
      },
      // "hi, " + this.msg
      // string
      // "hi, mini-vue"
      // Array
      [
        h(Foo, {
          count: 1
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
      ]
    );
  },

  setup() {
    return {
      msg: "代理值"
    };
  }
};
