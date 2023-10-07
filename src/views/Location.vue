<template>
  <div v-if="location != null" id="location">
    <v-app-bar app elevation="0">
      <v-app-bar-title>
        {{ location.locationTitle }}
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn @click="deleteLocation(location.idLocation)" v-if="!auth.includes('delete')" color="error">حذف الموقع</v-btn>
    </v-app-bar>
    <v-app-bar app>
      <v-tabs :show-arrows="$vuetify.display.mobile" stacked v-model="tab" color="primary" dark slider-color="primary"
        @change="changeUrl($event)">
        <v-tab title="السلف بالدينار" value="paymentsDinar" prepend-icon="mdi-cash-multiple">
        </v-tab>
        <v-tab title="السلف الثانوية" value="paymentsDollar" prepend-icon="mdi-cash-multiple">
        </v-tab>
        <v-tab title="معلومات الموقع" value="info" prepend-icon="mdi-information-outline">
        </v-tab>
        <v-tab title="الصور المرفقة" value="images" prepend-icon="mdi-image-multiple-outline">
        </v-tab>
      </v-tabs>
    </v-app-bar>
    <div :class="$vuetify.display.mobile ? 'px-0 py-2' : 'px-10 py-2'">
      <v-divider class="my-5"></v-divider>
      <v-window :touch="false" v-model="tab">
        <v-window-item value="paymentsDinar">
          <Payments currency="dinar" />
        </v-window-item>
        <v-window-item value="paymentsDollar">
          <Payments currency="dollar" />
        </v-window-item>
        <v-window-item value="info">
          <LocationInfo />
        </v-window-item>
        <v-window-item value="images">
          <Images />
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script>
import Payments from "./location/Payments.vue";
import LocationInfo from "./location/LocationInfo.vue";
import Images from "./location/Images.vue";
export default {
  components: { Payments, LocationInfo, Images },
  data: () => ({
    location: null,
    tab: "paymentsDinar",
    auth: [],
  }),
  created: function () {
    // setTimeout(() => {
    //   if (this.$route.params.page) {
    //     this.tab = this.$route.params.page;
    //   }
    // }, 200);
    this.fetch();
  },
  methods: {
    fetch() {
      this.axios
        .get("user/" + JSON.parse(localStorage.getItem("userInfo")).idUser)
        .then((res) => {
          this.auth = JSON.parse(res.data.denyFrom);
        });
      this.$store.state.loading = true;
      this.axios
        .get("location/" + this.$route.params.id)
        .then((res) => {
          this.location = res.data;
        })
        .finally(() => (this.$store.state.loading = false));
    },
    deleteLocation(id) {
      let c = confirm("هل انت متأكد");
      if (c) {
        this.axios.delete("location/" + id).then(() => this.$router.push("/"));
      }
    },
    // changeUrl(tab) {
    //   setTimeout(() => {
    //     this.$router.replace(`/location/${this.$route.params.id}/${tab}`);
    //   }, 300);
    // },
  },
  // watch: {
  //   $data: {
  //     handler: function (newValue) {
  //       var data = JSON.parse(JSON.stringify(newValue));
  //       if (data.tab) {
  //         this.changeUrl(data.tab);
  //       }
  //     },
  //     deep: true,
  //   },
  // },
};
</script>

<style scoped>
.tabsHolder {
  position: sticky;
  top: 129px;
  background: white;
  z-index: 10000;
}
</style>