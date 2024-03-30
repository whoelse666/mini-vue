/* 
const { toDisplayString: _toDisplayString } = Vue
return function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _toDisplayString(_ctx.message)
}
*/

import { NodeTypes } from "./ast";
const helpersObj = {
  toDisplayString: "toDisplayString"
};

function formatHelpers(v) {
  return "_" + v;
}

// 拼接 在codegen.ts,数据结构转换在transform.ts
export function generate(ast) {
  // 创建一个上下文
  const context = createCodegenContext();
  // 获取上下文的push方法
  const { push } = context;
  const VueBinging = "Vue";
  const helpers = ["toDisplayString"];

  if (NodeTypes.INTERPOLATION === ast.children[0].type) {
    push("const { ");
    for (let i = 0; i < helpers.length; i++) {
      const helper = helpers[i];
      push(`${helpersObj[helper]}: ${formatHelpers(helpersObj[helper])}`);
      if (i < helpers.length-1) {
        push(",");
      }
    }
    push(`} = ${VueBinging} `);
    push("\n");
  }

  const fnName = " render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(",");

  push("return ");
  push(`function ${fnName}( ${signature}){`);
  push("\n");
  push("return ");

  if (NodeTypes.INTERPOLATION === ast.children[0].type) {
    push("_toDisplayString(_ctx.message)");
  } else if (NodeTypes.TEXT === ast.children[0].type) {
    genNode(ast.codegenNode, context);
  }

  push("\n}");
  console.log("context.code----------------", context.code);
  return context;
}

// 创建一个代码生成上下文
function createCodegenContext() {
  // 创建一个上下文对象,用于存储代码生成上下文
  const context = {
    code: "",
    // 实现push方法,用于将源代码添加到上下文中
    push(source) {
      context.code += source;
    }
  };
  // 返回上下文对象
  return context;
}

// 生成节点函数
function genNode(node: any, context) {
  // 从上下文中获取push方法
  const { push } = context;
  // 将节点的content属性值转换为字符串并放入push方法中
  push(`'${node.content}'`);
}
