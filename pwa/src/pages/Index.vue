<template>
  <q-page class="flex flex-center">
    LOREM
  </q-page>
</template>

<script>
import { sendApiRequest, TEST_API } from "../ApiAccess";
export default {
  name: "PageIndex",
  mounted() {
    sendApiRequest(
      TEST_API,
      {},
      data => {},
      err => {
        alert(err);
      }
    );
  }
};
</script>
