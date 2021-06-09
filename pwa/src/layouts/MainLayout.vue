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
import { sendApiRequest, buildGetRequestUrl } from "../ApiAccess";

export default {
  name: "MainLayout",

  components: {},

  data() {
    return {};
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
    },

    askAndReadClipboard(e) {
      var duration = e ? e.duration : null, // makes duration handling possible
        clipboard = navigator.clipboard;
      if (!!clipboard) {
        return new Promise((res, rej) => {
          clipboard
            .readText()
            .then(content => {
              content = content.trim();
              if (!this.isClipboardValid(content)) {
                res("");
              } else {
                content = content.replaceAll("$", "#"); // resetting the workaround needed on mobile phones

                this.$q
                  .dialog({
                    component: ConfirmDialog,
                    parent: this,
                    cancelLabel: "Egal, scannen",
                    okLabel: "Ok, übernehmen",
                    title: "Daten gefunden",
                    message: `StudiCar hat passende Daten in deiner Zwischenablage gefunden. Daten übernehmen oder
                    trotzdem einen StudiCar Code scannen?`,
                    persistent: true,
                    animation: "fade",
                    details:
                      content.length > 1000
                        ? content.substr(0, 1000) + "..."
                        : content
                  })
                  .onOk(() => {
                    res(content);
                  })
                  .onCancel(() => {
                    res(""); // when no confirm, return empty string
                  })
                  .onDismiss(() => {
                    // console.log('I am triggered on both OK and Cancel')
                  });
              }
            })
            .catch(err => {
              this.error(err);
              rej();
            });
        });
      } else return Promise.resolve("");

      function error(err) {
        if (err) err = "[ERR: " + err + "] ";
        else err = "";
        alert("Clipboard error");
        this.$q.notify({
          type: "negative",
          message:
            err +
            "StudiCar kann nicht auf deine Zwischenablage zugreifen. Bitte sieh im Support nach, oft haben wir schon eine andere Lösung veröffentlicht."
        });
      }
    },

    isClipboardValid(text) {
      var conditions = [
        text.length > 10,
        text.startsWith("https://" + window.location.hostname)
      ];
      return conditions.every(item => item == true);
    }
  },

  mounted() {}
};
</script>
