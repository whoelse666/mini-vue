import { NodeTypes } from "./ast";

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

function parseChildren(context: any) {
  // const s = context.source;
  const nodes: any = [];
  while (!isEnd(context)) {
    const s = context.source;
    let node;
    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (s.startsWith("<")) {
      console.log("parseElement111", context);
      node = parseElement(context);
      console.log("parseElement222", context);
    }
    if (!node) {
      node = parseText(context);
    }

    nodes.push(node);
  }
  return nodes;
}

function parseInterpolation(context: any) {
  const openChar = "{{";
  const closeChar = "}}";
  let start = openChar.length,
    end = closeChar.length;
  const closeIndex = context.source.indexOf(closeChar, start);
  // const rawContentLength = context.source.length;
  const rawContent = context.source.slice(start, closeIndex);
  advanceBy(context, start);
  advanceBy(context, rawContent.length);
  advanceBy(context, end);
  const content = rawContent.trim();
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content
    }
  };
}

// 创建一个解析上下文，传入内容作为参数
function createParserContext(content: any) {
  return {
    source: content
  };
}

// 创建一个根节点，传入子节点作为参数
function createRoot(children) {
  return {
    children
  };
}
function advanceBy(content, length) {
  content.source = content.source.slice(length);
}

function parseElement(context: any): any {
  // 解析标签
  /* 插值 和  文本 不就有子元素，只有element 有子元素，需要处理子节点 */
  const element: any = parseTag(context);
  // 解析子节点
  console.log("context", context);
  element.children = parseChildren(context);
  return element;
}

function parseTag(context: any) {
  const match: any = /^<\/?([a-z]*)\>/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  return {
    type: NodeTypes.ELEMENT,
    tag
  };
}

function parseText(context: any): any {
  const content = parseTextData(context);
  return {
    type: NodeTypes.TEXT,
    content
  };
}

function parseTextData(context: any): any {
  const s = context.source;
  let content;
  let endIndex = s.length;
  const endToken = ["</", "{{"];
  for (let i = endToken.length - 1; i >= 0; i--) {
    const index = s.indexOf(endToken[i]);
    if (index !== -1 && index < endIndex) {
      endIndex = index;
      content = s.slice(0, endIndex);
    }
  }
  advanceBy(context, content.length);
  return content;
}

function isEnd(context: any) {
  const s = context.source;
  if (s.startsWith("</")) {
    return true;
  }
  return !s;
}
