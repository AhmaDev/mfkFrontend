<template>
  <div id="incomes">
    <v-app-bar elevation="0" app>
      <v-toolbar-title>الصندوق</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn elevation="0" @click="incomeModal = true" variant="elevated" color="success" v-if="!auth.includes('add')">
        اضافة وارد جديد
      </v-btn>
      &nbsp;
      <v-btn elevation="0" @click="outcomeModal = true" variant="elevated" color="error" v-if="!auth.includes('add')">
        اضافة مصاريف جديدة
      </v-btn>
      &nbsp;
      <v-btn elevation="0" @click="sallaryModal = true" variant="elevated" color="warning" v-if="!auth.includes('add')">
        صرف الرواتب
      </v-btn>
      &nbsp;
      <v-btn elevation="0" @click="corporationModal = true" variant="elevated" color="info" v-if="!auth.includes('add')">
        صرف نسب الشركاء
      </v-btn>
    </v-app-bar>
    <v-app-bar app>
      <v-tabs :show-arrows="$vuetify.display.mobile" stacked v-model="tab" color="primary" dark
        @update:modelValue="search()" slider-color="primary">
        <v-tab title="صندوق الدينار" value="dinar" prepend-icon="mdi-cash-multiple">
        </v-tab>
        <v-tab title="الصندوق الثانوي" value="dollar" prepend-icon="mdi-cash-multiple">
        </v-tab>
      </v-tabs>
    </v-app-bar>
    <v-card class="pa-10">
      <v-row>
        <v-col cols="auto">
          <b>تاريخ البحث</b>
        </v-col>
        <v-col cols="12" md="4">
          <VueDatePicker :enable-time-picker="false" v-model="dateRange" model-type="format" :teleport="true"
            format="yyyy-MM-dd" auto-apply close-on-auto-apply no-swipe :clearable="false" range>
          </VueDatePicker>
        </v-col>
        <v-col cols="12" md="4">
          <v-btn :loading="isLoading" color="primary" elevation="0" @click="search()" :block="$vuetify.display.mobile">
            <span>بحث</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <br />
    <v-row class="mb-10">
      <v-col cols="12" md="12">
        <v-card class="pa-10">
          <v-row>
            <v-col cols="auto">
              <h2>الديون</h2>
            </v-col>
            <v-col>
              <v-btn @click="loanModal = true" color="primary" variant="tonal">
                <v-icon icon="mdi-plus-circle"></v-icon>
                <span>اضافة دين جديد</span>
              </v-btn>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <center v-if="loans.filter(e => e.loanType == 'loan').length == 0">
            <v-alert width="300" color="success" variant="tonal">
              <span>لا يوجد ديون</span>
            </v-alert>
          </center>
          <v-table v-if="loans.filter(e => e.loanType == 'loan').length > 0" hover theme="light" density="compact">
            <thead>
              <tr>
                <th>الموقع</th>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>التسديد</th>
                <th>المتبقي</th>
                <th>الملاحظات</th>
                <th>الاجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in loans.filter(e => e.loanType == 'loan')" :key="loan.idLoan">
                <td>{{ locations.filter(e => e.idLocation == loan.locationId)[0].locationTitle }}</td>
                <td>{{ parseDate(loan.createdAt) }}</td>
                <td>
                  <v-chip variant="tonal" color="success">
                    {{ loan.amount.toLocaleString() }} د.ع
                  </v-chip>
                </td>
                <td>
                  <v-chip variant="tonal" color="warning">
                    {{ loans.filter(e => e.loanType == 'pay' && e.notice == loan.idLoan).reduce((a, b) => a +
                      b.amount, 0).toLocaleString() }} د.ع
                  </v-chip>
                </td>
                <td>
                  <v-chip variant="tonal" color="error">
                    {{ (loan.amount - loans.filter(e => e.loanType == 'pay' && e.notice == loan.idLoan).reduce((a, b) => a
                      +
                      b.amount, 0)).toLocaleString() }} د.ع
                  </v-chip>
                </td>
                <td>{{ loan.notice }}</td>
                <td>
                  <v-btn v-if="!auth.includes('delete')" @click="deleteLoan(loan.idLoan)" size="small" variant="text"
                    color="error" icon="mdi-delete-outline"></v-btn>
                  <v-btn v-if="(loan.amount - loans.filter(e => e.loanType == 'pay' && e.notice == loan.idLoan).reduce((a, b) => a
                    +
                    b.amount, 0)) > 0" @click="selectLoanToPay(loan)" size="small" color="primary" variant="tonal">
                    <span>تسديد </span>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          <v-divider class="my-2"></v-divider>
          <h2>التسديدات</h2>
          <center v-if="loans.filter(e => e.loanType == 'pay').length == 0">
            <v-alert width="300" color="error" variant="tonal">
              <span>لا يوجد تسديدات</span>
            </v-alert>
          </center>
          <v-table v-if="loans.filter(e => e.loanType == 'pay').length > 0" hover theme="light" density="compact">
            <thead>
              <tr>
                <th>الموقع</th>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>الملاحظات</th>
                <th>الاجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in loans.filter(e => e.loanType == 'pay')" :key="loan.idLoan">
                <td>{{ locations.filter(e => e.idLocation == loan.locationId)[0].locationTitle }}</td>
                <td>{{ parseDate(loan.createdAt) }}</td>
                <td>
                  <v-chip variant="tonal" color="success">
                    {{ loan.amount.toLocaleString() }} د.ع
                  </v-chip>
                </td>
                <td>{{ loanPayNotice(loan.notice) }}</td>
                <td>
                  <v-btn v-if="!auth.includes('delete')" @click="deleteLoan(loan.idLoan)" size="small" variant="text"
                    color="error" icon="mdi-delete-outline"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
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
                <v-btn :to="`/location/${payment.locationId}`" target="_BLANK" variant="text" rounded color="black">
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
              <th>الاجراءات</th>
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
              <td>
                <v-btn v-if="!auth.includes('delete')" @click="deleteIncome(income.idIncome)" size="small" variant="text"
                  color="error" icon="mdi-delete-outline"></v-btn>
                <v-btn v-if="!auth.includes('delete')"
                  @click="editIncomeDialog = true; editIncomeForm = income; editIncomeForm.createdAt = parseDate(editIncomeForm.createdAt)"
                  size="small" variant="text" color="info" icon="mdi-pencil-outline"></v-btn>
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
              <th>الاجراءات</th>
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
              <td>
                <v-btn v-if="!auth.includes('delete')" @click="deleteOutcome(outcome.idOutcome)" size="small"
                  variant="text" color="error" icon="mdi-delete-outline"></v-btn>
                <v-btn v-if="!auth.includes('delete')"
                  @click="editOutcomeDialog = true; editOutcomeForm = outcome; editOutcomeForm.createdAt = parseDate(editOutcomeForm.createdAt)"
                  size="small" variant="text" color="info" icon="mdi-pencil-outline"></v-btn>
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
    <v-footer style="z-index: 10" elevation="10" :app="!$vuetify.display.mobile">
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
        <v-col cols="auto">
          <span>مجموع الديون</span>
          <v-chip class="mr-3" color="primary">
            <b>
              {{
                (
                  loans.filter(e => e.loanType == 'loan').reduce((a, b) => a + b.amount, 0)
                ).toLocaleString()
              }}
            </b>
            <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
            <span class="mr-1" v-if="tab == 'dollar'">$</span>
          </v-chip>
        </v-col>
        <v-col cols="auto">
          <span>مجموع التسديدات</span>
          <v-chip class="mr-3" color="black">
            <b>
              {{
                (
                  loans.filter(e => e.loanType == 'pay').reduce((a, b) => a + b.amount, 0)
                ).toLocaleString()
              }}
            </b>
            <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
            <span class="mr-1" v-if="tab == 'dollar'">$</span>
          </v-chip>
        </v-col>
        <v-col cols="auto">
          <span>صافي الصندوق</span>
          <v-chip class="mr-3" color="orange">
            <b>
              {{
                (
                  incomes.reduce((a, b) => a + b.price, 0) +
                  totalPaymentsPercentage() -
                  outcomes.reduce((a, b) => a + b.price, 0)
                  +
                  loans.filter(e => e.loanType == 'pay').reduce((a, b) => a + b.amount, 0)
                  -
                  loans.filter(e => e.loanType == 'loan').reduce((a, b) => a + b.amount, 0)
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
        <v-text-field variant="outlined" label="المبلغ" type="number" v-model="incomeForm.price"></v-text-field>
        <br>
        <b>تاريخ : {{ parseDate(incomeForm.createdAt) }}</b>
        <VueDatePicker inline :enable-time-picker="false" menu-class-name="dpMenuX" model-type="format"
          format="yyyy-MM-dd" auto-apply :teleport="true" close-on-auto-apply no-swipe :clearable="false"
          v-model="incomeForm.createdAt" />
        <br>
        <v-textarea variant="outlined" label="الملاحظات" v-model="incomeForm.notice"></v-textarea>
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
        <v-text-field variant="outlined" label="المبلغ" type="number" v-model="outcomeForm.price"></v-text-field>
        <br>
        <b>تاريخ : {{ parseDate(outcomeForm.createdAt) }}</b>
        <VueDatePicker inline :enable-time-picker="false" menu-class-name="dpMenuX" model-type="format"
          format="yyyy-MM-dd" auto-apply :teleport="true" close-on-auto-apply no-swipe :clearable="false"
          v-model="outcomeForm.createdAt" />
        <br>
        <v-text-field variant="outlined" label="اسم المستلم" v-model="outcomeForm.recieverName"></v-text-field>
        <v-textarea variant="outlined" label="الملاحظات" v-model="outcomeForm.notice"></v-textarea>
        <v-radio-group v-model="outcomeForm.currency">
          <v-radio label="اضافة الى صندوق الدينار" value="dinar"></v-radio>
          <v-radio label="اضافة الى صندوق الدولار" value="dollar"></v-radio>
        </v-radio-group>
        <v-btn @click="addOutcome()" block color="success" dark>اضافة</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="sallaryModal" max-width="500">
      <v-card class="pa-10">
        <h3>احتساب الرواتب</h3>
        <p>اختيار الشهر</p>
        <v-select @update:menu="fixMenu" v-model="sallaryForm.month" id="salaryMonthSelect"
          :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]">
        </v-select>
        <v-btn @click="giveSallaries()" color="success" block>احتساب الرواتب</v-btn>
        <template v-if="employees.length > 0">
          <v-table theme="light" hover>
            <thead>
              <tr>
                <th>اسم الموظف</th>
                <th>الراتب</th>
                <th>الاستقطاعات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in employees" :key="employee.idEmployee">
                <td>{{ employee.employeeName }}</td>
                <td>{{ employee.salary.toLocaleString() }}</td>
                <td>{{ employee.absences.toLocaleString() }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-btn @click="addSallaries()" color="info" block>اضافة الرواتب الى الصرفيات</v-btn>
        </template>
      </v-card>
    </v-dialog>
    <v-dialog v-model="corporationModal" max-width="500">
      <v-card class="pa-10">
        <h3>احتساب نسب الشركاء</h3>
        <br>

        <v-text-field variant="outlined" label="عدد الشركاء" type="number"
          v-model="corporationForm.totalCorps"></v-text-field>
        <v-textarea variant="outlined" label="الملاحظات" v-model="corporationForm.notice"></v-textarea>
        <br>
        <p>المبلغ المتبقي في الصندوق : <b>
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
        </p>
        <p>حصة كل شريك : <b>
            {{
              (
                (incomes.reduce((a, b) => a + b.price, 0) +
                  totalPaymentsPercentage() -
                  outcomes.reduce((a, b) => a + b.price, 0)) / corporationForm.totalCorps
              ).toLocaleString()
            }}
          </b>
          <span class="mr-1" v-if="tab == 'dinar'">د.ع</span>
          <span class="mr-1" v-if="tab == 'dollar'">$</span>
        </p>
        <br>
        <v-btn @click="givePercentages(incomes.reduce((a, b) => a + b.price, 0) +
          totalPaymentsPercentage() -
          outcomes.reduce((a, b) => a + b.price, 0))" color="success" block>صرف النسب</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editIncomeDialog" max-width="500">
      <v-card class="pa-10">
        <h2 class="mb-3">تعديل وارد</h2>
        <v-text-field v-if="userId == 1" variant="outlined" label="المبلغ" type="number"
          v-model="editIncomeForm.price"></v-text-field>
        <br>
        <b>تاريخ : {{ parseDate(editIncomeForm.createdAt) }}</b>
        <VueDatePicker inline :enable-time-picker="false" menu-class-name="dpMenuX" model-type="format"
          format="yyyy-MM-dd" auto-apply :teleport="true" close-on-auto-apply no-swipe :clearable="false"
          v-model="editIncomeForm.createdAt" />
        <br>
        <v-textarea variant="outlined" label="الملاحظات" v-model="editIncomeForm.notice"></v-textarea>

        <v-btn @click="saveIncome()" block color="success" dark>حفظ</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editOutcomeDialog" max-width="500">
      <v-card class="pa-10">
        <h2 class="mb-3">تعديل صادر</h2>
        <v-text-field v-if="userId == 1" variant="outlined" label="المبلغ" type="number"
          v-model="editOutcomeForm.price"></v-text-field>
        <br>
        <b>تاريخ : {{ parseDate(editOutcomeForm.createdAt) }}</b>
        <VueDatePicker inline :enable-time-picker="false" menu-class-name="dpMenuX" model-type="format"
          format="yyyy-MM-dd" auto-apply :teleport="true" close-on-auto-apply no-swipe :clearable="false"
          v-model="editOutcomeForm.createdAt" />
        <br>
        <v-text-field variant="outlined" label="اسم المستلم" v-model="editOutcomeForm.recieverName"></v-text-field>
        <v-textarea variant="outlined" label="الملاحظات" v-model="editOutcomeForm.notice"></v-textarea>
        <v-btn @click="saveOutcome()" block color="success" dark>حفظ</v-btn>
      </v-card>
    </v-dialog>

    <v-dialog v-model="loanModal" max-width="500">
      <v-card class="pa-10">
        <h3>اضافة دين جديد</h3>
        <br>
        <v-autocomplete variant="outlined" :items="locations" item-title="locationTitle" item-value="idLocation"
          label="الموقع" @update:menu="fixMenu" v-model="newLoan.locationId"></v-autocomplete>
        <v-text-field variant="outlined" label="مبلغ الدين بالدينار العراقي" type="number"
          v-model="newLoan.amount"></v-text-field>
        <br>
        <v-textarea variant="outlined" label="الملاحظات" v-model="newLoan.notice"></v-textarea>
        <br>
        <v-btn @click="addLoan()" block color="primary" dark>اضافة الدين</v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="loanModalPay" max-width="500">
      <v-card class="pa-10">
        <h3>اضافة تسديد جديد</h3>
        <br>
        <v-text-field variant="outlined" label="مبلغ التسديد بالدينار العراقي" type="number"
          v-model="newLoanPay.amount"></v-text-field>
        <br>
        <v-btn @click="addLoanPay()" block color="primary" dark>اضافة تسديد</v-btn>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import * as moment from "moment";
export default {
  components: {},
  data: () => ({
    userId: 0,
    auth: [],
    location: null,
    locations: [],
    tab: "dinar",
    dateRange: [],
    isLoading: false,
    paymentsReport: [],
    incomes: [],
    outcomes: [],
    incomeModal: false,
    outcomeModal: false,
    employees: [],
    loans: [],
    selectedLoan: null,
    incomeForm: {
      price: null,
      createdBy: null,
      createdAt: null,
      notice: null,
      currency: null,
    },
    editIncomeForm: null,
    editOutcomeForm: null,
    editIncomeDialog: false,
    editOutcomeDialog: false,
    loanModal: false,
    newLoan: {
      locationId: null,
      fromId: 0,
      amount: null,
      currency: 'dinar',
      notice: '',
    },
    loanModalPay: false,
    newLoanPay: {
      locationId: null,
      fromId: 0,
      amount: null,
      currency: 'dinar',
      notice: '',
      loanType: 'pay',
    },
    outcomeForm: {
      price: null,
      createdBy: null,
      createdAt: null,
      notice: null,
      currency: null,
      recieverName: null,
    },
    sallaryModal: false,
    sallaryForm: {
      month: 1,
    },
    corporationModal: false,
    lastDayOfMonth: 30,
    corporationForm: {
      totalCorps: 2,
      notice: '',
    }
  }),
  created: function () {
    var today = new Date();
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.incomeForm.createdAt = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
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
    this.lastDayOfMonth = lastDayOfMonth.getDate();
    this.fetch();
  },
  methods: {
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
    deleteOutcome(id) {
      let c = confirm("هل انت متأكد");
      if (c) {
        this.axios.delete("outcome/" + id).then(() => this.fetch());
      }
    },
    deleteIncome(id) {
      let c = confirm("هل انت متأكد");
      if (c) {
        this.axios.delete("income/" + id).then(() => this.fetch());
      }
    },
    async saveIncome() {
      this.$store.state.loading = true;
      await this.axios.put('income/' + this.editIncomeForm.idIncome, this.editIncomeForm);
      this.$toast.success("تم التعديل");
      this.editIncomeDialog = false;
      this.$store.state.loading = false;
    },
    async saveOutcome() {
      this.$store.state.loading = true;
      await this.axios.put('outcome/' + this.editOutcomeForm.idOutcome, this.editOutcomeForm);
      this.$toast.success("تم التعديل");
      this.editOutcomeDialog = false;
      this.$store.state.loading = false;
    },
    fetch() {
      this.userId = JSON.parse(localStorage.getItem("userInfo")).idUser;
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
      this.axios
        .get("locations")
        .then((res) => {
          this.locations = res.data;
        })
      this.axios
        .get("loans")
        .then((res) => {
          this.loans = res.data;
        })
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
    addSallaries() {
      this.employees.forEach(employee => {
        this.$store.state.loading = true;
        this.axios
          .post("addOutcome", {
            price: employee.salary - employee.absences,
            createdBy: JSON.parse(
              localStorage.getItem("userInfo")
            ).idUser,
            notice: `صرف راتب الشهر (${this.sallaryForm.month}) - الراتب : ${employee.salary.toLocaleString()} - الاستقطاع : ${employee.absences.toLocaleString()}`,
            currency: 'dinar',
            recieverName: employee.employeeName,
          })
          .then(() => {
            this.fetch();
            this.sallaryModal = false;
            this.employees = [];
          })
          .finally(() => (this.$store.state.loading = false));
      });
    },
    loanPayNotice(id) {
      var loan = this.loans.filter((l) => l.idLoan == id);
      if (loan.length == 0) {
        return "تم حذف قيد الدين";
      } else {
        var location = this.locations.filter(e => e.idLocation == loan[0].locationId);
        return `تسديد للموقع : ${location[0].locationTitle} --- تاريخ قيد الدين : ${this.parseDate(loan[0].createdAt)}`;
      }
    },
    giveSallaries() {
      this.$store.state.loading = true;
      let yearx = Date.now();
      let year = new Date(yearx).getFullYear();
      this.axios.get('employees').then(employees => {
        this.axios
          .get(
            `absences?dateFrom=${year}-${this.sallaryForm.month}-01&dateTo=${year}-${this.sallaryForm.month}-${this.lastDayOfMonth}`
          )
          .then((absences) => {
            employees.data.forEach(employee => {
              employee.absences = absences.data.filter(e => e.employeeId == employee.idEmployee).reduce((a, b) => a + b.price, 0);
            });
            this.employees = employees.data;
          }).finally(() => this.$store.state.loading = false)
      })
    },
    givePercentages(amount) {
      for (let i = 0; i < this.corporationForm.totalCorps; i++) {
        this.$store.state.loading = true;
        this.axios
          .post("addOutcome", {
            price: amount / this.corporationForm.totalCorps,
            createdBy: JSON.parse(
              localStorage.getItem("userInfo")
            ).idUser,
            notice: this.corporationForm.notice,
            currency: this.tab,
            recieverName: 'نسبة شريك',
          })
          .then(() => {
            this.fetch();
            this.corporationModal = false;
          })
          .finally(() => (this.$store.state.loading = false));
      }
    },
    selectLoanToPay(loan) {
      console.log(JSON.parse(JSON.stringify(loan)));
      this.selectedLoan = JSON.parse(JSON.stringify(loan));
      this.newLoanPay.notice = JSON.parse(JSON.stringify(loan)).idLoan;
      this.newLoanPay.locationId = JSON.parse(JSON.stringify(loan)).locationId;
      this.loanModalPay = true;
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
          currency: 'dinar',
          notice: '',
        };
        this.fetch();
      }).finally(() => this.$store.state.loading = false)
    },
    addLoanPay() {
      this.$store.state.loading = true;
      this.axios.post('addLoan', this.newLoanPay).then(() => {
        this.$toast.success('تم اضافة التسديد');
        this.loanModalPay = false;
        this.selectLoanToPay = null;
        this.newLoanPay = {
          locationId: null,
          fromId: null,
          amount: null,
          currency: 'dinar',
          notice: '',
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