<template>
  <n-layout>
    <n-layout-header style="padding: 20px; background-color: #f8f8f9;">
      <div style="font-size: 24px; font-weight: bold;">管理员面板</div>
    </n-layout-header>
    <n-layout-content content-style="padding: 20px;">
      <n-space vertical>
        <n-card title="文章管理" :bordered="false">
          <n-button type="primary" tag="a" :href="createUrl" target="_blank">创建新文章</n-button>
        </n-card>
        <n-card title="分类管理" :bordered="false">
          <n-button type="warning" tag="a" :href="categoryUrl" target="_blank">创建分类</n-button>
        </n-card>
      </n-space>
    </n-layout-content>
  </n-layout>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { NLayout, NLayoutHeader, NLayoutContent, NSpace, NCard, NButton } from 'naive-ui';

// 计算属性用于动态生成链接
const createUrl = computed(() => `/admin/post/create`);
const categoryUrl = computed(() => `/admin/category/create`);

</script>

<style scoped>

</style>
