export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
  };

  return component;
}


