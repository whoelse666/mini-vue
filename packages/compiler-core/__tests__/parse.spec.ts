import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
describe("Parse", () => {
  describe("interpolation", () => {
    // 测试简单插值
    test("simple interpolation", () => {
      // 解析出原始代码中的插值
      const ast = baseParse("{{  message  }}");
      // 断言解析后的插值结构是否正确
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message"
        }
      });
    });
  });

  describe("element", () => {
    it("simple element div", () => {
      // 解析HTML字符串并生成抽象语法树
      const ast = baseParse("<div></div>");
      // 预期AST的第一个子节点是一个元素节点，标签为div，子节点为空
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        children: []
      });
    });
  });

  // 描述 text
  describe("text", () => {
    // 测试 simple text
    it("simple text", () => {
      // 调用 baseParse 函数，解析 "some text"
      const ast = baseParse("some text");
      // 断言 ast.children[0] 等于 { type: NodeTypes.TEXT, content: "some text" }
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "some text"
      });
    });
  });

  // 测试"hello world"
  test("hello world", () => {
    // 调用baseParse函数，解析模板字符串
    const ast = baseParse("<div>hi,{{message}}</div>");
    // 断言解析后的ast结果是否与预期相符
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hi,"
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message"
          }
        }
      ]
    });
  });

  // 测试嵌套元素
test("Nested element ", () => {
    // 解析字符串
    const ast = baseParse("<div><p>hi</p>{{message}}</div>");
    // 预期结果
    expect(ast.children[0]).toStrictEqual({
      // 元素节点
      type: NodeTypes.ELEMENT,
      tag: "div",
      // 子节点
      children: [
        {
          // 元素节点
          type: NodeTypes.ELEMENT,
          tag: "p",
          // 子节点
          children: [
            {
              // 文本节点
              type: NodeTypes.TEXT,
              content: "hi"
            }
          ]
        },
        {
          // 插值节点
          type: NodeTypes.INTERPOLATION,
          content: {
            // 简单表达式
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message"
          }
        }
      ]
    });
  });

  test("should throw error when lack end tag", () => {
    // baseParse("<div><span></div>");
    // 测试当缺少结束标签时，是否抛出错误
    expect(() => {
      baseParse("<div><span></div>");
    }).toThrow(`缺少结束标签:span`);
  });
});

