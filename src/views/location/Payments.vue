<template>
  <div v-if="location != null" id="payments">
    <v-row>
      <v-col cols="auto">
        <v-btn
          @click="addNewPaymentDialog = true"
          color="success"
          v-if="!auth.includes('add')"
          variant="elevated"
          elevation="0"
          >اضافة سلفة جديدة</v-btn
        >
      </v-col>
      <v-col cols="12" md="3">
        <v-autocomplete
          density="compact"
          variant="outlined"
          label="فرز حسب المستلم"
          :items="recievers"
          item-value="receiver"
          item-title="receiver"
          clearable
          v-model="reveiverSearch"
          @update:menu="fixMenu"
        ></v-autocomplete>
      </v-col>
    </v-row>
    <div v-for="payment in payments" :key="payment.idPayment">
      <v-card
        :id="'payment_' + payment.idPayment"
        class="elevation-5 rounded-lg ma-4"
      >
        <div class="pagePrint showOnPrint">
          <img src="printHeader.png" style="width: 100%" />
          <br />
          <br />
          <br />
          <br />
          <center>
            <h1>شركة مفخرة البناء للمقاولات العامة</h1>
            <h3>تصميم - تنفيذ - اشراف 07806206666 - 07800442272</h3>
            <h3>بغداد - القادسية - مدخل ساحة قحطان</h3>
          </center>
          <div class="pagePrintTitles">
            <h3>السيد : {{ location.locationTitle }}</h3>
            <h3>الموقع : {{ location.position }}</h3>
            <h3>رقم السلفة : ({{ payment.paymentCount }})</h3>
            <h3>تاريخ استلام السلفة : {{ parseDate(payment.createdAt) }}</h3>
            <h3>
              مبلغ السلفة : {{ payment.paymentAmount.toLocaleString() }}
              <span v-if="currency == 'dinar'">د.ع</span>
              <span v-if="currency == 'dollar'">$</span>
            </h3>
            <h3>
              النسبة ({{ location.percentage }} %) من المبلغ الواجب صرفه (اجور
              التنفيذ) :
              {{
                calculatePercentage(
                  payment.paymentAmount,
                  payment
                ).toLocaleString()
              }}
              <span v-if="currency == 'dinar'">د.ع</span>
              <span v-if="currency == 'dollar'">$</span>
            </h3>
            <h3>
              المبلغ الواجب صرفه بعد استقطاع نسبة تنفيذ العمل :
              {{
                (
                  payment.paymentAmount -
                  calculatePercentage(payment.paymentAmount, payment)
                ).toLocaleString()
              }}
              <span v-if="currency == 'dinar'">د.ع</span>
              <span v-if="currency == 'dollar'">$</span>
            </h3>
          </div>
        </div>
        <v-table class="px-0 rounded-0" theme="light" hover>
          <thead class="bg-grey-lighten-2">
            <tr>
              <th
                style="padding: 0px"
                colspan="6"
                class="header-space printOnlyTd"
              >
                <img src="printHeader.png" style="width: 100%" />
              </th>
            </tr>
            <tr class="hideOnPrint" style="background-color: #ffffff">
              <th style="padding: 0px" colspan="6" class="header-space">
                <v-table hover theme="light" class="headerTable">
                  <thead>
                    <tr>
                      <th width="120px">رقم السلفة</th>
                      <th width="120px">مبلغ السلفة</th>
                      <th width="150px">تاريخ الاستلام</th>
                      <th>النسبة</th>
                      <th>اجور الشركة</th>
                      <th>السلفة بعد الاستقطاع</th>
                      <th width="400px">التفاصيل</th>
                      <th class="hideOnPrint">الاجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <b class="text-info">{{ payment.paymentCount }}</b>
                      </td>
                      <td>
                        <v-chip color="success">
                          <b>
                            {{ payment.paymentAmount.toLocaleString() }}
                            <span v-if="currency == 'dinar'">د.ع</span>
                            <span v-if="currency == 'dollar'">$</span>
                          </b>
                        </v-chip>
                      </td>
                      <td>{{ parseDate(payment.createdAt) }}</td>
                      <td>{{ location.percentage }} %</td>
                      <td class="text-warning font-weight-bold">
                        {{
                          calculatePercentage(
                            payment.paymentAmount,
                            payment
                          ).toLocaleString()
                        }}
                        <span v-if="currency == 'dinar'">د.ع</span>
                        <span v-if="currency == 'dollar'">$</span>
                      </td>
                      <td class="text-success font-weight-bold">
                        {{
                          (
                            payment.paymentAmount -
                            calculatePercentage(payment.paymentAmount, payment)
                          ).toLocaleString()
                        }}
                        <span v-if="currency == 'dinar'">د.ع</span>
                        <span v-if="currency == 'dollar'">$</span>
                      </td>
                      <td class="wrapOnPrint">{{ payment.notice }}</td>
                      <td class="hideOnPrint">
                        <template v-if="!auth.includes('add')">
                          <v-btn
                            @click="
                              newPaymentCutForm.paymentId = payment.idPayment;
                              addNewPaymentCutDialog = true;
                            "
                            v-if="
                              payment.paymentAmount +
                                payment.totalAdds -
                                calculatePercentage(payment.paymentAmount) -
                                payment.addsPercentage -
                                payment.totalCut >
                              0
                            "
                            color="warning"
                            variant="outlined"
                          >
                            <v-icon
                              start
                              icon="mdi-plus-circle-outline"
                            ></v-icon>
                            <span>اضافة حركة</span>
                          </v-btn>
                        </template>
                        <v-chip
                          color="info"
                          v-if="
                            payment.paymentAmount +
                              payment.totalAdds -
                              calculatePercentage(payment.paymentAmount) -
                              payment.addsPercentage -
                              payment.totalCut ==
                            0
                          "
                        >
                          <v-icon icon="mdi-check" start></v-icon>
                          <span>تم صرف السلفة</span>
                        </v-chip>
                        &nbsp;
                        <v-btn
                          v-print="'#' + 'payment_' + payment.idPayment"
                          variant="outlined"
                          color="info"
                        >
                          <v-icon start icon="mdi-printer"></v-icon>
                          <span>طباعة</span>
                        </v-btn>
                        &nbsp;
                        <v-btn
                          variant="outlined"
                          color="red"
                          @click="deletePayment(payment.idPayment)"
                          v-if="!auth.includes('delete')"
                        >
                          <v-icon start icon="mdi-delete-outline"></v-icon>
                          <span>حذف السلفة</span>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
                <!-- <br class="showOnPrint" /> -->
              </th>
            </tr>
            <tr v-if="payment.cuts.length > 0">
              <th width="120px">الحركة</th>
              <th width="120px">المبلغ</th>
              <th>تاريخ</th>
              <th>اسم المستلم</th>
              <th width="50%">الملاحظات</th>
              <th class="hideOnPrint">الاجراءات</th>
            </tr>
          </thead>
          <tbody v-if="payment.cuts.length > 0">
            <tr
              v-for="cut in reveiverSearch == null
                ? payment.cuts
                : payment.cuts.filter((e) => e.receiver == reveiverSearch)"
              :key="cut.idPaymentCut"
            >
              <td>
                <b v-if="cut.method == 'minus'" class="text-red">صرف</b>
                <b v-if="cut.method == 'plus'" class="text-success">اضافة</b>
              </td>
              <td>
                <v-chip :color="cut.method == 'minus' ? 'error' : 'success'">
                  <b>
                    {{
                      cut.price > 0
                        ? cut.price.toLocaleString()
                        : (cut.price * -1).toLocaleString()
                    }}
                    <span v-if="currency == 'dinar'">د.ع</span>
                    <span v-if="currency == 'dollar'">$</span>
                  </b>
                </v-chip>
              </td>
              <td>
                {{ parseDate(cut.createdAt) }}
              </td>
              <td v-if="cut.method == 'minus'">{{ cut.receiver }}</td>
              <td v-if="cut.method == 'plus'">
                <v-chip color="success"
                  >اضافة نسبة الشركة
                  {{ calculatePercentage(cut.price, payment).toLocaleString() }}
                  &nbsp;
                  <span v-if="currency == 'dinar'">د.ع</span>
                  <span v-if="currency == 'dollar'">$</span>
                </v-chip>
              </td>
              <td class="wrapOnPrint wrap">{{ cut.notice }}</td>
              <td class="hideOnPrint">
                <v-btn
                  v-if="!auth.includes('delete')"
                  variant="plain"
                  color="error"
                  @click="deletePaymentCut(cut.idPaymentCut)"
                  icon
                >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
                <v-btn
                  @click="
                    selectedPaymentCutId = cut.idPaymentCut;
                    selectedPaymentId = payment.idPayment;
                    chooseImage();
                  "
                  v-if="!auth.includes('add')"
                  variant="text"
                  color="success"
                  >اضافة صورة وصل</v-btn
                >
                <input
                  type="file"
                  name="file"
                  id="file"
                  style="display: none"
                  @change="uploadImage($event)"
                  accept="image/*"
                />
                <img
                  v-for="image in paymentCutImages.filter(
                    (e) => e.paymentCutId == cut.idPaymentCut
                  )"
                  :key="image.idPaymentCutImage"
                  :src="axios.defaults.baseURL + image.imagePath"
                  class="paymentCutImage"
                  @click="
                    selectedPaymentCutImageId = image.idPaymentCutImage;
                    zoomedImage = axios.defaults.baseURL + image.imagePath;
                    imageModal = true;
                  "
                  alt=""
                />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" class="footer-space">
                <v-divider class="mb-4"></v-divider>
                <div class="px-4 pb-5 showOnlyOnLastPage">
                  <v-chip color="error">
                    <span
                      >مجموع الصرفيات :
                      <b>
                        {{ payment.totalCut.toLocaleString() }}
                        <span v-if="currency == 'dinar'">د.ع</span>
                        <span v-if="currency == 'dollar'">$</span>
                      </b>
                    </span>
                  </v-chip>
                  &nbsp;

                  <!-- <v-chip color="success">
                    <span
                      >مجموع نسبة الشركة :
                      <b>
                        {{
                          (
                            calculatePercentage(payment.paymentAmount) -
                            payment.addsPercentage
                          ).toLocaleString()
                        }}
                        <span v-if="currency == 'dinar'">د.ع</span>
                        <span v-if="currency == 'dollar'">$</span>
                      </b>
                    </span>
                  </v-chip>
                  &nbsp; -->
                  <v-chip color="warning">
                    <span
                      >المبلغ المتبقي من السلفة :
                      <b>
                        {{
                          (
                            payment.paymentAmount +
                            payment.totalAdds -
                            calculatePercentage(payment.paymentAmount) -
                            payment.addsPercentage -
                            payment.totalCut
                          ).toLocaleString()
                        }}
                        <span v-if="currency == 'dinar'">د.ع</span>
                        <span v-if="currency == 'dollar'">$</span>
                      </b>
                    </span>
                  </v-chip>
                </div>
              </td>
              <td class="hideOnPrint"></td>
            </tr>
            <tr>
              <td
                style="padding: 0px"
                colspan="6"
                class="header-space printOnlyTd"
              >
                <img
                  src="printFooter.png"
                  style="width: 100%; visibility: hidden"
                />
                <img
                  src="printFooter.png"
                  style="width: 100%; position: fixed; bottom: 0; left: 0"
                />
              </td>
            </tr>
          </tfoot>
        </v-table>
        <div
          v-for="image in paymentCutImages.filter(
            (e) => e.paymentId == payment.idPayment
          )"
          :key="image.idPaymentCutImage"
          class="pagePrint showOnPrint"
          style="padding: 30px"
        >
          <img
            :src="axios.defaults.baseURL + image.imagePath"
            style="height: 20cm; width: 19cm"
            alt=""
          />
        </div>
      </v-card>
      <v-divider class="my-10"></v-divider>
    </div>
    <v-footer
      color="#01226F"
      class="pa-3"
      elevation="5"
      :app="!$vuetify.display.mobile"
    >
      <v-row>
        <v-col cols="auto">
          <v-chip color="white">
            <span>مجموع السلف</span>
            &nbsp;
            <b>{{ totalPayments().toLocaleString() }}</b>
            &nbsp;
            <span v-if="currency == 'dinar'">د.ع</span>
            <span v-if="currency == 'dollar'">$</span>
          </v-chip>
        </v-col>
        <v-col cols="auto">
          <v-chip color="warning">
            <span>مجموع نسبة الشركة</span>
            &nbsp;
            <b>{{ totalPercentage().toLocaleString() }}</b>
            &nbsp;
            <span v-if="currency == 'dinar'">د.ع</span>
            <span v-if="currency == 'dollar'">$</span>
          </v-chip>
        </v-col>
        <v-col cols="auto">
          <v-chip color="#FB9A9A">
            <span>مجموع الصرفيات</span>
            &nbsp;
            <b>{{ totalCuts().toLocaleString() }}</b>
            &nbsp;
            <span v-if="currency == 'dinar'">د.ع</span>
            <span v-if="currency == 'dollar'">$</span>
          </v-chip>
        </v-col>
        <v-col cols="auto">
          <v-chip color="#57FFF9">
            <span> المتبقي</span>
            &nbsp;
            <b>{{
              (
                totalPayments() -
                totalPercentage() -
                totalCuts()
              ).toLocaleString()
            }}</b>
            &nbsp;
            <span v-if="currency == 'dinar'">د.ع</span>
            <span v-if="currency == 'dollar'">$</span>
          </v-chip>
        </v-col>
      </v-row>
    </v-footer>

    <v-dialog
      v-model="addNewPaymentDialog"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card class="pa-5">
        <v-card-title>اضافة سلفة جديدة</v-card-title>
        <v-divider class="my-2"></v-divider>
        <v-text-field
          variant="outlined"
          v-model="newPaymentForm.paymentAmount"
          type="number"
          label="مبلغ السلفة"
        ></v-text-field>
        <small class="mb-1">
          <div>تاريخ السلفة</div>
        </small>
        <VueDatePicker
          model-type="format"
          format="yyyy-MM-dd"
          auto-apply
          close-on-auto-apply
          no-swipe
          :clearable="false"
          v-model="newPaymentForm.createdAt"
        />
        <br />
        <v-textarea
          variant="outlined"
          v-model="newPaymentForm.notice"
          label="الملاحظات"
        ></v-textarea>
        <template v-if="payments.length > 0">
          <template
            v-if="
              payments[payments.length - 1].paymentAmount +
                payments[payments.length - 1].totalAdds -
                calculatePercentage(
                  payments[payments.length - 1].paymentAmount
                ) +
                payments[payments.length - 1].addsPercentage -
                payments[payments.length - 1].totalCut >
              0
            "
          >
            <!-- <v-checkbox
              color="info"
              v-model="newPaymentMoveLastPayment"
              :label="'نقل المبلغ المتبقي من السلفة السابقة الى السلفة الجديدة '"
            ></v-checkbox> -->
            <v-chip v-if="newPaymentMoveLastPayment" color="warning">
              المتبقي من السلفة السابقة :
              {{
                (
                  payments[payments.length - 1].paymentAmount +
                  payments[payments.length - 1].totalAdds -
                  calculatePercentage(
                    payments[payments.length - 1].paymentAmount
                  ) -
                  payments[payments.length - 1].addsPercentage -
                  payments[payments.length - 1].totalCut
                ).toLocaleString()
              }}
              <span v-if="currency == 'dinar'">د.ع</span>
              <span v-if="currency == 'dollar'">$</span>
            </v-chip>
            <br />
            <v-chip v-if="newPaymentMoveLastPayment" color="success">
              الاجمالي :
              {{
                (
                  payments[payments.length - 1].paymentAmount +
                  payments[payments.length - 1].totalAdds -
                  calculatePercentage(
                    payments[payments.length - 1].paymentAmount
                  ) -
                  payments[payments.length - 1].addsPercentage -
                  payments[payments.length - 1].totalCut +
                  newPaymentForm.paymentAmount * 1
                ).toLocaleString()
              }}
              <span v-if="currency == 'dinar'">د.ع</span>
              <span v-if="currency == 'dollar'">$</span>
            </v-chip>
            <br />
          </template>
        </template>
        <v-divider class="my-2"></v-divider>
        <v-btn @click="addPayment()" size="large" block color="primary" dark
          >اضافة السلفة</v-btn
        >
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="addNewPaymentCutDialog"
      max-width="500px"
      transition="dialog-transition"
    >
      <v-card class="pa-5">
        <v-card-title>اضافة حركة</v-card-title>
        <v-divider class="my-2"></v-divider>
        <v-select
          label="نوع الحركة"
          :items="paymentCutMethods"
          item-title="title"
          item-value="value"
          disabled
          variant="outlined"
          transition="fade"
          @update:menu="fixMenu"
          v-model="newPaymentCutForm.method"
        ></v-select>
        <v-text-field
          variant="outlined"
          v-model="newPaymentCutForm.price"
          type="number"
          :label="
            newPaymentCutForm.method == 'minus' ? 'مبلغ الصرف' : 'مبلغ الاضافة'
          "
        ></v-text-field>
        <v-text-field
          variant="outlined"
          v-if="newPaymentCutForm.method == 'minus'"
          v-model="newPaymentCutForm.receiver"
          label="اسم المستلم"
        ></v-text-field>
        <v-textarea
          variant="outlined"
          v-model="newPaymentCutForm.notice"
          label="الملاحظات"
        ></v-textarea>
        <div v-if="newPaymentCutForm.method == 'minus'">
          <v-chip color="warning">
            <span
              >اقصى مبلغ يمكن صرفه :
              <b>
                {{
                  (
                    payments.filter(
                      (e) => e.idPayment == newPaymentCutForm.paymentId
                    )[0].paymentAmount +
                    payments.filter(
                      (e) => e.idPayment == newPaymentCutForm.paymentId
                    )[0].totalAdds -
                    calculatePercentage(
                      payments.filter(
                        (e) => e.idPayment == newPaymentCutForm.paymentId
                      )[0].paymentAmount
                    ) -
                    payments.filter(
                      (e) => e.idPayment == newPaymentCutForm.paymentId
                    )[0].addsPercentage -
                    payments.filter(
                      (e) => e.idPayment == newPaymentCutForm.paymentId
                    )[0].totalCut
                  ).toLocaleString()
                }}
                <span v-if="currency == 'dinar'">د.ع</span>
                <span v-if="currency == 'dollar'">$</span>
              </b>
            </span>
          </v-chip>
          <br />
          <br />
          <v-chip color="info">
            <span
              >المبلغ المتبقي بعد الصرف :
              <b>
                {{
                  (
                    payments.filter(
                      (e) => e.idPayment == newPaymentCutForm.paymentId
                    )[0].paymentAmount +
                    payments.filter(
                      (e) => e.idPayment == newPaymentCutForm.paymentId
                    )[0].totalAdds -
                    calculatePercentage(
                      payments.filter(
                        (e) => e.idPayment == newPaymentCutForm.paymentId
                      )[0].paymentAmount
                    ) -
                    payments.filter(
                      (e) => e.idPayment == newPaymentCutForm.paymentId
                    )[0].addsPercentage -
                    payments.filter(
                      (e) => e.idPayment == newPaymentCutForm.paymentId
                    )[0].totalCut -
                    newPaymentCutForm.price
                  ).toLocaleString()
                }}
                <span v-if="currency == 'dinar'">د.ع</span>
                <span v-if="currency == 'dollar'">$</span>
              </b>
            </span>
          </v-chip>
          <v-divider class="my-2"></v-divider>
          <v-btn
            v-if="
              payments.filter(
                (e) => e.idPayment == newPaymentCutForm.paymentId
              )[0].paymentAmount +
                payments
                  .filter((e) => e.idPayment == newPaymentCutForm.paymentId)[0]
                  .cuts.filter((e) => e.method == 'plus')
                  .reduce((a, b) => a + b.price, 0) -
                calculatePercentage(
                  payments.filter(
                    (e) => e.idPayment == newPaymentCutForm.paymentId
                  )[0].paymentAmount,
                  payments.filter(
                    (e) => e.idPayment == newPaymentCutForm.paymentId
                  )[0]
                ) -
                payments.filter(
                  (e) => e.idPayment == newPaymentCutForm.paymentId
                )[0].totalCut -
                newPaymentCutForm.price >=
              0
            "
            @click="addPaymentCut()"
            size="large"
            block
            color="primary"
            dark
            >صرف</v-btn
          >
          <v-chip
            v-if="
              payments.filter(
                (e) => e.idPayment == newPaymentCutForm.paymentId
              )[0].paymentAmount +
                payments
                  .filter((e) => e.idPayment == newPaymentCutForm.paymentId)[0]
                  .cuts.filter((e) => e.method == 'plus')
                  .reduce((a, b) => a + b.price, 0) -
                calculatePercentage(
                  payments.filter(
                    (e) => e.idPayment == newPaymentCutForm.paymentId
                  )[0].paymentAmount,
                  payments.filter(
                    (e) => e.idPayment == newPaymentCutForm.paymentId
                  )[0]
                ) -
                payments.filter(
                  (e) => e.idPayment == newPaymentCutForm.paymentId
                )[0].totalCut -
                newPaymentCutForm.price <
              0
            "
            color="error"
          >
            المبلغ غير كافي
          </v-chip>
        </div>
        <div v-else>
          <v-btn
            @click="addPaymentCut()"
            size="large"
            block
            color="primary"
            dark
            >اضافة</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
    <v-dialog width="500" v-model="imageModal">
      <img
        @click="imageModal = false"
        :src="zoomedImage"
        style="height: 700px"
        alt=""
      />
      <v-btn
        v-if="!auth.includes('delete')"
        @click="deletePaymentCutImage()"
        color="error"
        >حذف الصورة</v-btn
      >
    </v-dialog>
  </div>
</template>

<script>
import * as moment from "moment";
import * as printJS from "print-js";
export default {
  props: ["currency"],
  data: () => ({
    auth: [],
    location: null,
    addNewPaymentDialog: false,
    addNewPaymentCutDialog: false,
    newPaymentMoveLastPayment: false,
    imageModal: false,
    zoomedImage: "",
    selectedPaymentCutImageId: 0,
    payments: [],
    reveiverSearch: null,
    recievers: [],
    selectedPaymentCutId: 0,
    paymentCutImages: [],
    selectedPaymentId: 0,
    newPaymentForm: {
      paymentAmount: null,
      createdAt: null,
      notice: null,
      paymentCurrency: null,
      createdBy: 0,
      locationId: 0,
      paymentCount: 1,
    },
    newPaymentCutForm: {
      paymentId: null,
      locationId: null,
      notice: null,
      price: null,
      method: "minus",
      createdBy: 0,
      receiver: null,
    },
    paymentCutMethods: [
      { title: "صرف مبلغ من السلفة", value: "minus" },
      { title: "اضافة مبلغ الى السلفة", value: "plus" },
    ],
  }),
  created: function () {
    this.fetch();
    this.newPaymentForm.paymentCurrency = this.currency;
    this.newPaymentForm.locationId = this.$route.params.id;
    this.newPaymentCutForm.locationId = this.$route.params.id;
    this.newPaymentForm.createdBy = JSON.parse(
      localStorage.getItem("userInfo")
    ).idUser;
    this.newPaymentCutForm.createdBy = JSON.parse(
      localStorage.getItem("userInfo")
    ).idUser;
    let now = new Date();
    this.newPaymentForm.createdAt =
      now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
  },
  methods: {
    fetch() {
      this.$store.state.loading = true;
      this.axios
        .get("user/" + JSON.parse(localStorage.getItem("userInfo")).idUser)
        .then((res) => {
          this.auth = JSON.parse(res.data.denyFrom);
        });
      this.axios.get("location/" + this.$route.params.id).then((res) => {
        this.location = res.data;
        this.axios
          .get(`paymentByCurrency/${this.currency}/${this.$route.params.id}`)
          .then((res) => {
            this.payments = res.data;
            if (this.payments.length > 0) {
              // UPDATE PAYENT COUNT
              let latestCount =
                this.payments[this.payments.length - 1].paymentCount * 1;
              this.newPaymentForm.paymentCount = latestCount + 1;
            }
          })
          .finally(() => (this.$store.state.loading = false));
      });
      this.axios.get("paymentCutImage/" + this.$route.params.id).then((res) => {
        this.paymentCutImages = res.data;
      });
      this.axios.get("recievers/" + this.$route.params.id).then((res) => {
        this.recievers = res.data;
      });
    },
    addPayment() {
      if (
        this.newPaymentForm.paymentAmount == null ||
        this.newPaymentForm.paymentAmount == 0
      ) {
        this.$toast.warning("يرجى كتابة مبلغ السلفة");
        return;
      }
      let lastPayment = 0;
      if (this.payments.length > 0) {
        lastPayment =
          this.payments[this.payments.length - 1].paymentAmount +
          this.payments[this.payments.length - 1].totalAdds -
          this.calculatePercentage(
            this.payments[this.payments.length - 1].paymentAmount
          ) -
          this.payments[this.payments.length - 1].addsPercentage -
          this.payments[this.payments.length - 1].totalCut;
      }
      if (this.newPaymentMoveLastPayment && this.payments.length > 0) {
        this.axios.post("addPaymentCut", {
          paymentId: this.payments[this.payments.length - 1].idPayment,
          locationId: this.location.idLocation,
          notice: "تم استقطاع باقي المبلغ وتحويله للسلفة التالية",
          price: lastPayment,

          createdBy: JSON.parse(localStorage.getItem("userInfo")).idUser,
          receiver: "تدوير مبلغ تلقائي",
        });
      }
      this.$store.state.loading = true;
      this.axios
        .post("addPayment", this.newPaymentForm)
        .then((res) => {
          this.$toast.success("تم اضافة السلفة بنجاح");
          this.fetch();
          this.addNewPaymentDialog = false;
          if (this.newPaymentMoveLastPayment && this.payments.length > 0) {
            this.axios
              .post("addPaymentCut", {
                paymentId: res.data.insertId,
                locationId: this.location.idLocation,
                notice: `(المبلغ الاصلي للسلفة ${this.newPaymentForm.paymentAmount.toLocaleString()} ... تم اضافة مبلغ ${lastPayment.toLocaleString()} من السلفة السابقة)`,
                price: lastPayment,
                method: "plus",
                createdBy: JSON.parse(localStorage.getItem("userInfo")).idUser,
                receiver: "",
              })
              .then(() => {
                this.fetch();
              });
          }
        })
        .finally(() => (this.$store.state.loading = false));
    },
    calculatePercentage(amount, payment = 0) {
      let percentage = this.location.percentage / 100;
      let y = (percentage / (1 + percentage)) * amount;
      let x = 0;
      if (this.currency == "dinar") {
        x = Math.ceil(y / 1000) * 1000 - 1000;
      } else {
        x = Math.ceil(y);
      }
      return x;
    },
    addPaymentCut() {
      if (
        this.newPaymentCutForm.price == null ||
        this.newPaymentCutForm.price == 0
      ) {
        this.$toast.warning("يرجى كتابة المبلغ");
        return;
      }
      this.$store.state.loading = true;
      this.axios
        .post("addPaymentCut", this.newPaymentCutForm)
        .then(() => {
          this.$toast.success("تم اضافة الاستقطاع بنجاح");
          this.fetch();
          this.addNewPaymentCutDialog = false;
        })
        .finally(() => (this.$store.state.loading = false));
    },
    parseDate(d) {
      let date = new Date(d);
      return moment(date).format("YYYY-MM-DD");
    },
    datax() {
      console.log(this.$options.data().newPaymentForm);
    },
    totalPayments() {
      let sum = 0;
      this.payments.forEach((payment) => {
        let childSum = 0;
        childSum = childSum + payment.paymentAmount;
        payment.cuts
          .filter((x) => x.method == "plus")
          .forEach((cut) => {
            childSum = childSum + cut.price;
          });
        sum = sum + childSum;
      });
      return sum;
    },
    totalCuts() {
      let sum = 0;
      this.payments.forEach((payment) => {
        sum = sum + payment.totalCut;
      });
      return sum;
    },
    totalPercentage() {
      let sum = 0;
      this.payments.forEach((payment) => {
        sum =
          sum +
          this.calculatePercentage(payment.paymentAmount) +
          payment.addsPercentage;
      });
      return sum;
    },
    printPage(pageId) {
      var element = document.getElementById(pageId);
      printJS({
        printable: pageId,
      });
    },
    deletePayment(id) {
      let c = confirm("هل انت متأكد من حذف السلفة");
      if (c) {
        this.$store.state.loading = true;
        this.axios
          .delete("payment/" + id)
          .then(() => {
            this.$toast.success("تم حذف السلفة");
            this.fetch();
          })
          .finally(() => (this.$store.state.loading = false));
      }
    },
    deletePaymentCutImage() {
      let c = confirm("هل انت متأكد من حذف الصورة");
      if (c) {
        this.$store.state.loading = true;
        this.axios
          .delete("paymentCutImage/" + this.selectedPaymentCutImageId)
          .then(() => {
            this.$toast.success("تم حذف الصورة");
            this.fetch();
            this.imageModal = false;
          })
          .finally(() => (this.$store.state.loading = false));
      }
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
    chooseImage() {
      document.getElementById("file").click();
    },
    uploadImage(e) {
      this.$store.state.loading = true;
      let userInfo = JSON.parse(localStorage.getItem("userInfo"));
      var formData = new FormData();
      var imagefile = document.querySelector("#file");
      formData.append("file", imagefile.files[0]);
      formData.append("paymentCutId", this.selectedPaymentCutId);
      formData.append("locationId", this.$route.params.id);
      formData.append("paymentId", this.selectedPaymentId);
      this.axios
        .post("addPaymentCutImage?destination=paymentCut", formData)
        .then(() => {
          this.$toast.success("تم اضافة صورة");
          this.fetch();
        })
        .finally(() => (this.$store.state.loading = false));
    },
    deletePayment(id) {
      let c = confirm("هل انت متأكد");
      if (c) {
        this.axios.delete("payment/" + id).then(() => this.fetch());
      }
    },
    deletePaymentCut(id) {
      let c = confirm("هل انت متأكد");
      if (c) {
        this.axios.delete("paymentCut/" + id).then(() => this.fetch());
      }
    },
  },
};
</script>

<style scoped>
thead th {
  font-weight: bold !important;
}

td,
th {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
}

.v-table--density-default > .v-table__wrapper > table > tbody > tr > th,
.v-table--density-default > .v-table__wrapper > table > thead > tr > th,
.v-table--density-default > .v-table__wrapper > table > tfoot > tr > th {
  height: 40px;
}
.showOnPrint {
  display: none;
}
.printOnlyTd {
  display: none;
}
.paymentCutImage {
  width: 50px;
  height: 50px;
  border-radius: 10px;
}
.wrap {
  white-space: normal;
  overflow: auto;
}

@media print {
  .pagePrint {
    page-break-after: initial;
  }
  .pagePrint h1 {
    font-size: 30px !important;
  }
  .pagePrint h3 {
    font-size: 20px !important;
  }

  .pagePrintTitles {
    border-top: 2px dashed black;
    margin-top: 40px;
    padding: 30px;
  }
  .pagePrintTitles h3 {
    margin-bottom: 20px;
  }
  .header-space {
    vertical-align: bottom;

    border: none !important;
  }
  .headerTable {
    padding: 0px !important;
  }

  .footer-space {
    vertical-align: top;

    border: none !important;
  }

  @page {
    size: A4;
    margin: 0 0 0 0;
  }
  .v-card {
    margin: 0px !important;
    border-radius: 0px !important;
    box-shadow: none !important;
    direction: rtl !important;
    background-size: cover;
  }
  * {
    font-size: 11px !important;
  }
  td,
  th {
    border: 1px solid black;
    text-align: center !important;
  }
  .v-table--density-default > .v-table__wrapper > table > tbody > tr > td,
  .v-table--density-default > .v-table__wrapper > table > thead > tr > td,
  .v-table--density-default > .v-table__wrapper > table > tfoot > tr > td {
    height: 20px !important;
  }
  .hideOnPrint {
    display: none !important;
  }

  .showOnPrint {
    display: block !important;
  }
  .printOnlyTd {
    display: table-cell;
  }
  .v-table--density-default > .v-table__wrapper > table > tbody > tr > th,
  .v-table--density-default > .v-table__wrapper > table > thead > tr > th,
  .v-table--density-default > .v-table__wrapper > table > tfoot > tr > th,
  .v-chip {
    height: 20px !important;
  }
  .wrapOnPrint {
    white-space: normal;
    overflow: auto;
  }
  table {
    border-spacing: 0px;
    border-collapse: separate;
  }
}
</style>