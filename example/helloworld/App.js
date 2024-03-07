import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
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
        h("ol", { class: "red" }, "hi"),
        h("p", { class: "blue" }, "mini-vue"),
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
      msg: "666"
    };
  }
};
