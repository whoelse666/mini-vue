import { NodeTypes } from "./ast";
const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, []));
}

function parseChildren(context: any, ancestors) {
  const nodes: any = [];
  while (!isEnd(context, ancestors)) {
    const s = context.source;
    let node;
    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
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
  advanceBy(context, start);
  const rawContentLength = closeIndex - start;
  // const rawContent = context.source.slice(start, closeIndex);
  const rawContent = parseTextData(context, rawContentLength);
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

function parseElement(context: any, ancestors): any {
  // 解析标签
  /* 插值 和  文本 不就有子元素，只有element 有子元素，需要处理子节点 */
  const element: any = parseTag(context, TagType.Start);
  // 解析子节点
  console.log("context", context);
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End);
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }
  return element;
}

function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  // advanceBy(context, match[0].length);
  // advanceBy(context, 1);
  advanceBy(context, match[0].length+1);
  if (type === TagType.End) return;

  return {
    type: NodeTypes.ELEMENT,
    tag
  };
}

function parseText(context: any): any {
  const s = context.source;
  let endIndex = s.length;
  const endToken = ["</", "{{"];
  for (let i = endToken.length - 1; i >= 0; i--) {
    const index = s.indexOf(endToken[i]);
    if (index !== -1 && index < endIndex) {
      endIndex = index;
    }
  }

  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content
  };
}

function parseTextData(context: any, length): any {
  const content = context.source.slice(0, length);
  advanceBy(context, length);
  return content;
}

function isEnd(context: any, ancestors) {
  const s = context.source;
  if (s.startsWith("</")) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (startsWithEndTagOpen(s, tag)) {
        return true;
      }
    }
  }
  return !s;
}

function startsWithEndTagOpen(source, tag) {
  return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}
