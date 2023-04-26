<template>
  <div id="locationInfo" v-if="location">
    <v-card class="pa-10">
      <v-text-field
        variant="outlined"
        label="اسم العميل"
        v-model="location.locationTitle"
      ></v-text-field>
      <v-text-field
        variant="outlined"
        label="رقم الهاتف"
        v-model="location.phoneNumber"
      ></v-text-field>
      <v-text-field
        variant="outlined"
        label="العنوان"
        v-model="location.position"
      ></v-text-field>
      <br />
      <v-btn
        color="success"
        elevation="0"
        size="large"
        :block="$vuetify.display.mobile"
        @click="save()"
        v-if="!auth.includes('edit')"
      >
        <span>حفظ</span>
      </v-btn>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    location: null,
    auth: [],
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

<style>
</style>