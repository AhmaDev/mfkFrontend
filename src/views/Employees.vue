<template>
  <div :class="$vuetify.display.mobile ? 'pa-5' : ''" id="employees">
    <v-app-bar app>
      <v-app-bar-title>
        <span>عدد الموظفين</span>
        &nbsp;
        <v-chip color="warning" size="small">
          <b>{{ employees.length }}</b>
        </v-chip>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn variant="elevated" @click="addEmployeeModal = true" color="success" v-if="!auth.includes('add')">
        <v-icon start icon="mdi-plus"></v-icon>
        <span>اضافة موظف جديد</span>
      </v-btn>
    </v-app-bar>
    <v-row>
      <v-col v-for="employee in employees" :key="employee.idEmployee" cols="12" md="3">
        <v-card variant="elevated">
          <v-card-item>
            <div>
              <h2 class="">{{ employee.employeeName }}</h2>

              <div class="">{{ employee.position }}</div>
              <v-chip class="mt-3" color="success">
                الراتب: {{ employee.salary.toLocaleString() }} د.ع
              </v-chip>
            </div>
          </v-card-item>

          <v-card-actions>
            <v-btn variant="plain">
              <v-icon start icon="mdi-phone"></v-icon>
              <span>{{ employee.phone }}</span>
            </v-btn>
            <v-spacer></v-spacer>
            <v-tooltip text="اضافة صورة مستمسكات" location="top">
              <template v-slot:activator="{ props }">
                <v-btn @click="selectedEmployeeId = employee.idEmployee;
                chooseImage();" v-bind="props" flat icon color="success" v-if="!auth.includes('edit')">
                  <v-icon icon="mdi-image-outline"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="تعديل" location="top">
              <template v-slot:activator="{ props }">
                <v-btn @click="editEmployeePrepare(employee.idEmployee, employee)" v-bind="props" flat icon
                  color="primary" v-if="!auth.includes('edit')">
                  <v-icon icon="mdi-pencil-outline"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="حذف" location="top">
              <template v-slot:activator="{ props }">
                <v-btn v-if="!auth.includes('delete')" v-bind="props" flat icon
                  @click="deleteEmployee(employee.idEmployee)" color="error">
                  <v-icon icon="mdi-delete-outline"></v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </v-card-actions>
          <hr v-if="documents.filter(e => e.employeeId == employee.idEmployee).length > 0">
          <div v-if="documents.filter(e => e.employeeId == employee.idEmployee).length > 0" class="pa-5">
            <img
              @click="zoomedImage = axios.defaults.baseURL + document.documentPath; imageModal = true; selectedDocument = document.idEmployeeDocument;"
              class="ma-2" v-for="document in documents.filter(e => e.employeeId == employee.idEmployee)"
              :key="document.idEmployeeDocument" style="width: 50px; height: 50px;"
              :src="axios.defaults.baseURL + document.documentPath" alt="">
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-footer elevation="4" app>
      <h4 class="text-success">
        مجموع الرواتب:
        {{ employees.reduce((a, b) => a + b.salary, 0).toLocaleString() }}
        د.ع
      </h4>
    </v-footer>
    <input type="file" name="file" id="file" style="display: none" @change="uploadImage($event)" accept="image/*" />
    <v-dialog v-model="addEmployeeModal" max-width="500">
      <v-card class="pa-10">
        <h2 class="mb-5">اضافة موظف جديد</h2>
        <v-text-field variant="outlined" label="اسم الموظف" v-model="addEmployeeForm.employeeName"></v-text-field>
        <v-text-field variant="outlined" label="الوظيفة" v-model="addEmployeeForm.position"></v-text-field>
        <v-text-field variant="outlined" label="الراتب بالدينار العراقي" type="number"
          v-model="addEmployeeForm.salary"></v-text-field>
        <v-text-field variant="outlined" label="رقم الهاتف" v-model="addEmployeeForm.phone"></v-text-field>
        <v-btn @click="addEmployee()" block color="success">اضافة</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog @update:modelValue="editModalEvent($event)" v-model="editEmployeeModal" max-width="500">
      <v-card class="pa-10">
        <h2 class="mb-5">تعديل معلومات الموظف</h2>
        <v-text-field variant="outlined" label="اسم الموظف" v-model="addEmployeeForm.employeeName"></v-text-field>
        <v-text-field variant="outlined" label="الوظيفة" v-model="addEmployeeForm.position"></v-text-field>
        <v-text-field variant="outlined" label="الراتب بالدينار العراقي" type="number"
          v-model="addEmployeeForm.salary"></v-text-field>
        <v-text-field variant="outlined" label="رقم الهاتف" v-model="addEmployeeForm.phone"></v-text-field>
        <v-btn elevation="0" class="mb-4" @click="editEmployee()" block color="primary">تعديل</v-btn>
        <v-btn elevation="0" @click="
          editEmployeeModal = false;
        addEmployeeForm = {
          employeeName: '',
          position: '',
          phone: '',
          salary: null,
          notice: '...',
        };" block color="error">اغلاق</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog width="500" v-model="imageModal">
      <img @click="imageModal = false" :src="zoomedImage" style="height: 700px" alt="" />
      <v-btn v-if="!auth.includes('delete')" @click="deleteDocument()" color="error">حذف الصورة</v-btn>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: () => ({
    auth: [],
    addEmployeeModal: false,
    editEmployeeModal: false,
    documents: [],
    selectedEmployee: 0,
    selectedEmployeeId: 0,
    selectedDocument: 0,
    imageModal: false,
    zoomedImage: '',
    employees: [],
    addEmployeeForm: {
      employeeName: "",
      position: "",
      phone: "",
      salary: null,
      notice: "...",
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
        .get("employees")
        .then((res) => (this.employees = res.data))
        .finally(() => (this.$store.state.loading = false));
      this.axios
        .get("employeeDocuments")
        .then((res) => (this.documents = res.data));
    },
    addEmployee() {
      if (this.addEmployeeForm.employeeName == "") {
        this.$toast.error("قم بكتابة اسم الموظف");
        return;
      }
      if (this.addEmployeeForm.position == "") {
        this.$toast.error("قم بكتابة عنوان الوظيفة");
        return;
      }
      if (this.addEmployeeForm.phone == "") {
        this.$toast.error("قم بكتابة رقم الهاتف");
        return;
      }
      if (this.addEmployeeForm.salary == null) {
        this.$toast.error("قم بكتابة الراتب");
        return;
      }
      this.$store.state.loading = true;
      this.axios.post("addEmployee", this.addEmployeeForm).then(() => {
        this.$toast.success("تم اضافة الموظف");
        this.addEmployeeModal = false;
        this.addEmployeeForm = {
          employeeName: "",
          position: "",
          phone: "",
          salary: null,
          notice: "...",
        };
        this.fetch();
      });
    },
    editEmployeePrepare(id, employee) {
      this.addEmployeeForm = {
        employeeName: employee.employeeName,
        position: employee.position,
        phone: employee.phone,
        salary: employee.salary,
        notice: "...",
      };
      this.selectedEmployee = id;
      this.editEmployeeModal = true;
    },
    deleteDocument() {
      let c = confirm("هل انت متأكد من حذف الصورة");
      if (c) {
        this.$store.state.loading = true;
        this.axios
          .delete("employeeDocument/" + this.selectedDocument)
          .then(() => {
            this.$toast.success("تم حذف الصورة");
            this.fetch();
            this.imageModal = false;
          })
          .finally(() => (this.$store.state.loading = false));
      }
    },
    editEmployee() {
      if (this.addEmployeeForm.employeeName == "") {
        this.$toast.error("قم بكتابة اسم الموظف");
        return;
      }
      if (this.addEmployeeForm.position == "") {
        this.$toast.error("قم بكتابة عنوان الوظيفة");
        return;
      }
      if (this.addEmployeeForm.phone == "") {
        this.$toast.error("قم بكتابة رقم الهاتف");
        return;
      }
      if (this.addEmployeeForm.salary == null) {
        this.$toast.error("قم بكتابة الراتب");
        return;
      }
      this.$store.state.loading = true;
      this.axios
        .put("employee/" + this.selectedEmployee, this.addEmployeeForm)
        .then(() => {
          this.$toast.success("تم تعديل الموظف");
          this.editEmployeeModal = false;
          this.addEmployeeForm = {
            employeeName: "",
            position: "",
            phone: "",
            salary: null,
            notice: "...",
          };
          this.fetch();
        });
    },
    editModalEvent(e) {
      if (!e) {
        this.addEmployeeForm = {
          employeeName: "",
          position: "",
          phone: "",
          salary: null,
          notice: "...",
        };
      }
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
      formData.append("employeeId", this.selectedEmployeeId);
      this.axios
        .post("addEmployeeDocument?destination=employee", formData)
        .then(() => {
          this.$toast.success("تم اضافة صورة");
          this.fetch();
        })
        .finally(() => (this.$store.state.loading = false));
    },
    deleteEmployee(id) {
      let c = confirm("هل انت متأكد");
      if (c) {
        this.axios.delete("employee/" + id).then(() => this.fetch());
      }
    },
  },
};
</script>

<style></style>