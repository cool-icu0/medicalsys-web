<template>
	<div class="manager-container">
		<!--  头部  -->
		<div class="manager-header">
			<div class="manager-header-left">
				<!--        <img src="@/assets/imgs/logo.png" /> -->
				<div class="title">大郎!!!该喝药了 ~</div>
			</div>

			<div class="manager-header-center">
				<el-breadcrumb separator-class="el-icon-arrow-right">
					<el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
					<el-breadcrumb-item :to="{ path: $route.path }">{{ $route.meta.name }}</el-breadcrumb-item>
				</el-breadcrumb>
			</div>

			<div class="manager-header-right">
				<el-dropdown placement="bottom">
					<div class="avatar">
						<img
							:src="user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
						<div style="color: #666666">{{ user.username }}</div>
					</div>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item @click.native="goToPerson">个人信息</el-dropdown-item>
						<el-dropdown-item @click.native="$router.push('/password')">修改密码</el-dropdown-item>
						<el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</div>
		</div>

		<!--  主体  -->
		<div class="manager-main">
			<!--  侧边栏  -->
			<div class="manager-main-left">
				<el-menu :default-openeds="['info', 'reserve', 'user']" router style="border: none"
					:default-active="$route.path">
					<el-menu-item index="/home">
						<i class="el-icon-s-home"></i>
						<span slot="title">系统首页</span>
					</el-menu-item>
					<el-submenu index="info" v-if="user.role !== 'USER'">
						<template slot="title">
							<i class="el-icon-menu"></i><span>信息管理</span>
						</template>
						<el-menu-item index="/notice" v-if="user.role == 'ADMIN'">公告信息</el-menu-item>
						<el-menu-item index="/review" v-if="user.role == 'ADMIN'">公告评论</el-menu-item>
						<el-menu-item index="/department" v-if="user.role == 'ADMIN'">科室信息</el-menu-item>
						<el-menu-item index="/examine"
							v-if="user.role == 'DOCTOR' || user.role =='PHARMACIST'">处方审核</el-menu-item>
						<el-menu-item index="/medicine" v-if="user.role == 'PHARMACIST'">药品信息</el-menu-item>
						<el-menu-item index="/medicareCard">医保卡信息</el-menu-item>
					</el-submenu>
					<el-submenu index="reserve">
						<template slot="title">
							<i class="el-icon-menu"></i><span>预约就诊</span>
						</template>
						<el-menu-item index="/doctorCard">预约挂号</el-menu-item>
						<el-menu-item index="/reserve"
							v-if="user.role == 'DOCTOR' || user.role =='PHARMACIST'">患者挂号</el-menu-item>
						<el-menu-item index="/medicineshop">药品商城</el-menu-item>
						<!-- <el-menu-item index="/registration" v-if="user.role == 'DOCTOR'|| 'USER'">聊天问诊</el-menu-item> -->
						<el-menu-item index="/case">病例查询</el-menu-item>
					</el-submenu>
					<el-submenu index="user" v-if="user.role == 'ADMIN'">
						<template slot="title">
							<i class="el-icon-menu"></i><span>用户管理</span>
						</template>
						<!-- <el-menu-item index="/admin">管理员信息</el-menu-item> -->
						<el-menu-item index="/doctor">医生信息</el-menu-item>
						<!-- <el-menu-item index="/user">患者信息</el-menu-item> -->
						<el-menu-item index="/record">病患追踪</el-menu-item>
					</el-submenu>
				</el-menu>
			</div>

			<!--  数据表格  -->
			<div class="manager-main-right">
				<router-view @update:user="updateUser" />
			</div>
		</div>

	</div>
</template>

<script>
	export default {
		name: "Manager",
		data() {
			return {
				user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
			}
		},
		created() {
			if (!this.user.userId) {
				this.$router.push('/login')
			}
		},
		methods: {
			updateUser() {
				this.user = JSON.parse(localStorage.getItem('xm-user') || '{}') // 重新获取下用户的最新信息
			},
			goToPerson() {
				if (this.user.role === 'ADMIN') {
					this.$router.push('/adminPerson')
				}
				if (this.user.role === 'PHARMACIST') {
					this.$router.push('/adminPerson')
				}
				if (this.user.role === 'DOCTOR') {
					this.$router.push('/adminPerson')
				}
				if (this.user.role === 'USER') {
					this.$router.push('/adminPerson')
				}
			},
			logout() {
				localStorage.removeItem('xm-user')
				this.$router.push('/login')
			}
		}
	}
</script>

<style scoped>
	@import "@/assets/css/manager.css";
</style>