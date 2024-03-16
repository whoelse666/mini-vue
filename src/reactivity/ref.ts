import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";
import { isObject,hasChanged } from "../shared/index";


// 定义RefImpl类
class RefImpl {
  // 定义私有变量_value
  private _value: any;
  // 定义私有变量rawValue
  rawValue: any;
  // 定义私有变量__v_isRef
  private __v_isRef = true; //该属性在 isRef()时判断是否是ref
  // 定义私有变量dep
  dep: Set<any>;
  constructor(value: any) {
    this.rawValue = value;
    this._value = convert(value);
    // 将dep赋值为一个新的Set
    this.dep = new Set();
  }
  // 定义私有变量activeEffect
  // activeEffect  =this
  get value() {
    if (isTracking()) {
      trackEffects(this.dep);
    }
    // 返回_value
    return this._value;
  }

  set value(newValue) {
    // Object.is() 静态方法确定两个值是否为相同值。
    // hasChanged
    // if (!Object.is(this._value, newValue)) {
  if (hasChanged(newValue, this._value)) {
    this.rawValue = newValue;
    this._value = convert(newValue);
    // 执行依赖
    triggerEffects(this.dep);
  }
  }
}

//函数：convert，用于将传入的参数转换为响应式
function convert(value: any) {
  //判断传入的参数是否为对象
  return isObject(value) ? reactive(value) : value;
}

//函数：ref，用于创建一个RefImpl实例
export function ref(value) {
  //创建一个RefImpl实例
  return new RefImpl(value);
}

//函数：isRef，用于判断传入的参数是否为RefImpl实例
export function isRef(value: any) {
  //判断传入的参数是否有__v_isRef属性
  return !!value["__v_isRef"];
}

//函数：unRef，用于获取传入参数的值
export function unRef(val) {
  return isRef(val) ? val.value : val;
}

// 导出一个函数，用于代理引用
export function proxyRefs(objectWithRefs) {
  // 打印出objectWithRefs
  // console.log("proxyRefs", objectWithRefs);
  // 返回一个代理对象
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    // 设置属性值
    set(target, key, value) {
      // console.log('target,key,value',target,key,value);
      // 如果旧的值是ref 并且新的值不是ref
      if (isRef(target[key]) && !isRef(value)) {
       // 返回解引用后的值
       return (target[key].value = value);
      } else {
        // 返回反射设置的值
        return Reflect.set(target, key, value);
      }
    }
  });
}
