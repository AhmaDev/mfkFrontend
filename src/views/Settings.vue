<template>
  <div id="settings">
    <v-app-bar app>
      <v-toolbar-title>المستخدمين</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="success" variant="elevated" elevation="0" @click="addUser()"
        >اضافة مستخدم جديد</v-btn
      >
    </v-app-bar>
    <v-table hover theme="light">
      <thead>
        <tr>
          <th width="500">اسم المستخدم</th>
          <th>كلمة المرور</th>
          <th>الصلاحيات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, i) in users" :key="user.idUser">
          <td>
            <v-text-field
              v-model="users[i].username"
              hide-details
              variant="text"
              @change="changeUsername(user.idUser, $event)"
            ></v-text-field>
          </td>
          <td>
            <v-row align="center">
              <v-col cols="auto">
                <span>{{ user.password }}</span>
              </v-col>
              <v-col cols="auto">
                <v-btn
                  @click="
                    selectedUser = user.idUser;
                    changePasswordModal = true;
                  "
                  variant="text"
                  size="x-small"
                  color="info"
                  icon
                >
                  <v-icon icon="mdi-key"></v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </td>
          <td>
            <div v-if="user.roleId != 1">
              <v-chip
                @click="changePermissions(user.idUser, 'delete')"
                class="ma-2"
                :color="
                  JSON.parse(user.denyFrom).filter((e) => e == 'delete')
                    .length > 0
                    ? 'error'
                    : 'grey'
                "
                variant="outlined"
              >
                <v-icon
                  start
                  :icon="
                    JSON.parse(user.denyFrom).filter((e) => e == 'delete')
                      .length > 0
                      ? 'mdi-check'
                      : 'mdi-checkbox-blank-outline'
                  "
                ></v-icon>
                <span>منع الحذف</span>
              </v-chip>
              <v-chip
                @click="changePermissions(user.idUser, 'edit')"
                class="ma-2"
                :color="
                  JSON.parse(user.denyFrom).filter((e) => e == 'edit').length >
                  0
                    ? 'error'
                    : 'grey'
                "
                variant="outlined"
              >
                <v-icon
                  start
                  :icon="
                    JSON.parse(user.denyFrom).filter((e) => e == 'edit')
                      .length > 0
                      ? 'mdi-check'
                      : 'mdi-checkbox-blank-outline'
                  "
                ></v-icon>
                <span>منع التعديل</span>
              </v-chip>
              <v-chip
                @click="changePermissions(user.idUser, 'add')"
                class="ma-2"
                :color="
                  JSON.parse(user.denyFrom).filter((e) => e == 'add').length > 0
                    ? 'error'
                    : 'grey'
                "
                variant="outlined"
              >
                <v-icon
                  start
                  :icon="
                    JSON.parse(user.denyFrom).filter((e) => e == 'add').length >
                    0
                      ? 'mdi-check'
                      : 'mdi-checkbox-blank-outline'
                  "
                ></v-icon>
                <span>منع الاضافة</span>
              </v-chip>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-dialog v-model="changePasswordModal" max-width="500">
      <v-card class="pa-10">
        <h1>تعديل كلمة المرور</h1>
        <v-text-field
          variant="outlined"
          label="كلمة المرور الجديدة"
          v-model="newPassword"
        ></v-text-field>
        <br />
        <v-btn
          block
          color="primary"
          variant="elevated"
          elevation="0"
          @click="changePassword()"
          >تعديل</v-btn
        >
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: () => ({
    users: [],
    changePasswordModal: false,
    selectedUser: 0,
    newPassword: "",
  }),
  created: function () {
    this.fetch();
  },
  methods: {
    fetch() {
      this.$store.state.loading = true;
      this.axios
        .get("users")
        .then((res) => {
          this.users = res.data;
        })
        .finally(() => (this.$store.state.loading = false));
    },
    changePermissions(userId, perm) {
      let user = this.users.filter((e) => e.idUser == userId)[0];
      let perms = JSON.parse(user.denyFrom);
      var items = perms.filter((e) => e == perm);
      if (items.length > 0) {
        perms = perms.filter((e) => e != perm);
      } else {
        perms.push(perm);
      }
      this.axios
        .put("user/" + userId, {
          denyFrom: JSON.stringify(perms),
        })
        .then(() => this.fetch());
    },
    changeUsername(userId, e) {
      this.axios
        .put("user/" + userId, {
          username: e.target.value,
        })
        .then(() => this.fetch());
    },
    changePassword() {
      this.axios
        .put("user/" + this.selectedUser, {
          password: this.newPassword,
        })
        .then(() => {
          this.fetch();
          this.changePasswordModal = false;
          this.$toast.success("تم تغيير كلمة المرور");
        });
    },
    addUser() {
      this.axios
        .post("addUser", {
          username: "مستخدم جديد",
          password: "123456",
          denyFrom: "[]",
          roleId: 2,
        })
        .then(() => this.fetch());
    },
  },
};
</script>

<style>
</style>