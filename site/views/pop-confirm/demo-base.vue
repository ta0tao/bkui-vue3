<template>
  <div>
    <bk-pop-confirm
      ref="popConfirmRef"
      width="288"
      content="删除操作无法撤回，请谨慎操作！"
      title="确认删除该脚本？"
      trigger="click"
      @confirm="ensure"
    >
      <bk-button>删除</bk-button>
    </bk-pop-confirm>
  </div>
</template>
<script>
  import { defineComponent, ref } from 'vue';

  export default defineComponent({
    components: {},
    setup() {
      const popConfirmRef = ref(null);
      function ensure() {
        console.error(popConfirmRef.value);
        console.log('ensure');
      }
      return {
        ensure,
        popConfirmRef,
      };
    },
  });
</script>
