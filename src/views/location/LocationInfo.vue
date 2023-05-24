<template>
  <div id="locationInfo" v-if="location">
    <v-card class="pa-10">
      <v-text-field variant="outlined" label="اسم العميل" v-model="location.locationTitle"></v-text-field>
      <v-text-field variant="outlined" label="رقم الهاتف" v-model="location.phoneNumber"></v-text-field>
      <v-text-field variant="outlined" label="العنوان" v-model="location.position"></v-text-field>
      <br />


      <l-map style="height: 400px" class="rounded-lg elevation-3" ref="map" v-model:zoom="zoom"
        :center="JSON.parse(location.geoLocation)">
        <l-tile-layer url="https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" layer-type="base"
          name="OpenStreetMap"></l-tile-layer>
        <l-marker draggable @update:lat-lng="changeLocation($event)" :lat-lng="map.markerLatLng"></l-marker>
      </l-map>
      <br />
      <v-btn color="success" elevation="0" size="large" :block="$vuetify.display.mobile" @click="save()"
        v-if="!auth.includes('edit')">
        <span>حفظ</span>
      </v-btn>
    </v-card>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data: () => ({
    location: null,
    auth: [],
    zoom: 15,
    map: {
      url: "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      zoom: 12,
      center: [33.29140013416987, 44.351881742477424],
      markerLatLng: [33.29140013416987, 44.351881742477424],
    },
  }),
  created: function () {
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
          delete this.location.createdAt;
        })
        .finally(() => (this.$store.state.loading = false));
    },
    changeLocation(e) {
      this.location.geoLocation = "[" + e.lat + "," + e.lng + "]"
    },
    save() {
      this.$store.state.loading = true;
      this.axios
        .put("location/" + this.$route.params.id, this.location)
        .then(() => {
          this.$toast.success("تم حفظ المعلومات");
        })
        .finally(() => (this.$store.state.loading = false));
    },
  },
};
</script>

<style></style>