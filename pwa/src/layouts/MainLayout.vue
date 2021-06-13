<template>
  <q-layout view="hHh lpR fFf">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          OneClipboard
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { sendApiRequest } from "../ApiAccess";

export default {
  name: "MainLayout",

  components: {},

  data() {
    return {
      working: false
    };
  },

  computed: {},

  methods: {
    reloadPage() {
      location.reload();
    },

    async refresh(done) {
      var pageRefresh = new Promise((res, rej) => {
        try {
          this.$refs.pageContent.refreshContent(res, rej);
        } catch (e) {
          res();
        }
      })
        .then()
        .catch(response => {
          this.refreshErr = response;
        })
        .finally(done);
    },

    refreshAgain() {
      this.refreshErr = null;
      this.$refs.refresher.trigger();
      // this.refresh();
    }
  },

  mounted() {}
};
</script>
