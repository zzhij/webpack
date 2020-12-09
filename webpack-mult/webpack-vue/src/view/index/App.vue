<template>
  <div>
    主页面
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {};
  },
  mounted() {},
  methods: {},
  components: {},
};
</script>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  -webkit-user-select: none;
  user-select: none;
}
</style>
