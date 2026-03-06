<script setup>
import Nodes from "../../ProcessNodes.ts";

const nodeList = Object.keys(Nodes)
  .filter((v) => Nodes[v].name)
  .map((v) => {
    return {
      type: v,
      ...Nodes[v],
    };
  });

defineEmits(["insertNode"]);
</script>

<template>
  <el-popover
    width="450"
    title="请选择流程节点"
    placement="right-start"
    trigger="click"
  >
    <template #reference>
      <el-button type="primary" icon="plus" circle style="z-index: 1" />
    </template>
    <div class="w-node-options">
      <div
        v-for="node in nodeList"
        :key="node.type"
        @click="$emit('insertNode', node.type)"
      >
        <el-icon size="25" :style="{ color: node.color }">
          <component :is="node.icon" />
        </el-icon>
        {{ node.name }}
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.w-node-options {
  display: flex;
  flex-wrap: wrap;

  i {
    padding: 3px;
    margin-right: 5px;
    border: 1px solid #dedfdf;
    border-radius: 10px;
  }

  & > div {
    display: flex;
    align-items: center;
    width: 110px;
    padding: 8px 10px;
    margin: 5px;
    cursor: pointer;
    background: #f8f9f9;
    border-radius: 15px;

    &:hover {
      box-shadow: 0 0 5px 0 #e3e3e3;
    }
  }
}
</style>
