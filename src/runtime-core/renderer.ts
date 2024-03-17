import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlag";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const { createElement: hostCreateElement, insert: hostInsert, patchProp: hostPatchProp, setElementText: hostSetElementText, remove: hostRemove } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null, null);
  }

  // 函数patch,用于处理vnode和container
  function patch(n1, n2: any, container: any, parentComponent, anchor) {
    /* TODO :区分 component 和 element */
    // fixme 如果vnode的类型是字符串, ===vnode 就是element 类型参数
    const { shapeFlag, type } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        // if (typeof vnode.type === "string") {
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
          //fixme 如果vnode的类型是对象 , === vnode 就是 Component 类型的参数
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n2, container, parentComponent, anchor);
        }
    }
  }

  // 函数processComponent,用于处理组件
  function processComponent(vnode: any, container: any, parentComponent, anchor) {
    // 调用mountComponent函数处理vnode和container
    mountComponent(vnode, container, parentComponent, anchor);
  }

  // 函数processElement,用于处理元素
  function processElement(n1, n2: any, container: any, parentComponent, anchor) {
    if (!n1) {
      // 调用mountElement函数处理vnode和container
      mountElement(n1, n2, container, parentComponent, anchor);
    } else {
      // 调用patchElement函数处理vnode和container
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  // 函数patchElement,用于更新DOM节点
  function patchElement(n1: any, n2: any, container: any, parentComponent: any, anchor) {
    // console.log("patchElement");
    // 获取旧props
    const oldProps = n1.props || {};
    // 获取新props
    const newProps = n2.props || {};
    // 更新组件的el
    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent, anchor);
    // 更新prop
    patchProps(el, oldProps, newProps);
  }

  // 比较新旧节点，完成 渲染更新
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    // console.log("patchChildren");
    const prevShapeFlag = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c1 = n1.children;
    const c2 = n2.children;
    //新的children是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 老的children是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 移除旧子节点
        unmountChildren(n1.children);
        // 设置新的元素文本
        hostSetElementText(container, n2.children);
      }
      if (c1 !== c2) {
        //旧的 children  是文本, 直接用新的文本覆盖旧的
        hostSetElementText(container, n2.children);
      }
    }
    // 新的children是数组
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 老的children是文本
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 移除旧的文本节点
        hostSetElementText(container, "");
        // 挂载新的的子节点
        mountChildren(n2.children, container, parentComponent, anchor);
      } else {
        // 新的children是数组,老的children是数组,需要更新
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren(c1: any, c2: any, container: any, parentComponent: any, parentAnchor) {
    const l2 = c2.length;
    let i = 0,
      e1 = c1.length - 1,
      e2 = l2 - 1;
    // 判断两个虚拟节点是否相同
    function isSameVNodeType(n1: any, n2: any) {
      // 判断两个虚拟节点的类型和key是否相同
      return n1.type === n2.type && n1.key === n2.key;
    }
    //左侧
    while (i <= e1 && i <= e2) {
      // console.log("左侧");
      // console.log("i", i);
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        // 直到有一个不相同了,就结束左到右这个循环
        break;
      }
      // 左侧还是 从0 开始往右移动
      i++;
    }
    // console.log("左侧结束:i,e1,e2", i, e1, e2);

    // 右侧
    while (i <= e1 && i <= e2) {
      // console.log("右侧");
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        // 直到有一个不相同了,就结束右到左这个循环
        break;
      }
      // 右侧还是 从length  开始往左移动
      e1--;
      e2--;
    }
    // console.log("右侧结束:i,e1,e2", i, e1, e2);

    // TODO  新的比老的多创建
    if (i > e1) {
      if (i <= e2) {
        // console.log("新的比老的多创建");
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 老的比新的多删除
      // console.log("老的比新的多删除");
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // console.log("中间对比");
      const s1 = i, s2 = i;
      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      // 1. 基于新的 创建 key 映射表，然后循环老的，每一个key 去keyToNewIndexMap 中找，没有的话，就可能为删除（用户传入可能会没有填写key）
      const keyToNewIndexMap = new Map();
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      let moved = false, maxNewIndexSoFar = 0;

      for (let i = s2; i <= e2; i++) {
        // 创建 新的tree 的 map 映射
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        // 优化: 新的已经全部比对完，旧的还有，不用继续循环,就删除
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          // 有key 的比对
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // 没有key 的比对
          for (let j = s2; j < e2; j++) {
            // 循环新的， 一一去和旧prevChild的比对，节点是否新老都存在
            if (isSameVNodeType(prevChild, c2[j])) {
              // nextINdex 的值是新的节点循环 的 索引,相对于完整列表的索引 
              newIndex = j;
              // 找到后就立马结束 ， 避免不必要的循环
              break;
            }
          }
        }
        // 以上处理都结束后 nextIndex 还是没有的话 ，就要删除
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          // nextIndex - s2 相对于去除首位相同部分，截取中间部分数组 ，在取的索引
          const num = newIndexToOldIndexMap[newIndex - s2] = i + 1;
          console.log(newIndexToOldIndexMap, `newIndexToOldIndexMap[${newIndex - s2}]`, num);
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      let j = increasingNewIndexSequence.length - 1;

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            console.log('移动位置', i, increasingNewIndexSequence[j], nextChild, anchor);
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--
          }
        }

      }

    }
  }

  function patchProps(el, oldProps, newProps) {
    // 更新props 循环新的，比较新旧是否相同
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp !== nextProp) {
        // 比较新旧props,如果不同,则更新
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
    // 循环旧的 判断旧的有，新的没有的属性，删除
    for (const key in oldProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (!nextProp) {
        // 如果新props中没有该prop,则删除
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
  }

  // 函数mountComponent,用于处理组件
  function mountComponent(vnode: any, container: any, parentComponent, anchor) {
    //  创建组件实例
    const instance = createComponentInstance(vnode, parentComponent);
    // 完成对instance 的 初始化处理
    setupComponent(instance);
    //这里已经完成了vnode 的处理,--> 渲染实例
    setupRenderEffect(instance, vnode, container, anchor);
  }

  //  处理vnode ->  element
  function mountElement(n1, n2: any, container: any, parentComponent, anchor) {
    // const el = document.createElement(vnode.type);
    const el = hostCreateElement(n2.type);

    // 1. $el-> 挂在el
    n2.el = el;
    const { children, props, shapeFlag } = n2;
    // children
    // shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    // if (typeof children === "string") {
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本节点
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent, anchor);
    }

    // props
    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
      /* 
    const isOn = () => /^on[A-Z]/.test(key);
    // if (key.startsWith("on")) {
    if (isOn()) {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else {
      el.setAttribute(key, val);
    } */
    }
    // container.append(el);
    hostInsert(el, container, anchor);
  }

  // 遍历children,调用patch函数处理每一个v,并将其添加到container中
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(v => {
      // 调用patch函数处理v和container
      patch(null, v, container, parentComponent, anchor);
    });
  }

  // 遍历children,调用hostRemove函数移除每一个el
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
  }
  /* 组件类型( ShapeFlags.STATEFUL_COMPONENT ) 到这里时候 ,instance 初始化完成  (每一个组件的 初始 root )
  instance = {
    emit: ƒ ()
    render:ƒ render()
    parent
    props
    provides
    proxy: Proxy(Object)
    setupState
    slots
    type
    vnode
  } */
  // 函数setupRenderEffect,用于设置渲染效果
  function setupRenderEffect(instance: any, initialVNode, container: any, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        // const subTree = instance.render(); // h()函数返回
        const subTree = (instance.subTree = instance.render.call(instance.proxy)); // h()函数返回
        patch(null, subTree, container, instance, anchor);
        // 2. $el-> 挂在el
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const prevSubTree = instance.subTree;
        const subTree = instance.render.call(instance.proxy);
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance, anchor);
      }
    });
  }

  function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  // 功能：处理文本节点
  // 参数：n1：文本节点1；n2：文本节点2；container：容器
  function processText(n1, n2: any, container: any) {
    // 创建文本节点
    const el = n2.el = document.createTextNode(n2.children);
    // 将文本节点添加到容器中
    container.append(el);
  }

  // TODO  createRenderer-01
  // createAppAPI 依赖render ,所以在这里调用获取render 的值
  // 方法1   return { render };
  // 方法2  return { createApp: createAppAPI(render) };
  return { createApp: createAppAPI(render) };
}


//最长递增自序列 算法 函数getSequence接收一个数组arr，返回一个排序后的数组
function getSequence(arr) {
  // 复制arr数组，并赋值给p
  const p = arr.slice();
  // 定义一个结果数组，第一个元素为0
  const result = [0];
  // 定义i,j,u,v,c变量
  let i, j, u, v, c;
  // 获取arr数组的长度
  const len = arr.length;
  // 遍历arr数组
  for (i = 0; i < len; i++) {
    // 获取arr数组中第i个元素
    const arrI = arr[i];
    // 如果arr数组中第i个元素不为0
    if (arrI !== 0) {
      // 获取result数组中最后一个元素，赋值给j
      j = result[result.length - 1];
      // 如果arr数组中第j个元素小于arr数组中第i个元素
      if (arr[j] < arrI) {
        // 将arr数组中第i个元素的值赋值给p数组中第i个元素
        p[i] = j;
        // 将i的值添加到result数组中
        result.push(i);
        // 继续遍历arr数组
        continue;
      }
      // 定义u和v变量
      u = 0;
      v = result.length - 1;
      // 当u小于v时，执行循环
      while (u < v) {
        // 计算u和v的中间值，赋值给c
        c = (u + v) >> 1;
        // 如果arr数组中第result数组中第c个元素小于arr数组中第i个元素
        if (arr[result[c]] < arrI) {
          // 将u的值加1
          u = c + 1;
        } else {
          // 否则将v的值赋值给c
          v = c;
        }
      }
      // 如果arr数组中第result数组中第u个元素小于arr数组中第i个元素
      if (arrI < arr[result[u]]) {
        // 如果u大于0，将arr数组中第result数组中第u-1个元素的值赋值给p数组中第i个元素
        if (u > 0) {
          p[i] = result[u - 1];
        }
        // 将i的值赋值给result数组中第u个元素
        result[u] = i;
      }
    }
  }
  // 获取result数组的长度
  u = result.length;
  // 获取result数组中最后一个元素，赋值给v
  v = result[u - 1];
  // 当u大于0时，执行循环
  while (u-- > 0) {
    // 将v的值赋值给result数组中第u个元素
    result[u] = v;
    // 将arr数组中第v个元素的值赋值给v
    v = p[v];
  }
  // 返回result数组
  return result;
}