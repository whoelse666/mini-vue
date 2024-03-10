import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log("props===", props);
      console.log("emit===", emit);
      emit("add", 1, 2);
      emit("add2", 5,6);
      emit("add-foo", "add-foo->addFoo");
    };
    return {
      emitAdd
    };
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd
      },
      "emitAdd"
    );

    const foo = h("p", {}, "foo");
    return h("div", {}, [foo, btn]);
  }
};
