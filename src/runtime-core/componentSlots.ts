export function initSlots(instance: any, children: any) {
  //  instance.slots = Array.isArray(children) ? children : [children];
  const slots = {};
  for (const key in children) {
    const fn = children[key];
    console.log("fn", fn);
    slots[key] = props => (Array.isArray(fn(props)) ? fn(props) : [fn(props)]);
  }
  instance.slots = slots || {};
}
