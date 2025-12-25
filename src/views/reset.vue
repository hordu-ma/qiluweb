<template>
  <div class="reset-container">
    <div class="box-card">
      <div slot="header" class="clearfix">
        <span>重置密码</span>
      </div>

      <!-- 第一步：验证身份 -->
      <div v-show="currentStep === 1" class="step-content">
        <el-form
          :model="form"
          :rules="step1Rules"
          ref="step1Form"
          label-position="top"
          label-width="120px"
          class="reset-form"
        >
          <el-form-item label="学号" prop="account">
            <el-input v-model="form.account" placeholder="请输入学号" clearable></el-input>
          </el-form-item>
          <el-form-item label="身份证号后6位" prop="idCardSuffix">
            <el-input v-model="form.idCardSuffix" placeholder="请输入身份证号后6位" maxlength="6" clearable></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号"
              maxlength="11"
              @input="inputPhone"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="verifyCode" class="verify-code-item">
            <div class="verify-code-wrapper">
              <el-input v-model="form.verifyCode" placeholder="请输入验证码" maxlength="6" clearable></el-input>
              <span
                class="get-code-text"
                :class="{
                  disabled: !canGetCode || countdown > 0,
                  'has-clear-icon': form.verifyCode.length > 0,
                }"
                @click="getVerifyCode"
              >
                {{ countdown > 0 ? countdown + "s" : "点击获取验证码" }}
              </span>
            </div>
          </el-form-item>
          <div class="step-buttons">
            <el-button type="primary" @click="nextStep">下一步</el-button>
            <el-button @click="onCancel">取消</el-button>
          </div>
        </el-form>
      </div>

      <!-- 第二步：设置新密码 -->
      <div v-show="currentStep === 2" class="step-content">
        <el-form
          :model="form"
          :rules="step2Rules"
          ref="step2Form"
          label-position="top"
          label-width="120px"
          class="reset-form"
        >
          <el-form-item label="新密码" prop="newPassword">
            <div class="password-input-wrapper">
              <el-input
                v-model="form.newPassword"
                :type="passwordShow ? 'text' : 'password'"
                placeholder="请输入新密码（必须包含字母和数字，6-20位）"
              ></el-input>
              <i
                v-if="form.newPassword.length > 0"
                :class="[
                  'password-toggle-icon',
                  passwordShow ? 'iconfont icon-yincangmima' : 'iconfont icon-xianshimima1',
                ]"
                @click="passwordShow = !passwordShow"
              ></i>
            </div>
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword" class="btn-repeat">
            <div class="password-input-wrapper">
              <el-input
                v-model="form.confirmPassword"
                :type="confirmPasswordShow ? 'text' : 'password'"
                placeholder="请再次输入密码"
              ></el-input>
              <i
                v-if="form.confirmPassword.length > 0"
                :class="[
                  'password-toggle-icon',
                  confirmPasswordShow ? 'iconfont icon-yincangmima' : 'iconfont icon-xianshimima1',
                ]"
                @click="confirmPasswordShow = !confirmPasswordShow"
              ></i>
            </div>
          </el-form-item>
          <div class="step-buttons">
            <el-button type="primary" @click="submitReset">确认重置</el-button>
            <el-button @click="onCancel">取消</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentStep: 1,
      form: {
        account: "",
        idCardSuffix: "",
        phone: "",
        verifyCode: "",
        newPassword: "",
        confirmPassword: "",
      },
      resetToken: "",
      passwordShow: false,
      confirmPasswordShow: false,
      countdown: 0,
      canGetCode: false,
      step1Rules: {
        account: [{ required: true, message: "请输入学号", trigger: "blur" }],
        idCardSuffix: [
          { required: true, message: "请输入身份证号后6位", trigger: "blur" },
          { len: 6, message: "身份证号后6位必须是6位含字母或数字", trigger: "blur" },
          { pattern: /^\d{5}[0-9Xx]$/, message: "身份证号后6位必须是6位含字母或数字", trigger: "blur" },
        ],
        phone: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" },
        ],
        verifyCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
      },
      step2Rules: {
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
            message: "新密码必须包含字母和数字，6-20位",
            trigger: "blur",
          },
        ],
        confirmPassword: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
            message: "新密码必须包含字母和数字，6-20位",
            trigger: "blur",
          },
          {
            validator: (rule, value, callback) => {
              if (value !== this.form.newPassword) {
                callback(new Error("两次输入密码不一致"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    inputPhone() {
      this.form.phone = this.form.phone.replace(/[^0-9]/g, "");
      // 检查手机号格式是否正确（必须是11位且符合中国手机号规则）
      this.canGetCode = this.form.phone.length === 11 && /^1[3-9]\d{9}$/.test(this.form.phone);
    },
    getVerifyCode() {
      const _this = this;

      // 验证手机号格式
      if (!_this.canGetCode) {
        _this.$message.error("请输入正确的手机号！");
        return;
      }

      // 调用发送验证码的API
      this.axios
        .sendCode({
          phoneNumber: _this.form.phone,
        })
        .then((res) => {
          if (res?.data?.success) {
            // 发送成功，开始倒计时
            _this.countdown = 60;
            const timer = setInterval(() => {
              _this.countdown--;
              if (_this.countdown <= 0) {
                clearInterval(timer);
              }
            }, 1000);
            _this.$Modal.success({
              title: "提示",
              content: "验证码已发送，请查收！",
            });
          } else {
            _this.$message.error(res.msg || "发送验证码失败，请重试");
          }
        })
        .catch((err) => {
          _this.$message.error(err.message || "发送验证码失败，请重试");
        });
    },
    nextStep() {
      this.$refs.step1Form.validate((valid) => {
        if (valid) {
          // 验证身份信息
          const verifyData = {
            account: this.form.account,
            idCardSuffix: this.form.idCardSuffix,
            phoneNumber: this.form.phone,
            smsCode: this.form.verifyCode,
          };

          this.showLoading("验证身份信息中...");
          this.axios
            .verifyIdentity(verifyData)
            .then((res) => {
              this.hideLoading();
              if (res?.data?.success) {
                console.log("身份验证通过", res);
                this.resetToken = res.data?.data;
                this.$message.success("身份验证通过");
                this.currentStep = 2;
              } else {
                this.$message.error(res.msg || "身份验证失败");
              }
            })
            .catch((err) => {
              this.hideLoading();
              this.$message.error(err.message || "身份验证失败");
            });
        }
      });
    },
    submitReset() {
      this.$refs.step2Form.validate((valid) => {
        if (valid) {
          // 表单数据
          const resetData = {
            newPassword: this.form.newPassword,
            confirmPassword: this.form.confirmPassword,
            resetToken: this.resetToken,
          };

          // 提交逻辑
          this.axios
            .resetPasswordWithPhone(resetData)
            .then((res) => {
              console.log(res);
              if (res?.data?.success) {
                this.$message.success("重置成功");
                this.$router.go(-1);
              } else {
                this.$message.error(res.msg || "重置失败");
              }
            })
            .catch((err) => {
              this.$message.error(err.message || "重置失败");
            });
        }
      });
    },
    onCancel() {
      // 返回上一页或清空表单
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}
.box-card {
  width: 510px;
  height: 800px;
  padding: 50px;
  box-sizing: border-box;
  font-weight: 600;
  background: #ffffff;
  box-shadow: 0px 3px 7px 0px rgba(16, 165, 147, 0.11);
  border-radius: 20px;
}
.clearfix {
  text-align: center;
  font-size: 18px;
  color: #000000;
  line-height: 26px;
}
.reset-form {
  margin-top: 40px;
}
::v-deep .el-card__body {
  padding-top: 0;
}
::v-deep .el-form-item {
  margin-bottom: 2px;
  margin-top: 10px;
}
::v-deep .el-form--label-top .el-form-item__label {
  padding-bottom: 0;
}
::v-deep .el-input__inner {
  height: 48px !important;
  line-height: 48px !important;
  font-size: 14px;
}
.btn-repeat {
  margin-top: 28px;
}
.btn-item {
  margin-top: 50px;
  margin-bottom: 16px;
}
.reset-container ::v-deep .el-button {
  width: 120px;
  margin: 0 10px;
}

/* 步骤按钮样式 */
.step-buttons {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  .el-button {
    width: 100%;
    margin: 0;
  }
}

/* 验证码相关样式 */
.verify-code-item {
  ::v-deep .el-form-item__content {
    position: relative;
  }
}

.verify-code-wrapper {
  position: relative;
  width: 100%;
  /* height: 40px; */
}

.get-code-text {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #10a593;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
  z-index: 1;

  &:hover {
    color: #0d8a7a;
  }

  &.disabled {
    color: #cccccc;
    cursor: not-allowed;

    &:hover {
      color: #cccccc;
    }
  }

  &.has-clear-icon {
    right: 30px;
  }
}

::v-deep .el-input {
  .el-input__inner {
    padding-right: 100px;
  }

  &.has-clear-icon .el-input__inner {
    padding-right: 130px;
  }
}

/* 密码输入框样式 */
.reset-form {
  ::v-deep .el-input__suffix {
    top: 50%;
    transform: translateY(-40%);
  }

  ::v-deep .el-input__suffix-inner {
    display: flex;
    align-items: center;
  }

  ::v-deep .el-input__icon {
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #10a593;
    }
  }

  ::v-deep .el-input__clear {
    color: #c0c4cc;
    transition: color 0.3s;

    &:hover {
      color: #909399;
    }
  }
}

/* 密码显示/隐藏图标样式 */
.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-toggle-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
  color: #c0c4cc;
  z-index: 2;
  transition: color 0.3s;

  &:hover {
    color: #10a593;
  }
}
</style>
