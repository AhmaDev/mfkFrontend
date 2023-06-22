<template>
  <div id="absences">
    <v-app-bar>
      <v-toolbar-title>الغيابات</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="!auth.includes('add')" variant="elevated" @click="addAbsenceModal = true" color="success">
        <v-icon start icon="mdi-plus"></v-icon>
        <span>اضافة غياب جديد</span>
      </v-btn>
    </v-app-bar>
    <v-card class="pa-10">
      <v-row>
        <v-col cols="auto">
          <b>تاريخ البحث</b>
        </v-col>
        <v-col cols="12" md="4">
          <VueDatePicker :enable-time-picker="false" v-model="dateRange" model-type="format" format="yyyy-MM-dd"
            auto-apply close-on-auto-apply :teleport="true" no-swipe :clearable="false" range>
          </VueDatePicker>
        </v-col>
        <v-col>
          <v-autocomplete variant="outlined" label="الموظف" :items="employees" item-title="employeeName"
            item-value="idEmployee" v-model="selectedEmployee" clearable @update:menu="fixMenu($event)" density="compact"
            @update:modelValue="fetch()" hide-details></v-autocomplete>
        </v-col>
        <v-col cols="12" md="4">
          <v-btn color="primary" elevation="0" @click="fetch()" :block="$vuetify.display.mobile">
            <span>بحث</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <br />
    <v-table class="rounded elevation-2" theme="light" fixed-header hover>
      <thead>
        <tr>
          <th>اسم الموظف</th>
          <th>المبلغ المستطقع</th>
          <th>تاريخ الغياب</th>
          <th>الملاحظات</th>
          <th>الاجراءات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="absence in absences" :key="absence.idAbsence">
          <td>{{ absence.employeeName }}</td>
          <td>{{ absence.price.toLocaleString() }} د.ع</td>
          <td>{{ parseDate(absence.absenceDate) }}</td>
          <td>{{ absence.notice }}</td>
          <td>
            <v-btn @click="deleteAbsence(absence.idAbsence)" v-if="!auth.includes('delete')" variant="plain" icon
              color="error">
              <v-icon icon="mdi-delete-outline"></v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-footer elevation="4" app>
      <v-row>
        <v-col cols="auto">
          <h4 class="text-error">
            الاستقطاعات:
            {{ absences.reduce((a, b) => a + b.price, 0).toLocaleString() }}
            د.ع
          </h4>
        </v-col>
        <v-col v-if="selectedEmployee" cols="auto">
          <h4 class="text-warning">
            الراتب:
            {{
              employees
                .filter((e) => e.idEmployee == selectedEmployee)[0]
                .salary.toLocaleString()
            }}
            د.ع
          </h4>
        </v-col>
        <v-col v-if="selectedEmployee" cols="auto">
          <h4 class="text-success">
            المتبقي:
            {{
              (
                employees.filter((e) => e.idEmployee == selectedEmployee)[0]
                  .salary - absences.reduce((a, b) => a + b.price, 0)
              ).toLocaleString()
            }}
            د.ع
          </h4>
        </v-col>
      </v-row>
    </v-footer>
    <v-dialog v-model="addAbsenceModal" max-width="500">
      <v-card class="pa-10 addAbsenceDialog">
        <h2 class="mb-5">اضافة غياب جديد</h2>
        <v-autocomplete variant="outlined" label="الموظف" :items="employees" item-title="employeeName"
          item-value="idEmployee" v-model="absenceForm.employeeId" @update:menu="fixMenu($event)"></v-autocomplete>
        <v-text-field variant="outlined" type="number" v-model="absenceForm.price"
          label="المبلغ المستطقع بالدينار العراقي"></v-text-field>
        <small class="mb-1">
          <div>تاريخ الغياب : {{ absenceForm.absenceDate }}</div>
        </small>
        <VueDatePicker inline :enable-time-picker="false" menu-class-name="dpMenuX" model-type="format"
          format="yyyy-MM-dd" auto-apply :teleport="true" close-on-auto-apply no-swipe :clearable="false"
          v-model="absenceForm.absenceDate" />
        <br />
        <v-textarea variant="outlined" label="الملاحظات" v-model="absenceForm.notice"></v-textarea>
        <v-btn @click="addAbsence()" color="success" block>اضافة</v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import * as moment from "moment";
export default {
  data: () => ({
    auth: [],
    addAbsenceModal: false,
    absences: [],
    employees: [],
    dateRange: [],
    selectedEmployee: null,
    absenceForm: {
      employeeId: null,
      price: null,
      createdBy: null,
      absenceDate: "",
      notice: "",
    },
  }),
  created: function () {
    let now = new Date();
    this.absenceForm.absenceDate =
      now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    this.absenceForm.createdBy = JSON.parse(
      localStorage.getItem("userInfo")
    ).idUser;
    var today = new Date();
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.dateRange.push(
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-01"
    );
    this.dateRange.push(
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      lastDayOfMonth.getDate()
    );
    this.fetch();
  },
  methods: {
    fetch() {
      this.axios
        .get("user/" + JSON.parse(localStorage.getItem("userInfo")).idUser)
        .then((res) => {
          this.auth = JSON.parse(res.data.denyFrom);
        });
      let q = "";
      if (this.selectedEmployee) {
        q = q + "&employeeId=" + this.selectedEmployee;
      }
      this.$store.state.loading = true;
      this.axios.get("employees").then((res) => (this.employees = res.data));
      this.axios
        .get(
          `absences?dateFrom=${this.dateRange[0]}&dateTo=${this.dateRange[1]}${q}`
        )
        .then((res) => (this.absences = res.data))
        .finally(() => (this.$store.state.loading = false));
    },
    addAbsence() {
      if (this.absenceForm.employeeId == null) {
        this.$toast.error("قم باختيار الموظف");
        return;
      }
      if (this.absenceForm.price == null) {
        this.$toast.error("قم بكتابة مبلغ الاستقطاع");
        return;
      }
      this.$store.state.loading = true;
      this.axios
        .post("addAbsence", this.absenceForm)
        .then(() => {
          this.fetch();
          this.$toast.success("تم اضافة الغياب");
          this.addAbsenceModal = false;
          this.absenceForm = {
            employeeId: null,
            price: null,
            createdBy: null,
            absenceDate: "",
            notice: "",
          };
          this.absenceForm.absenceDate =
            now.getFullYear() +
            "-" +
            (now.getMonth() + 1) +
            "-" +
            now.getDate();
          this.absenceForm.createdBy = JSON.parse(
            localStorage.getItem("userInfo")
          ).idUser;
        })
        .finally(() => (this.$store.state.loading = false));
    },
    deleteAbsence(id) {
      let c = confirm("هل انت متأكد");
      if (c) {
        this.axios.delete("absence/" + id).then(() => this.$router.push("/"));
      }
    },
    parseDate(d) {
      let date = new Date(d);
      return moment(date).format("YYYY-MM-DD");
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

<style>
.dp__outer_menu_wrap,
.dpMenuX {
  width: 100% !important;
}

.v-card {
  overflow: inherit !important;
}
</style>