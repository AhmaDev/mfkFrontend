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
        </v-app-bar>
        <div id="locations">
            <v-row>
                <v-col v-for="location in locations" :key="location.idLocation" cols="12" md="3">
                    <v-card class="">
                        <v-card-title> {{ location.locationTitle }} </v-card-title>
                        <v-card-subtitle> {{ location.position }} </v-card-subtitle>
                        <v-divider class="my-2"></v-divider>
                        <div class="pa-3">
                            <v-btn v-if="!auth.includes('add')"
                                @click="newLoan.locationId = location.idLocation; loanModal = true;" color="success"
                                block>اضافة دين
                                جديد</v-btn>
                            <v-divider class="my-2"></v-divider>
                            <v-list-item v-for="loan in loans.filter(e => e.locationId == location.idLocation)"
                                :key="loan.idLoan">
                                <v-list-item-title>
                                    {{ locations.filter(e => e.idLocation == loan.fromId)[0].locationTitle }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="text-red">
                                    <b>{{ loan.amount.toLocaleString() }}</b>
                                    <span class="mr-1" v-if="loan.currency == 'dinar'">د.ع</span>
                                    <span class="mr-1" v-if="loan.currency == 'dollar'">$</span>
                                </v-list-item-subtitle>
                                <template v-slot:append>
                                    <v-btn v-if="!auth.includes('delete')" @click="deleteLoan(loan.idLoan)" size="small"
                                        variant="text" color="error" icon="mdi-delete-outline"></v-btn>
                                </template>
                            </v-list-item>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </div>
        <v-dialog v-model="loanModal" max-width="500">
            <v-card class="pa-10">
                <h3>اضافة دين جديد</h3>
                <br>
                <v-autocomplete variant="outlined" :items="locations" item-title="locationTitle" item-value="idLocation"
                    label="اقتراض من" @update:menu="fixMenu" v-model="newLoan.fromId"></v-autocomplete>
                <v-text-field variant="outlined" label="مبلغ الدين" type="number" v-model="newLoan.amount"></v-text-field>
                <v-radio-group v-model="newLoan.currency">
                    <v-radio label="الدينار" value="dinar"></v-radio>
                    <v-radio label="الدولار" value="dollar"></v-radio>
                </v-radio-group>
                <br>
                <v-btn @click="addLoan()" block color="primary" dark>اضافة الدين</v-btn>
            </v-card>
        </v-dialog>
    </div>
</template>
  
<script>
export default {
    components: {
    },

    data: () => ({
        auth: [],
        locations: [],
        zoom: 15,
        loans: [],
        addNewLocationDialog: false,
        loanModal: false,
        newLoan: {
            locationId: null,
            fromId: null,
            amount: null,
            currency: 'dinar'
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
                this.axios
                    .get("loans")
                    .then((res) => {
                        this.loans = res.data;
                    })
                    .finally(() => (this.$store.state.loading = false));
            }, 0);
        },
        addLoan() {
            this.$store.state.loading = true;
            this.axios.post('addLoan', this.newLoan).then(() => {
                this.$toast.success('تم اضافة الدين');
                this.loanModal = false;
                this.newLoan = {
                    locationId: null,
                    fromId: null,
                    amount: null,
                    currency: 'dinar'
                };
                this.fetch();
            }).finally(() => this.$store.state.loading = false)
        },
        deleteLoan(id) {
            let c = confirm("هل انت متأكد");
            if (c) {
                this.axios.delete("loan/" + id).then(() => this.fetch());
            }
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
        fixMenu(e) {
            if (e) {
                setTimeout(() => {
                    var menus = document.querySelectorAll(
                        ".v-overlay-container .v-overlay .v-overlay__content"
                    );

                    if (menus) {
                        menus.forEach((menu) => {
                            if (!menu.style.left.startsWith("-")) return;
                            const right = menu.style.right;
                            const left = menu.style.left;
                            menu.style.left = right;
                            menu.style.right = left.replace("-", "");
                        });
                    }
                }, 1);
            }
        },


    },
};
</script>
  
<style></style>