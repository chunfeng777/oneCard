// 获取随机节点 ID
export function getRandNodeId(): string {
  // 前缀 node_ + 时间戳 + 4 位随机数
  return `node_${new Date().getTime()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
}

// 定义节点类型
interface Node {
  id?: string;
  type?: string;
  props?: {
    branch?: Node[];
  };
  branch?: Node[];
}

// 重载所有的节点 ID
export function reloadNodeId(nodes: Node | Node[]): void {
  if (Array.isArray(nodes)) {
    nodes.forEach(node => {
      if (node.type === 'GATEWAY') {
        // 递归网关，网关 ID 加上一个后缀
        node.id = getRandNodeId() + '_fork';
        // 分支头部节点
        if (node.props?.branch) {
          reloadNodeId(node.props.branch);
        }
        // 分支
        if (node.branch) {
          reloadNodeId(node.branch);
        }
      } else {
        node.id = getRandNodeId();
      }
    });
  } else {
    nodes.id = getRandNodeId();
  }
}
