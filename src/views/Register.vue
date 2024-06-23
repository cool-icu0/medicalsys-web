<template>
	<div class="container">
		<el-card style="width: 50%;">
			<el-row :gutter="10">
				<el-col :span="12">
					<div class="grid-content">
						<div class="block">
							<el-carousel :interval="2000">
								<el-carousel-item v-for="item in images" :key="item.id">
									<img :src="item.src" alt="Carousel Image" class="carousel-image">
								</el-carousel-item>
							</el-carousel>
						</div>
					</div>
				</el-col>
				<el-col :span="12">
					<div class="grid-content">
						<div style="width: 400px; padding: 30px; background-color: white; border-radius: 5px;">
							<div style="text-align: center; font-size: 20px; margin-bottom: 20px; color: #333">欢迎注册
							</div>
							<el-form :model="form" :rules="rules" ref="formRef">
								<el-form-item prop="userAccount">
									<el-input prefix-icon="el-icon-user" placeholder="请输入账号"
										v-model="form.userAccount"></el-input>
								</el-form-item>
								<el-form-item prop="password">
									<el-input prefix-icon="el-icon-lock" placeholder="请输入密码" show-password
										v-model="form.password"></el-input>
								</el-form-item>
								<el-form-item prop="confirmPass">
									<el-input prefix-icon="el-icon-lock" placeholder="请确认密码" show-password
										v-model="form.confirmPass"></el-input>
								</el-form-item>
								<el-form-item>
									<el-button
										style="width: 100%; background-color: #333; border-color: #333; color: white"
										@click="register">注 册</el-button>
								</el-form-item>
								<div style="display: flex; align-items: center">
									<div style="flex: 1"></div>
									<div style="flex: 1; text-align: right">
										已有账号？请 <a href="/login">登录</a>
									</div>
								</div>
							</el-form>
						</div>
					</div>
				</el-col>
			</el-row>

		</el-card>
	</div>
</template>

<script>
	export default {
		name: "Register",
		data() {
			// 验证码校验
			const validatePassword = (rule, confirmPass, callback) => {
				if (confirmPass === '') {
					callback(new Error('请确认密码'))
				} else if (confirmPass !== this.form.password) {
					callback(new Error('两次输入的密码不一致'))
				} else {
					callback()
				}
			}
			return {
				images: [{
						id: 1,
						src: require('@/assets/imgs/l5.png')
					},
					{
						id: 2,
						src: require('@/assets/imgs/l6.png')
					},
					{
						id: 3,
						src: require('@/assets/imgs/l7.png')
					},
					{
						id: 4,
						src: require('@/assets/imgs/l8.png')
					}
				],
				form: {
					role: 'USER'
				},
				rules: {
					username: [{
						required: true,
						message: '请输入账号',
						trigger: 'blur'
					}, ],
					password: [{
						required: true,
						message: '请输入密码',
						trigger: 'blur'
					}, ],
					confirmPass: [{
						validator: validatePassword,
						trigger: 'blur'
					}]
				}
			}
		},
		created() {

		},
		methods: {
			register() {
				this.$refs['formRef'].validate((valid) => {
					if (valid) {
						// 验证通过
						this.$request.post('/user/register', this.form).then(res => {
							if (res.code == 200) {
								this.$router.push('/login') // 跳转登录页面
								this.$message.success('注册成功')
							} else {
								this.$message.error(res.msg)
							}
						})
					}
				})
			}
		}
	}
</script>

<style scoped>
	.container {
		height: 100vh;
		overflow: hidden;
		/* background-image: url("@/assets/imgs/bg.png"); */
		background-size: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666;
	}

	a {
		color: #2a60c9;
	}

	.el-carousel__item h3 {
		color: #475669;
		font-size: 14px;
		opacity: 0.75;
		line-height: 150px;
		margin: 0;
	}

	.el-carousel__item:nth-child(2n) {
		background-color: #99a9bf;
	}

	.el-carousel__item:nth-child(2n+1) {
		background-color: #d3dce6;
	}

	.carousel-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>