<template>
  <q-page>
    <q-pull-to-refresh ref="refresher" @refresh="tryReading">
      <div v-if="working">
        <div v-if="content.length > 0">
          <q-expansion-item
            v-for="(item, idx) in content"
            :key="idx"
            :value="idx > 0"
          >
            <template v-slot:header>
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <q-icon
                      :name="deviceIcon(item.os)"
                      color="primary"
                      text-color="white"
                    />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ item.os }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-item-label caption>{{
                    item.app + " v" + item.versionNumber
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <q-card>
              <q-card-section>
                <q-item v-for="(text, idx) in item.clipboard" :key="idx">
                  <q-item-section>
                    <q-item-label class="text-subtitle2">{{
                      shortenText(text)
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      size="sm"
                      color="dark"
                      icon="content_copy"
                      @click="
                        _ => {
                          copyClipboard(text);
                        }
                      "
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
        <q-chip v-else class="text-center" size="lg" icon="info" color="info">
          No items here yet
        </q-chip>
      </div>
      <q-chip
        v-else
        class="text-center"
        size="lg"
        icon="warning"
        color="negative"
      >
        Not in focus or Permission denied
      </q-chip>
    </q-pull-to-refresh>
  </q-page>
</template>

<script>
import {
  sendApiRequest,
  SIGN_IN_OR_REGISTER,
  UPLOAD,
  REFRESH
} from "../ApiAccess";
import { Platform } from "quasar";
import { DeviceUUID } from "device-uuid";
import { copyToClipboard } from "quasar";
export default {
  name: "PageIndex",
  data() {
    return {
      content: [],
      lastData: "",
      timer: null,
      working: true
    };
  },
  watch: {
    "$q.appVisible"(val) {
      this.working = val;
      if (val == true) {
        this.tryReading(_ => {
          /* success code */
        });
      }
    }
  },
  computed: {
    visible() {
      return true;
    },

    deviceId() {
      return new DeviceUUID().get();
    },

    deviceInfo() {
      const p = Platform.is;

      const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
      return {
        os: (_ => {
          switch (p.platform) {
            case "win":
              return "Windows";
            case "ios":
              return "iOS";
            default:
              return capitalize(p.platform);
          }
        })(),
        app: capitalize(p.name),
        versionNumber: p.versionNumber
      };
    }
  },
  methods: {
    signInOrRegister() {
      console.warn("saying hello");
      sendApiRequest(
        SIGN_IN_OR_REGISTER,
        {
          id: this.deviceId,
          deviceData: this.deviceInfo
        },
        res => {
          console.warn("ok, got content");
          this.content = res.data;
        },
        err => alert
      );
    },
    tryReading(done) {
      console.log("checkin clipboard");
      this.askAndReadClipboard()
        .then(data => {
          this.working = true;
          this.gotContent(data, done);
        })
        .catch(err => {
          this.working = false;
        });
    },

    askAndReadClipboard(e) {
      var duration = e ? e.duration : null, // makes duration handling possible
        clipboard = navigator.clipboard;
      if (!!clipboard) {
        return new Promise((res, rej) => {
          clipboard
            .readText()
            .then(content => {
              console.warn("content detected: " + content);
              res(content);
            })
            .catch(err => {
              rej(err);
            });
        });
      } else return Promise.resolve("");
    },

    gotContent(data, done) {
      console.warn("got content, checking whether new");
      if (this.lastData != data) this.uploadContent(data, done);
      // save traffic
      else this.refreshContent(done);
      this.lastData = data;
    },

    uploadContent(data, done) {
      console.warn("uploading content");
      sendApiRequest(
        UPLOAD,
        {
          id: this.deviceId,
          data: data
        },
        res => {
          console.warn("got it");
          this.content = res.data;
        },
        err => alert
      );
      done();
    },

    refreshContent(done) {
      console.warn("refreshing content");
      sendApiRequest(
        REFRESH,
        {
          id: this.deviceId
        },
        res => {
          console.warn("got it");
          this.content = res.data;
        },
        err => alert
      );
      done();
    },

    shortenText(text) {
      const maxLength = 100,
        suffixText = "...";
      return text.length < maxLength
        ? text
        : text.substr(0, maxLength - suffixText.length) + suffixText;
    },

    deviceIcon(platform) {
      switch (platform) {
        case "Android":
          return "smartphone";
        case "iOS":
          return "phone_iphone";
        case "Windows":
          return "desktop_windows";
        case "Mac":
          return "desktop_mac";
      }
    },

    copyClipboard(text) {
      copyToClipboard(text);
    }
  },
  mounted() {
    this.signInOrRegister();
    this.tryReading(_ => {});
  }
};
</script>
