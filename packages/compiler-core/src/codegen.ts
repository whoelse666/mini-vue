import { isString } from "@mini-vue/shared";
import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING, helperMapName, CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

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
  // push("\n");
  push(" return ");
  genNode(ast.codegenNode, context);
  // push("\n");
  push("}");
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
  push(" return ");
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
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
    default:
      break;
  }
}

function genCompoundExpression(node: any, context: any) {
  const { push } = context;
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      //  中间加入的  " + "
      push(child);
    } else {
      genNode(child, context);
    }
  }
}

/* 
const { toDisplayString: _toDisplayString, openBlock: _openBlock, createElementBlock: _createElementBlock } = Vue
return function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("div", null, "hi," + _toDisplayString(_ctx.message)))
}
*/
function genElement(node: any, context: any) {
  const { push, helper } = context;
  const { children, tag, props } = node;
  // const child = children[0];
  push(`${helper(CREATE_ELEMENT_VNODE)}(`);
  genNodeList(genNullable([tag, props, children]), context);
  /*   push(`${helper(CREATE_ELEMENT_VNODE)}(${tag},${props},`);
  // 处理后符合类型只有一个children， 真实的children 在 children[0]里面
  children && genNode(children, context); */
  /*   for (let i = 0; i < children.length; i++) {
    const child = children[i];
    genNode(child, context);
    // if (i < children.length - 1) {
    //   push("+");
    // }
  } */
  push(")");
}

function genNodeList(nodes, context) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (/* !node || */ isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }
    if (i < nodes.length - 1) {
      push(",");
    }
  }
}

function genNullable(args: any[]) {
  return args.map(arg => arg || "null");
}

function genExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}

// 插值类型
function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}

// 文本类型
function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}
