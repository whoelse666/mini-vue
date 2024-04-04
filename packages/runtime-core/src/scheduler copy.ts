const p = Promise.resolve();
const queue: any[] = [];
let isFlushPending = false;
export function nextTick(fn?) {
  return fn ? p.then(fn) : p;
}

/* 
args   job ===  instance.update === effect.run
*/
// 导出一个函数，用于队列作业
export function queueJobs(job) {
  // 如果没有包含该作业，则将其推入队列
  if (!queue.includes(job)) {
    // 收集effect的run方法
    queue.push(job);
  }
  queueFlush();
}


// 定义一个清空队列的函数
function queueFlush() {
  if (isFlushPending) return;
  isFlushPending = true;
  //  类似防抖功能原理
  // 进到这里后 就会把这个为任务加到队列中，等待同步任务执行完后 开始执行异步任务
 nextTick(flushJobs);
}

function flushJobs() {
    // 执行到这里后，重置 isFlushPending 为 false，表示当前没有在执行队列中的任务
    isFlushPending = false;
    let job;
    //  queue.shift() 返回 队列中的第一个作业，并将其从队列中删除
    while ((job = queue.shift())) {
      job && job();
    }
}
