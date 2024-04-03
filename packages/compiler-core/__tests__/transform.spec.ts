// 导入NodeTypes类，用于表示AST（抽象语法树）中的节点类型
import { NodeTypes } from "../src/ast";
// 导入baseParse函数，用于将源代码转换为AST
import { baseParse } from "../src/parse";
// 导入transform函数，用于将AST转换为特定格式
import { transform } from "../src/transform";

describe("transform", () => {
  it("happy path", () => {
    // 使用 baseParse 函数解析模板字符串
    const ast = baseParse("<div>hi,{{message}}</div>");
    // 定义一个 plugin 函数，用于处理 ast 中的节点
    const plugin = (node: any) => {
      // 如果处理的是文本节点
      if (node.type === NodeTypes.TEXT) {
        // 将文本节点的 content 属性拼接上 " mini-vue"
        node.content = node.content + " mini-vue";
      }
    };
    // 使用 transform 函数将 ast 中的节点转换
    transform(ast, {
      nodeTransforms: [plugin]
    });
    // 获取 ast 中第一个子节点的第一个子节点
    const nodeText = ast.children[0].children[0];
    // 断言 nodeText 的 content 属性是否等于 "hi, mini-vue"
    expect(nodeText.content).toBe("hi, mini-vue");
  });
});
