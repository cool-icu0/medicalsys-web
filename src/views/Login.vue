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
						<div style=" padding: 30px; background-color: white; border-radius: 5px;">
							<div style="text-align: center; font-size: 20px; margin-bottom: 20px; color: #333">
								欢迎登录大郎医院预约挂号系统</div>
							<el-form :model="form" :rules="rules" ref="formRef">
								<el-form-item prop="userAccount">
									<el-input prefix-icon="el-icon-user" placeholder="请输入账号"
										v-model="form.userAccount"></el-input>
								</el-form-item>
								<el-form-item prop="password">
									<el-input prefix-icon="el-icon-lock" placeholder="请输入密码" show-password
										v-model="form.password"></el-input>
								</el-form-item>
								<el-form-item>
									<el-button
										style="width: 100%; background-color: #7eb488; border-color: #7eb488; color: white"
										@click="login">登 录</el-button>
								</el-form-item>
								<div style="display: flex; align-items: center">
									<div style="flex: 1"></div>
									<div style="flex: 1; text-align: right">
										还没有账号？请 <a @click.prevent="goToRegister">注册</a>

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
		name: "Login",
		data() {
			return {
				images: [{
						id: 1,
						src: require('@/assets/imgs/l1.png')
					},
					{
						id: 2,
						src: require('@/assets/imgs/l2.png')
					},
					{
						id: 3,
						src: require('@/assets/imgs/l3.png')
					},
					{
						id: 4,
						src: require('@/assets/imgs/l4.png')
					}
				],
				form: {},
				dialogVisible: false,
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
					}, ]
				}
			}
		},
		methods: {
			login() {
				this.$refs['formRef'].validate((valid) => {
					if (valid) {
						// 验证通过
						this.$request.post('/user/login', this.form).then(res => {
							if (res.code == 200) {
								if (res.data.role == 3) {
									res.data.role = 'ADMIN'
								}
								if (res.data.role == 2) {
									res.data.role = 'PHARMACIST'
									this.$request.get(`/api/v1/uad/selectUserDoctorByUserId/` + res.data
										.userId).then(r => {
										res.data.docId = r.data.docId
										console.log(res.data)
									})
								}
								if (res.data.role == 1) {
									res.data.role = 'DOCTOR'
									this.$request.get(`/api/v1/uad/selectUserDoctorByUserId/` + res.data
										.userId).then(r => {
										console.log(r.data)
										res.data.docId = r.data.docId
										console.log(res.data)
									})
								}
								if (res.data.role == 0) {
									res.data.role = 'USER'
								}
								localStorage.setItem("xm-user", JSON.stringify(res
									.data)) // 存储用户数据
								this.$router.push('/') // 跳转主页
								this.$message.success('登录成功')
							} else {
								this.$message.error(res.msg)
							}
						})
					}
				})
			},
			resetForm() {
				this.form = {
					userAccount: '',
					password: ''
				};
			},
			goToRegister() {
				this.resetForm(); 
				this.$router.push('/register');  
			},
		}
	}
</script>

<style scoped>
	.container {
		height: 100vh;
		overflow: hidden;
		background-color: aliceblue;
		/* background-image: url("@/assets/imgs/bg2.jpg"); */
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