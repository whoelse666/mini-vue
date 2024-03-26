import { NodeTypes } from "./ast";
const enum TagType {
  Start,
  End
}
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
    } else if (s[0] === "<") {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context);
      }
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
  const start = openChar.length,
    end = closeChar.length;
  const closeIndex = context.source.indexOf(closeChar, start);
  // advanceBy(context, start);
  const rawContentLength = closeIndex - start;
  const rawContent = context.source.slice(0, rawContentLength);
  // const rawContent = parseTextData(context, rawContentLength);
  advanceBy(context, end);
  console.log("rawContent", rawContent);
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

// function parseElement(context: any): any {
//   // 解析标签
//   /* 插值 和  文本 不就有子元素，只有element 有子元素，需要处理子节点 */
//   const element: any = parseTag(context);
//   // 解析子节点
//   console.log("context", context);
//   element.children = parseChildren(context);
//   return element;
// }

function parseElement(context: any): any {
  // 解析标签
  /* 插值 和  文本 不就有子元素，只有element 有子元素，需要处理子节点 */
  const element: any = parseTag(context, TagType.Start);
  // 解析子节点
  console.log("context", context);

  element.children = parseChildren(context);
  parseTag(context, TagType.End);
  return element;
}

function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  // advanceBy(context, match[0].length);
  advanceBy(context, match[0].length);
  // advanceBy(context, 1);

  if (type === TagType.End) return;

  return {
    type: NodeTypes.ELEMENT,
    tag
  };
}

function parseText(context: any): any {
  const content = parseTextData(context);
  console.log("content", content);
  return {
    type: NodeTypes.TEXT,
    content
  };
}

function parseTextData(context: any): any {
  const s = context.source;
  console.log("s===", s);

  let content = s;
  let endIndex = s.length;
  const endToken = ["</", "{{"];
  for (let i = endToken.length - 1; i >= 0; i--) {
    const index = s.indexOf(endToken[i]);
    if (index !== -1 && index < endIndex) {
      endIndex = index;
    }
  }
  content = s.slice(0, endIndex);

  console.log("content===", content);

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