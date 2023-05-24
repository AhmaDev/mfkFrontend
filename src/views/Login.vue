<template>
  <div id="login" class="pa-5 navd">
    <div class="text-center">
      <br /><br /><br />
      <v-card class="mx-auto px-6 py-8" max-width="500">
        <img src="./mfkLogo.png" width="200" alt="" />
        <br />
        <br />
        <v-form v-model="form" @submit.prevent="onSubmit">
          <v-text-field v-model="email" :readonly="loading" :rules="[required]" class="mb-2" clearable variant="outlined"
            label="اسم المستخدم" append-inner-icon="mdi-card-account-details-outline"></v-text-field>

          <v-text-field v-model="password" :readonly="loading" :rules="[required]" clearable variant="outlined"
            label="كلمة المرور" type="password" placeholder="ادخل كلمة المرور"
            append-inner-icon="mdi-lock-outline"></v-text-field>

          <br />

          <v-btn :loading="loading" block color="warning" size="large" type="submit" elevation="0">
            دخول
          </v-btn>
        </v-form>
      </v-card>
      <br /><br />
      <small class="text-white">
        Developed by
        <b>Ahmad Faris</b> &copy; {{ new Date().getFullYear() }}
      </small>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    form: false,
    email: null,
    password: null,
    loading: false,
  }),

  methods: {
    onSubmit() {
      if (!this.form) return;
      this.loading = true;
      this.axios
        .post("login", {
          username: this.email,
          password: this.password,
        })
        .then((res) => {
          localStorage.setItem("userInfo", JSON.stringify(res.data));
          location.reload();
        })
        .catch(() => {
          this.$toast.error("المعلومات غير صحيحة");
        })
        .finally(() => (this.loading = false));
    },
    required(v) {
      return !!v || "";
    },
  },
};
</script>

<style scoped>
#login {
  /* background-color: #330000; */
  /* background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Cdefs%3E%3CradialGradient id='a' cx='396' cy='281' r='514' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%235676DD'/%3E%3Cstop offset='1' stop-color='%23330000'/%3E%3C/radialGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='400' y1='148' x2='400' y2='333'%3E%3Cstop offset='0' stop-color='%23FA3' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23FA3' stop-opacity='0.5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23a)' width='800' height='400'/%3E%3Cg fill-opacity='0.4'%3E%3Ccircle fill='url(%23b)' cx='267.5' cy='61' r='300'/%3E%3Ccircle fill='url(%23b)' cx='532.5' cy='61' r='300'/%3E%3Ccircle fill='url(%23b)' cx='400' cy='30' r='300'/%3E%3C/g%3E%3C/svg%3E"); */
  background-attachment: fixed;
  background-position: top;
  background-size: cover;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
</style>