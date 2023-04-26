<template>
  <div id="imagesPage">
    <v-btn
      v-if="!auth.includes('add')"
      class="mb-4"
      color="success"
      elevation="0"
      @click="chooseImage()"
      >اضافة صورة</v-btn
    >

    <v-row>
      <v-col
        v-for="image in images"
        :key="image.idLocationImage"
        cols="6"
        md="3"
      >
        <v-hover v-slot="{ isHovering, props }">
          <v-card v-bind="props">
            <v-img
              height="300"
              cover
              :src="axios.defaults.baseURL + image.imagePath"
            ></v-img>
            <v-overlay
              :model-value="isHovering"
              contained
              scrim="#036358"
              class="align-center justify-center"
            >
              <v-btn
                @click="
                  zoomedImage = axios.defaults.baseURL + image.imagePath;
                  imageModal = true;
                "
                icon
              >
                <v-icon icon="mdi-magnify-plus-outline"></v-icon>
              </v-btn>
              &nbsp;
              <v-btn
                color="red"
                theme="dark"
                @click="deleteImage(image.idLocationImage)"
                icon
                v-if="!auth.includes('delete')"
              >
                <v-icon icon="mdi-delete-outline"></v-icon>
              </v-btn>
            </v-overlay>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
    <input
      type="file"
      name="file"
      id="file"
      style="display: none"
      @change="uploadImage($event)"
      accept="image/*"
    />
    <v-dialog max-width="100vh" max-height="100vh" v-model="imageModal">
      <img
        @click="imageModal = false"
        :src="zoomedImage"
        style="max-width: 100vh; max-height: 100vh"
        alt=""
      />
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: () => ({
    images: [],
    zoomedImage: "",
    imageModal: false,
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
        .get("locationImage/" + this.$route.params.id)
        .then((res) => {
          this.images = res.data;
        })
        .finally(() => (this.$store.state.loading = false));
    },
    chooseImage() {
      document.getElementById("file").click();
    },
    uploadImage(e) {
      this.$store.state.loading = true;
      let userInfo = JSON.parse(localStorage.getItem("userInfo"));
      var formData = new FormData();
      var imagefile = document.querySelector("#file");
      formData.append("file", imagefile.files[0]);
      formData.append("createdBy", userInfo.idUser);
      formData.append("locationId", this.$route.params.id);
      this.axios
        .post("addLocationImage?destination=location", formData)
        .then(() => {
          this.$toast.success("تم اضافة صورة");
          this.fetch();
        })
        .finally(() => (this.$store.state.loading = false));
    },
    deleteImage(id) {
      let c = confirm("هل انت متأكد من حذف الصورة");
      if (c) {
        this.$store.state.loading = true;
        this.axios
          .delete("locationImage/" + id)
          .then(() => {
            this.$toast.success("تم حذف الصورة");
            this.fetch();
          })
          .finally(() => (this.$store.state.loading = false));
      }
    },
  },
};
</script>

<style>
</style>