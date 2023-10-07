<template>
    <div id="websitePage">
        <v-app-bar app>
            <v-toolbar-title>الموقع الالكتروني</v-toolbar-title>
            <v-spacer></v-spacer>
        </v-app-bar>
        <v-card v-if="settings.length > 0" class="pa-10">
            <h2 class="mb-10">معلومات الموقع الالكتروني</h2>
            <v-text-field variant="outlined" :label="settings[0].title" v-model="settings[0].value"></v-text-field>
            <v-textarea variant="outlined" :label="settings[1].title" v-model="settings[1].value"></v-textarea>
            <v-btn @click="saveWebsiteInfo()" color="success">حفظ</v-btn>
        </v-card>
        <v-card v-if="categories.length > 0" class="pa-10 mt-5">
            <v-row>
                <v-col cols="6">
                    <h2 class="mb-10">المواقع المنجزة</h2>
                </v-col>
                <v-col cols="6" align="left">
                    <v-btn @click="addLocationModal = true" color="success">اضافة موقع</v-btn>
                </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row align="center" class="pa-4" v-for="location in locations" :key="location.idWebsiteLocation">
                <v-col cols="12" md="3">
                    {{ location.description }}
                    <v-btn
                        @click="selectedLocation = location.idWebsiteLocation; editLocation = true; editLocationInfo(); addLocationModal = true;"
                        icon="mdi-pencil" color="info" variant="tonal" size="small"></v-btn>
                </v-col>
                <v-col cols="12" md="3">
                    {{ categories.filter(e => e.idWebsiteCategory == location.categoryId)[0].categoryTitle }}
                </v-col>
                <v-col style="display: contents;" cols="12" md="3">
                    <img @click="deleteImage(image.idWebsiteLocationImage)" class="ml-2" :width="100" :height="100"
                        style="border: 1px #DDD solid;"
                        v-for="image in images.filter(e => e.locationId == location.idWebsiteLocation)"
                        :key="image.idWebsiteLocationImage" :src="axios.defaults.baseURL + image.imagePath" />
                    <v-btn @click="selectedLocation = location.idWebsiteLocation; chooseImage();" height="100" width="100"
                        variant="tonal" color="success">
                        <v-icon icon="mdi-image-plus" size="40"></v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="12">
                    <v-divider></v-divider>
                </v-col>
            </v-row>
        </v-card>
        <input type="file" name="file" id="file" style="display: none" @change="uploadImage($event)" accept="image/*" />
        <v-dialog persistent max-width="500" v-model="addLocationModal">
            <v-card class="pa-10">
                <h3 v-if="!editLocation" class="mb-10">اضافة موقع منجز جديد</h3>
                <h3 v-if="editLocation" class="mb-10">تعديل موقع منجز</h3>
                <v-select label="تصنيف الموقع" :items="categories" item-title="categoryTitle" item-value="idWebsiteCategory"
                    variant="outlined" transition="fade" @update:menu="$fixMenu($event)"
                    v-model="newLocationForm.categoryId"></v-select>
                <v-textarea variant="outlined" v-model="newLocationForm.description" label="نبذة عن الموقع"></v-textarea>
                <div>تاريخ الانجاز : <b>{{ newLocationForm.completionDate }}</b></div>
                <VueDatePicker inline :enable-time-picker="false" menu-class-name="dpMenuX" model-type="format"
                    format="yyyy-MM-dd" auto-apply :teleport="true" close-on-auto-apply no-swipe :clearable="false"
                    v-model="newLocationForm.completionDate" />
                <v-btn v-if="!editLocation" @click="addNewLocation()" color="success" class="mt-10" block>اضافة</v-btn>
                <v-btn v-if="editLocation" @click="editNewLocation()" color="success" class="mt-10" block>تعديل</v-btn>
                <v-btn @click="editLocation = false; clearLocationInfo(); addLocationModal = false;" color="error"
                    variant="tonal" class="mt-10" block>اغلاق</v-btn>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    data: () => ({
        settings: [],
        locations: [],
        addLocationModal: false,
        categories: [],
        selectedLocation: 0,
        editLocation: false,
        images: [],
        newLocationForm: {
            description: null,
            completionDate: null,
            categoryId: null,
        },
    }),
    created: function () {
        this.fetch();
    },
    methods: {
        async fetch() {
            this.$store.state.loading = true;
            this.settings = (await this.axios.get('websiteSettings')).data;
            this.locations = (await this.axios.get('websiteLocations')).data;
            this.categories = (await this.axios.get('websiteCategorys')).data;
            this.images = (await this.axios.get('websiteLocationImages')).data;
            this.$store.state.loading = false;
        },
        async saveWebsiteInfo() {
            this.$store.state.loading = true;
            await this.axios.put('websiteSetting/1', this.settings[0]);
            await this.axios.put('websiteSetting/2', this.settings[1]);
            this.$toast.success("تم التعديل");
            this.$store.state.loading = false;
        },
        async addNewLocation() {
            if (this.newLocationForm.categoryId == null) {
                this.$toast.warning("قم باختيار تصنيف")
                return;
            }
            if (this.newLocationForm.description == null) {
                this.$toast.warning("قم بكتابة نبذة عن الموقع")
                return;
            }
            if (this.newLocationForm.completionDate == null) {
                this.$toast.warning("قم باختيار تاريخ الانجاز")
                return;
            }
            this.$store.state.loading = true;
            await this.axios.post("addWebsiteLocation", this.newLocationForm);
            this.clearLocationInfo();
            this.addLocationModal = false;
            this.$toast.success("تم الاضافة");
            this.$store.state.loading = false;
            this.fetch();
        },
        chooseImage() {
            document.getElementById("file").click();
        },
        uploadImage(e) {
            this.$store.state.loading = true;
            var formData = new FormData();
            var imagefile = document.querySelector("#file");
            formData.append("file", imagefile.files[0]);
            formData.append("locationId", this.selectedLocation);
            this.axios
                .post("addWebsiteLocationImage?destination=location", formData)
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
                    .delete("websiteLocationImage/" + id)
                    .then(() => {
                        this.$toast.success("تم حذف الصورة");
                        this.fetch();
                    })
                    .finally(() => (this.$store.state.loading = false));
            }
        },
        clearLocationInfo() {
            this.newLocationForm = {
                description: null,
                completionDate: null,
                categoryId: null,
            };
        },
        editLocationInfo() {
            this.newLocationForm = {
                description: this.locations.filter(e => e.idWebsiteLocation == this.selectedLocation)[0].description,
                completionDate: this.$formatDate(this.locations.filter(e => e.idWebsiteLocation == this.selectedLocation)[0].completionDate),
                categoryId: this.locations.filter(e => e.idWebsiteLocation == this.selectedLocation)[0].categoryId,
            };
        },
        async editNewLocation() {
            this.$store.state.loading = true;
            await this.axios.put('websiteLocation/' + this.selectedLocation, this.newLocationForm);
            this.$toast.success("تم التعديل");
            this.clearLocationInfo();
            this.addLocationModal = false;
            this.fetch();
            this.$store.state.loading = false;
        },
    }
}
</script>

<style></style>