import { NodeTypes } from "./ast";
const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  // 处理数据结构
  const context = createParserContext(content);
  const res = parseChildren(context);
  // 处理数据结构
  return createRoot(res);
}

// 创建解析上下文
function createParserContext(content: string) {
  return {
    source: content
  };
}

function isEnd(context: any, tag?: any) {
  console.log("context.source", context.source);
  if (context.source.startsWith("</div>")) {
    return true;
  }
  return !context.source;
}

// 解析子节点
function parseChildren(context: any) {
  const nodes: any = [];
  // while (!isEnd(context)) {
    let node;
    const s = context.source;
    // 如果代码以{{开始
    if (s.startsWith("{{")) {
      // 解析插值表达式
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context);
      }
    }
    if (!node) {
      // 解析文本节点
      node = parseText(context);
    }
    // 将节点推入nodes数组
    nodes.push(node);
  // }
  // 返回nodes数组
  return nodes;
}

// 解析文本
function parseText(context: any) {
  const endTokens = "{{";
  let endIndex = context.source.length;
  const index = context.source.indexOf(endTokens);
  if (index !== -1) {
    endIndex = index;
  }
  // 从上下文中提取内容
  const content = parserTextData(context, endIndex);
  console.log("content--------->", content);
  // 返回文本节点
  return {
    type: NodeTypes.TEXT,
    content
  };
}

// 提取文本数据
function parserTextData(context: any, length) {
  // 提取源代码的前length个字符
  const content = context.source.slice(0, length);
  // 移动指针
  advanceBy(context, length);
  // 返回文本数据
  return content;
}

// 函数parseElement,接收两个参数context和arg1,返回值any
function parseElement(context: any): any {
  const element: any = parseTag(context, TagType.Start);
  element.children = parseChildren(context);
  console.log(" element.children", element.children);
  // if (startsWithEndTagOpen(context.source, element.tag)) {
    // 匹配开始标签<div>后，还有去除关闭标签</div>
    parseTag(context, TagType.End);
  // }
  return element;
}

function startsWithEndTagOpen(source, tag) {
  return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}

function parseTag(context: any, type: TagType) {
  // const match: any = /^<\/?([a-z]+\w*)/i.exec(context.sources);
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  const tag = match[1];
  // 移动光标 ,已经处理的就删除了,  match[0].length + 1 的  +1 是要再加 > d的一个位置
  advanceBy(context, match[0].length + 1);
  if (type === TagType.End) return;
  return { type: NodeTypes.ELEMENT, tag: tag };
}

// 解析插值表达式
function parseInterpolation(context) {
  // 定义开始标签和结束标签
  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  // 记录开始标签和结束标签的长度
  let openDelimiterLength = openDelimiter.length;
  let closeIndex = context.source.indexOf(closeDelimiter, openDelimiterLength);

  // 移动光标 ,已经处理的就删除了
  advanceBy(context, openDelimiterLength);
  let rawContentLength = closeIndex - openDelimiterLength;
  // 获取内容部分 , 去除'{{' 部分
  // let rawContent = context.source.slice(0, rawContentLength);
  let rawContent = parserTextData(context, rawContentLength);
  // 去除空格
  let content = rawContent && rawContent.trim();
  // advanceBy(context, closeDelimiter.length);
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
