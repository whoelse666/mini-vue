import { NodeTypes } from "./ast";
const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  // 处理数据结构  {    source: content   };
  const context = createParserContext(content);
  const res = parseChildren(context, []);
  // 处理数据结构  { children:[{    source: content   }]};
  return createRoot(res);
}

// 解析子节点
function parseChildren(context: any, ancestors) {
  const nodes: any = [];
  while (!isEnd(context, ancestors)) {
    let node;
    const s = context.source;
    // 如果代码以 {{ 开始
    if (s.startsWith("{{")) {
      // 解析插值表达式
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      // 检查字符串s的第二个字符是否为小写字母
      if (/[a-z]/i.test(s[1])) {
        // 如果是，则调用parseElement函数，获取新的node节点
        node = parseElement(context, ancestors);
      }
    }

    if (!node) {
      // 解析文本节点
      node = parseText(context);
    }
    // 将节点推入nodes数组
    nodes.push(node);
  }
  // 返回nodes数组
  return nodes;
}

function isEnd(context, ancestors) {
  const s = context.source;
  if (s.startsWith("</")) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (startsWithEndTagOpen(s, tag)) {
        return true;
      }
    }
    return true;
  }
  return !s;
}

// 函数startsWithEndTagOpen()用于检查字符串source是否以tag结尾
function startsWithEndTagOpen(source, tag) {
  // 如果source以</开头，并且tag的大小写与source中slice(2, 2 + tag.length)的大小写相等
  if (source.startsWith("</") && tag.toLowerCase() === source.slice(2, 2 + tag.length).toLowerCase()) {
    // 返回true
    return true;
  }
}

// 解析文本
function parseText(context: any) {
  let endIndex = context.source.length;
  let endTokens = ["<", "{{"];
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }

  // 从上下文中提取内容
  const content = parseTextData(context, endIndex);
  // 返回文本节点
  return {
    type: NodeTypes.TEXT,
    content
  };
}

// 提取文本数据
function parseTextData(context: any, length) {
  // 提取源代码的前length个字符
  const content = context.source.slice(0, length);
  // 移动指针
  advanceBy(context, length);
  // 返回文本数据
  return content;
}

// 函数parseElement,接收两个参数context和arg1,返回值any
function parseElement(context: any, ancestors): any {
  const element: any = parseTag(context, TagType.Start);
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();

  if (startsWithEndTagOpen(context.source, element.tag)) {
    // 匹配开始标签<div>后，还有去除关闭标签</div>
    parseTag(context, TagType.End);
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }

  return element;
}


function parseTag(context: any, type: TagType) {
  // const match: any = /^<\/?([a-z]+\w*)/i.exec(context.sources);
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  // 移动光标 ,已经处理的就删除了,  match[0].length + 1 的  +1 是要再加 > d的一个位置
  advanceBy(context, match[0].length + 1);
/*   advanceBy(context, match[0].length);
  advanceBy(context, 1); */
  if (type === TagType.End) return;
  return { type: NodeTypes.ELEMENT, tag: tag };
}

// 解析插值表达式
function parseInterpolation(context) {
  // 定义开始标签和结束标签
  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  // 记录开始标签标签的长度
  let openDelimiterLength = openDelimiter.length;
  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiterLength);

  // 移动光标 ,已经处理的就删除了
  advanceBy(context, openDelimiterLength);
  const rawContentLength = closeIndex - openDelimiterLength;
  // 获取内容部分 , 去除'{{' 部分
  const rawContent = parseTextData(context, rawContentLength);
  // 去除空格
  const content = rawContent && rawContent.trim();
  advanceBy(context, closeDelimiter.length);
  return {
    // 子节点的类型为 NodeTypes.INTERPOLATION
    type: NodeTypes.INTERPOLATION,
    // 内容为一个对象,包含 type 和 content 属性
    content: {
      // type 属性为 NodeTypes.SIMPLE_EXPRESSION
      type: NodeTypes.SIMPLE_EXPRESSION,
      // content 属性为 "message"
      content: content
    }
  };
}

// 函数advanceBy,功能:从给定的any类型的context中截取长度为length的字符串
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

// 函数createRoot,功能:创建一个具有children属性root
function createRoot(children) {
  return {
    children
  };
}
// 创建解析上下文
function createParserContext(content: string) {
  return {
    source: content
  };
}
