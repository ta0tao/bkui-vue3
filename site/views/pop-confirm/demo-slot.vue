<template>
  <div>
    <bk-pop-confirm
      width="288"
      content="删除操作无法撤回，请谨慎操作！"
      title="确认删除该脚本？"
      @confirm="ensure"
    >
      <bk-button>删除</bk-button>
      <template #content>
        <div style="margin-bottom: 16px">测试将同时删除该结果数据下的所有样本曲线</div>
      </template>
    </bk-pop-confirm>
  </div>
</template>
<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    components: {},
    setup() {
      function ensure() {
        console.log('ensure');
      }
      return {
        ensure,
      };
    },
  });
</script>
