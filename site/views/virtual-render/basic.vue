<template>
  <div style="width: 100%; height: 400px; overflow: auto">
    <div style="padding: 15px 0">
      <bk-button
        theme="primary"
        @click="handleRandomRows"
      >
        随机1000-9999行数据
      </bk-button>
      <bk-button @click="handleFixToTop"> fixToTop: index = {{ Math.ceil(randomRows.length / 2) }} </bk-button>
      <span style="padding: 0 30px">当前行数：{{ randomRows.length }}</span>
    </div>
    <bk-virtual-render
      ref="refFixToTop"
      :height="300"
      :line-height="30"
      :list="randomRows"
    >
      <template #default="{ data }">
        <div
          v-for="item in data"
          :style="getRowStyle(item)"
          :key="item.$index"
        >
          <span :style="getCellStyle(item)">{{ item.$index + 1 }}</span>
          <span :style="getCellStyle(item)">{{ item.ip }}</span>
          <span :style="getCellStyle(item)">{{ item.source }}</span>
          <span :style="getCellStyle(item)">{{ item.status }}</span>
          <span :style="getCellStyle(item)">{{ item.create_time }}</span>
          <span :style="getCellStyle(item)">LineHeight: {{ 30 }}</span>
        </div>
      </template>
    </bk-virtual-render>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';
  export default defineComponent({
    components: {},
    data() {
      return {
        randomRows: [
          {
            ip: '192.168.0.1',
            source: 'QQ',
            status: '创建中',
            create_time: '2018-05-25 15:02:24',
          },
          {
            ip: '192.168.0.2',
            source: '微信',
            status: '正常',
            create_time: '2018-05-25 15:02:24',
          },
          {
            ip: '192.168.0.3',
            source: 'QQ',
            status: '创建中',
            create_time: '2018-05-25 15:02:24',
          },
          {
            ip: '192.168.0.1',
            source: 'QQ',
            status: '创建中',
            create_time: '2018-05-25 15:02:24',
          },
          {
            ip: '192.168.0.2',
            source: '微信',
            status: '正常',
            create_time: '2018-05-25 15:02:24',
          },
          {
            ip: '192.168.0.3',
            source: 'QQ',
            status: '创建中',
            create_time: '2018-05-25 15:02:24',
          },
        ],
        scrollbar: {
          enabled: true,
        },
      };
    },
    created() {
      // this.handleRandomRows();
    },
    methods: {
      getCellStyle() {
        const lineHeight = 30;
        return {
          padding: '2px 10px',
          height: `${lineHeight}px`,
          lineHeight: `${lineHeight}px`,
          display: 'block',
          width: '200px',
        };
      },

      getRowStyle() {
        const lineHeight = 30;
        return {
          height: `${lineHeight}px`,
          lineHeight: `${lineHeight}px`,
          borderBottom: 'solid 1px #ddd',
          display: 'inline-flex',
        };
      },
      handleRandomRows() {
        this.randomRows.splice(
          0,
          this.randomRows.length,
          ...new Array(Math.ceil(Math.random() * 9000) + 1000).fill('').map((_, index) => ({
            ip: `${index}--192.168.0.x`,
            source: `${index}_QQ`,
            status: '创建中',
            create_time: `2018-05-25 15:02:24.${index}`,
          })),
        );
      },
      handleFixToTop() {
        this.$refs.refFixToTop.fixToTop({ index: Math.ceil(this.randomRows.length / 2) });
      },
    },
  });
</script>
