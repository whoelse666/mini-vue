import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING, helperMapName } from "./runtimeHelpers";

// 拼接 在codegen.ts,数据结构转换在transform.ts
export function generate(ast) {
  // 创建一个上下文
  const context = createCodegenContext();
  // 获取上下文的push方法
  const { push } = context;
  const fnName = " render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(",");
  genFunctionPreamble(ast, context);
  push(`function ${fnName}( ${signature}){`);
  push("\n");
  push("return ");
  genNode(ast.codegenNode, context);

  push("\n}");
  return context;
}

// 处理导入 模块的函数  const { toDisplayString: _toDisplayString } = Vue
function genFunctionPreamble(ast: any, context) {
  const { push } = context;
  const VueBinging = "Vue";
  const aliasHelper = s => `${helperMapName[s]}:_${helperMapName[s]}`;
  if (ast.helpers.length > 0) {
    // 推送helper的格式化结果
    push(`const { ${ast.helpers.map(aliasHelper)}} = ${VueBinging} `);
    push("\n");
  }
  push("return ");
}

// 创建一个代码生成上下文
function createCodegenContext() {
  // 创建一个上下文对象,用于存储代码生成上下文
  const context = {
    code: "",
    // 实现push方法,用于将源代码添加到上下文中
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
      // return `_${helperMapName[key]}`;
    }
  };
  // 返回上下文对象
  return context;
}

// 生成节点函数
function genNode(node: any, context) {
  console.log("node,context.code", node, context.code);
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    default:
      break;
  }
}

function genExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}
function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  console.log("context.code", context.code);
  genNode(node.content, context);
  push(")");
}

function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}
