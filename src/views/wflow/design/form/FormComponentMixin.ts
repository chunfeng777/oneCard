//节点复用逻辑
export default {
  props: {
    config: {
      type: Object,
      default: () => {
        return {};
      },
    },
    mode: {
      type: String,
      default: "normal", //组件模式，free设计模式，normal 编辑模式, read 阅读模式，disable 禁用模式
    },
    active: {
      type: Object,
    },
    modelValue: {
      type: [Object, Number, Array, String] as PropType<any>,
    },
  },
  computed: {
    _active: function (props: any, emit: any) {
      return {
        get() {
          return props.active;
        },
        set(val: any) {
          emit("update:active", val);
        },
      };
    },
    _value: function (props: any, emit: any) {
      return {
        get() {
          return props.modelValue;
        },
        set(val: any) {
          emit("update:modelValue", val);
        },
      };
    },
  },
  emits: ["update:modelValue", "update:active", "copy", "delete"],
};
