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
  // if (!context.source) {
  //   return;
  // }
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length + 1);
  // advanceBy(context, match[0].length);
  // advanceBy(context, 1);

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

// 函数parseTextData用于解析文本数据
function parseTextData(context: any, length): any {
  // 从context.source中截取前length个字符
  const content = context.source.slice(0, length);
  // 调用advanceBy函数，使context.source跳过length个字符
  advanceBy(context, length);
  // 返回content
  return content;
}

// 函数isEnd用于判断是否为结束标签
function isEnd(context: any, ancestors) {
  // 从context.source中获取字符串
  const s = context.source;
  // 判断context.source是否以"</"开头
  if (s.startsWith("</")) {
    // 从后往前遍历ancestors数组
    for (let i = ancestors.length - 1; i >= 0; i--) {
      // 获取标签
      const tag = ancestors[i].tag;
      // 判断context.source是否以"</"开头，且标签名与tag相同
      if (startsWithEndTagOpen(s, tag)) {
        // 返回true
        return true;
      }
    }
  }
  // 返回context.source是否为空字符串
  return !s;
}

// 函数startsWithEndTagOpen用于判断context.source是否以"</"开头，且标签名与tag相同
function startsWithEndTagOpen(source, tag) {
  // 判断context.source是否以"</"开头
  return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}
