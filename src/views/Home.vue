<template>
  <div id="home">
    <v-app-bar>
      <v-app-bar-title>
        <span>عدد المواقع</span>
        &nbsp;
        <v-chip color="warning" size="small">
          <b>{{ locations.length }}</b>
        </v-chip>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn @click="addNewLocationDialog = true" color="success" variant="elevated" v-if="!auth.includes('add')">
        <v-icon start icon="mdi-plus"></v-icon>
        <span>اضافة موقع جديد</span>
      </v-btn>
    </v-app-bar>
    <div id="locations">
      <v-row>
        <v-col v-for="location in locations" :key="location.idLocation" cols="12" md="3">
          <v-card class="">
            <!-- <v-img :src="
              `https://maps.googleapis.com/maps/api/staticmap?center=` +
              location.geoLocation.slice(1, -1) +
              `&zoom=16&scale=2&size=600x300&maptype=roadmap&format=png&key=AIzaSyBAbB0YnZF2pgdYMRSJMsbwXf0_7IbOk-g&markers=size:lar%7Ccolor:0xff0000%7Clabel:%7C` +
              location.geoLocation.slice(1, -1)
            " height="200px" cover></v-img> -->
            <v-card-title> {{ location.locationTitle }} </v-card-title>
            <v-divider class="mb-2"></v-divider>
            <v-card-subtitle> {{ location.position }} </v-card-subtitle>
            <v-divider class="my-2"></v-divider>
            <v-card-subtitle> تاريخ الاضافة: {{ $formatDate(location.createdAt) }} </v-card-subtitle>
            <v-divider class="my-2"></v-divider>
            <v-card-actions>
              <v-btn :to="'/location/' + location.idLocation" color="orange-darken-2" variant="elevated" elevation="0">
                تفاصيل
              </v-btn>

              <v-spacer></v-spacer>

              <v-btn>
                {{ location.phoneNumber }}
                <v-icon icon="mdi-phone-outline" end></v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <v-dialog transition="scale-transition" v-model="addNewLocationDialog" width="100%" max-width="700"
      :fullscreen="$vuetify.display.mobile">
      <v-card class="pa-10">
        <v-card-title>اضافة موقع جديد
          <v-btn icon style="float: left" @click="addNewLocationDialog = false">
            <v-icon icon="mdi-close"></v-icon>
          </v-btn>
        </v-card-title>
        <br />
        <v-text-field variant="outlined" prepend-inner-icon="mdi-account-circle-outline"
          v-model="newLocationForm.locationTitle" label="اسم صاحب الموقع"></v-text-field>
        <v-text-field variant="outlined" prepend-inner-icon="mdi-map-marker-outline" v-model="newLocationForm.position"
          label="عنوان الموقع"></v-text-field>
        <v-text-field variant="outlined" prepend-inner-icon="mdi-phone-outline" v-model="newLocationForm.phoneNumber"
          label="رقم هاتف صاحب الموقع"></v-text-field>
        <v-row>
          <v-col cols="12">
            <b>نسبة الشركة</b>
          </v-col>
          <v-col cols="8">
            <v-slider :min="0" :max="100" v-model="newLocationForm.percentage" color="primary" :step="1"></v-slider>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="newLocationForm.percentage" variant="outlined" hide-details type="number"
              density="compact"></v-text-field>
          </v-col>
        </v-row>
        <v-alert icon="mdi-map-marker-radius" density="compact" color="blue-darken-3">
          <v-row>
            <v-col>
              <span>قم باختيار الموقع على الخريطة</span>
            </v-col>
            <v-col cols="auto">
              <v-chip dir="ltr" size="x-small">
                {{ newLocationForm.geoLocation }}
              </v-chip>
            </v-col>
          </v-row>
        </v-alert>
        <l-map style="height: 400px" class="rounded-lg elevation-3" ref="map" v-model:zoom="zoom" :center="map.center"
          @click="log($event)">
          <l-tile-layer url="https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" layer-type="base"
            name="OpenStreetMap"></l-tile-layer>
          <l-marker draggable @update:lat-lng="changeLocation($event)" :lat-lng="map.markerLatLng"></l-marker>
        </l-map>
        <v-divider class="my-10"></v-divider>
        <v-btn @click="addLocation()" size="large" block color="primary" dark>اضافة</v-btn>
      </v-card>
    </v-dialog>
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
    auth: [],
    locations: [],
    zoom: 15,
    addNewLocationDialog: false,
    newLocationForm: {
      locationTitle: null,
      createdBy: null,
      percentage: 10,
      geoLocation: "[33.29140013416987,44.351881742477424]",
      position: null,
      phoneNumber: null,
    },
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
      setTimeout(() => {
        this.axios
          .get("locations")
          .then((res) => {
            this.locations = res.data;
          })
          .finally(() => (this.$store.state.loading = false));
      }, 0);
    },
    changeLocation(e) {
      this.newLocationForm.geoLocation = "[" + e.lat + "," + e.lng + "]";
    },
    log(e) {
      console.log(e);
    },
    addLocation() {
      console.log(this.newLocationForm.locationTitle);
      if (this.newLocationForm.locationTitle == null) {
        this.$toast.error("قم بكتابة اسم صاحب الموقع");
        return;
      }
      if (this.newLocationForm.position == null) {
        this.$toast.error("قم بكتابة عنوان الموقع");
        return;
      }
      if (this.newLocationForm.phoneNumber == null) {
        this.$toast.error("قم بكتابة رقم هاتف صاحب الموقع");
        return;
      }
      this.$store.state.loading = true;
      let userInfo = JSON.parse(localStorage.getItem("userInfo"));
      this.newLocationForm.createdBy = userInfo.idUser;
      this.axios
        .post("addLocation", this.newLocationForm)
        .then(() => {
          this.$toast.success("تم اضافة الموقع بنجاح");
          this.fetch();
          this.addNewLocationDialog = false;
        })
        .finally(() => (this.$store.state.loading = false));
    },
  },
};
</script>

<style></style>