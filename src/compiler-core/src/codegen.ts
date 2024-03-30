// 拼接 在codegen，数据结构转换在transform.ts
// 导出一个函数，用于生成代码
export function generate(ast) {
  // 创建一个上下文
  const context = createCodegenContext();
  // 获取上下文的push方法
  const { push } = context;
  const fnName = " render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(",");
  push(`function ${fnName}( ${signature}){`);
  push("\n");
  push("return ");
  // 生成代码
  genNode(ast.codegenNode, context);
  push(";");
  push("\n}");
  return context;
}

// 创建一个代码生成上下文
function createCodegenContext() {
  // 创建一个上下文对象，用于存储代码生成上下文
  const context = {
    code: "",
    // 实现push方法，用于将源代码添加到上下文中
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
/* 

return function render(_ctx, _cache, $props, $setup, $data, $options) {
  return "hi"
}

*/
