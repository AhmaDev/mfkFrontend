<template>
  <div id="incomes">
    <v-app-bar elevation="0" app>
      <v-toolbar-title>الصندوق</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        elevation="0"
        @click="incomeModal = true"
        variant="elevated"
        color="success"
        v-if="!auth.includes('add')"
      >
        اضافة وارد جديد
      </v-btn>
      &nbsp;
      <v-btn
        elevation="0"
        @click="outcomeModal = true"
        variant="elevated"
        color="error"
        v-if="!auth.includes('add')"
      >
        اضافة مصاريف جديدة
      </v-btn>
    </v-app-bar>
    <v-app-bar app>
      <v-tabs
        :show-arrows="$vuetify.display.mobile"
        stacked
        v-model="tab"
        color="primary"
        dark
        @update:modelValue="search()"
        slider-color="primary"
      >
        <v-tab
          title="صندوق الدينار"
          value="dinar"
          prepend-icon="mdi-cash-multiple"
        >
        </v-tab>
        <v-tab
          title="صندوق الدولار"
          value="dollar"
          prepend-icon="mdi-currency-usd"
        >
        </v-tab>
      </v-tabs>
    </v-app-bar>
    <v-card class="pa-10">
      <v-row>
        <v-col cols="auto">
          <b>تاريخ البحث</b>
        </v-col>
        <v-col cols="12" md="4">
          <VueDatePicker
            :enable-time-picker="false"
            v-model="dateRange"
            model-type="format"
            :teleport="true"
            format="yyyy-MM-dd"
            auto-apply
            close-on-auto-apply
            no-swipe
            :clearable="false"
            range
          >
          </VueDatePicker>
        </v-col>
        <v-col cols="12" md="4">
          <v-btn
            :loading="isLoading"
            color="primary"
            elevation="0"
            @click="search()"
            :block="$vuetify.display.mobile"
          >
            <span>بحث</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <br />
    <v-row class="mb-10">
      <v-col v-if="paymentsReport.length > 0" cols="12" md="12">
        <h2 class="mb-4">
          <span>واردات السلف</span>
          <v-chip class="mr-4" color="primary">
            <b>{{ paymentsReport.length }}</b>
          </v-chip>
        </h2>
        <v-table class="elevation-2 rounded" theme="light" hover>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المبلغ</th>
              <th>رقم السلفة</th>
              <th>صاحب الدار</th>
              <th>موقع الدار</th>
              <th>التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in paymentsReport" :key="payment.idPayment">
              <td>{{ parseDate(payment.createdAt) }}</td>
              <td>
                <v-chip color="success">
                  {{
                    calculatePercentage(
                      payment.paymentAmount,
                      payment.percentage
                    ).toLocaleString()
                  }}
                  <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
                  <span class="mr-1" v-if="tab == 'dollar'">$</span>
                </v-chip>
              </td>
              <td>
                <b class="text-blue">{{ payment.paymentCount }}</b>
              </td>
              <td>
                <v-btn
                  :to="`/location/${payment.locationId}`"
                  target="_BLANK"
                  variant="text"
                  rounded
                  color="black"
                >
                  {{ payment.locationTitle }}
                </v-btn>
              </td>
              <td>{{ payment.position }}</td>
              <td>
                {{ payment.notice }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6">
                <v-chip color="success">
                  <span class="ml-2">مجموع واردات السلف</span>
                  <b>{{ totalPaymentsPercentage().toLocaleString() }}</b>
                  <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
                  <span class="mr-1" v-if="tab == 'dollar'">$</span>
                </v-chip>
              </td>
            </tr>
          </tfoot>
        </v-table>
      </v-col>
      <v-col v-if="incomes.length > 0" cols="12" md="12">
        <h2 class="mb-4">
          <span>واردات الصندوق</span>
          <v-chip class="mr-4" color="primary">
            <b>{{ incomes.length }}</b>
          </v-chip>
        </h2>
        <v-table class="elevation-2 rounded" theme="light" hover>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المبلغ</th>
              <th>التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="income in incomes" :key="income.idIncome">
              <td>{{ parseDate(income.createdAt) }}</td>
              <td>
                <v-chip color="success">
                  {{ income.price.toLocaleString() }}
                  <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
                  <span class="mr-1" v-if="tab == 'dollar'">$</span>
                </v-chip>
              </td>
              <td>
                {{ income.notice }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6">
                <v-chip color="success">
                  <span class="ml-2">مجموع واردات الصندوق</span>
                  <b>{{
                    incomes.reduce((a, b) => a + b.price, 0).toLocaleString()
                  }}</b>
                  <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
                  <span class="mr-1" v-if="tab == 'dollar'">$</span>
                </v-chip>
              </td>
            </tr>
          </tfoot>
        </v-table>
      </v-col>
      <v-col v-if="outcomes.length > 0" cols="12" md="12">
        <h2 class="mb-4">
          <span>مصاريف الصندوق</span>
          <v-chip class="mr-4" color="primary">
            <b>{{ outcomes.length }}</b>
          </v-chip>
        </h2>
        <v-table class="elevation-2 rounded" theme="light" hover>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المبلغ</th>
              <th>اسم المستلم</th>
              <th>التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="outcome in outcomes" :key="outcome.idOutcome">
              <td>{{ parseDate(outcome.createdAt) }}</td>
              <td>
                <v-chip color="error">
                  {{ outcome.price.toLocaleString() }}
                  <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
                  <span class="mr-1" v-if="tab == 'dollar'">$</span>
                </v-chip>
              </td>
              <td>
                {{ outcome.recieverName }}
              </td>
              <td>
                {{ outcome.notice }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6">
                <v-chip color="error">
                  <span class="ml-2">مجموع مصاريف الصندوق</span>
                  <b>{{
                    outcomes.reduce((a, b) => a + b.price, 0).toLocaleString()
                  }}</b>
                  <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
                  <span class="mr-1" v-if="tab == 'dollar'">$</span>
                </v-chip>
              </td>
            </tr>
          </tfoot>
        </v-table>
      </v-col>
    </v-row>
    <v-footer
      style="z-index: 10"
      elevation="10"
      :app="!$vuetify.display.mobile"
    >
      <v-row>
        <v-col cols="auto">
          <span>مجموع الواردات</span>
          <v-chip class="mr-3" color="success">
            <b>
              {{
                (
                  incomes.reduce((a, b) => a + b.price, 0) +
                  totalPaymentsPercentage()
                ).toLocaleString()
              }}
            </b>
            <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
            <span class="mr-1" v-if="tab == 'dollar'">$</span>
          </v-chip>
        </v-col>
        <v-col cols="auto">
          <span>مجموع المصاريف</span>
          <v-chip class="mr-3" color="error">
            <b>
              {{ outcomes.reduce((a, b) => a + b.price, 0).toLocaleString() }}
            </b>
            <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
            <span class="mr-1" v-if="tab == 'dollar'">$</span>
          </v-chip>
        </v-col>
        <v-col cols="auto">
          <span>المتبقي في الصندوق</span>
          <v-chip class="mr-3" color="warning">
            <b>
              {{
                (
                  incomes.reduce((a, b) => a + b.price, 0) +
                  totalPaymentsPercentage() -
                  outcomes.reduce((a, b) => a + b.price, 0)
                ).toLocaleString()
              }}
            </b>
            <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
            <span class="mr-1" v-if="tab == 'dollar'">$</span>
          </v-chip>
        </v-col>
      </v-row>
    </v-footer>
    <v-dialog v-model="incomeModal" max-width="500">
      <v-card class="pa-10">
        <h2 class="mb-3">اضافة وارد جديد</h2>
        <v-text-field
          variant="outlined"
          label="المبلغ"
          type="number"
          v-model="incomeForm.price"
        ></v-text-field>
        <v-textarea
          variant="outlined"
          label="الملاحظات"
          v-model="incomeForm.notice"
        ></v-textarea>
        <v-radio-group v-model="incomeForm.currency">
          <v-radio label="اضافة الى صندوق الدينار" value="dinar"></v-radio>
          <v-radio label="اضافة الى صندوق الدولار" value="dollar"></v-radio>
        </v-radio-group>
        <v-btn @click="addIncome()" block color="success" dark>اضافة</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="outcomeModal" max-width="500">
      <v-card class="pa-10">
        <h2 class="mb-3">اضافة مصاريف جديدة</h2>
        <v-text-field
          variant="outlined"
          label="المبلغ"
          type="number"
          v-model="outcomeForm.price"
        ></v-text-field>
        <v-text-field
          variant="outlined"
          label="اسم المستلم"
          v-model="outcomeForm.recieverName"
        ></v-text-field>
        <v-textarea
          variant="outlined"
          label="الملاحظات"
          v-model="outcomeForm.notice"
        ></v-textarea>
        <v-radio-group v-model="outcomeForm.currency">
          <v-radio label="اضافة الى صندوق الدينار" value="dinar"></v-radio>
          <v-radio label="اضافة الى صندوق الدولار" value="dollar"></v-radio>
        </v-radio-group>
        <v-btn @click="addOutcome()" block color="success" dark>اضافة</v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import * as moment from "moment";
export default {
  components: {},
  data: () => ({
    auth: [],
    location: null,
    tab: "dinar",
    dateRange: [],
    isLoading: false,
    paymentsReport: [],
    incomes: [],
    outcomes: [],
    incomeModal: false,
    outcomeModal: false,
    incomeForm: {
      price: null,
      createdBy: null,
      notice: null,
      currency: null,
    },
    outcomeForm: {
      price: null,
      createdBy: null,
      notice: null,
      currency: null,
      recieverName: null,
    },
  }),
  created: function () {
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
      this.incomeForm.createdBy = JSON.parse(
        localStorage.getItem("userInfo")
      ).idUser;
      this.search();
      this.outcomeForm.createdBy = JSON.parse(
        localStorage.getItem("userInfo")
      ).idUser;
      this.search();
    },
    search() {
      this.incomeForm.currency = this.tab;
      this.outcomeForm.currency = this.tab;
      this.isLoading = true;
      this.axios
        .get(
          `report/income/${this.tab}?dateFrom=${this.dateRange[0]}&dateTo=${this.dateRange[1]}`
        )
        .then((res) => {
          this.paymentsReport = res.data;
        })
        .finally(() => (this.isLoading = false));
      this.axios
        .get(
          `incomes/${this.tab}?dateFrom=${this.dateRange[0]}&dateTo=${this.dateRange[1]}`
        )
        .then((res) => {
          this.incomes = res.data;
        })
        .finally(() => (this.isLoading = false));
      this.axios
        .get(
          `outcomes/${this.tab}?dateFrom=${this.dateRange[0]}&dateTo=${this.dateRange[1]}`
        )
        .then((res) => {
          this.outcomes = res.data;
        })
        .finally(() => (this.isLoading = false));
    },
    parseDate(d) {
      let date = new Date(d);
      return moment(date).format("YYYY-MM-DD");
    },
    calculatePercentage(amount, companyPercentage) {
      let percentage = companyPercentage / 100;
      let y = (percentage / (1 + percentage)) * amount;
      let x = 0;
      if (this.tab == "dinar") {
        x = Math.ceil(y / 1000) * 1000 - 1000;
      } else {
        x = Math.ceil(y);
      }
      return x;
    },
    totalPaymentsPercentage() {
      let sum = 0;
      this.paymentsReport.forEach((e) => {
        sum = sum + this.calculatePercentage(e.paymentAmount, e.percentage);
      });
      return sum;
    },
    addIncome() {
      if (this.incomeForm.price == null) {
        this.$toast.error("يرجى كتابة المبلغ");
        return;
      }
      this.$store.state.loading = true;
      this.axios
        .post("addIncome", this.incomeForm)
        .then(() => {
          this.$toast.success("تم اضافة المبلغ");
          this.incomeForm = {
            price: null,
            createdBy: null,
            notice: null,
            currency: null,
          };
          this.fetch();
          this.incomeModal = false;
        })
        .finally(() => (this.$store.state.loading = false));
    },
    addOutcome() {
      if (this.outcomeForm.price == null) {
        this.$toast.error("يرجى كتابة المبلغ");
        return;
      }
      this.$store.state.loading = true;
      this.axios
        .post("addOutcome", this.outcomeForm)
        .then(() => {
          this.$toast.success("تم اضافة المبلغ");
          this.outcomeForm = {
            price: null,
            createdBy: null,
            notice: null,
            currency: null,
            recieverName: null,
          };
          this.fetch();
          this.outcomeModal = false;
        })
        .finally(() => (this.$store.state.loading = false));
    },
  },
};
</script>

<style>
.v-card {
  overflow: inherit !important;
}
td,
th {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
}
.dp__menu {
  z-index: 1000000000000 !important;
}
</style>